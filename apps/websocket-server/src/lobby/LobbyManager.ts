import { v4 as uuidv4 } from 'uuid';
import { Lobby, LobbyStatus, BattleTeam } from '@pokebattle/shared';

/**
 * Interfaz para jugadores en cola de matchmaking
 */
export interface MatchmakingPlayer {
  userId: string;
  bracketId: number;
  wagerLamports: number;
  joinedAt: Date;
}

/**
 * Tipos de lobby
 */
export type LobbyType = 'NORMAL' | 'QUICK_MATCH' | 'VS_BOT';

/**
 * Interfaz para los datos de un lobby en memoria
 */
export interface LobbyData {
  id: string;
  bracketId: number;
  creatorId: string;
  opponentId?: string;
  inviteCode?: string;
  status: LobbyStatus;
  escrowPda?: string;
  wagerLamports: number;
  createdAt: Date;
  updatedAt: Date;
  creatorTeam?: BattleTeam;
  opponentTeam?: BattleTeam;
  creatorReady: boolean;
  opponentReady: boolean;
  type: LobbyType;
  isBot?: boolean;
}

/**
 * Clase que gestiona los lobbys de batalla
 */
export class LobbyManager {
  private lobbies: Map<string, LobbyData>;
  private userToLobby: Map<string, string>;
  private matchmakingQueue: MatchmakingPlayer[];
  private matchmakingInterval: NodeJS.Timeout | null;

  constructor() {
    this.lobbies = new Map();
    this.userToLobby = new Map();
    this.matchmakingQueue = [];
    this.matchmakingInterval = null;
    this.startMatchmaking();
  }

  /**
   * Crea un nuevo lobby
   */
  public createLobby(creatorId: string, bracketId: number, wagerLamports: number, type: LobbyType = 'NORMAL'): LobbyData {
    // Verificar si el usuario ya está en un lobby
    if (this.userToLobby.has(creatorId)) {
      throw new Error('User already in a lobby');
    }

    const lobbyId = uuidv4();
    const inviteCode = type === 'NORMAL' ? this.generateInviteCode() : undefined;
    
    const lobby: LobbyData = {
      id: lobbyId,
      bracketId,
      creatorId,
      inviteCode,
      status: 'OPEN',
      wagerLamports,
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorReady: false,
      opponentReady: false,
      type
    };

    this.lobbies.set(lobbyId, lobby);
    this.userToLobby.set(creatorId, lobbyId);

    return lobby;
  }

  /**
   * Permite a un jugador unirse a un lobby
   */
  public joinLobby(userId: string, lobbyId: string): LobbyData {
    // Verificar si el usuario ya está en un lobby
    if (this.userToLobby.has(userId)) {
      throw new Error('User already in a lobby');
    }

    // Verificar si el lobby existe
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    // Verificar si el lobby está abierto
    if (lobby.status !== 'OPEN') {
      throw new Error('Lobby is not open');
    }

    // Verificar si el usuario es el creador
    if (lobby.creatorId === userId) {
      throw new Error('Cannot join your own lobby');
    }

    // Actualizar el lobby
    lobby.opponentId = userId;
    lobby.status = 'FULL';
    lobby.updatedAt = new Date();

    this.lobbies.set(lobbyId, lobby);
    this.userToLobby.set(userId, lobbyId);

    return lobby;
  }

  /**
   * Permite a un jugador unirse a un lobby mediante código de invitación
   */
  public joinLobbyByInviteCode(userId: string, inviteCode: string): LobbyData {
    // Buscar el lobby por código de invitación
    const lobby = Array.from(this.lobbies.values()).find(l => l.inviteCode === inviteCode);
    if (!lobby) {
      throw new Error('Invalid invite code');
    }

    return this.joinLobby(userId, lobby.id);
  }

  /**
   * Establece el equipo de un jugador en un lobby
   */
  public setTeam(userId: string, team: BattleTeam): LobbyData {
    // Verificar si el usuario está en un lobby
    const lobbyId = this.userToLobby.get(userId);
    if (!lobbyId) {
      throw new Error('User not in a lobby');
    }

    // Verificar si el lobby existe
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    // Actualizar el equipo según el usuario
    if (lobby.creatorId === userId) {
      lobby.creatorTeam = team;
    } else if (lobby.opponentId === userId) {
      lobby.opponentTeam = team;
    } else {
      throw new Error('User not in this lobby');
    }

    lobby.updatedAt = new Date();
    this.lobbies.set(lobbyId, lobby);

    return lobby;
  }

