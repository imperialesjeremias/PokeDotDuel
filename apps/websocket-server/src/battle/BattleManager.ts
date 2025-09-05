import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { BattleEvent } from '@pokebattle/shared';

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

    // Process the turn (simplified battle logic)
    const events = await this.processBattleTurn(battle, move);
    
    battle.turn = turn;
    battle.transcript.push(...events);

    // Check for battle end conditions
    const battleEnded = this.checkBattleEnd(battle, events);
    
    if (battleEnded) {
      battle.status = 'ENDED';
      battle.winner = this.determineWinner(battle);
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

  private generateSeed(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async processBattleTurn(battle: Battle, move: any): Promise<BattleEvent[]> {
    const events: BattleEvent[] = [];
    
    // Simplified battle logic - in a real implementation, this would be much more complex
    // involving type effectiveness, damage calculation, status effects, etc.
    
    if (move.action === 'MOVE') {
      // Calculate damage (simplified)
      const damage = Math.floor(Math.random() * 50) + 10;
      
      events.push({
        type: 'DAMAGE',
        target: move.target || 0,
        value: damage,
        move: move.moveId,
      });
    } else if (move.action === 'SWITCH') {
      events.push({
        type: 'SWITCH',
        target: move.target || 0,
      });
    }

    return events;
  }

  private checkBattleEnd(battle: Battle, events: BattleEvent[]): boolean {
    // Simplified end condition - in reality, this would check HP, status effects, etc.
    return events.some(event => event.type === 'DAMAGE' && event.value && event.value > 100);
  }

  private determineWinner(battle: Battle): string {
    // Simplified winner determination
    return battle.turn % 2 === 0 ? battle.playerB : battle.playerA;
  }
}
