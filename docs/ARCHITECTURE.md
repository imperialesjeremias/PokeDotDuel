# Arquitectura de PokeDotDuel

Este documento describe la arquitectura técnica de PokeDotDuel, un criptojuego PvP con apuestas en SOL.

## ⚠️ **IMPORTANTE**: Arquitectura 100% TypeScript

Este proyecto ha sido completamente migrado a **TypeScript**. Ya no contiene código Rust ni programas de Solana compilados. Todo el backend blockchain se maneja a través de clientes TypeScript que interactúan con programas de Solana desplegados externamente.

## 🏗️ Visión General de la Arquitectura

PokeDotDuel utiliza una arquitectura híbrida que combina tecnologías centralizadas y descentralizadas:

- **Frontend**: Next.js 14 con App Router
- **Backend**: API Routes + Edge Functions
- **Base de Datos**: Supabase (PostgreSQL)
- **Blockchain**: Solana con clientes TypeScript para programas externos
- **Tiempo Real**: WebSockets
- **Autenticación**: Privy

## 📊 Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   WebSocket     │    │   Supabase      │
│   (Next.js)     │◄──►│   Server        │◄──►│   (PostgreSQL)  │
│   + TypeScript  │    │   (Socket.IO)   │    │                 │
│   Clients       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │   Game Logic    │    │   RLS Policies  │
│   (Next.js)     │    │   (Node.js)     │    │   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Solana        │    │   External      │
│   TypeScript    │    │   Programs      │
│   Clients       │    │   (Anchor)      │
└─────────────────┘    └─────────────────┘
```

## 🔧 Componentes Principales

### 1. Frontend (Next.js 14)

**Ubicación**: `apps/web/`

**Tecnologías**:
- Next.js 14 con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Privy para autenticación
- React Query para estado del servidor

**Estructura**:
```
apps/web/src/
├── app/                 # App Router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   ├── battle/         # Battle pages
│   ├── team-builder/   # Team builder
│   ├── marketplace/    # Marketplace
│   └── packs/          # Booster packs
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── lib/               # Utilities and configs
│   ├── clients.ts     # Export all blockchain clients
│   ├── pvpClient.ts   # PVP Escrow client
│   ├── vrfClient.ts   # VRF Packs client
│   ├── bridgeClient.ts # PokéCoins Bridge client
│   ├── supabase.ts    # Supabase client
│   ├── privy.ts       # Privy config
│   ├── solana.ts      # Solana utilities
│   └── websocket.ts   # WebSocket client
├── hooks/             # React hooks for blockchain
│   ├── usePVP.ts      # PVP operations
│   ├── useVRF.ts      # VRF operations
│   └── useBridge.ts   # Bridge operations
├── types/             # TypeScript types
└── examples/          # Usage examples
```

### 2. WebSocket Server

**Ubicación**: `apps/websocket-server/`

**Propósito**: Manejo de tiempo real para batallas y lobbies

**Tecnologías**:
- Node.js + TypeScript
- Socket.IO
- Express
- JWT para autenticación

**Estructura**:
```
apps/websocket-server/src/
├── index.ts           # Main server file
├── auth/              # Authentication
│   └── AuthManager.ts
├── game/              # Game coordination
│   └── GameManager.ts
├── lobby/             # Lobby management
│   └── LobbyManager.ts
├── battle/            # Battle logic
│   └── BattleManager.ts
└── lib/               # Utilities
    └── supabase.ts
