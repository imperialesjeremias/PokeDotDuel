# PokeDotDuel WebSocket Server

Servidor WebSocket para manejar batallas en tiempo real para PokeDotDuel.

## Características

- Sistema de lobbys para emparejamiento de jugadores
- Motor de batalla para Pokémon
- Sistema de Pokédex con datos de Pokémon y movimientos
- Comunicación en tiempo real mediante WebSockets

## Requisitos

- Node.js 16+
- npm o yarn

## Instalación

```bash
# Instalar dependencias
npm install

# o con yarn
yarn install
```

## Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# o con yarn
yarn dev
```

El servidor se iniciará en `http://localhost:4000`.

## Compilación

```bash
# Compilar TypeScript a JavaScript
npm run build

# o con yarn
yarn build
```

## Producción

```bash
# Iniciar en modo producción
npm run start

# o con yarn
yarn start
```

## Estructura del proyecto

```
src/
  ├── index.ts              # Punto de entrada
  ├── battle/
  │   ├── BattleEngine.ts   # Motor de batalla
  │   └── battleHandlers.ts # Manejadores de eventos de batalla
  ├── dex/
  │   └── Pokedex.ts        # Sistema de Pokédex
  └── lobby/
      ├── LobbyManager.ts   # Gestor de lobbys
      └── lobbyHandlers.ts  # Manejadores de eventos de lobby
```

## Integración con el frontend

El frontend se conecta a este servidor mediante el hook `usePVP` que utiliza Socket.IO para la comunicación en tiempo real.

## Licencia

MIT