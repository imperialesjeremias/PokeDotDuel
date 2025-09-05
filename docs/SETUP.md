# Guía de Configuración - PokeBattle

Esta guía te ayudará a configurar PokeBattle desde cero en tu entorno de desarrollo.

## 📋 Prerrequisitos

### Software Requerido

1. **Node.js 18+**
   ```bash
   # Verificar versión
   node --version
   npm --version
   ```

2. **Rust 1.70+**
   ```bash
   # Instalar Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   rustc --version
   ```

3. **Solana CLI**
   ```bash
   # Instalar Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   solana --version
   ```

4. **Anchor CLI**
   ```bash
   # Instalar Anchor
   npm install -g @coral-xyz/anchor-cli
   anchor --version
   ```

5. **Supabase CLI**
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase
   supabase --version
   ```

### Cuentas Necesarias

1. **Privy Account**: [https://privy.io](https://privy.io)
2. **Supabase Account**: [https://supabase.com](https://supabase.com)
3. **Solana Wallet**: Phantom, Solflare, o similar

## 🚀 Configuración Paso a Paso

### 1. Clonar y Configurar el Proyecto

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/pokebattle.git
cd pokebattle

# Instalar dependencias
npm install

# Instalar dependencias de Anchor
cd programs/solana
anchor build
cd ../..
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

### 4. Configurar Solana

#### Configurar Wallet

```bash
# Crear nueva wallet (si no tienes)
solana-keygen new --outfile ~/.config/solana/id.json

# Configurar para devnet
solana config set --url devnet

# Verificar configuración
solana config get

# Obtener SOL de prueba
solana airdrop 2
```

#### Configurar Variables de Entorno

```env
# Solana
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### 5. Desplegar Programas Anchor

#### Configurar Anchor.toml

Edita `Anchor.toml` con tu wallet:

```toml
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

#### Desplegar Programas

```bash
# Construir programas
anchor build

# Desplegar a devnet
anchor deploy --provider.cluster devnet

# Anotar los Program IDs generados
```

#### Actualizar Program IDs

Actualiza los Program IDs en:
- `apps/web/src/lib/solana.ts`
- `programs/solana/*/src/lib.rs`

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

### 3. Verificar Programas Solana

```bash
# Ejecutar tests
anchor test

# Verificar deployment
solana program show <PROGRAM_ID>
```

### 4. Verificar Base de Datos

1. Ve a tu dashboard de Supabase
2. Verifica que las tablas se crearon correctamente
3. Ejecuta algunas consultas de prueba

## 🔧 Solución de Problemas

### Problemas Comunes

#### Error de Conexión a Solana

```bash
# Verificar configuración
solana config get

# Verificar balance
solana balance

# Obtener más SOL de prueba
solana airdrop 2
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

# Logs de Solana
solana logs

# Logs de Next.js
npm run dev 2>&1 | tee logs/nextjs.log
```

## 📚 Recursos Adicionales

### Documentación

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Privy Docs](https://docs.privy.io)
- [Anchor Docs](https://www.anchor-lang.com/docs)
- [Solana Docs](https://docs.solana.com)

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