  /**
   * Marca a un jugador como listo para comenzar la batalla
   */
  public setReady(userId: string): LobbyData {
    // Verificar si el usuario está en un lobby
    const lobbyId = this.userToLobby.get(userId);
    if (!lobbyId) {
      throw new Error('User not in a lobby');
    }

    // Verificar si el lobby existe
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    // Verificar si el lobby está lleno
    if (lobby.status !== 'FULL') {
      throw new Error('Lobby is not full');
    }

    // Verificar si el usuario tiene un equipo seleccionado
    if (lobby.creatorId === userId && !lobby.creatorTeam) {
      throw new Error('Creator must select a team first');
    } else if (lobby.opponentId === userId && !lobby.opponentTeam) {
      throw new Error('Opponent must select a team first');
    }

    // Marcar al usuario como listo
    if (lobby.creatorId === userId) {
      lobby.creatorReady = true;
    } else if (lobby.opponentId === userId) {
      lobby.opponentReady = true;
    } else {
      throw new Error('User not in this lobby');
    }

    // Verificar si ambos jugadores están listos
    if (lobby.creatorReady && lobby.opponentReady) {
      lobby.status = 'IN_PROGRESS';
    }

    lobby.updatedAt = new Date();
    this.lobbies.set(lobbyId, lobby);

    return lobby;
  }

  /**
   * Obtiene un lobby por su ID
   */
  public getLobby(lobbyId: string): LobbyData | undefined {
    return this.lobbies.get(lobbyId);
  }

  /**
   * Obtiene el lobby de un usuario
   */
  public getUserLobby(userId: string): LobbyData | undefined {
    const lobbyId = this.userToLobby.get(userId);
    if (!lobbyId) {
      return undefined;
    }
    return this.lobbies.get(lobbyId);
  }

  /**
   * Obtiene todos los lobbys abiertos
   */
  public getOpenLobbies(): LobbyData[] {
    return Array.from(this.lobbies.values()).filter(lobby => lobby.status === 'OPEN');
  }

  /**
   * Cierra un lobby (cuando la batalla termina o se cancela)
   */
  public closeLobby(lobbyId: string, status: 'RESOLVED' | 'CANCELLED'): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    lobby.status = status;
    lobby.updatedAt = new Date();

    // Eliminar las referencias de los usuarios
    if (lobby.creatorId) {
      this.userToLobby.delete(lobby.creatorId);
    }
    if (lobby.opponentId) {
      this.userToLobby.delete(lobby.opponentId);
    }

