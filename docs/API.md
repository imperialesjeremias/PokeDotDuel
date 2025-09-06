# API Documentation - PokeDotDuel

Esta documentación describe todas las APIs disponibles en PokeDotDuel, incluyendo:

- **APIs REST tradicionales** (Next.js API Routes)
- **Clientes TypeScript para Solana** (funciones blockchain)
- **WebSocket APIs** (tiempo real)

## ⚠️ **IMPORTANTE**: APIs Actualizadas

El proyecto ha sido migrado completamente a **TypeScript**. Las APIs blockchain ahora se manejan a través de clientes TypeScript que interactúan con programas de Solana externos, en lugar de APIs REST tradicionales.

## 🔐 Autenticación

Todas las APIs (excepto las públicas) requieren autenticación mediante JWT en el header `Authorization`:

```
Authorization: Bearer <jwt_token>
```

## 🔗 APIs de Clientes TypeScript

### Configuración Inicial

```typescript
import { usePVP, useVRF, useBridge } from '../hooks';

// En tu componente
const pvp = usePVP();
const vrf = useVRF();
const bridge = useBridge();
```

### PVP Escrow Client

#### `createLobby(lobbyData, feeVault)`
Crear un nuevo lobby para batalla PvP.

**Parámetros**:
```typescript
lobbyData: {
  lobbyId: string;
  wagerLamports: number;
}
feeVault: string; // Dirección del vault de fees
```

**Retorno**: `Promise<string>` - Firma de transacción

#### `joinLobby(lobbyId)`
Unirse a un lobby existente.

**Parámetros**:
```typescript
lobbyId: string;
```

**Retorno**: `Promise<string>` - Firma de transacción

#### `getLobby(lobbyId)`
Obtener información de un lobby.

**Parámetros**:
```typescript
lobbyId: string;
```

**Retorno**: `Promise<Lobby | null>`

### VRF Client

#### `buyPack(packData)`
Comprar un booster pack.

**Parámetros**:
```typescript
packData: {
  packId: string;
}
```

**Retorno**: `Promise<string>` - Firma de transacción

#### `requestVrf(packId, vrfAccount, permissionAccount, switchboardState)`
Solicitar VRF para abrir un pack.

**Parámetros**:
```typescript
packId: string;
vrfAccount: string;
permissionAccount: string;
switchboardState: string;
```

**Retorno**: `Promise<string>` - Firma de transacción

### Bridge Client

#### `depositSol(data)`
Depositar SOL para recibir PokéCoins.

**Parámetros**:
```typescript
data: {
  amount: number; // En lamports
}
```

**Retorno**: `Promise<string>` - Firma de transacción

## 📋 Endpoints REST

### Autenticación

#### `POST /api/auth/privy/callback`

Callback para autenticación con Privy.

**Request Body**:
```json
{
  "walletAddress": "string",
  "userId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "walletAddress": "string",
    "username": "string",
    "level": 1,
    "xp": 0,
    "pokecoins": 1000,
    "stats": {
      "wins": 0,
      "losses": 0,
      "packsOpened": 0,
      "cardsOwned": 0,
      "totalWagered": 0,
      "totalWon": 0
    }
  }
}
```

### Perfil de Usuario

#### `GET /api/profile/me`

