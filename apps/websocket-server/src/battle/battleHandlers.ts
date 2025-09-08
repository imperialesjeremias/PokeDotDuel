import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { BattleEngine, BattleAction } from './BattleEngine';
import { ClientMessage, ServerMessage, BattleTeam } from '../../../../packages/shared/src';
import { lobbyManager } from '../lobby/LobbyManager';

// Almacena las batallas activas
const activeBattles = new Map<string, BattleEngine>();

/**
 * Configura los manejadores de eventos para las batallas
 */
export function setupBattleHandlers(io: Server, socket: Socket): void {
  // Almacenar el ID de usuario en el socket
  let userId: string | undefined;

  // Autenticación del usuario
  socket.on('authenticate', (data: { userId: string }) => {
    userId = data.userId;
    socket.join(`user:${userId}`);
    console.log(`User authenticated: ${userId}`);
  });

  // Unirse a una batalla
  socket.on('join_battle', (data: { battleId: string }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      // Unir al usuario a la sala de la batalla
      socket.join(`battle:${data.battleId}`);
      console.log(`User ${userId} joined battle ${data.battleId}`);
      
      // Obtener la batalla si ya existe
      const battle = activeBattles.get(data.battleId);
      
      if (battle) {
        // TODO: Send appropriate battle state message when needed
        // The battle state can be sent through TURN_RESULT messages
      }
      
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Iniciar una batalla
  socket.on('start_battle', (data: { battleId: string, lobbyId: string }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      // Obtener el lobby
      const lobby = lobbyManager.getLobby(data.lobbyId);
      if (!lobby) {
        return callback({ success: false, error: 'Lobby not found' });
      }

      // Verificar que el usuario sea el creador del lobby
      if (lobby.creatorId !== userId) {
        return callback({ success: false, error: 'Only the creator can start the battle' });
      }

      // Verificar que ambos jugadores estén listos
      if (!lobby.creatorReady || !lobby.opponentReady) {
        return callback({ success: false, error: 'Both players must be ready' });
      }

      // Verificar que ambos jugadores tengan equipos seleccionados
      if (!lobby.creatorTeam || !lobby.opponentTeam) {
        return callback({ success: false, error: 'Both players must select teams' });
      }

      // Crear una nueva instancia de BattleEngine
      // Agregar activeIndex a los equipos
      const creatorTeamWithIndex = { ...lobby.creatorTeam, activeIndex: 0 };
      const opponentTeamWithIndex = { ...lobby.opponentTeam, activeIndex: 0 };
      
      const battle = new BattleEngine(
        creatorTeamWithIndex,
        opponentTeamWithIndex,
        lobby.creatorId,
        lobby.opponentId!
      );

      // Almacenar la batalla
      activeBattles.set(data.battleId, battle);

      // Unir a ambos jugadores a la sala de la batalla
      io.sockets.sockets.forEach(s => {
        const socketUserId = s.data.userId;
        if (socketUserId === lobby.creatorId || socketUserId === lobby.opponentId) {
          s.join(`battle:${data.battleId}`);
        }
      });

      // La batalla ha comenzado, se puede enviar un mensaje de inicio si es necesario
      
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Realizar una acción en la batalla
  socket.on('battle_action', (data: { battleId: string, action: BattleAction }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      // Obtener la batalla
      const battle = activeBattles.get(data.battleId);
      if (!battle) {
        return callback({ success: false, error: 'Battle not found' });
      }

      // Verificar que el usuario sea un participante de la batalla
      if (battle.player1Id !== userId && battle.player2Id !== userId) {
        return callback({ success: false, error: 'Not a participant in this battle' });
      }

      // Verificar que sea el turno del jugador
      if (battle.getCurrentPlayerId() !== userId) {
        return callback({ success: false, error: 'Not your turn' });
      }

      // Procesar la acción
      const events = battle.processAction(data.action);

      // Enviar los eventos a ambos jugadores
      const battleEvent: ServerMessage = {
        type: 'TURN_RESULT',
        turn: battle.turn || 0,
        events: events
      };
      
      io.to(`battle:${data.battleId}`).emit('message', battleEvent);

      // Si la batalla ha terminado, enviar el resultado
      if (battle.isOver()) {
        const winner = battle.getWinner();
        if (winner) {
          const winnerId = winner === 'A' ? battle.player1Id : battle.player2Id;
          const battleResult: ServerMessage = {
            type: 'BATTLE_RESULT',
            battleId: data.battleId,
            winner: winnerId,
            data: { reason: 'KO' }
          };
          
          io.to(`battle:${data.battleId}`).emit('message', battleResult);
        }
        
        // Eliminar la batalla de las batallas activas
        activeBattles.delete(data.battleId);
      }
      
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Abandonar una batalla
  socket.on('forfeit_battle', (data: { battleId: string }, callback) => {
    try {
      if (!userId) {
        return callback({ success: false, error: 'Not authenticated' });
      }

      // Obtener la batalla
      const battle = activeBattles.get(data.battleId);
      if (!battle) {
        return callback({ success: false, error: 'Battle not found' });
      }

      // Verificar que el usuario sea un participante de la batalla
      if (battle.player1Id !== userId && battle.player2Id !== userId) {
        return callback({ success: false, error: 'Not a participant in this battle' });
      }

      // Determinar el ganador (el oponente del que abandona)
      const winnerId = battle.player1Id === userId ? battle.player2Id : battle.player1Id;

      // Enviar el resultado de la batalla
      const battleResult: ServerMessage = {
        type: 'BATTLE_RESULT',
        battleId: data.battleId,
        winner: winnerId,
        data: { reason: 'Forfeit' }
      };
      
      io.to(`battle:${data.battleId}`).emit('message', battleResult);
      
      // Eliminar la batalla de las batallas activas
      activeBattles.delete(data.battleId);
      
      callback({ success: true });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    if (userId) {
      // Buscar batallas en las que el usuario esté participando
      activeBattles.forEach((battle, battleId) => {
        if (battle.player1Id === userId || battle.player2Id === userId) {
          // Determinar el ganador (el oponente del que se desconecta)
          const winnerId = battle.player1Id === userId ? battle.player2Id : battle.player1Id;

          // Enviar el resultado de la batalla
          const battleResult: ServerMessage = {
            type: 'BATTLE_RESULT',
            battleId,
            winner: winnerId,
            data: { reason: 'DISCONNECT' }
          };
          
          io.to(`battle:${battleId}`).emit('message', battleResult);
          
          // Eliminar la batalla de las batallas activas
          activeBattles.delete(battleId);
        }
      });
    }
  });

  // Manejador para partidas rápidas (matchmaking)
  socket.on('quick_match', async (data: { team: any }) => {
    if (!userId) {
      socket.emit('error', { message: 'Usuario no autenticado' });
      return;
    }

    try {
      // Buscar un oponente disponible o crear una nueva sala de espera
      const matchResult = await lobbyManager.findQuickMatch(userId, data.team);
      
      if (matchResult.type === 'WAITING') {
        socket.emit('message', {
          type: 'QUICK_MATCH_WAITING',
          message: 'Buscando oponente...'
        });
      } else if (matchResult.type === 'MATCH_FOUND') {
        // Crear batalla inmediatamente
         const battleId = uuidv4();
         // Crear equipos por defecto si no existen
        const defaultTeam: BattleTeam = {
          id: 'default-team',
          name: 'Default Team',
          pokemon: []
        };

        const creatorTeamWithIndex = {
          ...(matchResult.creatorTeam || defaultTeam),
          activeIndex: 0
        };
        
        const opponentTeamWithIndex = {
          ...(matchResult.opponentTeam || defaultTeam),
          activeIndex: 0
        };
        
        const battle = new BattleEngine(
           creatorTeamWithIndex,
           opponentTeamWithIndex,
           matchResult.creatorId!,
           matchResult.opponentId!
         );

        activeBattles.set(battleId, battle);

        // Notificar a ambos jugadores
         io.to(`user:${matchResult.creatorId!}`).emit('message', {
           type: 'BATTLE_START',
           battleId,
           opponentId: matchResult.opponentId!
         });
         
         io.to(`user:${matchResult.opponentId!}`).emit('message', {
           type: 'BATTLE_START',
           battleId,
           opponentId: matchResult.creatorId!
         });
      }
    } catch (error) {
      socket.emit('error', { message: 'Error en matchmaking' });
    }
  });

  // Manejador para jugar contra bot
  socket.on('play_vs_bot', async (data: { team: any, difficulty?: 'easy' | 'medium' | 'hard' }) => {
    if (!userId) {
      socket.emit('error', { message: 'Usuario no autenticado' });
      return;
    }

    try {
      const battleId = uuidv4();
      const botTeam = await lobbyManager.createBotTeam(data.difficulty || 'medium');
      const userTeamWithIndex = { ...data.team, activeIndex: 0 };
      const botTeamWithIndex = { ...botTeam, activeIndex: 0 };
      
      const battle = new BattleEngine(
        userTeamWithIndex,
        botTeamWithIndex,
        userId,
        'bot-player'
      );

      activeBattles.set(battleId, battle);

      // Notificar al jugador que la batalla comenzó
      socket.emit('message', {
        type: 'BATTLE_START',
        battleId,
        opponentId: 'bot-player',
        isVsBot: true
      });
      
      socket.join(`battle:${battleId}`);
    } catch (error) {
      socket.emit('error', { message: 'Error creando batalla contra bot' });
    }
  });
}