    this.lobbies.set(lobbyId, lobby);
  }

  /**
   * Inicia el sistema de matchmaking automático
   */
  private startMatchmaking(): void {
    this.matchmakingInterval = setInterval(() => {
      this.processMatchmaking();
    }, 2000); // Procesar cada 2 segundos
  }

  /**
   * Detiene el sistema de matchmaking
   */
  public stopMatchmaking(): void {
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
      this.matchmakingInterval = null;
    }
  }

  /**
   * Agrega un jugador a la cola de matchmaking
   */
  public joinQuickMatch(userId: string, bracketId: number, wagerLamports: number): void {
    // Verificar si el usuario ya está en un lobby o en la cola
    if (this.userToLobby.has(userId)) {
      throw new Error('User already in a lobby');
    }

    if (this.matchmakingQueue.find(p => p.userId === userId)) {
      throw new Error('User already in matchmaking queue');
    }

    const player: MatchmakingPlayer = {
      userId,
      bracketId,
      wagerLamports,
      joinedAt: new Date()
    };

    this.matchmakingQueue.push(player);
  }

  /**
   * Remueve un jugador de la cola de matchmaking
   */
  public leaveQuickMatch(userId: string): void {
    const index = this.matchmakingQueue.findIndex(p => p.userId === userId);
    if (index !== -1) {
      this.matchmakingQueue.splice(index, 1);
    }
  }

  /**
   * Procesa la cola de matchmaking para emparejar jugadores
   */
  private processMatchmaking(): void {
    // Agrupar jugadores por bracket y wager
    const groups = new Map<string, MatchmakingPlayer[]>();
    
    for (const player of this.matchmakingQueue) {
      const key = `${player.bracketId}-${player.wagerLamports}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(player);
    }

    // Emparejar jugadores en cada grupo
    for (const [key, players] of groups) {
      while (players.length >= 2) {
        const player1 = players.shift()!;
        const player2 = players.shift()!;
        
        // Crear lobby para los jugadores emparejados
        try {
          const lobby = this.createLobby(player1.userId, player1.bracketId, player1.wagerLamports, 'QUICK_MATCH');
          
          // Agregar el segundo jugador
          lobby.opponentId = player2.userId;
          lobby.status = 'FULL';
          lobby.updatedAt = new Date();
          
          this.lobbies.set(lobby.id, lobby);
          this.userToLobby.set(player2.userId, lobby.id);
          
          // Remover jugadores de la cola
          this.removeFromQueue(player1.userId);
          this.removeFromQueue(player2.userId);
          
          // Emitir evento de emparejamiento (será manejado por el servidor principal)
          this.onMatchFound?.(lobby, player1.userId, player2.userId);
        } catch (error) {
          console.error('Error creating matchmaking lobby:', error);
        }
      }
    }
  }

  /**
   * Remueve un jugador específico de la cola
   */
  private removeFromQueue(userId: string): void {
    const index = this.matchmakingQueue.findIndex(p => p.userId === userId);
    if (index !== -1) {
      this.matchmakingQueue.splice(index, 1);
    }
  }

  /**
   * Callback para cuando se encuentra un emparejamiento
   */
  public onMatchFound?: (lobby: LobbyData, player1Id: string, player2Id: string) => void;

  /**
   * Crea un lobby contra un bot
   */
  public createBotLobby(userId: string, bracketId: number, wagerLamports: number): LobbyData {
    // Verificar si el usuario ya está en un lobby
    if (this.userToLobby.has(userId)) {
      throw new Error('User already in a lobby');
    }

    const lobby = this.createLobby(userId, bracketId, wagerLamports, 'VS_BOT');
    
    // Agregar bot como oponente
    const botId = `bot_${uuidv4()}`;
    lobby.opponentId = botId;
    lobby.status = 'FULL';
    lobby.isBot = true;
    lobby.updatedAt = new Date();
    
    // Generar equipo aleatorio para el bot
    lobby.opponentTeam = this.generateBotTeam();
    lobby.opponentReady = true;
    
    this.lobbies.set(lobby.id, lobby);
    
    return lobby;
  }

  /**
   * Genera un equipo aleatorio para el bot
   */
  private generateBotTeam(): BattleTeam {
    // Lista de Pokémon disponibles para bots
    const availablePokemon = [
      { id: 'pikachu', name: 'Pikachu', type1: 'electric', hp: 35, attack: 55, defense: 40, speed: 90 },
      { id: 'charizard', name: 'Charizard', type1: 'fire', type2: 'flying', hp: 78, attack: 84, defense: 78, speed: 100 },
      { id: 'blastoise', name: 'Blastoise', type1: 'water', hp: 79, attack: 83, defense: 100, speed: 78 },
      { id: 'venusaur', name: 'Venusaur', type1: 'grass', type2: 'poison', hp: 80, attack: 82, defense: 83, speed: 80 },
      { id: 'alakazam', name: 'Alakazam', type1: 'psychic', hp: 55, attack: 50, defense: 45, speed: 120 },
      { id: 'machamp', name: 'Machamp', type1: 'fighting', hp: 90, attack: 130, defense: 80, speed: 55 }
    ];

    // Seleccionar 3 Pokémon aleatorios
    const team: BattleTeam = {
      id: uuidv4(),
      name: 'Bot Team',
      pokemon: []
    };

    const shuffled = [...availablePokemon].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const pokemon = shuffled[i];
      team.pokemon.push({
        id: pokemon.id,
        species: pokemon.name,
        level: 50,
        hp: pokemon.hp,
        maxHp: pokemon.hp,
        type1: pokemon.type1 as any, // Temporal fix for type conversion
        type2: pokemon.type2 as any,
        moves: this.generateBotMoves(pokemon.type1, pokemon.type2),
        status: null,
        gender: 'M',
        ability: 'Static',
        nature: 'Hardy',
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 }
      });
    }

    return team;
  }

  /**
   * Genera movimientos aleatorios para un bot basados en sus tipos
   */
  private generateBotMoves(type1: string, type2?: string): any[] {
    const movesByType: { [key: string]: any[] } = {
      electric: [
        { 
          id: 'thunderbolt', 
          name: 'Thunderbolt', 
          type: 'ELECTRIC', 
          category: 'SPECIAL', 
          power: 90, 
          accuracy: 100, 
          pp: 15, 
          maxPp: 15, 
          priority: 0, 
          flags: [], 
          target: 'normal' 
        },
        { 
          id: 'thunder_wave', 
          name: 'Thunder Wave', 
          type: 'ELECTRIC', 
          category: 'STATUS', 
          power: 0, 
          accuracy: 90, 
          pp: 20, 
          maxPp: 20, 
          priority: 0, 
          flags: [], 
          target: 'normal' 
        }
      ],
      fire: [
        { 
          id: 'flamethrower', 
          name: 'Flamethrower', 
          type: 'FIRE', 
          category: 'SPECIAL', 
          power: 90, 
          accuracy: 100, 
          pp: 15, 
          maxPp: 15, 
          priority: 0, 
          flags: [], 
          target: 'normal' 
        }
      ],
      normal: [
        { 
          id: 'tackle', 
          name: 'Tackle', 
          type: 'NORMAL', 
          category: 'PHYSICAL', 
          power: 40, 
          accuracy: 100, 
          pp: 35, 
          maxPp: 35, 
          priority: 0, 
          flags: [], 
          target: 'normal' 
        }
      ]
    };

    const moves = [];
    const availableMoves = [...(movesByType[type1.toLowerCase()] || []), ...(type2 ? movesByType[type2.toLowerCase()] || [] : [])];
    
    // Agregar movimientos genéricos si no hay suficientes
    if (availableMoves.length === 0) {
      availableMoves.push(...movesByType.normal);
    }
    
    // Seleccionar hasta 4 movimientos
    const shuffled = [...availableMoves].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(4, shuffled.length); i++) {
      moves.push(shuffled[i]);
    }

    return moves;
  }

  /**
   * Obtiene el estado de la cola de matchmaking
   */
  public getMatchmakingStatus(): { queueLength: number; estimatedWaitTime: number } {
    return {
      queueLength: this.matchmakingQueue.length,
      estimatedWaitTime: this.matchmakingQueue.length > 0 ? Math.max(5, this.matchmakingQueue.length * 2) : 0
    };
  }

  /**
   * Busca una partida rápida para el usuario
   */
  public async findQuickMatch(userId: string, team: BattleTeam): Promise<{
    type: 'WAITING' | 'MATCH_FOUND';
    creatorId?: string;
    opponentId?: string;
    creatorTeam?: BattleTeam;
    opponentTeam?: BattleTeam;
  }> {
    // Buscar si hay alguien esperando en la cola
    const waitingPlayer = this.matchmakingQueue.find(player => player.userId !== userId);
    
    if (waitingPlayer) {
      // Encontrar match
      this.removeFromQueue(waitingPlayer.userId);
      
      // Obtener el equipo del jugador en espera
      const waitingLobby = this.getUserLobby(waitingPlayer.userId);
      
      return {
        type: 'MATCH_FOUND',
        creatorId: waitingPlayer.userId,
        opponentId: userId,
        creatorTeam: waitingLobby?.creatorTeam || this.generateBotTeam(),
        opponentTeam: team
      };
    } else {
      // Agregar a la cola de espera
      this.joinQuickMatch(userId, 1, 0); // Bracket 1, sin apuesta
      
      // Crear lobby temporal para almacenar el equipo
      const lobby = this.createLobby(userId, 1, 0, 'QUICK_MATCH');
      this.setTeam(userId, team);
      
      return {
        type: 'WAITING'
      };
    }
  }

  /**
   * Crea un equipo de bot con la dificultad especificada
   */
  public async createBotTeam(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<BattleTeam> {
    const botTeam = this.generateBotTeam();
    
    // Ajustar estadísticas según la dificultad
    botTeam.pokemon.forEach(pokemon => {
      switch (difficulty) {
        case 'easy':
          // Reducir estadísticas para facilidad
          pokemon.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
          pokemon.ivs = { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 };
          break;
        case 'hard':
          // Maximizar estadísticas para dificultad
          pokemon.evs = { hp: 252, atk: 252, def: 252, spa: 252, spd: 252, spe: 252 };
          pokemon.ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
          break;
        case 'medium':
        default:
          // Mantener estadísticas balanceadas
          break;
      }
    });
    
    return botTeam;
  }

  /**
   * Genera un código de invitación único
   */
  private generateInviteCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}

// Exportar una instancia singleton del LobbyManager
export const lobbyManager = new LobbyManager();