import { z } from 'zod';

// Enums
export type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY';
export type TypeGen1 = 
  | 'NORMAL' | 'FIRE' | 'WATER' | 'ELECTRIC' | 'GRASS' | 'ICE' 
  | 'FIGHTING' | 'POISON' | 'GROUND' | 'FLYING' | 'PSYCHIC' 
  | 'BUG' | 'ROCK' | 'GHOST' | 'DRAGON';

export type LobbyStatus = 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED';
export type AuctionStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type TransactionKind = 
  | 'DEPOSIT_SOL' | 'WITHDRAW_SOL' | 'BUY_POKECOINS' | 'SELL_CARD' 
  | 'BUY_CARD' | 'BID' | 'WAGER_DEPOSIT' | 'WAGER_PAYOUT' 
  | 'PACK_PURCHASE' | 'PACK_REWARD';

// Zod schemas
export const RaritySchema = z.enum(['COMMON', 'RARE', 'LEGENDARY']);
export const TypeGen1Schema = z.enum([
  'NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE',
  'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC',
  'BUG', 'ROCK', 'GHOST', 'DRAGON'
]);

export const StatsSchema = z.object({
  hp: z.number().min(0),
  atk: z.number().min(0),
  def: z.number().min(0),
  spa: z.number().min(0),
  spd: z.number().min(0),
  spe: z.number().min(0),
});

export const CardSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  dexNumber: z.number().min(1).max(151),
  name: z.string(),
  isShiny: z.boolean(),
  rarity: RaritySchema,
  level: z.number().min(1).max(100),
  stats: StatsSchema,
  types: z.array(TypeGen1Schema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  walletAddress: z.string(),
  generatedWalletAddress: z.string().optional(),
  username: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  level: z.number().min(1),
  xp: z.number().min(0),
  badges: z.array(z.any()),
  pokecoins: z.number().min(0),
  solBalance: z.number().min(0),
  stats: z.object({
    wins: z.number().min(0),
    losses: z.number().min(0),
    packsOpened: z.number().min(0),
    cardsOwned: z.number().min(0),
    totalWagered: z.number().min(0),
    totalWon: z.number().min(0),
  }),
});

