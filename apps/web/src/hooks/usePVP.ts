import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { io, Socket } from 'socket.io-client';
import { BACKEND_WS_URL, WS_EVENTS } from '../lib/backend';
import { LobbyState, ServerMessage, ClientMessage } from '../types/shared';
import { pvpClient } from '../lib/clients';

interface UsePVPReturn {
  // Lobby Management
  createLobby: (bracketId: number, wagerAmount: number) => Promise<string>;
  joinLobby: (lobbyId: string) => Promise<void>;
  getLobby: (lobbyId: string) => Promise<LobbyState | null>;

  // Battle Actions
  selectTeam: (teamId: string) => Promise<void>;
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

  // Socket.IO connection
  const [socket, setSocket] = useState<Socket | null>(null);

  const createLobby = useCallback(async (bracketId: number, wagerAmount: number): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const lobbyId = `lobby-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const signature = await pvpClient.createLobby(
        { publicKey, signTransaction },
        wagerAmount,
        lobbyId
      );

      // Update local state
      setCurrentLobby({
        id: lobbyId,
        bracketId,
        status: 'OPEN',
        creatorId: publicKey.toString(),
        wagerLamports: wagerAmount,
      });

      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lobby';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction]);

  const joinLobby = useCallback(async (lobbyId: string): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const signature = await pvpClient.joinLobby(
        { publicKey, signTransaction: signTransaction! },
        lobbyId
      );

      // Update local state
      if (currentLobby) {
        setCurrentLobby({
          ...currentLobby,
          opponentId: publicKey.toString(),
          status: 'FULL',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join lobby';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, currentLobby]);

  const getLobby = useCallback(async (lobbyId: string): Promise<LobbyState | null> => {
    try {
      const lobby = await pvpClient.getLobby(lobbyId);
      setCurrentLobby(lobby);
      return lobby;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get lobby');
      return null;
    }
  }, []);

  const selectTeam = useCallback(async (teamId: string): Promise<void> => {
    if (!socket || !currentLobby) {
      throw new Error('Not in a lobby');
    }

    const message: ClientMessage = {
      type: 'SELECT_TEAM',
      teamId,
    };

    sendMessage(message);
  }, [socket, currentLobby]);

  const ready = useCallback(async (): Promise<void> => {
    if (!socket || !currentLobby) {
      throw new Error('Not in a lobby');
    }

    const message: ClientMessage = {
      type: 'READY',
    };

    sendMessage(message);
  }, [socket, currentLobby]);

  const makeMove = useCallback(async (move: {
    slot: number;
    action: 'MOVE' | 'SWITCH';
    moveId?: string;
    target?: number;
  }): Promise<void> => {
    if (!socket || !currentBattle) {
      throw new Error('Not in a battle');
    }

    const message: ClientMessage = {
      type: 'TURN_ACTION',
      turn: currentBattle.turn || 0,
      move,
    };

    sendMessage(message);
  }, [socket, currentBattle]);

  const forfeit = useCallback(async (): Promise<void> => {
    if (!socket || !currentBattle) {
      throw new Error('Not in a battle');
    }

    const message: ClientMessage = {
      type: 'FORFEIT',
    };

    sendMessage(message);
  }, [socket, currentBattle]);

  const sendMessage = useCallback((message: ClientMessage): void => {
    if (socket && socket.connected) {
      socket.emit('message', message);
    } else {
      console.error('Socket.IO not connected');
    }
  }, [socket]);

  const onMessage = useCallback((callback: (message: ServerMessage) => void): void => {
    if (!socket) return;

    socket.on('message', (message: ServerMessage) => {
      callback(message);

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
        case 'BATTLE_END':
          setCurrentBattle(null);
          setCurrentLobby(null);
          break;
        case 'ERROR':
          setError(message.message);
          break;
      }
    });
  }, [socket]);

  // Socket.IO connection setup
  const connect = useCallback(() => {
    if (socket) return;

    const newSocket = io(BACKEND_WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to backend');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from backend');
    });

    newSocket.on('connect_error', (error) => {
      setError('Socket.IO connection failed');
      console.error('Socket.IO error:', error);
    });

    setSocket(newSocket);
  }, [socket]);

  // Auto-connect when wallet is connected
  React.useEffect(() => {
    if (publicKey && !socket) {
      connect();
    }
  }, [publicKey, socket, connect]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    // Lobby Management
    createLobby,
    joinLobby,
    getLobby,

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

    // WebSocket
    sendMessage,
    onMessage,
  };
}
