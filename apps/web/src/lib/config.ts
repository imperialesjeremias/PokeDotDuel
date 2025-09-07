// Configuration constants for PokeDotDuel (Pokemon Showdown integration)

export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  API_PREFIX: '/api',

  // WebSocket Configuration
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',

  // Frontend Configuration
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',

  // Game Configuration
  MAX_TEAM_SIZE: 6,
  MAX_MOVE_PP: 40,

  // Battle Configuration
  BATTLE_TIMEOUT: 30000, // 30 seconds per turn
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 2000,

  // Lobby Configuration
  MAX_LOBBY_WAIT_TIME: 300000, // 5 minutes
  LOBBY_CLEANUP_INTERVAL: 60000, // 1 minute

  // Bracket Configuration
  BRACKETS: [
    { id: 1, minWager: 0.01 * 1_000_000_000, maxWager: 0.05 * 1_000_000_000, name: 'Bronze', description: '0.01 - 0.05 SOL' },
    { id: 2, minWager: 0.05 * 1_000_000_000, maxWager: 0.1 * 1_000_000_000, name: 'Silver', description: '0.05 - 0.1 SOL' },
    { id: 3, minWager: 0.1 * 1_000_000_000, maxWager: 0.5 * 1_000_000_000, name: 'Gold', description: '0.1 - 0.5 SOL' },
    { id: 4, minWager: 0.5 * 1_000_000_000, maxWager: 1 * 1_000_000_000, name: 'Platinum', description: '0.5 - 1 SOL' },
    { id: 5, minWager: 1 * 1_000_000_000, maxWager: 5 * 1_000_000_000, name: 'Diamond', description: '1 - 5 SOL' },
    { id: 6, minWager: 5 * 1_000_000_000, maxWager: Number.MAX_SAFE_INTEGER, name: 'Master', description: '5+ SOL' },
  ],

  // Pokemon Showdown specific settings
  SHOWDOWN: {
    THEME: 'dark',
    LANGUAGE: 'es',
    SOUND_ENABLED: true,
    ANIMATIONS_ENABLED: true,
    AUTOSCROLL_CHAT: true,
    SHOW_AVATARS: true,
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 4000,
    LOADING_TIMEOUT: 10000,
    DEBOUNCE_DELAY: 300,
  },

  // Development settings
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  ENABLE_DEVTOOLS: process.env.NODE_ENV === 'development',
} as const;

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  return `${CONFIG.API_BASE_URL}${CONFIG.API_PREFIX}${endpoint}`;
};

export const getWsUrl = (): string => {
  return CONFIG.WS_URL;
};

export const getBracketById = (id: number) => {
  return CONFIG.BRACKETS.find(bracket => bracket.id === id);
};

export const getBracketForWager = (wagerLamports: number) => {
  return CONFIG.BRACKETS.find(bracket =>
    wagerLamports >= bracket.minWager && wagerLamports <= bracket.maxWager
  );
};

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_WS_URL',
    'NEXT_PUBLIC_FRONTEND_URL',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Using default values for missing variables');
  }
};
