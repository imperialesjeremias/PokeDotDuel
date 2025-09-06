// Backend configuration
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
export const BACKEND_WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  // Add more endpoints as needed
} as const;

// WebSocket events
export const WS_EVENTS = {
  // Client to server
  JOIN_LOBBY: 'JOIN_LOBBY',
  INVITE_ACCEPT: 'INVITE_ACCEPT',
  SELECT_TEAM: 'SELECT_TEAM',
  READY: 'READY',
  TURN_ACTION: 'TURN_ACTION',
  FORFEIT: 'FORFEIT',

  // Server to client
  LOBBY_STATE: 'LOBBY_STATE',
  BATTLE_START: 'BATTLE_START',
  TURN_RESULT: 'TURN_RESULT',
  BATTLE_END: 'BATTLE_END',
  ERROR: 'ERROR',
  CHAT: 'CHAT',
} as const;

