# Guía de Configuración - PokeDotDuel

Esta guía te ayudará a configurar PokeDotDuel desde cero en tu entorno de desarrollo.

## ⚠️ **IMPORTANTE**: Proyecto 100% TypeScript

Este proyecto ya no requiere Rust, Anchor, ni Solana CLI. Todo el backend blockchain se maneja a través de clientes TypeScript que interactúan con programas de Solana desplegados externamente.

## 📋 Prerrequisitos

### Software Requerido

1. **Node.js 18+**
   ```bash
   # Verificar versión
   node --version
   npm --version
   ```

2. **Supabase CLI** (opcional, para desarrollo local)
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase
   supabase --version
   ```

### Cuentas Necesarias

1. **Privy Account**: [https://privy.io](https://privy.io)
2. **Supabase Account**: [https://supabase.com](https://supabase.com)
3. **Solana Wallet**: Phantom, Solflare, o similar
4. **Programas de Solana**: Direcciones de programas desplegados (PVP, VRF, Bridge)

## 🚀 Configuración Paso a Paso

### 1. Clonar y Configurar el Proyecto

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/pokedotduel.git
cd pokedotduel

# Instalar dependencias
npm install
```

### 2. Configurar Supabase

#### Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL y las claves API

#### Configurar Base de Datos Local

```bash
# Inicializar Supabase
supabase init

# Aplicar migraciones
supabase db reset

# (Opcional) Iniciar Supabase local
supabase start
```

#### Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Solana Configuration
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Program IDs (Actualizar con direcciones reales de programas desplegados)
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=tu_pvp_escrow_program_id
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=tu_packs_vrf_program_id
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=tu_bridge_program_id
```

### 3. Configurar Privy

#### Crear Aplicación en Privy

1. Ve a [privy.io](https://privy.io) y crea una cuenta
2. Crea una nueva aplicación
3. Configura los dominios permitidos
4. Anota el App ID y App Secret

#### Actualizar Variables de Entorno

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=tu_privy_app_id
PRIVY_APP_SECRET=tu_privy_app_secret
```

### 4. Configurar Programas de Solana (Externos)

#### Obtener Direcciones de Programas

Los programas de Solana deben estar desplegados externamente. Necesitas las direcciones de:

1. **PVP Escrow Program**: Programa para gestionar apuestas en batallas
2. **Packs VRF Program**: Programa para booster packs con VRF
3. **PokéCoins Bridge**: Programa para puente SOL ↔ PokéCoins

#### Opciones para Obtener Programas:

1. **Desplegar tus propios programas** usando Anchor
2. **Usar programas ya desplegados** (si tienes acceso)
3. **Programas de ejemplo** para desarrollo

#### Actualizar Variables de Entorno

Una vez que tengas las direcciones, actualízalas en `.env.local`:

```env
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=Ej7WjQt1w9BkMzWz8QX7pJzKQKQwbvL9W5TJG6X5c4N
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=ABC123...
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=DEF456...
```

### 6. Configurar WebSocket Server

#### Variables de Entorno Adicionales

```env
# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001
JWT_SECRET=tu_jwt_secret_muy_seguro

# Configuración del Juego
MARKETPLACE_FEE_BPS=250
PACK_PRICE_LAMPORTS=100000000
HEARTBEAT_INTERVAL_MS=8000
```

### 7. Ejecutar el Proyecto

#### Desarrollo Completo

```bash
# Ejecutar todos los servicios
npm run dev
```

#### Servicios Individuales

```bash
# Solo frontend
npm run dev:web

# Solo WebSocket server
npm run dev:websocket

# Solo programas Solana (tests)
npm run test
```

## 🧪 Verificar la Configuración

### 1. Verificar Frontend

1. Ve a `http://localhost:3000`
2. Deberías ver la página de inicio de PokeBattle
3. Intenta conectar tu wallet

### 2. Verificar WebSocket

1. El servidor WebSocket debería estar corriendo en puerto 3001
2. Verifica en `http://localhost:3001/health`

### 3. Verificar Clientes TypeScript

```bash
# Ejecutar tests del cliente TypeScript
npm test

# Verificar conexión con programas
npm run test:integration
```

### 4. Verificar Base de Datos

1. Ve a tu dashboard de Supabase
2. Verifica que las tablas se crearon correctamente
3. Ejecuta algunas consultas de prueba

## 🔧 Solución de Problemas

### Problemas Comunes

#### Error de Conexión a Solana

```bash
# Verificar configuración en .env.local
cat .env.local | grep SOLANA

# Verificar conexión RPC
curl $(grep NEXT_PUBLIC_RPC_URL .env.local | cut -d'=' -f2)/health

# Verificar wallet conectada en la aplicación
```

#### Error de Supabase

```bash
# Verificar conexión
supabase status

# Reiniciar servicios
supabase stop
supabase start
```

#### Error de Privy

1. Verifica que el App ID sea correcto
2. Asegúrate de que el dominio esté configurado en Privy
3. Revisa la consola del navegador para errores

#### Error de WebSocket

1. Verifica que el puerto 3001 esté libre
2. Revisa los logs del servidor WebSocket
3. Verifica la configuración de CORS

### Logs Útiles

```bash
# Logs de Supabase
supabase logs

# Logs de Next.js
npm run dev 2>&1 | tee logs/nextjs.log

# Logs del cliente TypeScript
npm run dev:debug

# Verificar conexión con programas Solana
npm run test:connection
```

## 📚 Recursos Adicionales

### Documentación

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Privy Docs](https://docs.privy.io)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Solana Docs](https://docs.solana.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Comunidad

- [Discord de PokeBattle](https://discord.gg/pokebattle)
- [Twitter](https://twitter.com/pokebattlegame)
- [GitHub Issues](https://github.com/tu-usuario/pokebattle/issues)

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. Revisa esta guía paso a paso
2. Busca en los issues de GitHub
3. Únete a nuestro Discord
4. Crea un nuevo issue con detalles del problema

---

¡Feliz desarrollo! 🎮⚡