Obtener perfil del usuario autenticado.

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "walletAddress": "string",
    "username": "string",
    "level": 1,
    "xp": 0,
    "badges": [],
    "pokecoins": 1000,
    "stats": {
      "wins": 0,
      "losses": 0,
      "packsOpened": 0,
      "cardsOwned": 0,
      "totalWagered": 0,
      "totalWon": 0
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `PUT /api/profile/me`

Actualizar perfil del usuario.

**Request Body**:
```json
{
  "username": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string"
  }
}
```

### Equipos

#### `GET /api/team`

Listar equipos del usuario.

**Response**:
```json
{
  "success": true,
  "teams": [
    {
      "id": "uuid",
      "name": "string",
      "slots": ["uuid", "uuid", "uuid", "uuid", "uuid", "uuid"],
      "natures": ["string", "string", "string", "string", "string", "string"],
      "moves": {
        "cardId": ["string", "string", "string", "string"]
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/team`

Crear nuevo equipo.

**Request Body**:
```json
{
  "name": "string",
  "slots": ["uuid", "uuid", "uuid", "uuid", "uuid", "uuid"],
  "natures": ["string", "string", "string", "string", "string", "string"],
  "moves": {
    "cardId": ["string", "string", "string", "string"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "team": {
    "id": "uuid",
    "name": "string",
    "slots": ["uuid", "uuid", "uuid", "uuid", "uuid", "uuid"],
    "natures": ["string", "string", "string", "string", "string", "string"],
    "moves": {
      "cardId": ["string", "string", "string", "string"]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `GET /api/team/[id]`

Obtener equipo específico.

**Response**:
```json
{
  "success": true,
  "team": {
    "id": "uuid",
    "name": "string",
    "slots": ["uuid", "uuid", "uuid", "uuid", "uuid", "uuid"],
    "natures": ["string", "string", "string", "string", "string", "string"],
    "moves": {
      "cardId": ["string", "string", "string", "string"]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `PUT /api/team/[id]`

Actualizar equipo.

**Request Body**:
```json
{
  "name": "string",
  "slots": ["uuid", "uuid", "uuid", "uuid", "uuid", "uuid"],
  "natures": ["string", "string", "string", "string", "string", "string"],
  "moves": {
    "cardId": ["string", "string", "string", "string"]
  }
}
```

#### `DELETE /api/team/[id]`

Eliminar equipo.

**Response**:
```json
{
  "success": true,
  "message": "Team deleted successfully"
}
```

### Marketplace

#### `GET /api/market/listings`

Listar cartas en venta.

**Query Parameters**:
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)
- `rarity` (string): Filtrar por rareza
- `minPrice` (number): Precio mínimo en lamports
- `maxPrice` (number): Precio máximo en lamports
- `isShiny` (boolean): Filtrar por shiny

**Response**:
```json
{
  "success": true,
  "listings": [
    {
      "id": "uuid",
      "priceLamports": 5000000,
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "card": {
        "id": "uuid",
        "dexNumber": 25,
        "name": "Pikachu",
        "isShiny": false,
        "rarity": "RARE",
        "level": 25,
        "stats": {
          "hp": 35,
          "atk": 55,
          "def": 40,
          "spa": 50,
          "spd": 50,
          "spe": 90
        },
        "types": ["ELECTRIC"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### `POST /api/market/listings`

Crear nuevo listado.

**Request Body**:
```json
{
  "cardId": "uuid",
  "priceLamports": 5000000
}
```

**Response**:
```json
{
  "success": true,
  "listing": {
    "id": "uuid",
    "cardId": "uuid",
    "priceLamports": 5000000,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /api/market/listings/[id]/buy`

Comprar carta.

**Response**:
```json
{
  "success": true,
  "message": "Card purchased successfully",
  "card": {
    "id": "uuid",
    "dexNumber": 25,
    "name": "Pikachu",
    "isShiny": false,
    "rarity": "RARE",
    "level": 25,
    "stats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "types": ["ELECTRIC"]
  }
}
```

### Apuestas y Lobbies

#### `GET /api/wager/lobby`

Listar lobbies disponibles.

**Query Parameters**:
- `bracketId` (number): Filtrar por bracket
- `status` (string): Filtrar por estado (default: OPEN)
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)

**Response**:
```json
{
  "success": true,
  "lobbies": [
    {
      "id": "uuid",
      "bracketId": 2,
      "creatorId": "uuid",
      "opponentId": "uuid",
      "wagerLamports": 7500000,
      "status": "FULL",
      "bracket": {
        "name": "0.005 - 0.01 SOL",
        "minLamports": 5000000,
        "maxLamports": 10000000
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### `POST /api/wager/lobby`

Crear nuevo lobby.

**Request Body**:
```json
{
  "bracketId": 2,
  "wagerLamports": 7500000,
  "inviteCode": "string"
}
```

**Response**:
```json
{
  "success": true,
  "lobby": {
    "id": "uuid",
    "bracketId": 2,
    "creatorId": "uuid",
    "wagerLamports": 7500000,
    "inviteCode": "string",
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /api/wager/lobby/[id]/join`

Unirse a lobby.

**Response**:
```json
{
  "success": true,
  "message": "Successfully joined lobby"
}
```

#### `POST /api/wager/lobby/[id]/lock`

Bloquear lobby para batalla.

**Response**:
```json
{
  "success": true,
  "message": "Lobby locked successfully"
}
```

#### `POST /api/wager/lobby/[id]/resolve`

Resolver batalla.

**Request Body**:
```json
{
  "winner": "uuid",
  "transcriptHash": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Battle resolved successfully"
}
```

#### `POST /api/wager/lobby/[id]/cancel`

Cancelar lobby.

**Response**:
```json
{
  "success": true,
  "message": "Lobby cancelled successfully"
}
```

### Booster Packs

#### `POST /api/packs/buy`

Comprar booster pack.

**Response**:
```json
{
  "success": true,
  "pack": {
    "id": "uuid",
    "buyerId": "uuid",
    "opened": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /api/packs/open`

Abrir booster pack.

**Request Body**:
```json
{
  "packId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "rewards": [
    {
      "cardId": "uuid",
      "cardName": "Pikachu",
      "rarity": "RARE",
      "isShiny": false
    }
  ]
}
```

### Historial

#### `GET /api/history/transactions`

Obtener historial de transacciones.

**Query Parameters**:
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)
- `kind` (string): Filtrar por tipo de transacción

**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "kind": "BUY_CARD",
      "solLamports": 5000000,
      "pokecoinsDelta": 0,
      "refId": "uuid",
      "onchainSig": "string",
      "metadata": {
        "cardId": "uuid",
        "sellerId": "uuid"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### `GET /api/history/battles`

Obtener historial de batallas.

**Query Parameters**:
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)

**Response**:
```json
{
  "success": true,
  "battles": [
    {
      "id": "uuid",
      "lobbyId": "uuid",
      "playerA": "uuid",
      "playerB": "uuid",
      "result": {
        "winner": "uuid",
        "reason": "KO"
      },
      "startedAt": "2024-01-01T00:00:00Z",
      "endedAt": "2024-01-01T00:05:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

## 🔌 WebSocket API

### Conexión

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Eventos del Cliente

#### `JOIN_LOBBY`
```json
{
  "type": "JOIN_LOBBY",
  "lobbyId": "uuid"
}
```

#### `INVITE_ACCEPT`
```json
{
  "type": "INVITE_ACCEPT",
  "lobbyId": "uuid"
}
```

#### `SELECT_TEAM`
```json
{
  "type": "SELECT_TEAM",
  "teamId": "uuid"
}
```

#### `READY`
```json
{
  "type": "READY"
}
```

#### `TURN_ACTION`
```json
{
  "type": "TURN_ACTION",
  "turn": 1,
  "move": {
    "slot": 0,
    "action": "MOVE",
    "moveId": "string",
    "target": 1
  },
  "commit": "string",
  "reveal": "string"
}
```

#### `FORFEIT`
```json
{
  "type": "FORFEIT"
}
```

### Eventos del Servidor

#### `LOBBY_STATE`
```json
{
  "type": "LOBBY_STATE",
  "state": {
    "id": "uuid",
    "bracketId": 2,
    "status": "FULL",
    "creatorId": "uuid",
    "opponentId": "uuid",
    "wagerLamports": 7500000
  }
}
```

#### `BATTLE_START`
```json
{
  "type": "BATTLE_START",
  "battleId": "uuid",
  "seed": "string"
}
```

#### `TURN_RESULT`
```json
{
  "type": "TURN_RESULT",
  "turn": 1,
  "events": [
    {
      "type": "DAMAGE",
      "target": 1,
      "value": 25,
      "move": "Tackle"
    }
  ]
}
```

#### `BATTLE_END`
```json
{
  "type": "BATTLE_END",
  "winner": "uuid",
  "reason": "KO"
}
```

#### `ERROR`
```json
{
  "type": "ERROR",
  "code": "INVALID_MOVE",
  "message": "Invalid move for this Pokémon"
}
```

## 📊 Códigos de Error

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "username",
      "message": "Username must be between 3 and 20 characters"
    }
  ]
}
```

### WebSocket Error Codes

- `AUTHENTICATION_REQUIRED`: Token de autenticación requerido
- `INVALID_TOKEN`: Token inválido
- `LOBBY_NOT_FOUND`: Lobby no encontrado
- `LOBBY_NOT_OPEN`: Lobby no está abierto
- `INVALID_MOVE`: Movimiento inválido
- `NOT_YOUR_TURN`: No es tu turno
- `BATTLE_NOT_FOUND`: Batalla no encontrada
- `INTERNAL_ERROR`: Error interno del servidor

## 🔒 Rate Limiting

- **API Routes**: 100 requests por minuto por IP
- **WebSocket**: 30 mensajes por segundo por conexión
- **Pack Purchase**: 10 packs por hora por usuario
- **Marketplace**: 50 transacciones por hora por usuario

## 📝 Ejemplos de Uso

### JavaScript/TypeScript

```typescript
// Autenticación
const response = await fetch('/api/auth/privy/callback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    walletAddress: 'user_wallet_address',
    userId: 'privy_user_id'
  })
});

const { user } = await response.json();

// Crear equipo
const teamResponse = await fetch('/api/team', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt_token}`
  },
  body: JSON.stringify({
    name: 'Mi Equipo',
    slots: ['card1', 'card2', 'card3', 'card4', 'card5', 'card6'],
    natures: ['Adamant', 'Modest', 'Jolly', 'Bold', 'Timid', 'Careful'],
    moves: {
      'card1': ['Tackle', 'Growl', 'Vine Whip', 'Poison Powder']
    }
  })
});

// WebSocket
const socket = io('ws://localhost:3001', {
  auth: { token: jwt_token }
});

socket.on('LOBBY_STATE', (data) => {
  console.log('Lobby state:', data.state);
});

socket.emit('message', {
  type: 'JOIN_LOBBY',
  lobbyId: 'lobby_id'
});
```

### cURL

```bash
# Obtener perfil
curl -X GET "http://localhost:3000/api/profile/me" \
  -H "Authorization: Bearer jwt_token"

# Crear lobby
curl -X POST "http://localhost:3000/api/wager/lobby" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d '{
    "bracketId": 2,
    "wagerLamports": 7500000
  }'

# Comprar pack
curl -X POST "http://localhost:3000/api/packs/buy" \
  -H "Authorization: Bearer jwt_token"
```

---

Esta documentación se actualiza regularmente. Para la versión más reciente, consulta el repositorio de GitHub.
