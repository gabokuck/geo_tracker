# GeoTracker Rails 🌍📍

Sistema de rastreo GPS en tiempo real construido con Ruby on Rails 8.1, que permite monitorear dispositivos IoT (ESP32) y visualizar su ubicación en un mapa interactivo con actualizaciones en vivo mediante WebSockets.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API REST](#-api-rest)
- [Arquitectura](#-arquitectura)
- [Despliegue](#-despliegue)
- [Desarrollo](#-desarrollo)

## ✨ Características

- **Rastreo GPS en Tiempo Real**: Recibe y visualiza coordenadas GPS desde dispositivos IoT
- **Mapa Interactivo**: Interfaz web con Leaflet.js para visualización geográfica
- **Actualizaciones en Vivo**: WebSockets (Action Cable) para actualizaciones automáticas sin recargar
- **API REST**: Endpoint para recibir telemetría desde dispositivos ESP32
- **CRUD de Dispositivos**: Gestión completa de dispositivos de rastreo
- **Interfaz Moderna**: UI construida con TailwindCSS y Hotwire (Turbo + Stimulus)
- **Containerizado**: Soporte completo para Docker y Docker Compose
- **Listo para Producción**: Configurado para despliegue con Kamal en Coolify

## 🛠 Tecnologías

### Backend
- **Ruby**: 3.2.2
- **Rails**: 8.1.2
- **PostgreSQL**: 14+ (base de datos principal)
- **Redis**: 4.0+ (Action Cable y caché)
- **Puma**: Servidor web
- **Action Cable**: WebSockets para comunicación en tiempo real

### Frontend
- **Hotwire**: Turbo + Stimulus para SPA-like experience
- **TailwindCSS**: Framework CSS para diseño moderno
- **Leaflet.js**: Biblioteca de mapas interactivos
- **Importmap**: Gestión de módulos JavaScript

### Infraestructura
- **Docker**: Containerización
- **Kamal**: Herramienta de despliegue
- **Solid Cache/Queue/Cable**: Backends sólidos para Rails

## 📦 Requisitos Previos

- Ruby 3.2.2
- PostgreSQL 14+
- Redis 4.0+
- Node.js (para desarrollo)
- Docker y Docker Compose (opcional, para desarrollo containerizado)

## 🚀 Instalación

### Opción 1: Instalación Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd geo_tracker
```

2. **Instalar dependencias**
```bash
bundle install
```

3. **Configurar la base de datos**
```bash
# Editar config/database.yml si es necesario
rails db:create
rails db:migrate
```

4. **Iniciar los servicios**
```bash
# Opción A: Usando foreman (recomendado)
bin/dev

# Opción B: Manualmente en terminales separadas
rails server
rails tailwindcss:watch
```

5. **Acceder a la aplicación**
```
http://localhost:3000
```

### Opción 2: Docker Compose

1. **Iniciar los contenedores**
```bash
docker-compose up --build
```

2. **Crear y migrar la base de datos**
```bash
docker-compose exec web rails db:create db:migrate
```

3. **Acceder a la aplicación**
```
http://localhost:3000
```

## ⚙️ Configuración

### Variables de Entorno

Para producción, configurar las siguientes variables:

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db

# Rails
RAILS_ENV=production
SECRET_KEY_BASE=<generar con: rails secret>

# Redis (para Action Cable)
REDIS_URL=redis://localhost:6379/1
```

### Configuración de Base de Datos

El archivo `config/database.yml` está configurado para:
- **Development**: PostgreSQL en `db:5432` (Docker) o `localhost:5432`
- **Production**: Usa `DATABASE_URL` desde variables de entorno
- **Múltiples bases**: Soporta cache, queue y cable databases

### Configuración de Action Cable

El archivo `config/cable.yml` configura WebSockets:
- **Development**: Usa Redis en `redis://localhost:6379/1`
- **Production**: Usa `REDIS_URL` desde variables de entorno

## 💻 Uso

### Gestión de Dispositivos

1. **Crear un nuevo dispositivo**
   - Navegar a http://localhost:3000
   - Click en "Nuevo Dispositivo"
   - Ingresar número de serie y descripción
   - Opcionalmente establecer coordenadas iniciales

2. **Ver dispositivos en el mapa**
   - La página principal muestra todos los dispositivos en un mapa interactivo
   - Los marcadores se actualizan automáticamente cuando llegan nuevas coordenadas

3. **Editar/Eliminar dispositivos**
   - Usar los botones en las tarjetas de dispositivos

### Enviar Telemetría desde ESP32

Ejemplo de código para ESP32:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* serverUrl = "http://TU_SERVIDOR/api/telemetry";

void enviarGPS(float lat, float lng, String serial) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  
  String datos = "serial=" + serial + "&lat=" + String(lat, 6) + "&lng=" + String(lng, 6);
  int httpCode = http.POST(datos);
  
  if (httpCode == 200) {
    Serial.println("✓ Coordenadas enviadas");
  }
  http.end();
}
```

## 🔌 API REST

### POST /api/telemetry

Recibe coordenadas GPS desde dispositivos IoT.

**Endpoint**: `POST /api/telemetry`

**Headers**: `Content-Type: application/x-www-form-urlencoded`

**Parámetros**:
```
serial: String (requerido) - Número de serie del dispositivo
lat: Float (requerido) - Latitud
lng: Float (requerido) - Longitud
```

**Ejemplo de Request**:
```bash
curl -X POST http://localhost:3000/api/telemetry \
  -d "serial=ESP32-001&lat=19.4326&lng=-99.1332"
```

**Respuestas**:

✅ **200 OK** - Coordenadas recibidas correctamente
```json
{
  "status": "ok",
  "message": "Coordenadas recibidas"
}
```

❌ **404 Not Found** - Dispositivo no encontrado
```json
{
  "error": "Dispositivo no encontrado"
}
```

❌ **422 Unprocessable Entity** - Datos inválidos
```json
{
  "error": "Datos inválidos",
  "details": { ... }
}
```

**Nota**: Este endpoint tiene deshabilitada la protección CSRF para permitir requests desde dispositivos IoT.

## 🏗 Arquitectura

### Modelo de Datos

**Device** (`devices` table)
```ruby
- id: integer (PK)
- serial_number: string
- description: text
- last_latitude: float
- last_longitude: float
- created_at: datetime
- updated_at: datetime
```

### Flujo de Datos en Tiempo Real

1. **ESP32** envía POST a `/api/telemetry` con coordenadas
2. **TelemetryController** valida y actualiza el dispositivo
3. **Device Model** (callback `after_update_commit`) emite broadcast via Action Cable
4. **TelemetryChannel** transmite a todos los clientes suscritos
5. **MapController (Stimulus)** recibe el evento y actualiza el marcador en el mapa

```
ESP32 → API → Device.update → ActionCable.broadcast → WebSocket → Frontend
```

### Componentes Principales

#### Backend
- `app/controllers/api/telemetry_controller.rb` - API para recibir telemetría
- `app/controllers/devices_controller.rb` - CRUD de dispositivos
- `app/models/device.rb` - Modelo con broadcast automático
- `app/channels/telemetry_channel.rb` - Canal WebSocket

#### Frontend
- `app/javascript/controllers/map_controller.js` - Controlador Stimulus para Leaflet
- `app/views/devices/index.html.erb` - Vista principal con mapa
- `app/javascript/channels/telemetry_channel.js` - Cliente WebSocket

## 🚢 Despliegue

### Docker

El proyecto incluye un `Dockerfile` multi-stage optimizado:

```bash
# Construir imagen
docker build -t geotracker .

# Ejecutar
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e SECRET_KEY_BASE=... \
  geotracker
```

### Kamal (Coolify/VPS)

1. **Configurar Kamal**
```bash
# Editar config/deploy.yml con tus credenciales
kamal setup
```

2. **Desplegar**
```bash
kamal deploy
```

El `Dockerfile` incluye:
- Build stage con compilación de assets
- Runtime stage optimizado
- Usuario no-root por seguridad
- Migración automática en arranque
- Soporte para Tailwind CSS precompilado

### Variables de Entorno en Producción

Asegurar configurar:
- `DATABASE_URL` - URL completa de PostgreSQL
- `SECRET_KEY_BASE` - Generar con `rails secret`
- `REDIS_URL` - URL de Redis para Action Cable
- `RAILS_ENV=production`

## 👨‍💻 Desarrollo

### Estructura del Proyecto

```
geo_tracker/
├── app/
│   ├── channels/          # Action Cable channels
│   ├── controllers/       # Controladores Rails
│   │   └── api/          # API REST
│   ├── javascript/        # Stimulus controllers
│   │   ├── controllers/  # Map, picker controllers
│   │   └── channels/     # WebSocket clients
│   ├── models/           # Modelos ActiveRecord
│   └── views/            # Vistas ERB
├── config/
│   ├── cable.yml         # Configuración Action Cable
│   ├── database.yml      # Configuración PostgreSQL
│   └── routes.rb         # Rutas de la aplicación
├── db/
│   ├── migrate/          # Migraciones
│   └── schema.rb         # Esquema de base de datos
├── Dockerfile            # Imagen Docker multi-stage
├── docker-compose.yml    # Orquestación local
└── Gemfile              # Dependencias Ruby
```

### Comandos Útiles

```bash
# Consola Rails
rails console

# Ejecutar migraciones
rails db:migrate

# Revertir última migración
rails db:rollback

# Resetear base de datos
rails db:reset

# Ejecutar tests
rails test

# Linter de código
rubocop

# Análisis de seguridad
brakeman
bundle audit
```

### Agregar Nuevos Dispositivos via Consola

```ruby
rails console

Device.create!(
  serial_number: "ESP32-001",
  description: "Dispositivo de prueba",
  last_latitude: 19.4326,
  last_longitude: -99.1332
)
```

### Testing

El proyecto incluye:
- **Minitest**: Framework de testing
- **Capybara**: Testing de sistema
- **Selenium**: WebDriver para tests E2E

```bash
# Ejecutar todos los tests
rails test

# Ejecutar tests de sistema
rails test:system
```

### Debugging

- **Debug gem**: Incluido en development/test
- **Web Console**: Disponible en páginas de error
- **Logs**: `tail -f log/development.log`

## 📝 Notas Adicionales

### Seguridad

- CSRF protection deshabilitado solo en `/api/telemetry`
- Usuario no-root en contenedor Docker
- Secrets manejados via variables de entorno
- Auditoría de gemas con `bundler-audit`
- Análisis estático con `brakeman`

### Performance

- Assets precompilados en build
- Solid Cache para caché de aplicación
- Solid Queue para trabajos en background
- Connection pooling en PostgreSQL

### Compatibilidad

- Desarrollado en Windows (permisos de ejecución corregidos en Dockerfile)
- Compatible con Linux/macOS
- Probado con PostgreSQL 14+
- Redis 4.0+

## 📄 Licencia

Este proyecto es parte del sistema EnconTrack.

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

---

**Desarrollado con ❤️ usando Ruby on Rails 8.1**
