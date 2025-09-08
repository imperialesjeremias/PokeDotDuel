import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useWebSocket } from '../lib/websocket';
import { LobbyState, ServerMessage, ClientMessage, BattleTeam } from '../types/shared';
import { pvpClient } from '../lib/clients';

interface UsePVPReturn {
  // Lobby management
  createLobby: (bracketId: number, wagerAmount: number) => Promise<string>;
  joinLobby: (lobbyId: string) => Promise<void>;
  getLobby: (lobbyId: string) => Promise<LobbyState | null>;

  // Quick match and bot battles
  joinQuickMatch: (bracketId: number, wagerAmount: number) => Promise<void>;
  leaveQuickMatch: () => Promise<void>;
  playVsBot: (bracketId: number, wagerAmount: number, difficulty?: 'easy' | 'medium' | 'hard') => Promise<void>;
  getMatchmakingStatus: () => Promise<{ queueLength: number; estimatedWaitTime: number }>;
  quickMatch: (bracketId: number, wagerAmount: number) => Promise<{ matchId: string } | null>;

  // Battle actions
  selectTeam: (team: BattleTeam) => Promise<void>;
  ready: () => Promise<void>;
  makeMove: (move: {
    slot: number;
    action: 'MOVE' | 'SWITCH';
    moveId?: string;
    target?: number;
  }) => Promise<void>;
  forfeit: () => Promise<void>;

  // State
  currentLobby: LobbyState | null;
  currentBattle: any | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  matchmakingStatus: { queueLength: number; estimatedWaitTime: number } | null;

  // WebSocket
  sendMessage: (message: ClientMessage) => void;
  onMessage: (callback: (message: ServerMessage) => void) => void;
}

