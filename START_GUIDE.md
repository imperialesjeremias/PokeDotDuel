# 🚀 Guía de Inicio - PokeDotDuel

## Inicio Rápido

```bash
# 1. Configurar variables de entorno
npm run setup

# 2. Verificar implementación
npm run verify

# 3. Iniciar todo el proyecto
npm run start
```

O ejecuta directamente:
```bash
turbo run start
```

## 🎯 Comandos Disponibles

### Configuración
```bash
npm run setup        # Configurar variables de entorno
npm run verify       # Verificar que todo esté implementado
```

### Desarrollo
```bash
npm run dev          # Iniciar servicios en modo desarrollo
npm run start        # Iniciar servicios completos (producción)
```

### Testing
```bash
npm run test         # Ejecutar tests
node test-runner-simple.js  # Tests simplificados
```

### Utilidades
```bash
npm run build        # Construir todos los servicios
npm run lint         # Ejecutar linter
npm run clean        # Limpiar builds
```

## 📋 Servicios Iniciados

Cuando ejecutas `npm run start`, se inician:

1. **WebSocket Server** (puerto 3001)
   - Manejo de batallas PvP
   - Matchmaking automático
   - Comunicación en tiempo real

2. **Next.js Frontend** (puerto 3000)
   - Interfaz de usuario
   - Integración con wallet
   - Componentes de juego

## 🌐 Acceso a la Aplicación

- **Frontend:** http://localhost:3000
- **WebSocket:** http://localhost:3001
- **API Docs:** http://localhost:3000/api/docs

## ⚙️ Configuración Inicial

### Variables de Entorno

Ejecuta `npm run setup` para crear `.env.local` automáticamente con valores de ejemplo.

Edita `.env.local` con tus claves reales:

```env
# Solana
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Program IDs (después de desplegar)
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=tu-program-id
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=tu-program-id
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=tu-program-id

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=tu-privy-app-id
PRIVY_APP_SECRET=tu-privy-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-key
SUPABASE_SERVICE_ROLE_KEY=tu-supabase-service-key
```

## 🔧 Solución de Problemas

### Turbo no encontrado
```bash
npm install -g turbo
# o
npx turbo run start
```

### Variables de entorno no configuradas
```bash
npm run setup
# Luego edita .env.local
```

### Servicios no inician
```bash
# Verificar implementación
npm run verify

# Instalar dependencias
npm install
```

### Tests fallan
```bash
# Ejecutar tests simplificados
node test-runner-simple.js
```

## 🎮 Funcionalidades Disponibles

Una vez iniciado, puedes:

- ✅ **Conectar wallet** (Phantom, Solflare)
- ✅ **Crear/join lobbies** de batalla
- ✅ **Seleccionar equipos** de 6 Pokémon
- ✅ **Batallas PvP** con tipos y efectividades
- ✅ **Comprar packs** con VRF
- ✅ **Abrir packs** y obtener cartas
- ✅ **Gestionar colección** de cartas
- ✅ **Mercado** con listings y subastas
- ✅ **Sistema económico** con PokéCoins

## 📊 Estado del Proyecto

- ✅ Backend TypeScript completo
- ✅ Frontend con hooks integrado
- ✅ Tests funcionando
- ✅ Performance optimizada
- ✅ Documentación completa
- ✅ Turbo configuración lista

## 🎯 Próximos Pasos

1. **Desplegar programas Solana** en Devnet
2. **Actualizar Program IDs** en .env.local
3. **Configurar Supabase** con datos reales
4. **Probar todas las funcionalidades**
5. **Deploy a producción**

---

¡Disfruta de PokeDotDuel! 🎮⚡