```

### 3. Clientes Blockchain TypeScript

**Ubicación**: `apps/web/src/lib/`

Los clientes TypeScript interactúan con programas de Solana desplegados externamente.

#### 3.1 PVP Escrow Client (`pvpClient.ts`)

**Propósito**: Cliente para interactuar con contratos de apuestas PvP

**Funcionalidades**:
- ✅ Crear lobby con escrow
- ✅ Unirse a lobby
- ✅ Bloquear lobby para batalla
- ✅ Resolver batalla y distribuir ganancias
- ✅ Cancelar lobby y reembolsar

**Métodos principales**:
- `createLobby()`: Crear nuevo lobby
- `joinLobby()`: Unirse a lobby existente
- `lockLobby()`: Bloquear lobby para batalla
- `resolveMatch()`: Resolver batalla y pagar
- `cancelLobby()`: Cancelar y reembolsar

#### 3.2 VRF Client (`vrfClient.ts`)

**Propósito**: Cliente para sistema de booster packs con VRF

**Funcionalidades**:
- ✅ Comprar pack con SOL
- ✅ Solicitar VRF para apertura
- ✅ Abrir pack con resultado VRF
- ✅ Reclamar recompensas

**Métodos principales**:
- `buyPack()`: Comprar booster pack
- `requestVrf()`: Solicitar aleatoriedad VRF
- `openPack()`: Abrir pack con resultado
- `claimRewards()`: Reclamar recompensas

#### 3.3 Bridge Client (`bridgeClient.ts`)

**Propósito**: Cliente para puente SOL ↔ PokéCoins

**Funcionalidades**:
- ✅ Depositar SOL por PokéCoins
- ✅ Retirar PokéCoins por SOL
- ✅ Consultar estado del bridge

**Métodos principales**:
- `depositSol()`: Depositar SOL
- `withdrawSol()`: Retirar SOL
- `getBridge()`: Consultar estado

### 4. Base de Datos (Supabase)

**Tecnología**: PostgreSQL con Row Level Security (RLS)

**Tablas Principales**:

```sql
-- Usuarios y perfiles
users (id, wallet_address, username, level, xp, pokecoins, stats)

-- Cartas y equipos
cards (id, owner_id, dex_number, name, rarity, level, stats, types)
teams (id, owner_id, name, slots, natures, moves)

-- Batallas y lobbies
lobbies (id, bracket_id, creator_id, opponent_id, wager_lamports, status)
battles (id, lobby_id, player_a, player_b, result, transcript)

-- Marketplace
listings (id, card_id, seller_id, price_lamports, status)
auctions (id, card_id, seller_id, reserve_price, end_at, status)
bids (id, auction_id, bidder_id, amount_lamports)

