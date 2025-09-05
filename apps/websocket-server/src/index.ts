import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { GameManager } from './game/GameManager';
import { AuthManager } from './auth/AuthManager';
import { LobbyManager } from './lobby/LobbyManager';
import { BattleManager } from './battle/BattleManager';
import { ClientMessage, ServerMessage } from '@pokebattle/shared';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize managers
const authManager = new AuthManager();
const lobbyManager = new LobbyManager();
const battleManager = new BattleManager();
const gameManager = new GameManager(lobbyManager, battleManager);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Authentication middleware
  socket.use((packet, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const user = authManager.verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Handle client messages
  socket.on('message', async (message: ClientMessage) => {
    try {
      await handleClientMessage(socket, message);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message', {
        type: 'ERROR',
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred'
      } as ServerMessage);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    handleDisconnection(socket);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

async function handleClientMessage(socket: any, message: ClientMessage) {
  const user = socket.data.user;
  
  switch (message.type) {
    case 'JOIN_LOBBY':
      await handleJoinLobby(socket, user, message.lobbyId);
      break;
      
    case 'INVITE_ACCEPT':
      await handleInviteAccept(socket, user, message.lobbyId);
      break;
      
    case 'SELECT_TEAM':
      await handleSelectTeam(socket, user, message.teamId);
      break;
      
    case 'READY':
      await handleReady(socket, user);
      break;
      
    case 'TURN_ACTION':
      await handleTurnAction(socket, user, message);
      break;
      
    case 'FORFEIT':
      await handleForfeit(socket, user);
      break;
      
    default:
      socket.emit('message', {
        type: 'ERROR',
        code: 'UNKNOWN_MESSAGE_TYPE',
        message: `Unknown message type: ${(message as any).type}`
      } as ServerMessage);
  }
}

async function handleJoinLobby(socket: any, user: any, lobbyId: string) {
  try {
    const lobby = await lobbyManager.joinLobby(lobbyId, user.id, socket.id);
    
    // Join socket room
    socket.join(`lobby:${lobbyId}`);
    
    // Send lobby state to all players
    io.to(`lobby:${lobbyId}`).emit('message', {
      type: 'LOBBY_STATE',
      state: lobby
    } as ServerMessage);
    
  } catch (error) {
    socket.emit('message', {
      type: 'ERROR',
      code: 'JOIN_LOBBY_FAILED',
      message: error instanceof Error ? error.message : 'Failed to join lobby'
    } as ServerMessage);
  }
}

async function handleInviteAccept(socket: any, user: any, lobbyId: string) {
  try {
    const lobby = await lobbyManager.acceptInvite(lobbyId, user.id, socket.id);
    
    // Join socket room
    socket.join(`lobby:${lobbyId}`);
    
    // Send lobby state to all players
    io.to(`lobby:${lobbyId}`).emit('message', {
      type: 'LOBBY_STATE',
      state: lobby
    } as ServerMessage);
    
  } catch (error) {
    socket.emit('message', {
      type: 'ERROR',
      code: 'INVITE_ACCEPT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to accept invite'
    } as ServerMessage);
  }
}

async function handleSelectTeam(socket: any, user: any, teamId: string) {
  try {
    const lobbyId = socket.data.currentLobbyId;
    if (!lobbyId) {
      throw new Error('Not in a lobby');
    }
    
    const lobby = await lobbyManager.selectTeam(lobbyId, user.id, teamId);
    
    // Send updated lobby state
    io.to(`lobby:${lobbyId}`).emit('message', {
      type: 'LOBBY_STATE',
      state: lobby
    } as ServerMessage);
    
  } catch (error) {
    socket.emit('message', {
      type: 'ERROR',
      code: 'SELECT_TEAM_FAILED',
      message: error instanceof Error ? error.message : 'Failed to select team'
    } as ServerMessage);
  }
}

async function handleReady(socket: any, user: any) {
  try {
    const lobbyId = socket.data.currentLobbyId;
    if (!lobbyId) {
      throw new Error('Not in a lobby');
    }
    
    const result = await lobbyManager.setReady(lobbyId, user.id);
    
    if (result.battleStarted) {
      // Start battle
      const battle = await battleManager.startBattle(
        result.battleId,
        result.playerA,
        result.playerB,
        result.teamA,
        result.teamB
      );
      
      // Send battle start to all players
      io.to(`lobby:${lobbyId}`).emit('message', {
        type: 'BATTLE_START',
        battleId: result.battleId,
        seed: battle.seed
      } as ServerMessage);
      
      // Join battle room
      socket.join(`battle:${result.battleId}`);
      
    } else {
      // Send updated lobby state
      io.to(`lobby:${lobbyId}`).emit('message', {
        type: 'LOBBY_STATE',
        state: result.lobby
      } as ServerMessage);
    }
    
  } catch (error) {
    socket.emit('message', {
      type: 'ERROR',
      code: 'READY_FAILED',
      message: error instanceof Error ? error.message : 'Failed to set ready'
    } as ServerMessage);
  }
}

async function handleTurnAction(socket: any, user: any, message: any) {
  try {
    const battleId = socket.data.currentBattleId;
    if (!battleId) {
      throw new Error('Not in a battle');
    }
    
    const result = await battleManager.processTurn(
      battleId,
      user.id,
      message.turn,
      message.move,
      message.commit,
      message.reveal
    );
    
    // Send turn result to all players
    io.to(`battle:${battleId}`).emit('message', {
      type: 'TURN_RESULT',
      turn: result.turn,
      events: result.events
    } as ServerMessage);
    
    // Check if battle ended
    if (result.battleEnded) {
      io.to(`battle:${battleId}`).emit('message', {
        type: 'BATTLE_END',
        winner: result.winner,
        reason: result.reason
      } as ServerMessage);
    }
    
  } catch (error) {
    socket.emit('message', {
      type: 'ERROR',
      code: 'TURN_ACTION_FAILED',
      message: error instanceof Error ? error.message : 'Failed to process turn'
    } as ServerMessage);
  }
}

async function handleForfeit(socket: any, user: any) {
  try {
    const battleId = socket.data.currentBattleId;
    if (!battleId) {
      throw new Error('Not in a battle');
    }
    
    const result = await battleManager.forfeitBattle(battleId, user.id);
    
    // Send battle end to all players
    io.to(`battle:${battleId}`).emit('message', {
      type: 'BATTLE_END',
      winner: result.winner,
      reason: 'Forfeit'
    } as ServerMessage);
    
  } catch (error) {
    socket.emit('message', {
      type: 'ERROR',
      code: 'FORFEIT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to forfeit'
    } as ServerMessage);
  }
}

function handleDisconnection(socket: any) {
  const user = socket.data.user;
  if (!user) return;
  
  // Handle lobby disconnection
  const lobbyId = socket.data.currentLobbyId;
  if (lobbyId) {
    lobbyManager.handleDisconnection(lobbyId, user.id);
  }
  
  // Handle battle disconnection
  const battleId = socket.data.currentBattleId;
  if (battleId) {
    battleManager.handleDisconnection(battleId, user.id);
  }
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