export const TeamSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  slots: z.array(z.string().uuid()).length(6),
  natures: z.array(z.string()),
  moves: z.record(z.array(z.string())),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LobbySchema = z.object({
  id: z.string().uuid(),
  bracketId: z.number(),
  creatorId: z.string().uuid(),
  opponentId: z.string().uuid().optional(),
  inviteCode: z.string().optional(),
  status: z.enum(['OPEN', 'FULL', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']),
  escrowPda: z.string().optional(),
  wagerLamports: z.number().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BattleSchema = z.object({
  id: z.string().uuid(),
  lobbyId: z.string().uuid(),
  playerA: z.string().uuid(),
  playerB: z.string().uuid(),
  result: z.object({
    winner: z.string().uuid(),
    reason: z.enum(['KO', 'Timeout', 'Forfeit']),
  }).optional(),
  transcript: z.array(z.any()).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const ListingSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  sellerId: z.string().uuid(),
  priceLamports: z.number().min(0),
  status: z.enum(['ACTIVE', 'SOLD', 'CANCELLED']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuctionSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  sellerId: z.string().uuid(),
  reservePriceLamports: z.number().min(0),
  endAt: z.string().datetime(),
  status: z.enum(['ACTIVE', 'ENDED', 'CANCELLED']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BidSchema = z.object({
  id: z.string().uuid(),
  auctionId: z.string().uuid(),
  bidderId: z.string().uuid(),
  amountLamports: z.number().min(0),
  createdAt: z.string().datetime(),
});

export const PackSchema = z.object({
  id: z.string().uuid(),
  buyerId: z.string().uuid(),
  paymentSig: z.string().optional(),
  vrfRequestId: z.string().optional(),
  opened: z.boolean(),
  openedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  cardId: z.string().uuid().optional(),
  kind: z.enum([
    'DEPOSIT_SOL', 'WITHDRAW_SOL', 'BUY_POKECOINS', 'SELL_CARD',
    'BUY_CARD', 'BID', 'WAGER_DEPOSIT', 'WAGER_PAYOUT',
    'PACK_PURCHASE', 'PACK_REWARD'
  ]),
  solLamports: z.number().min(0),
  pokecoinsDelta: z.number(),
  refId: z.string().uuid().optional(),
  onchainSig: z.string().optional(),
  metadata: z.record(z.any()),
  createdAt: z.string().datetime(),
});

// TypeScript types
export type Card = z.infer<typeof CardSchema>;
export type User = z.infer<typeof UserSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type Battle = z.infer<typeof BattleSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type Auction = z.infer<typeof AuctionSchema>;
export type Bid = z.infer<typeof BidSchema>;
export type Pack = z.infer<typeof PackSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Stats = z.infer<typeof StatsSchema>;

// WebSocket message types (moved to end of file to avoid duplicates)

export interface LobbyState {
  id: string;
  bracketId: number;
  status: LobbyStatus;
  escrowPda?: string;
  creatorId: string;
  opponentId?: string;
  wagerLamports: number;
  isBot?: boolean;
}

export interface BattleEvent {
  type: 'DAMAGE' | 'HEAL' | 'STATUS' | 'SWITCH' | 'MOVE';
  target: number;
  value?: number;
  status?: string;
  move?: string;
}

// Battle-related types
export interface BattleState {
  id: string;
  turn: number;
  phase: 'SELECT' | 'BATTLE' | 'END';
  player1Id: string;
  player2Id: string;
  player1Team: BattlePokemon[];
  player2Team: BattlePokemon[];
  players: {
    [playerId: string]: {
      team: BattlePokemon[];
      activePokemon: number;
      ready: boolean;
    };
  };
  field: {
    weather?: string;
    terrain?: string;
    hazards: Record<string, any>;
  };
  log: BattleEvent[];
}

export interface BattlePokemon {
  id: string;
  species: string;
  level: number;
  gender?: 'M' | 'F';
  shiny?: boolean;
  ability: string;
  item?: string;
  nature: string;
  evs: Stats;
  ivs: Stats;
  moves: BattleMove[];
  hp: number;
  maxHp: number;
  status?: string | null;
  statusTurns?: number;
  type1: TypeGen1;
  type2?: TypeGen1;
  boosts: {
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
    accuracy: number;
    evasion: number;
  };
}

export interface BattleMove {
  id: string;
  name: string;
  type: TypeGen1;
  category: 'PHYSICAL' | 'SPECIAL' | 'STATUS';
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
  priority: number;
  flags: string[];
  target: string;
}

export interface BattleTeam {
  id: string;
  name: string;
  pokemon: BattlePokemon[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Battle mechanics
export interface Move {
  id: string;
  name: string;
  type: TypeGen1;
  power: number;
  accuracy: number;
  pp: number;
  category: 'PHYSICAL' | 'SPECIAL' | 'STATUS';
  priority: number;
  effects?: MoveEffect[];
}

export interface MoveEffect {
  type: 'DAMAGE' | 'STATUS' | 'STAT_CHANGE' | 'HEAL';
  value?: number;
  status?: string;
  stat?: string;
  chance?: number;
}

export interface PokemonData {
  dexNumber: number;
  name: string;
  types: TypeGen1[];
  baseStats: Stats;
  moves: {
    levelUp: Array<{ level: number; move: string }>;
    tm: string[];
    egg: string[];
    tutor: string[];
  };
}

// Type effectiveness chart (Gen 1)
export const TYPE_EFFECTIVENESS: Record<TypeGen1, Record<TypeGen1, number>> = {
  NORMAL: {
    NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
    FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
    BUG: 1, ROCK: 0.5, GHOST: 0, DRAGON: 1
  },
  FIRE: {
    NORMAL: 1, FIRE: 0.5, WATER: 0.5, ELECTRIC: 1, GRASS: 2, ICE: 2,
    FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
    BUG: 2, ROCK: 0.5, GHOST: 1, DRAGON: 0.5
  },
  WATER: {
    NORMAL: 1, FIRE: 2, WATER: 0.5, ELECTRIC: 1, GRASS: 0.5, ICE: 1,
    FIGHTING: 1, POISON: 1, GROUND: 2, FLYING: 1, PSYCHIC: 1,
    BUG: 1, ROCK: 2, GHOST: 1, DRAGON: 0.5
  },
  ELECTRIC: {
    NORMAL: 1, FIRE: 1, WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, ICE: 1,
    FIGHTING: 1, POISON: 1, GROUND: 0, FLYING: 2, PSYCHIC: 1,
    BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 0.5
  },
  GRASS: {
    NORMAL: 1, FIRE: 0.5, WATER: 2, ELECTRIC: 1, GRASS: 0.5, ICE: 1,
    FIGHTING: 1, POISON: 0.5, GROUND: 2, FLYING: 0.5, PSYCHIC: 1,
    BUG: 0.5, ROCK: 2, GHOST: 1, DRAGON: 0.5
  },
  ICE: {
    NORMAL: 1, FIRE: 0.5, WATER: 0.5, ELECTRIC: 1, GRASS: 2, ICE: 0.5,
    FIGHTING: 1, POISON: 1, GROUND: 2, FLYING: 2, PSYCHIC: 1,
    BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 2
  },
  FIGHTING: {
    NORMAL: 2, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 2,
    FIGHTING: 1, POISON: 0.5, GROUND: 1, FLYING: 0.5, PSYCHIC: 0.5,
    BUG: 0.5, ROCK: 2, GHOST: 0, DRAGON: 1
  },
  POISON: {
    NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 2, ICE: 1,
    FIGHTING: 1, POISON: 0.5, GROUND: 0.5, FLYING: 1, PSYCHIC: 1,
    BUG: 2, ROCK: 0.5, GHOST: 0.5, DRAGON: 1
  },
  GROUND: {
    NORMAL: 1, FIRE: 2, WATER: 1, ELECTRIC: 2, GRASS: 0.5, ICE: 1,
    FIGHTING: 1, POISON: 2, GROUND: 1, FLYING: 0, PSYCHIC: 1,
    BUG: 0.5, ROCK: 2, GHOST: 1, DRAGON: 1
  },
  FLYING: {
    NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 0.5, GRASS: 2, ICE: 1,
    FIGHTING: 2, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
    BUG: 2, ROCK: 0.5, GHOST: 1, DRAGON: 1
  },
  PSYCHIC: {
    NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
    FIGHTING: 2, POISON: 2, GROUND: 1, FLYING: 1, PSYCHIC: 0.5,
    BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 1
  },
  BUG: {
    NORMAL: 1, FIRE: 0.5, WATER: 1, ELECTRIC: 1, GRASS: 2, ICE: 1,
    FIGHTING: 0.5, POISON: 2, GROUND: 1, FLYING: 0.5, PSYCHIC: 2,
    BUG: 1, ROCK: 1, GHOST: 0.5, DRAGON: 1
  },
  ROCK: {
    NORMAL: 1, FIRE: 2, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 2,
    FIGHTING: 0.5, POISON: 1, GROUND: 0.5, FLYING: 2, PSYCHIC: 1,
    BUG: 2, ROCK: 1, GHOST: 1, DRAGON: 1
  },
  GHOST: {
    NORMAL: 0, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
    FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 0,
    BUG: 1, ROCK: 1, GHOST: 2, DRAGON: 1
  },
  DRAGON: {
    NORMAL: 1, FIRE: 1, WATER: 1, ELECTRIC: 1, GRASS: 1, ICE: 1,
    FIGHTING: 1, POISON: 1, GROUND: 1, FLYING: 1, PSYCHIC: 1,
    BUG: 1, ROCK: 1, GHOST: 1, DRAGON: 2
  }
};

// Utility functions
export function calculateTypeEffectiveness(attackType: TypeGen1, targetTypes: TypeGen1[]): number {
  let effectiveness = 1;
  for (const targetType of targetTypes) {
    effectiveness *= TYPE_EFFECTIVENESS[attackType][targetType];
  }
  return effectiveness;
}

export function getTypeColor(type: TypeGen1): string {
  const colors: Record<TypeGen1, string> = {
    NORMAL: '#A8A878',
    FIRE: '#F08030',
    WATER: '#6890F0',
    ELECTRIC: '#F8D030',
    GRASS: '#78C850',
    ICE: '#98D8D8',
    FIGHTING: '#C03028',
    POISON: '#A040A0',
    GROUND: '#E0C068',
    FLYING: '#A890F0',
    PSYCHIC: '#F85888',
    BUG: '#A8B820',
    ROCK: '#B8A038',
    GHOST: '#705898',
    DRAGON: '#7038F8',
  };
  return colors[type];
}

export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    COMMON: '#9CA3AF',
    RARE: '#3B82F6',
    LEGENDARY: '#F59E0B',
  };
  return colors[rarity];
}

// WebSocket message types
export type ClientMessage =
  | { type: 'JOIN_LOBBY'; lobbyId: string }
  | { type: 'INVITE_ACCEPT'; lobbyId: string }
  | { type: 'SELECT_TEAM'; teamId: string }
  | { type: 'READY' }
  | {
      type: 'TURN_ACTION';
      turn: number;
      move: {
        slot: number;
        action: 'MOVE' | 'SWITCH';
        moveId?: string;
        target?: number;
      };
      commit?: string;
      reveal?: string;
    }
  | { type: 'FORFEIT' };

export type ServerMessage =
  | { type: 'LOBBY_STATE'; state: LobbyState }
  | { type: 'BATTLE_START'; battleId: string; seed: string }
  | { type: 'TURN_RESULT'; turn: number; events: BattleEvent[] }
  | { type: 'CHAT'; from: string; text: string }
  | { type: 'BATTLE_END'; winner: string; reason: 'KO' | 'Timeout' | 'Forfeit' }
  | { type: 'ERROR'; code: string; message: string }
  | { type: 'MATCH_FOUND'; lobbyId: string }
  | { type: 'MATCHMAKING_STATUS'; data: MatchmakingStatus }
  | { type: 'BATTLE_STATE'; state: any }
  | { type: 'BATTLE_RESULT'; winner: string; data: any; battleId?: string; };

// Duplicate interfaces removed - using definitions from above

export interface MatchmakingStatus {
  queueLength: number;
  estimatedWaitTime: number;
}
