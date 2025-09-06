import { Injectable, Logger } from '@nestjs/common';
import {
  BattlePokemon,
  BattleMove,
  BattleStatus,
  BattleTeam,
  BattleEvent,
  calculateTypeEffectiveness
} from '../shared/interfaces/battle';

@Injectable()
export class BattleEngineService {
  private readonly logger = new Logger(BattleEngineService.name);

  private teamA: BattleTeam;
  private teamB: BattleTeam;
  private turn: number = 0;

  constructor() {}

  initializeBattle(teamA: BattleTeam, teamB: BattleTeam): void {
    this.teamA = teamA;
    this.teamB = teamB;
    this.turn = 0;
    this.logger.log('Battle initialized');
  }

  // Process a turn with moves from both players
  processTurn(
    playerAMove: { slot: number; moveId: string },
    playerBMove: { slot: number; moveId: string }
  ): BattleEvent[] {
    const events: BattleEvent[] = [];
    this.turn++;

    // Get active Pokemon
    const activeA = this.teamA.pokemon[this.teamA.activeIndex];
    const activeB = this.teamB.pokemon[this.teamB.activeIndex];

    // Determine turn order based on priority and speed
    const moves = [
      { player: 'A', pokemon: activeA, move: playerAMove },
      { player: 'B', pokemon: activeB, move: playerBMove }
    ];

    // Sort by priority, then by speed
    moves.sort((a, b) => {
      const moveA = activeA.moves.find(m => m.id === a.move.moveId);
      const moveB = activeB.moves.find(m => m.id === b.move.moveId);

      if (!moveA || !moveB) return 0;

      if (moveA.priority !== moveB.priority) {
        return moveB.priority - moveA.priority; // Higher priority first
      }

      const speedA = this.calculateEffectiveSpeed(activeA);
      const speedB = this.calculateEffectiveSpeed(activeB);
      return speedB - speedA; // Higher speed first
    });

    // Process moves in order
    for (const moveData of moves) {
      if (this.isBattleEnded()) break;

      const event = this.processMove(moveData.player, moveData.move);
      if (event) {
        events.push(event);
      }
    }

    // Process end-of-turn effects
    events.push(...this.processEndOfTurn());

    return events;
  }

  private processMove(player: string, moveData: { slot: number; moveId: string }): BattleEvent | null {
    const attacker = player === 'A' ? this.teamA.pokemon[this.teamA.activeIndex] : this.teamB.pokemon[this.teamB.activeIndex];
    const defender = player === 'A' ? this.teamB.pokemon[this.teamB.activeIndex] : this.teamA.pokemon[this.teamA.activeIndex];

    // Check if Pokemon is fainted
    if (attacker.currentHp <= 0) return null;

    const move = attacker.moves.find(m => m.id === moveData.moveId);
    if (!move) return null;

    // Check PP
    if (move.pp <= 0) return null;

    // Check accuracy
    if (!this.checkAccuracy(move.accuracy)) {
      return {
        type: 'MISS',
        attacker: player,
        move: move.name
      };
    }

    move.pp--; // Consume PP

    // Process move based on category
    switch (move.category) {
      case 'PHYSICAL':
      case 'SPECIAL':
        return this.processDamageMove(attacker, defender, move, player);
      case 'STATUS':
        return this.processStatusMove(attacker, defender, move, player);
      default:
        return null;
    }
  }

  private processDamageMove(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: BattleMove,
    attackerPlayer: string
  ): BattleEvent {
    const baseDamage = this.calculateDamage(attacker, defender, move);

    // Apply random factor (0.85-1.0)
    const randomFactor = 0.85 + Math.random() * 0.15;
    const damage = Math.floor(baseDamage * randomFactor);

    // Apply damage
    defender.currentHp = Math.max(0, defender.currentHp - damage);

    return {
      type: 'DAMAGE',
      attacker: attackerPlayer,
      defender: attackerPlayer === 'A' ? 'B' : 'A',
      damage,
      move: move.name,
      effectiveness: calculateTypeEffectiveness(move.type, defender.types)
    };
  }

  private processStatusMove(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: BattleMove,
    attackerPlayer: string
  ): BattleEvent {
    // Simplified status move processing
    // In a full implementation, this would handle various status effects
    return {
      type: 'STATUS',
      attacker: attackerPlayer,
      defender: attackerPlayer === 'A' ? 'B' : 'A',
      status: 'PARALYSIS',
      move: move.name
    };
  }

