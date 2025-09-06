export interface PackReward {
  cardId: string;
  cardName: string;
  dexNumber: number;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  isShiny: boolean;
}

export interface Pack {
  id: string;
  buyerId: string;
  opened: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
}

export interface Lobby {
  id: string;
  bracketId: string;
  creatorId: string;
  opponentId?: string;
  wagerLamports: number;
  status: 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  bracket: {
    name: string;
    minLamports: number;
    maxLamports: number;
  };
  createdAt: string;
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
  | { type: 'ERROR'; code: string; message: string };

export interface LobbyState {
  id: string;
  bracketId: number;
  status: 'OPEN' | 'WAITING' | 'READY' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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