-- Packs y transacciones
packs (id, buyer_id, payment_sig, vrf_request_id, opened)
pack_rewards (id, pack_id, card_id)
transactions (id, user_id, kind, sol_lamports, pokecoins_delta, ref_id)
```

**RLS Policies**:
- Usuarios solo pueden acceder a sus propios datos
- Lobbies accesibles por participantes
- Marketplace público para listados activos
- Transacciones auditables pero privadas

## 🔄 Flujos de Datos

### 1. Flujo de Autenticación

```
1. Usuario conecta wallet (Privy)
2. Privy genera JWT
3. Frontend envía JWT a API
4. API verifica JWT y obtiene usuario de Supabase
5. Usuario autenticado puede acceder a funcionalidades
```

### 2. Flujo de Batalla PvP

```
1. Usuario A crea lobby (API + Solana)
2. Usuario B se une al lobby (API + Solana)
3. Ambos seleccionan equipos (WebSocket)
4. Lobby se bloquea (Solana)
5. Batalla comienza (WebSocket)
6. Turnos se procesan (WebSocket + Game Logic)
7. Batalla termina (WebSocket)
8. Resultado se resuelve on-chain (Solana)
9. Ganancias se distribuyen (Solana)
10. Base de datos se actualiza (API)
```

### 3. Flujo de Compra de Pack

```
1. Usuario compra pack (Frontend)
2. Transacción SOL se envía (Solana)
3. Pack se crea en DB (API)
4. VRF se solicita (Solana)
5. VRF se cumple (Solana)
6. Recompensas se generan (Solana)
7. Cartas se crean en DB (API)
8. Pack se marca como abierto (API)
```

### 4. Flujo de Marketplace

```
1. Usuario lista carta (API)
2. Carta aparece en marketplace (Frontend)
3. Otro usuario compra carta (API)
4. Transacción se procesa (Solana)
5. Carta cambia de dueño (API)
6. Transacciones se registran (API)
```

## 🔒 Seguridad

### On-chain Security

1. **PDAs**: Todas las cuentas usan Program Derived Addresses
2. **Verificación de Firmas**: Todas las operaciones requieren firmas válidas
3. **Reentrancy Guards**: Protección contra ataques de reentrancia
4. **Timeouts**: Lobbies tienen timeouts para evitar bloqueos
5. **Comisiones**: Sistema de comisiones para sostenibilidad

### Off-chain Security

1. **RLS**: Row Level Security en Supabase
2. **JWT**: Autenticación con tokens JWT
3. **Validación**: Validación de entrada con Zod
4. **Rate Limiting**: Límites de velocidad en APIs
5. **CORS**: Configuración CORS apropiada

### Anti-trampa

1. **Server Authority**: Cálculos de batalla en el servidor
2. **Seeds Reproducibles**: RNG determinístico
3. **Commitment-Reveal**: Para movimientos críticos
4. **Auditoría**: Registro completo de transacciones
5. **Monitoreo**: Detección de patrones sospechosos

## 📈 Escalabilidad

### Horizontal Scaling

1. **WebSocket Servers**: Múltiples instancias con Redis
2. **API Routes**: Auto-scaling en Vercel
3. **Database**: Supabase maneja el scaling automáticamente
4. **Solana**: Red descentralizada escalable

### Optimizaciones

1. **Caching**: React Query para cache del cliente
2. **CDN**: Assets estáticos en CDN
3. **Database Indexes**: Índices optimizados
4. **Connection Pooling**: Pool de conexiones a DB
5. **Batch Operations**: Operaciones en lote cuando sea posible

## 🔍 Monitoreo y Observabilidad

### Métricas

1. **Gameplay**: Batallas por minuto, SOL en apuestas
2. **Performance**: Latencia de APIs, tiempo de respuesta WebSocket
3. **Business**: Cartas vendidas, packs abiertos, usuarios activos
4. **Technical**: Errores, uptime, uso de recursos

### Logging

1. **Structured Logs**: Logs estructurados con Logflare
2. **Error Tracking**: Sentry para errores
3. **WebSocket Logs**: Conexiones y desconexiones
4. **Transaction Logs**: Todas las transacciones on-chain

### Alertas

1. **Critical Errors**: Errores críticos inmediatos
2. **Performance**: Degradación de performance
3. **Business**: Anomalías en métricas de negocio
4. **Security**: Intentos de ataque o abuso

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Configurar Vercel
vercel

# Variables de entorno
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_PRIVY_APP_ID
# ... más variables

# Deploy
vercel --prod
```

### WebSocket Server (Railway)

```bash
# Configurar Railway
railway login
railway init

# Variables de entorno
railway variables set SUPABASE_URL=...
railway variables set JWT_SECRET=...

# Deploy
railway up
```

### Programas Solana Externos

Los programas de Solana deben desplegarse por separado:

1. **Desarrollar programas** usando Anchor o similar
2. **Desplegar a devnet/mainnet** usando herramientas de Solana
3. **Actualizar variables de entorno** con las direcciones reales
4. **Los clientes TypeScript** se conectarán automáticamente

```bash
# Ejemplo de despliegue con Anchor
anchor build
anchor deploy --provider.cluster mainnet-beta
```

### Database (Supabase)

```bash
# Aplicar migraciones
supabase db push --project-ref tu-project-ref
```

## 🔮 Futuras Mejoras

### Técnicas

1. **Microservicios**: Separar servicios por dominio
2. **Event Sourcing**: Para auditoría completa
3. **CQRS**: Separar comandos y consultas
4. **GraphQL**: API más flexible
5. **Mobile App**: React Native o Flutter

### Funcionales

1. **Torneos**: Sistema de torneos automáticos
2. **Guilds**: Clanes y competencias entre equipos
3. **Misiones**: Sistema de misiones diarias
4. **NFTs**: Cartas como NFTs
5. **Staking**: Staking de SOL para recompensas

---

Esta arquitectura está diseñada para ser escalable, segura y mantenible, permitiendo el crecimiento del juego mientras mantiene la integridad de las apuestas y la experiencia del usuario.
