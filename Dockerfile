FROM ruby:3.2.2

# Instalar dependencias del sistema necesarias
# (Postgres client y NodeJS/Yarn para algunos procesos de JS si fueran necesarios)
RUN apt-get update -qq && apt-get install -y postgresql-client build-essential libpq-dev

# Configurar directorio de trabajo
WORKDIR /app

# --- AQUÍ ESTÁ LA MAGIA QUE FALTA ---
# Copiamos el Gemfile y el Gemfile.lock al contenedor
COPY Gemfile Gemfile.lock ./

# Instalamos las gemas.
# Si el Gemfile cambia, Docker volverá a ejecutar este paso automáticamente.
RUN bundle install

# Copiamos el resto de la aplicación
COPY . .

# Exponemos el puerto 3000
EXPOSE 3000

# Script para solucionar el problema de "server.pid" que a veces queda bloqueado
CMD ["rails", "server", "-b", "0.0.0.0"]