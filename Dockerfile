# Dockerfile
ARG RUBY_VERSION=3.2.2
FROM registry.docker.com/library/ruby:$RUBY_VERSION-slim as base

# Directorio de trabajo
WORKDIR /rails

# Variables de entorno para producción
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# Fase de construcción (Build Stage)
FROM base as build

# Instalar paquetes necesarios para compilar gemas (C++)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev git pkg-config

# Copiar Gemfile y instalar gemas
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Copiar el código de la aplicación
COPY . .

# Precompilar assets (Tailwind, Stimulus)
# Nota: Usamos un SECRET_KEY_BASE dummy solo para que rails no falle al compilar assets
RUN SECRET_KEY_BASE=dummy_for_build ./bin/rails assets:precompile

# Fase Final (La imagen que correrá en Coolify)
FROM base

# Instalar dependencias de runtime (Cliente de Postgres, etc)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libvips postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copiar artefactos desde la fase de build
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails /rails

# Crear un usuario no-root por seguridad
RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp
USER rails:rails

# Comando de arranque:
# 1. db:prepare corre las migraciones si hay nuevas (o crea la BD si no existe)
# 2. Luego arranca el servidor
ENTRYPOINT ["/rails/bin/docker-entrypoint"]
CMD ["/rails/bin/rails", "server", "-b", "0.0.0.0"]

EXPOSE 3000