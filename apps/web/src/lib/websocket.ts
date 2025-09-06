import { io, Socket } from 'socket.io-client';
import { ClientMessage, ServerMessage } from '../types/shared';

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      
      this.socket = io(wsUrl, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.handleReconnect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection error:', error);
        this.handleReconnect();
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Failed to reconnect to WebSocket server');
        this.notifyListeners('connection_failed', null);
      });

      // Handle server messages
      this.socket.on('message', (message: ServerMessage) => {
        this.handleServerMessage(message);
      });

      // Handle errors
      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', error);
      });
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    }
  }

  private handleServerMessage(message: ServerMessage): void {
    console.log('Received server message:', message);
    this.notifyListeners(message.type, message);
  }

  send(message: ClientMessage): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', message);
    } else {
      console.error('WebSocket not connected, cannot send message:', message);
    }
  }

  joinLobby(lobbyId: string): void {
    this.send({ type: 'JOIN_LOBBY', lobbyId });
  }

  acceptInvite(lobbyId: string): void {
    this.send({ type: 'INVITE_ACCEPT', lobbyId });
  }

  selectTeam(teamId: string): void {
    this.send({ type: 'SELECT_TEAM', teamId });
  }

  ready(): void {
    this.send({ type: 'READY' });
  }

  sendTurnAction(turn: number, move: any, commit?: string, reveal?: string): void {
    this.send({
      type: 'TURN_ACTION',
      turn,
      move,
      commit,
      reveal,
    });
  }

  forfeit(): void {
    this.send({ type: 'FORFEIT' });
  }

  // Event listener management
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

// React hook for WebSocket
export function useWebSocket() {
  return wsManager;
}
