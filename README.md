# PokeBattle - Criptojuego PvP con Apuestas en SOL

PokeBattle es un criptojuego PvP permite a los jugadores combatir por turnos con apuestas reales en SOL. Los jugadores pueden coleccionar cartas, construir equipos, comprar booster packs y participar en un marketplace descentralizado.

## 🎮 Características Principales

- **Batallas PvP por Turnos**: Sistema de combate auténtico de Pokémon Gen 1 con mecánicas de tipos y efectividades
- **Apuestas en SOL**: Sistema de escrow on-chain seguro para apuestas reales
- **Matchmaking Inteligente**: Emparejamiento por rangos de apuesta con múltiples lobbies simultáneos
- **Team Builder**: Constructor de equipos de 6 Pokémon con análisis de tipos y cobertura
- **Marketplace Descentralizado**: Compra y venta de cartas con precios dinámicos
- **Booster Packs**: Packs pagados en SOL con probabilidades por rareza y animaciones
- **Colección de Cartas**: Sistema de rareza (Común/Rara/Legendaria) con variantes Shiny
- **Perfil de Entrenador**: Progresión con niveles, insignias y estadísticas

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API Routes de Next.js, Edge Functions
- **Base de Datos**: Supabase (PostgreSQL + RLS + Realtime)
- **Blockchain**: Solana (programas con Anchor)
- **Autenticación**: Privy (wallets + social login)
- **Tiempo Real**: WebSockets (Socket.IO)
- **Estado**: Zustand/Jotai + React Query

### Estructura del Proyecto

```
PokeBattle/
├── apps/
│   ├── web/                 # Frontend Next.js
│   └── websocket-server/    # Servidor WebSocket
├── packages/
│   └── shared/             # Tipos y utilidades compartidas
├── programs/
│   └── solana/             # Programas Anchor
│       ├── pvp_escrow/     # Escrow para apuestas PvP
│       ├── packs_vrf/      # Booster packs con VRF
│       └── pokecoins_bridge/ # Bridge SOL ↔ PokéCoins
├── supabase/
│   ├── migrations/         # Migraciones de base de datos
│   └── config.toml         # Configuración de Supabase
└── tests/                  # Tests de programas Solana
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI
- Supabase CLI

### 1. Clonar el Repositorio

```bash
git clone https://github.com/imperialesjeremias/pokebattle.git
cd pokebattle
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Solana
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=tu_privy_app_id
PRIVY_APP_SECRET=tu_privy_app_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# JWT
JWT_SECRET=tu_jwt_secret

# Configuración
MARKETPLACE_FEE_BPS=250
PACK_PRICE_LAMPORTS=100000000
```

### 4. Configurar Supabase

```bash
# Inicializar Supabase
supabase init

# Aplicar migraciones
supabase db reset

# Iniciar Supabase local (opcional)
supabase start
```

### 5. Configurar Solana

```bash
# Configurar Solana CLI
solana config set --url devnet

# Crear wallet (si no tienes)
solana-keygen new --outfile ~/.config/solana/id.json

# Obtener SOL de prueba
solana airdrop 2
```

### 6. Desplegar Programas Anchor

```bash
# Construir programas
anchor build

# Desplegar a devnet
anchor deploy --provider.cluster devnet
```

### 7. Ejecutar el Proyecto

```bash
# Desarrollo
npm run dev

# O ejecutar servicios individualmente
npm run dev:web          # Frontend
npm run dev:websocket    # Servidor WebSocket
```

## 🎯 Funcionalidades Detalladas

### Sistema de Batallas

- **Mecánicas Gen 1**: Tipos, efectividades, estados, prioridades
- **Determinístico**: Cálculos server-side con seeds reproducibles
- **Anti-trampa**: Commitment-reveal para movimientos críticos
- **Tiempo Real**: WebSockets para sincronización fluida

### Sistema de Apuestas

- **Escrow On-chain**: PDAs seguros para retener apuestas
- **Distribución Automática**: Payouts al ganador menos comisiones
- **Rangos de Apuesta**: Múltiples brackets para diferentes niveles
- **Auditoría Completa**: Registro de todas las transacciones

### Marketplace

- **Listados Fijos**: Precios establecidos por el vendedor
- **Subastas**: Sistema de pujas con tiempo límite
- **Fees Configurables**: Comisiones del marketplace
- **Historial Completo**: Transacciones auditables

### Booster Packs

- **VRF On-chain**: Switchboard VRF para aleatoriedad verificable
- **Probabilidades Transparentes**: 80% Común, 18% Rara, 2% Legendaria
- **Shiny Rate**: 1/128 chance por carta
- **Animaciones**: Apertura visual con skip opcional

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/privy/callback` - Callback de Privy