  private calculateDamage(attacker: BattlePokemon, defender: BattlePokemon, move: BattleMove): number {
    const level = attacker.level;
    const power = move.power;

    // Get attack/defense stats based on move category
    let attack: number, defense: number;

    if (move.category === 'PHYSICAL') {
      attack = this.calculateEffectiveStat(attacker.stats.atk, attacker.status);
      defense = this.calculateEffectiveStat(defender.stats.def, defender.status);
    } else { // SPECIAL
      attack = this.calculateEffectiveStat(attacker.stats.spa, attacker.status);
      defense = this.calculateEffectiveStat(defender.stats.spd, defender.status);
    }

    // Damage formula: ((2 * level / 5 + 2) * power * attack / defense / 50 + 2)
    let damage = ((2 * level / 5 + 2) * power * attack / defense / 50 + 2);

    // Apply type effectiveness
    const effectiveness = calculateTypeEffectiveness(move.type, defender.types);
    damage *= effectiveness;

    // Apply STAB (Same Type Attack Bonus)
    if (attacker.types.includes(move.type)) {
      damage *= 1.5;
    }

    return Math.floor(damage);
  }

  private calculateEffectiveStat(baseStat: number, status?: BattleStatus): number {
    if (!status) return baseStat;

    switch (status.type) {
      case 'BURN':
        return Math.floor(baseStat * 0.5); // Burn reduces physical attack
      case 'PARALYSIS':
        return Math.floor(baseStat * 0.75); // Paralysis reduces speed
      default:
        return baseStat;
    }
  }

  private calculateEffectiveSpeed(pokemon: BattlePokemon): number {
    let speed = pokemon.stats.spe;

    if (pokemon.status) {
      switch (pokemon.status.type) {
        case 'PARALYSIS':
          speed = Math.floor(speed * 0.25); // Paralysis severely reduces speed
          break;
      }
    }

    return speed;
  }

  private checkAccuracy(accuracy: number): boolean {
    return Math.random() * 100 < accuracy;
  }

  private processEndOfTurn(): BattleEvent[] {
    const events: BattleEvent[] = [];

    // Process status effects
    for (const team of [this.teamA, this.teamB]) {
      const pokemon = team.pokemon[team.activeIndex];
      if (pokemon.status) {
        switch (pokemon.status.type) {
          case 'POISON':
            const poisonDamage = Math.floor(pokemon.stats.hp * 0.0625);
            pokemon.currentHp = Math.max(0, pokemon.currentHp - poisonDamage);
            events.push({
              type: 'STATUS_DAMAGE',
              pokemon: team === this.teamA ? 'A' : 'B',
              damage: poisonDamage,
              status: 'POISON'
            });
            break;
          case 'BURN':
            const burnDamage = Math.floor(pokemon.stats.hp * 0.0625);
            pokemon.currentHp = Math.max(0, pokemon.currentHp - burnDamage);
            events.push({
              type: 'STATUS_DAMAGE',
              pokemon: team === this.teamA ? 'A' : 'B',
              damage: burnDamage,
              status: 'BURN'
            });
            break;
        }
      }
    }

    return events;
  }

  private isBattleEnded(): boolean {
    const teamAAlive = this.teamA.pokemon.some(p => p.currentHp > 0);
    const teamBAlive = this.teamB.pokemon.some(p => p.currentHp > 0);

    return !teamAAlive || !teamBAlive;
  }

  getWinner(): 'A' | 'B' | null {
    const teamAAlive = this.teamA.pokemon.some(p => p.currentHp > 0);
    const teamBAlive = this.teamB.pokemon.some(p => p.currentHp > 0);

    if (!teamAAlive && !teamBAlive) return null; // Draw
    if (!teamAAlive) return 'B';
    if (!teamBAlive) return 'A';
    return null;
  }

  getBattleState() {
    return {
      turn: this.turn,
      teamA: {
        pokemon: this.teamA.pokemon.map(p => ({
          name: p.name,
          currentHp: p.currentHp,
          maxHp: p.stats.hp,
          status: p.status
        })),
        activeIndex: this.teamA.activeIndex
      },
      teamB: {
        pokemon: this.teamB.pokemon.map(p => ({
          name: p.name,
          currentHp: p.currentHp,
          maxHp: p.stats.hp,
          status: p.status
        })),
        activeIndex: this.teamB.activeIndex
      }
    };
  }
}

