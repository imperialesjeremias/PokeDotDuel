import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { lobbyManager, LobbyData } from './LobbyManager';
import { ClientMessage, ServerMessage, BattleTeam } from '../../../../packages/shared/src';
import { BotAI } from '../battle/BotAI';

/**
 * Configura los manejadores de eventos para los lobbys
 */
export function setupLobbyHandlers(io: Server, socket: Socket): void {
  // Almacenar el ID de usuario en el socket
  let userId: string | undefined;

  // Handle authentication
  socket.on('authenticate', (data: { userId: string }) => {
    console.log('Authenticating user:', data.userId);
    userId = data.userId;
    socket.data = { ...socket.data, userId: data.userId };
    socket.join(`user:${data.userId}`);
    console.log('User authenticated and joined room:', data.userId);
  });

  // Configurar callback para matchmaking
  lobbyManager.onMatchFound = (lobby: LobbyData, player1Id: string, player2Id: string) => {
    // Notificar a ambos jugadores que se encontró una partida
    const matchFoundMessage: ServerMessage = {
      type: 'MATCH_FOUND',
      lobbyId: lobby.id
    };
    
    io.to(`user:${player1Id}`).emit('message', matchFoundMessage);
    io.to(`user:${player2Id}`).emit('message', matchFoundMessage);
    
    // Unir a ambos jugadores a la sala del lobby
    io.sockets.sockets.forEach(s => {
      if (s.data?.userId === player1Id || s.data?.userId === player2Id) {
        s.join(`lobby:${lobby.id}`);
      }
    });
    
    // Enviar estado del lobby
    const lobbyState: ServerMessage = {
      type: 'LOBBY_STATE',
      state: {
        id: lobby.id,
        bracketId: lobby.bracketId,
        status: lobby.status,
        creatorId: lobby.creatorId,
        opponentId: lobby.opponentId,
        wagerLamports: lobby.wagerLamports,
        escrowPda: lobby.escrowPda
      }
    };
    
    io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
  };

  // Autenticación del usuario
  socket.on('authenticate', (data: { userId: string }) => {
    userId = data.userId;
    socket.data = { userId }; // Almacenar en socket.data para acceso global
    socket.join(`user:${userId}`);
    console.log(`User authenticated: ${userId}`);
  });

  // Crear un nuevo lobby
  socket.on('create_lobby', (data: { bracketId: number, wagerLamports: number }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.createLobby(userId, data.bracketId, data.wagerLamports);
      
      // Unir al usuario a la sala del lobby
      socket.join(`lobby:${lobby.id}`);
      
      // Enviar estado del lobby al creador
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: lobby.status,
          creatorId: lobby.creatorId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      socket.emit('message', lobbyState);
      callback({ success: true, data: lobby });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Unirse a un lobby por ID
  socket.on('join_lobby', (data: { lobbyId: string }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.joinLobby(userId, data.lobbyId);
      
      // Unir al usuario a la sala del lobby
      socket.join(`lobby:${lobby.id}`);
      
      // Enviar estado del lobby a todos los usuarios en el lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: lobby.status,
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      callback({ success: true, data: lobby });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Unirse a un lobby por código de invitación
  socket.on('join_lobby_by_code', (data: { inviteCode: string }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.joinLobbyByInviteCode(userId, data.inviteCode);
      
      // Unir al usuario a la sala del lobby
      socket.join(`lobby:${lobby.id}`);
      
      // Enviar estado del lobby a todos los usuarios en el lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: lobby.status,
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      callback({ success: true, data: lobby });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Seleccionar equipo
  socket.on('select_team', (data: { teamId: string, team: BattleTeam }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.setTeam(userId, data.team);
      
      // Enviar estado del lobby a todos los usuarios en el lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: lobby.status,
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      callback({ success: true, data: lobby });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Salir de un lobby
  socket.on('leave_lobby', (data: { userId: string }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.getUserLobby(userId);
      if (!lobby) {
        return callback({ success: false, error: 'Not in a lobby' });
      }

      // Cerrar el lobby si el usuario estaba en uno
      lobbyManager.closeLobby(lobby.id, 'CANCELLED');
      
      // Salir de la sala del lobby
      socket.leave(`lobby:${lobby.id}`);
      
      // Enviar evento de cancelación a todos los usuarios en el lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: 'CANCELLED',
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      callback({ success: true, message: 'Left lobby successfully' });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Marcar como listo
  socket.on('ready', (callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.setReady(userId);
      
      // Enviar estado del lobby a todos los usuarios en el lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: lobby.status,
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      
      // Si ambos jugadores están listos, iniciar la batalla
      if (lobby.status === 'IN_PROGRESS' && lobby.creatorReady && lobby.opponentReady) {
        const battleId = uuidv4();
        const seed = Math.random().toString();
        
        // Enviar evento de inicio de batalla
        const battleStart: ServerMessage = {
          type: 'BATTLE_START',
          battleId,
          seed
        };
        
        io.to(`lobby:${lobby.id}`).emit('message', battleStart);
      }
      
      callback({ success: true, data: lobby });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Obtener lobbys abiertos
  socket.on('get_open_lobbies', (callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const openLobbies = lobbyManager.getOpenLobbies();
      callback({ success: true, data: openLobbies });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Abandonar lobby
  socket.on('leave_lobby', (callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const lobby = lobbyManager.getUserLobby(userId);
      if (!lobby) {
        return callback({ success: false, error: 'Not in a lobby' });
      }

      // Cerrar el lobby
      lobbyManager.closeLobby(lobby.id, 'CANCELLED');
      
      // Enviar evento de cancelación a todos los usuarios en el lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: 'CANCELLED',
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda
        }
      };
      
      io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      
      // Sacar al usuario de la sala del lobby
      socket.leave(`lobby:${lobby.id}`);
      
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Unirse a partida rápida (matchmaking)
  socket.on('join_quick_match', (data: { bracketId: number, wagerLamports: number }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      lobbyManager.joinQuickMatch(userId, data.bracketId, data.wagerLamports);
      
      // Enviar estado de la cola
      const queueStatus = lobbyManager.getMatchmakingStatus();
      const queueMessage: ServerMessage = {
        type: 'MATCHMAKING_STATUS',
        data: {
          queueLength: queueStatus.queueLength,
          estimatedWaitTime: queueStatus.estimatedWaitTime
        }
      };
      
      socket.emit('message', queueMessage);
      callback({ success: true, message: 'Joined matchmaking queue' });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Salir de partida rápida
  socket.on('leave_quick_match', (callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      lobbyManager.leaveQuickMatch(userId);
      callback({ success: true, message: 'Left matchmaking queue' });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Crear lobby contra bot
  socket.on('play_vs_bot', (data: { bracketId: number, wagerLamports: number, difficulty?: 'easy' | 'medium' | 'hard' }, callback) => {
    try {
      console.log('Received play_vs_bot request:', data, 'from user:', userId);
      
      if (!userId) {
        console.error('play_vs_bot: User not authenticated');
        return callback({ success: false, error: 'Not authenticated' });
      }

      // Check if user is already in a lobby and leave it first
      const existingLobby = lobbyManager.getUserLobby(userId);
      if (existingLobby) {
        console.log('User already in lobby, leaving first:', existingLobby.id);
        lobbyManager.closeLobby(existingLobby.id, 'CANCELLED');
        socket.leave(`lobby:${existingLobby.id}`);
        
        // Notify other users in the lobby about cancellation
        const cancelState: ServerMessage = {
          type: 'LOBBY_STATE',
          state: {
            id: existingLobby.id,
            bracketId: existingLobby.bracketId,
            status: 'CANCELLED',
            creatorId: existingLobby.creatorId,
            opponentId: existingLobby.opponentId,
            wagerLamports: existingLobby.wagerLamports,
            escrowPda: existingLobby.escrowPda
          }
        };
        io.to(`lobby:${existingLobby.id}`).emit('message', cancelState);
      }

      console.log('Creating bot lobby for user:', userId, 'with params:', { bracketId: data.bracketId, wagerLamports: data.wagerLamports, difficulty: data.difficulty });
      
      const lobby = lobbyManager.createBotLobby(userId, data.bracketId, data.wagerLamports);
      
      console.log('Bot lobby created successfully:', lobby.id);
      
      // Unir al usuario a la sala del lobby
      socket.join(`lobby:${lobby.id}`);
      
      // Crear instancia de IA para el bot
      const botAI = new BotAI(data.difficulty || 'medium');
      
      // Almacenar la IA del bot en el socket para uso posterior
      socket.data.botAI = botAI;
      socket.data.botLobbyId = lobby.id;
      
      // Enviar estado del lobby
      const lobbyState: ServerMessage = {
        type: 'LOBBY_STATE',
        state: {
          id: lobby.id,
          bracketId: lobby.bracketId,
          status: lobby.status,
          creatorId: lobby.creatorId,
          opponentId: lobby.opponentId,
          wagerLamports: lobby.wagerLamports,
          escrowPda: lobby.escrowPda,
          isBot: true
        }
      };
      
      socket.emit('message', lobbyState);
      
      console.log('Bot battle setup complete, sending success response');
      callback({ success: true, data: lobby });
    } catch (error: any) {
      console.error('Error creating bot lobby:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Obtener estado de matchmaking
  socket.on('get_matchmaking_status', (callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      const status = lobbyManager.getMatchmakingStatus();
      callback({ success: true, data: status });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    if (userId) {
      // Remover de la cola de matchmaking si estaba en ella
      lobbyManager.leaveQuickMatch(userId);
      
      const lobby = lobbyManager.getUserLobby(userId);
      if (lobby && (lobby.status === 'OPEN' || lobby.status === 'FULL')) {
        // Cerrar el lobby si el usuario estaba en uno
        lobbyManager.closeLobby(lobby.id, 'CANCELLED');
        
        // Enviar evento de cancelación a todos los usuarios en el lobby
        const lobbyState: ServerMessage = {
          type: 'LOBBY_STATE',
          state: {
            id: lobby.id,
            bracketId: lobby.bracketId,
            status: 'CANCELLED',
            creatorId: lobby.creatorId,
            opponentId: lobby.opponentId,
            wagerLamports: lobby.wagerLamports,
            escrowPda: lobby.escrowPda
          }
        };
        
        io.to(`lobby:${lobby.id}`).emit('message', lobbyState);
      }
    }
  });
}