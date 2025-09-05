import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { LobbyState } from '@pokebattle/shared';

export interface Lobby {
  id: string;
  bracketId: number;
  creatorId: string;
  opponentId?: string;
  status: 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  wagerLamports: number;
  creatorSocketId?: string;
  opponentSocketId?: string;
  creatorTeamId?: string;
  opponentTeamId?: string;
  creatorReady: boolean;
  opponentReady: boolean;
}

export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();

  async createLobby(
    bracketId: number,
    creatorId: string,
    wagerLamports: number,
    socketId: string
  ): Promise<Lobby> {
    const lobbyId = uuidv4();
    
    const lobby: Lobby = {
      id: lobbyId,
      bracketId,
      creatorId,
      status: 'OPEN',
      wagerLamports,
      creatorSocketId: socketId,
      creatorReady: false,
      opponentReady: false,
    };

    this.lobbies.set(lobbyId, lobby);

    // Save to database
    await supabase
      .from('lobbies')
      .insert({
        id: lobbyId,
        bracket_id: bracketId,
        creator_id: creatorId,
        wager_lamports: wagerLamports,
        status: 'OPEN',
      });

    return lobby;
  }

  async joinLobby(lobbyId: string, userId: string, socketId: string): Promise<LobbyState> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.status !== 'OPEN') {
      throw new Error('Lobby is not open');
    }

    if (lobby.creatorId === userId) {
      throw new Error('Cannot join own lobby');
    }

    lobby.opponentId = userId;
    lobby.opponentSocketId = socketId;
    lobby.status = 'FULL';

    // Update database
    await supabase
      .from('lobbies')
      .update({
        opponent_id: userId,
        status: 'FULL',
      })
      .eq('id', lobbyId);

    return this.toLobbyState(lobby);
  }

  async acceptInvite(lobbyId: string, userId: string, socketId: string): Promise<LobbyState> {
    // Same as joinLobby for now
    return this.joinLobby(lobbyId, userId, socketId);
  }

  async selectTeam(lobbyId: string, userId: string, teamId: string): Promise<LobbyState> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.creatorId === userId) {
      lobby.creatorTeamId = teamId;
    } else if (lobby.opponentId === userId) {
      lobby.opponentTeamId = teamId;
    } else {
      throw new Error('Not a member of this lobby');
    }

    return this.toLobbyState(lobby);
  }

  async setReady(lobbyId: string, userId: string): Promise<{
    lobby?: LobbyState;
    battleStarted: boolean;
    battleId?: string;
    playerA?: string;
    playerB?: string;
    teamA?: string;
    teamB?: string;
  }> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.creatorId === userId) {
      lobby.creatorReady = true;
    } else if (lobby.opponentId === userId) {
      lobby.opponentReady = true;
    } else {
      throw new Error('Not a member of this lobby');
    }

    // Check if both players are ready
    if (lobby.creatorReady && lobby.opponentReady && 
        lobby.creatorTeamId && lobby.opponentTeamId) {
      
      lobby.status = 'IN_PROGRESS';
      
      // Update database
      await supabase
        .from('lobbies')
        .update({ status: 'IN_PROGRESS' })
        .eq('id', lobbyId);

      return {
        battleStarted: true,
        battleId: uuidv4(),
        playerA: lobby.creatorId,
        playerB: lobby.opponentId!,
        teamA: lobby.creatorTeamId,
        teamB: lobby.opponentTeamId,
      };
    }

    return {
      lobby: this.toLobbyState(lobby),
      battleStarted: false,
    };
  }

  handleDisconnection(lobbyId: string, userId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    if (lobby.creatorId === userId) {
      lobby.creatorSocketId = undefined;
      lobby.creatorReady = false;
    } else if (lobby.opponentId === userId) {
      lobby.opponentSocketId = undefined;
      lobby.opponentReady = false;
    }

    // If lobby is empty, remove it
    if (!lobby.creatorSocketId && !lobby.opponentSocketId) {
      this.lobbies.delete(lobbyId);
    }
  }

  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  private toLobbyState(lobby: Lobby): LobbyState {
    return {
      id: lobby.id,
      bracketId: lobby.bracketId,
      status: lobby.status,
      creatorId: lobby.creatorId,
      opponentId: lobby.opponentId,
      wagerLamports: lobby.wagerLamports,
    };
  }
}
