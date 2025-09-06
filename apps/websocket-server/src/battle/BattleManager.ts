import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { BattleEvent, calculateTypeEffectiveness } from '@pokebattle/shared';
import { BattleEngine, BattlePokemon, BattleTeam } from './BattleEngine';

export interface Battle {
  id: string;
  playerA: string;
  playerB: string;
  teamA: string;
  teamB: string;
  seed: string;
  turn: number;
  status: 'ACTIVE' | 'ENDED';
  winner?: string;
  reason?: 'KO' | 'Timeout' | 'Forfeit';
  transcript: BattleEvent[];
  playerASocketId?: string;
  playerBSocketId?: string;
}

export class BattleManager {
  private battles: Map<string, Battle> = new Map();

  async startBattle(
    battleId: string,
    playerA: string,
    playerB: string,
    teamA: string,
    teamB: string
  ): Promise<Battle> {
    const seed = this.generateSeed();
    
    const battle: Battle = {
      id: battleId,
      playerA,
      playerB,
      teamA,
      teamB,
      seed,
      turn: 0,
      status: 'ACTIVE',
      transcript: [],
    };

    this.battles.set(battleId, battle);

    // Save to database
    await supabase
      .from('battles')
      .insert({
        id: battleId,
        player_a: playerA,
        player_b: playerB,
        started_at: new Date().toISOString(),
      });

    return battle;
  }

  async processTurn(
    battleId: string,
    playerId: string,
    turn: number,
    move: any,
    commit?: string,
    reveal?: string
  ): Promise<{
    turn: number;
    events: BattleEvent[];
    battleEnded: boolean;
    winner?: string;
    reason?: 'KO' | 'Timeout' | 'Forfeit';
  }> {
    const battle = this.battles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.status !== 'ACTIVE') {
      throw new Error('Battle is not active');
    }

    if (turn !== battle.turn + 1) {
      throw new Error('Invalid turn number');
    }

    // Validate player turn
    const isPlayerATurn = battle.turn % 2 === 0;
    const expectedPlayer = isPlayerATurn ? battle.playerA : battle.playerB;

    if (playerId !== expectedPlayer) {
      throw new Error('Not your turn');
    }

    // Get team data from database (simplified for now)
    const teamA = await this.getTeamData(battle.teamA);
    const teamB = await this.getTeamData(battle.teamB);

    // Create battle engine instance
    const battleEngine = new BattleEngine(teamA, teamB);

    // Process the turn using the battle engine
    const moveA = isPlayerATurn ? move : { slot: 0, moveId: 'struggle' }; // Default move
    const moveB = !isPlayerATurn ? move : { slot: 0, moveId: 'struggle' }; // Default move

    const events = battleEngine.processTurn(moveA, moveB);

    battle.turn = turn;
    battle.transcript.push(...events);

    // Check for battle end
    const winner = battleEngine.getWinner();
    const battleEnded = winner !== null;

    if (battleEnded) {
      battle.status = 'ENDED';
      battle.winner = winner === 'A' ? battle.playerA : battle.playerB;
      battle.reason = 'KO';

      // Update database
      await supabase
        .from('battles')
        .update({
          result: {
            winner: battle.winner,
            reason: battle.reason,
          },
          transcript: battle.transcript,
          ended_at: new Date().toISOString(),
        })
        .eq('id', battleId);
    }

    return {
      turn: battle.turn,
      events,
      battleEnded,
      winner: battle.winner,
      reason: battle.reason,
    };
  }

  async forfeitBattle(battleId: string, playerId: string): Promise<{
    winner: string;
    reason: 'Forfeit';
  }> {
    const battle = this.battles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.status !== 'ACTIVE') {
      throw new Error('Battle is not active');
    }

    battle.status = 'ENDED';
    battle.winner = playerId === battle.playerA ? battle.playerB : battle.playerA;
    battle.reason = 'Forfeit';

    // Update database
    await supabase
      .from('battles')
      .update({
        result: {
          winner: battle.winner,
          reason: battle.reason,
        },
        transcript: battle.transcript,
        ended_at: new Date().toISOString(),
      })
      .eq('id', battleId);

    return {
      winner: battle.winner,
      reason: 'Forfeit',
    };
  }

  handleDisconnection(battleId: string, playerId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) return;

    if (battle.playerA === playerId) {
      battle.playerASocketId = undefined;
    } else if (battle.playerB === playerId) {
      battle.playerBSocketId = undefined;
    }

    // If both players disconnected, remove battle
    if (!battle.playerASocketId && !battle.playerBSocketId) {
      this.battles.delete(battleId);
    }
  }

  getBattle(battleId: string): Battle | undefined {
    return this.battles.get(battleId);
  }

  private async getTeamData(teamId: string): Promise<BattleTeam> {
    // Get team from database
    const { data: team } = await supabase
      .from('teams')
      .select(`
        *,
        team_cards (
          position,
          cards (*)
        )
      `)
      .eq('id', teamId)
      .single();

    if (!team) throw new Error('Team not found');

    // Convert to BattleTeam format
    const pokemon: BattlePokemon[] = [];

    for (const teamCard of team.team_cards || []) {
      const card = teamCard.cards;
      if (card) {
        pokemon[teamCard.position] = {
          id: card.id,
          dexNumber: card.dex_number,
          name: card.name,
          level: card.level,
          types: card.types,
          stats: card.stats,
          currentHp: card.stats.hp, // Full HP at start
          moves: [], // Would need to get moves from database
        };
      }
    }

    return {
      pokemon,
      activeIndex: 0,
    };
  }

  private generateSeed(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
