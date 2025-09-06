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
  username: z.string().optional(),
  createdAt: z.string().datetime(),
  level: z.number().min(1),
  xp: z.number().min(0),
  badges: z.array(z.any()),
  pokecoins: z.number().min(0),
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
  moves: z.record(z.string(), z.array(z.string())),
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

// TypeScript types
export type Card = z.infer<typeof CardSchema>;
export type User = z.infer<typeof UserSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type Battle = z.infer<typeof BattleSchema>;
export type Stats = z.infer<typeof StatsSchema>;

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
  | { type: 'ERROR'; code: string; message: string };

export interface LobbyState {
  id: string;
  bracketId: number;
  status: LobbyStatus;
  escrowPda?: string;
  creatorId: string;
  opponentId?: string;
  wagerLamports: number;
}

export interface BattleEvent {
  type: 'DAMAGE' | 'HEAL' | 'STATUS' | 'SWITCH' | 'MOVE';
  target: number;
  value?: number;
  status?: string;
  move?: string;
}

// Matchmaking interfaces
export interface Bracket {
  id: number;
  minWager: number;
  maxWager: number;
  name: string;
  description: string;
}

export interface QueueStatus {
  queueLength: number;
  estimatedWaitTime: number;
}

export interface MatchmakingStatus {
  brackets: Bracket[];
  queues: Record<number, QueueStatus>;
}