export function usePVP(): UsePVPReturn {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [currentLobby, setCurrentLobby] = useState<LobbyState | null>(null);
  const [currentBattle, setCurrentBattle] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<{ queueLength: number; estimatedWaitTime: number } | null>(null);

  // WebSocket connection
  const wsManager = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (!wsManager.isConnected()) return;

    const handleMessage = (message: ServerMessage) => {
      switch (message.type) {
        case 'LOBBY_STATE':
          setCurrentLobby(message.state);
          break;
        case 'MATCH_FOUND':
          // Handle match found - lobby will be updated via LOBBY_STATE
          break;
        case 'MATCHMAKING_STATUS':
          setMatchmakingStatus(message.data);
          break;
        case 'BATTLE_START':
          setCurrentBattle({ id: message.battleId, seed: message.seed });
          break;
        case 'BATTLE_END':
          setCurrentBattle(null);
          setCurrentLobby(null);
          break;
        case 'ERROR':
          setError(message.message);
          break;
      }
    };

    wsManager.onMessage(handleMessage);
  }, [wsManager]);



  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsManager.isConnected()) {
      wsManager.send(message);
    } else {
      console.error('WebSocket not connected');
    }
  }, [wsManager]);

  const onMessage = useCallback((callback: (message: ServerMessage) => void) => {
    wsManager.on('message', callback);
    return () => {
      wsManager.off('message', callback);
    };
  }, [wsManager]);

  // WebSocket connection setup
  useEffect(() => {
    if (!publicKey) return;

    const connectWebSocket = async () => {
      try {
        await wsManager.connect();
        setIsConnected(true);
        setError(null);

        // Authenticate with the server
        wsManager.getSocket()?.emit('authenticate', { userId: publicKey.toString() });

        // Set up message handlers
        wsManager.on('message', (message: ServerMessage) => {
          // Update local state based on message type
          switch (message.type) {
            case 'LOBBY_STATE':
              setCurrentLobby(message.state);
              break;
            case 'BATTLE_START':
              setCurrentBattle({
                id: message.battleId,
                seed: message.seed,
                turn: 0,
              });
              break;
            case 'BATTLE_STATE':
              setCurrentBattle((prev: any) => ({
                ...prev,
                ...message.state,
              }));
              break;
            case 'BATTLE_RESULT':
              setCurrentBattle(null);
              setCurrentLobby(null);
              break;
            case 'ERROR':
              setError(message.message);
              break;
          }
        });
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setIsConnected(false);
        setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    connectWebSocket();

    return () => {
      wsManager.disconnect();
      setIsConnected(false);
    };
  }, [publicKey, wsManager]);

  // WebSocket-based functions
  const createLobby = useCallback(async (bracketId: number, wagerLamports: number): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al servidor WebSocket para crear un lobby
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('create_lobby', { bracketId, wagerLamports }, (response: any) => {
          if (response.success) {
            resolve(response.data.id);
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lobby';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, wsManager]);

  const joinLobby = useCallback(async (lobbyId: string): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al servidor WebSocket para unirse a un lobby
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('join_lobby', { lobbyId }, (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join lobby';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, wsManager]);

  const getLobby = useCallback(async (lobbyId: string): Promise<LobbyState | null> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    // Return current lobby if it matches the requested ID
    if (currentLobby && currentLobby.id === lobbyId) {
      return currentLobby;
    }
    return null;
  }, [publicKey, currentLobby]);

  const selectTeam = useCallback(async (team: BattleTeam): Promise<void> => {
    if (!publicKey || !currentLobby) {
      throw new Error('Wallet not connected or not in a lobby');
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al servidor WebSocket para seleccionar un equipo
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('select_team', { teamId: team.id, team }, (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select team';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, currentLobby, wsManager]);

  const ready = useCallback(async (): Promise<void> => {
    if (!publicKey || !currentLobby) {
      throw new Error('Wallet not connected or not in a lobby');
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al servidor WebSocket para marcar como listo
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('ready', (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to ready up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, currentLobby, wsManager]);

  const makeMove = useCallback(async (action: any): Promise<void> => {
    if (!publicKey || !currentBattle) {
      throw new Error('Wallet not connected or not in a battle');
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al servidor WebSocket para realizar una acción en la batalla
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('battle_action', { 
          battleId: currentBattle.id, 
          action 
        }, (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make move';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, currentBattle, wsManager]);

  const forfeit = useCallback(async (): Promise<void> => {
    if (!publicKey || !currentBattle) {
      throw new Error('Wallet not connected or not in a battle');
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al servidor WebSocket para abandonar la batalla
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('forfeit_battle', { battleId: currentBattle.id }, (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to forfeit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, currentBattle, wsManager]);

  // Quick match and bot battle methods
  const joinQuickMatch = useCallback(async (bracketId: number, wagerAmount: number): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Create a default team for quick match (this should be replaced with actual team selection)
      const defaultTeam = {
        id: 'quick-match-team',
        name: 'Quick Match Team',
        pokemon: [] // This should be populated with actual Pokemon data
      };

      wsManager.getSocket()?.emit('quick_match', { team: defaultTeam });
       setLoading(false);
     } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Failed to join quick match';
       setError(errorMessage);
       throw new Error(errorMessage);
     }
   }, [publicKey, wsManager]);

  const leaveQuickMatch = useCallback(async (): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('leave_quick_match', (response: any) => {
          if (response.success) {
            setMatchmakingStatus(null);
            resolve();
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave quick match';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, wsManager]);

  const playVsBot = useCallback(async (bracketId: number, wagerAmount: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Create a default team for bot battle (this should be replaced with actual team selection)
      const defaultTeam = {
        id: 'bot-battle-team',
        name: 'Bot Battle Team',
        pokemon: [] // This should be populated with actual Pokemon data
      };

      wsManager.getSocket()?.emit('play_vs_bot', { team: defaultTeam, difficulty });
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start bot battle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [publicKey, wsManager]);

  const getMatchmakingStatus = useCallback(async (): Promise<{ queueLength: number; estimatedWaitTime: number }> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('get_matchmaking_status', (response: any) => {
          if (response.success) {
            setMatchmakingStatus(response.data);
            resolve(response.data);
          } else {
            reject(new Error(response.error));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get matchmaking status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [publicKey, wsManager]);

  const quickMatch = useCallback(async (bracketId: number, wagerAmount: number): Promise<{ matchId: string } | null> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Create a default team for quick match
      const defaultTeam = {
        id: 'quick-match-team',
        name: 'Quick Match Team',
        pokemon: [] // This should be populated with actual Pokemon data
      };

      return new Promise((resolve, reject) => {
        if (!wsManager.isConnected()) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        wsManager.getSocket()?.emit('quick_match', { 
          bracketId, 
          wagerAmount, 
          team: defaultTeam 
        }, (response: any) => {
          if (response.success && response.matchId) {
            resolve({ matchId: response.matchId });
          } else if (response.success) {
            // Match not found immediately, return null
            resolve(null);
          } else {
            reject(new Error(response.error || 'Failed to find match'));
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find quick match';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, wsManager]);

  return {
    // Lobby Management
    createLobby,
    joinLobby,
    getLobby,

    // Quick match and bot battles
    joinQuickMatch,
    leaveQuickMatch,
    playVsBot,
    getMatchmakingStatus,
    quickMatch,

    // Battle Actions
    selectTeam,
    ready,
    makeMove,
    forfeit,

    // State
    currentLobby,
    currentBattle,
    isConnected,
    loading,
    error,
    matchmakingStatus,

    // WebSocket
    sendMessage,
    onMessage,
  };
}
