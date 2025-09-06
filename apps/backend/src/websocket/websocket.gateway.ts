import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { ClientMessage, ServerMessage } from '../shared/interfaces/types';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Authentication middleware
    client.use((packet, next) => {
      const token = client.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        // TODO: Implement token verification
        const user = { id: 'temp-user-id', walletAddress: 'temp-address' };
        client.data.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // TODO: Handle disconnection logic
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: ClientMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      await this.processClientMessage(client, message);
    } catch (error) {
      this.logger.error('Error handling message:', error);
      client.emit('message', {
        type: 'ERROR',
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred',
      } as ServerMessage);
    }
  }

  private async processClientMessage(client: Socket, message: ClientMessage): Promise<void> {
    const user = client.data.user;

    switch (message.type) {
      case 'JOIN_LOBBY':
        await this.handleJoinLobby(client, user, message.lobbyId);
        break;

      case 'INVITE_ACCEPT':
        await this.handleInviteAccept(client, user, message.lobbyId);
        break;

      case 'SELECT_TEAM':
        await this.handleSelectTeam(client, user, message.teamId);
        break;

      case 'READY':
        await this.handleReady(client, user);
        break;

      case 'TURN_ACTION':
        await this.handleTurnAction(client, user, message);
        break;

      case 'FORFEIT':
        await this.handleForfeit(client, user);
        break;

      default:
        client.emit('message', {
          type: 'ERROR',
          code: 'UNKNOWN_MESSAGE_TYPE',
          message: `Unknown message type: ${(message as any).type}`,
        } as ServerMessage);
    }
  }

  private async handleJoinLobby(client: Socket, user: any, lobbyId: string): Promise<void> {
    try {
      // TODO: Implement lobby joining logic
      this.logger.log(`User ${user.id} joining lobby ${lobbyId}`);

      // Join socket room
      client.join(`lobby:${lobbyId}`);

      // Send lobby state to all players
      this.server.to(`lobby:${lobbyId}`).emit('message', {
        type: 'LOBBY_STATE',
        state: {
          id: lobbyId,
          bracketId: 1,
          status: 'OPEN',
          creatorId: user.id,
          wagerLamports: 1000000,
        },
      } as ServerMessage);

    } catch (error) {
      client.emit('message', {
        type: 'ERROR',
        code: 'JOIN_LOBBY_FAILED',
        message: error instanceof Error ? error.message : 'Failed to join lobby',
      } as ServerMessage);
    }
  }

  private async handleInviteAccept(client: Socket, user: any, lobbyId: string): Promise<void> {
    try {
      // TODO: Implement invite acceptance logic
      this.logger.log(`User ${user.id} accepting invite for lobby ${lobbyId}`);

      // Join socket room
      client.join(`lobby:${lobbyId}`);

      // Send lobby state to all players
      this.server.to(`lobby:${lobbyId}`).emit('message', {
        type: 'LOBBY_STATE',
        state: {
          id: lobbyId,
          bracketId: 1,
          status: 'FULL',
          creatorId: 'creator-id',
          opponentId: user.id,
          wagerLamports: 1000000,
        },
      } as ServerMessage);

    } catch (error) {
      client.emit('message', {
        type: 'ERROR',
        code: 'INVITE_ACCEPT_FAILED',
        message: error instanceof Error ? error.message : 'Failed to accept invite',
      } as ServerMessage);
    }
  }

  private async handleSelectTeam(client: Socket, user: any, teamId: string): Promise<void> {
    try {
      // TODO: Implement team selection logic
      this.logger.log(`User ${user.id} selecting team ${teamId}`);

      const lobbyId = client.data.currentLobbyId;
      if (!lobbyId) {
        throw new Error('Not in a lobby');
      }

      // Send updated lobby state
      this.server.to(`lobby:${lobbyId}`).emit('message', {
        type: 'LOBBY_STATE',
        state: {
          id: lobbyId,
          bracketId: 1,
          status: 'FULL',
          creatorId: 'creator-id',
          opponentId: user.id,
          wagerLamports: 1000000,
        },
      } as ServerMessage);

    } catch (error) {
      client.emit('message', {
        type: 'ERROR',
        code: 'SELECT_TEAM_FAILED',
        message: error instanceof Error ? error.message : 'Failed to select team',
      } as ServerMessage);
    }
  }

  private async handleReady(client: Socket, user: any): Promise<void> {
    try {
      // TODO: Implement ready logic
      this.logger.log(`User ${user.id} is ready`);

      const lobbyId = client.data.currentLobbyId;
      if (!lobbyId) {
        throw new Error('Not in a lobby');
      }

      // Mock battle start
      const battleId = 'mock-battle-id';

      // Send battle start to all players
      this.server.to(`lobby:${lobbyId}`).emit('message', {
        type: 'BATTLE_START',
        battleId,
        seed: 'mock-seed',
      } as ServerMessage);

      // Join battle room
      client.join(`battle:${battleId}`);

    } catch (error) {
      client.emit('message', {
        type: 'ERROR',
        code: 'READY_FAILED',
        message: error instanceof Error ? error.message : 'Failed to set ready',
      } as ServerMessage);
    }
  }

  private async handleTurnAction(client: Socket, user: any, message: any): Promise<void> {
    try {
      // TODO: Implement turn action logic
      this.logger.log(`User ${user.id} performing turn action`);

      const battleId = client.data.currentBattleId;
      if (!battleId) {
        throw new Error('Not in a battle');
      }

      // Send turn result to all players
      this.server.to(`battle:${battleId}`).emit('message', {
        type: 'TURN_RESULT',
        turn: message.turn,
        events: [],
      } as ServerMessage);

    } catch (error) {
      client.emit('message', {
        type: 'ERROR',
        code: 'TURN_ACTION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to process turn',
      } as ServerMessage);
    }
  }

  private async handleForfeit(client: Socket, user: any): Promise<void> {
    try {
      // TODO: Implement forfeit logic
      this.logger.log(`User ${user.id} forfeiting`);

      const battleId = client.data.currentBattleId;
      if (!battleId) {
        throw new Error('Not in a battle');
      }

      // Send battle end to all players
      this.server.to(`battle:${battleId}`).emit('message', {
        type: 'BATTLE_END',
        winner: 'opponent-id',
        reason: 'Forfeit',
      } as ServerMessage);

    } catch (error) {
      client.emit('message', {
        type: 'ERROR',
        code: 'FORFEIT_FAILED',
        message: error instanceof Error ? error.message : 'Failed to forfeit',
      } as ServerMessage);
    }
  }
}
