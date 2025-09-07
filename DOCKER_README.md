# 🚀 PokeDotDuel - Docker Setup

Este documento explica cómo configurar y ejecutar PokeDotDuel usando Docker para desarrollo con hot reload.

## 📋 Prerrequisitos

- **Docker Desktop** instalado y ejecutándose
- **Docker Compose** (viene incluido con Docker Desktop)
- **Git** para clonar el repositorio

## 🏗️ Arquitectura

La aplicación consta de los siguientes servicios:

- **Frontend** (Next.js): Interfaz de usuario en `http://localhost:3000`
- **Backend** (NestJS): API REST y WebSockets en `http://localhost:3001`
- **PostgreSQL**: Base de datos principal
- **pgAdmin**: Interfaz web para gestión de BD en `http://localhost:5050`
- **Redis**: Cache opcional

### 🔧 Configuraciones Disponibles

1. **`docker-compose.yml`**: Configuración completa (requiere configuración adicional)
2. **`docker-compose.simple.yml`**: Configuración simplificada (recomendada para empezar)

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd PokeDotDuel
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp docker-env-example.txt .env

# Editar las variables necesarias (especialmente las claves de Supabase)
# nano .env  # o tu editor favorito
```

### 3. Probar la configuración de Docker
```bash
# Ejecutar el script de prueba
./scripts/test-docker.sh
```

### 4. Iniciar los servicios (Configuración Simplificada)
```bash
# Usando docker-compose simple (recomendado)
docker-compose -f docker-compose.simple.yml up --build -d

# O usando el script de desarrollo
./scripts/dev.sh start

# O usando PowerShell (Windows)
.\scripts\dev.ps1 start
```

### 5. Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:5050
  - Usuario: admin@pokedotduel.com
  - Contraseña: admin123
- **Base de datos**: localhost:5432

## 🛠️ Comandos de Desarrollo

### Usando el script de desarrollo

```bash
# Linux/Mac
./scripts/dev.sh

# Windows PowerShell
.\scripts\dev.ps1
```

Esto mostrará un menú interactivo con las siguientes opciones:

1. **Start development environment** - Inicia todos los servicios
2. **Stop development environment** - Detiene todos los servicios
3. **Show service status** - Muestra el estado de los contenedores
4. **Show logs** - Muestra logs de todos los servicios
5. **Install dependencies** - Instala dependencias de npm
6. **Clean up** - Elimina contenedores, volúmenes e imágenes
7. **Create environment file** - Crea archivo .env básico

### Comandos directos con Docker Compose

```bash
# Iniciar servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v --rmi all

# Reiniciar un servicio específico
docker-compose restart backend
```

## 🔧 Configuración

### Variables de Entorno

Las variables de entorno principales están documentadas en `docker-env-example.txt`. Las más importantes son:

#### Base de Datos
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pokedotduel
```

#### Supabase (Local)
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Personalización de Puerto

Si necesitas cambiar los puertos, edita el archivo `docker-compose.yml`:

```yaml
# Cambiar puerto del frontend
frontend:
  ports:
    - "3000:3000"  # Cambia el primer número

# Cambiar puerto del backend
backend:
  ports:
    - "3001:3001"  # Cambia el primer número
```

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Cambiar el puerto en docker-compose.yml
```

#### 2. Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

#### 3. Problemas con dependencias
```bash
# Limpiar node_modules y reinstalar
docker-compose down -v
docker-compose up --build
```

#### 4. Error de memoria en Docker Desktop
- Aumenta la memoria asignada a Docker Desktop (recomendado: 4GB+)
- Cierra otras aplicaciones que consuman memoria

### Logs y Debugging

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ver logs con timestamps
docker-compose logs -f --timestamps

# Seguir logs en tiempo real
docker-compose logs -f --tail=100
```

## 🚀 Despliegue en Producción

Para producción, usa el archivo `docker-compose.prod.yml`:

```bash
# Construir para producción
docker-compose -f docker-compose.prod.yml up --build -d

# O usar el script de producción
./scripts/deploy.sh
```

### Variables de Producción

Asegúrate de configurar estas variables para producción:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db:5432/pokedotduel
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
```

## 📁 Estructura de Archivos

```
PokeDotDuel/
├── apps/
│   ├── backend/
│   │   ├── Dockerfile          # Imagen de producción
│   │   ├── Dockerfile.dev      # Imagen de desarrollo
│   │   └── .dockerignore
│   └── web/
│       ├── Dockerfile          # Imagen de producción
│       ├── Dockerfile.dev      # Imagen de desarrollo
│       └── .dockerignore
├── supabase/                   # Configuración de Supabase
├── scripts/
│   ├── dev.sh                  # Script de desarrollo (Linux/Mac)
│   └── dev.ps1                 # Script de desarrollo (Windows)
├── docker-compose.yml          # Desarrollo
├── docker-compose.prod.yml     # Producción
├── docker-env-example.txt      # Variables de entorno
└── DOCKER_README.md           # Esta documentación
```

## 🔄 Desarrollo con Hot Reload

El setup de desarrollo incluye:

- **Hot reload** automático para frontend y backend
- **Volúmenes montados** para cambios en tiempo real
- **Live debugging** con breakpoints
- **Auto-restart** de servicios al cambiar código

### Flujo de Desarrollo Típico

1. **Hacer cambios** en el código
2. **Los cambios se reflejan automáticamente** en el navegador
3. **Ver logs** con `docker-compose logs -f`
4. **Debuggear** usando las DevTools del navegador

## 🤝 Contribución

1. Asegúrate de que tus cambios funcionen con Docker
2. Actualiza esta documentación si agregas nuevas variables
3. Prueba tanto desarrollo como producción antes de hacer commit

## 📞 Soporte

Si tienes problemas:

1. Verifica los logs: `docker-compose logs -f`
2. Revisa el estado de los servicios: `docker-compose ps`
3. Reinicia los servicios: `docker-compose restart`
4. Si todo falla, limpia y reconstruye: `docker-compose down -v && docker-compose up --build`

¡Feliz desarrollo con PokeDotDuel! 🎮⚡