### Perfil
- `GET /api/profile/me` - Obtener perfil del usuario
- `PUT /api/profile/me` - Actualizar perfil

### Equipos
- `GET /api/team` - Listar equipos del usuario
- `POST /api/team` - Crear nuevo equipo
- `GET /api/team/[id]` - Obtener equipo específico
- `PUT /api/team/[id]` - Actualizar equipo
- `DELETE /api/team/[id]` - Eliminar equipo

### Marketplace
- `GET /api/market/listings` - Listar cartas en venta
- `POST /api/market/listings` - Crear nuevo listado
- `POST /api/market/listings/[id]/buy` - Comprar carta

### Apuestas
- `GET /api/wager/lobby` - Listar lobbies
- `POST /api/wager/lobby` - Crear lobby
- `POST /api/wager/lobby/[id]/join` - Unirse a lobby
- `POST /api/wager/lobby/[id]/lock` - Bloquear lobby
- `POST /api/wager/lobby/[id]/resolve` - Resolver batalla

### Packs
- `POST /api/packs/buy` - Comprar booster pack
- `POST /api/packs/open` - Abrir pack

### Historial
- `GET /api/history/transactions` - Transacciones del usuario
- `GET /api/history/battles` - Batallas del usuario

## 🧪 Testing

### Tests de Programas Solana

```bash
# Ejecutar tests de Anchor
anchor test

# Tests específicos
npm run test:pvp-escrow
npm run test:packs-vrf
```

### Tests E2E

```bash
# Instalar Playwright
npm install -D @playwright/test

# Ejecutar tests E2E
npm run test:e2e
```

## 📊 Base de Datos

### Esquemas Principales

- **users**: Perfiles de usuarios con estadísticas
- **cards**: Cartas Pokémon con stats y rareza
- **teams**: Equipos de 6 Pokémon
- **lobbies**: Lobbies de batalla con apuestas
- **battles**: Registro de batallas y resultados
- **listings**: Cartas en venta en el marketplace
- **auctions**: Subastas activas
- **packs**: Booster packs comprados
- **transactions**: Auditoría de todas las transacciones

### Row Level Security (RLS)

- Usuarios solo pueden acceder a sus propios datos
- Lobbies y batallas accesibles por participantes
- Marketplace público para listados activos
- Transacciones auditables pero privadas

## 🔒 Seguridad

### On-chain
- PDAs para escrow seguro
- Verificación de firmas
- Reentrancy guards
- Timeouts parametrizables

### Off-chain
- RLS estricto en Supabase
- Validación con Zod
- Rate limiting
- JWT para autenticación

### Anti-trampa
- Cálculos server-side
- Seeds reproducibles
- Commitment-reveal
- Monitoreo de patrones

## 🚀 Despliegue

### Frontend (Vercel)

```bash
# Configurar Vercel
vercel

# Variables de entorno en Vercel dashboard
# Desplegar
vercel --prod
```

### WebSocket Server (Railway/Render)

```bash
# Configurar Railway
railway login
railway init
railway up
```

### Programas Solana (Mainnet)

```bash
# Configurar mainnet
solana config set --url mainnet-beta

# Desplegar programas
anchor deploy --provider.cluster mainnet-beta
```

### Base de Datos (Supabase)

```bash
# Aplicar migraciones a producción
supabase db push --project-ref tu-project-ref
```

## 📈 Monitoreo y Observabilidad

### Métricas
- Batallas por minuto
- SOL en apuestas
- Cartas vendidas
- Packs abiertos

### Logs
- Logflare para logs estructurados
- Sentry para errores
- WebSocket connection tracking

### Alertas
- Fallos de transacciones
- Lobbies abandonados
- Errores de VRF
- Rate limit exceeded

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Discord**: [Únete a nuestro servidor](https://discord.gg/pokebattle)
- **Twitter**: [@PokeBattleGame](https://twitter.com/pokebattlegame)
- **Email**: support@pokebattle.com

## 🗺️ Roadmap

### MVP (Actual)
- ✅ Batallas PvP básicas
- ✅ Sistema de apuestas
- ✅ Marketplace simple
- ✅ Booster packs

### Beta
- 🔄 Subastas
- 🔄 Torneos
- 🔄 Misiones diarias
- 🔄 Sistema de guilds

### V1.0
- ⏳ Mobile app
- ⏳ Más generaciones de Pokémon
- ⏳ NFTs de cartas
- ⏳ Staking de SOL

---

**¡Únete a la revolución del gaming con blockchain! 🎮⚡**
