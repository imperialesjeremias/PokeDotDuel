import { TypeGen1, calculateTypeEffectiveness, BattleEvent, BattleTeam as SharedBattleTeam, BattlePokemon } from '@pokebattle/shared';
import { pokedex } from '../dex/Pokedex';

// Extended BattleTeam with activeIndex for battle engine
interface BattleTeam extends SharedBattleTeam {
  activeIndex: number;
}


export interface BattleAction {
  slot: number;
  moveId: string;
}



export class BattleEngine {
  private teamA: BattleTeam;
  private teamB: BattleTeam;
  public turn: number = 0;
  private events: BattleEvent[] = [];
  public readonly player1Id: string;
  public readonly player2Id: string;

  constructor(teamA: BattleTeam, teamB: BattleTeam, player1Id: string, player2Id: string) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
  }

  public processTurn(actionA: BattleAction, actionB: BattleAction): BattleEvent[] {
    this.events = [];
    this.turn++;

    // Get active Pokemon
    const pokemonA = this.teamA.pokemon[this.teamA.activeIndex];
    const pokemonB = this.teamB.pokemon[this.teamB.activeIndex];

    // Get moves
    const moveA = pokemonA.moves.find(m => m.id === actionA.moveId);
    const moveB = pokemonB.moves.find(m => m.id === actionB.moveId);

    if (!moveA || !moveB) {
      throw new Error('Invalid move ID');
    }

    // Determine move order based on priority and speed
    const speedA = this.calculateEffectiveSpeed(pokemonA);
    const speedB = this.calculateEffectiveSpeed(pokemonB);

    let firstPokemon: BattlePokemon;
    let secondPokemon: BattlePokemon;
    let firstMove: typeof moveA;
    let secondMove: typeof moveB;
    let firstAttacker: 'A' | 'B';
    let secondAttacker: 'A' | 'B';

    if (moveA.priority > moveB.priority) {
      firstPokemon = pokemonA;
      secondPokemon = pokemonB;
      firstMove = moveA;
      secondMove = moveB;
      firstAttacker = 'A';
      secondAttacker = 'B';
    } else if (moveB.priority > moveA.priority) {
      firstPokemon = pokemonB;
      secondPokemon = pokemonA;
      firstMove = moveB;
      secondMove = moveA;
      firstAttacker = 'B';
      secondAttacker = 'A';
    } else if (speedA > speedB) {
      firstPokemon = pokemonA;
      secondPokemon = pokemonB;
      firstMove = moveA;
      secondMove = moveB;
      firstAttacker = 'A';
      secondAttacker = 'B';
    } else {
      firstPokemon = pokemonB;
      secondPokemon = pokemonA;
      firstMove = moveB;
      secondMove = moveA;
      firstAttacker = 'B';
      secondAttacker = 'A';
    }

    // Process first move
    this.processMove(firstPokemon, secondPokemon, firstMove, firstAttacker, secondAttacker);

    // Check if second Pokemon can still attack
    const secondTeam = secondAttacker === 'A' ? this.teamA : this.teamB;
    const secondActivePokemon = secondTeam.pokemon[secondTeam.activeIndex];

    if (secondActivePokemon.hp > 0) {
      // Process second move
      this.processMove(secondPokemon, firstPokemon, secondMove, secondAttacker, firstAttacker);
    }

    // Process end of turn effects
    this.processEndOfTurn();

    // Consume PP
    moveA.pp -= 1;
    moveB.pp -= 1;

    return this.events;
  }

  public processEndOfTurn(): BattleEvent[] {
    const endOfTurnEvents: BattleEvent[] = [];

    // Process status effects for team A
    const pokemonA = this.teamA.pokemon[this.teamA.activeIndex];
    if (pokemonA.status === 'BURN') {
      const burnDamage = Math.floor(pokemonA.maxHp * 0.0625);
      pokemonA.hp = Math.max(0, pokemonA.hp - burnDamage);
      endOfTurnEvents.push({
        type: 'STATUS',
        target: this.teamA.activeIndex,
        status: 'BURN_DAMAGE'
      });
    }

    // Note: Status duration would be handled by statusTurns property if needed

    // Process status effects for team B
    const pokemonB = this.teamB.pokemon[this.teamB.activeIndex];
    if (pokemonB.status === 'BURN') {
      const burnDamage = Math.floor(pokemonB.maxHp * 0.0625);
      pokemonB.hp = Math.max(0, pokemonB.hp - burnDamage);
      endOfTurnEvents.push({
        type: 'STATUS',
        target: this.teamB.activeIndex,
        status: 'BURN_DAMAGE'
      });
    }

    // Note: Status duration would be handled by statusTurns property if needed

    this.events.push(...endOfTurnEvents);
    return endOfTurnEvents;
  }

  public getWinner(): 'A' | 'B' | null {
    // Verificar si el equipo A tiene Pokémon disponibles
    const teamAHasAvailable = this.teamA.pokemon.some(p => p.hp > 0);
    
    // Verificar si el equipo B tiene Pokémon disponibles
    const teamBHasAvailable = this.teamB.pokemon.some(p => p.hp > 0);
    
    if (!teamAHasAvailable && !teamBHasAvailable) {
      return null; // Empate (muy raro)
    }
    
    if (!teamAHasAvailable) {
      return 'B'; // El equipo B gana
    }
    
    if (!teamBHasAvailable) {
      return 'A'; // El equipo A gana
    }
    
    return null; // La batalla continúa
  }

  public isOver(): boolean {
    return this.getWinner() !== null;
  }

  public getState(): any {
    return {
      teamA: this.teamA,
      teamB: this.teamB,
      turn: this.turn,
      events: this.events
    };
  }

  public getCurrentPlayerId(): string {
    // Retorna el ID del jugador cuyo turno es actualmente
    return this.turn % 2 === 0 ? this.player1Id : this.player2Id;
  }

  public processAction(action: BattleAction): BattleEvent[] {
    // Procesar la acción y retornar los eventos resultantes
    const events: BattleEvent[] = [];
    
    // Aquí iría la lógica para procesar la acción
    // Por ahora retornamos un evento básico
    events.push({
      type: 'MOVE',
      target: this.turn % 2 === 0 ? this.teamA.activeIndex : this.teamB.activeIndex
    });
    
    this.turn++;
    return events;
  }

  public calculateEffectiveSpeed(pokemon: BattlePokemon): number {
    let speed = pokemon.boosts.spe;

    // Apply status effects
    if (pokemon.status === 'PARALYSIS') {
      speed = Math.floor(speed * 0.75); // 25% speed reduction for paralysis
    }

    return speed;
  }

  private processMove(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: BattlePokemon['moves'][0],
    attackerTeam: 'A' | 'B',
    defenderTeam: 'A' | 'B'
  ): void {
    // Get move data from Pokedex for accurate calculations
    const moveData = pokedex.getMove(move.id);
    if (!moveData) {
      console.warn(`Move ${move.id} not found in Pokedex, using basic data`);
    }
    
    // Use Showdown data if available, otherwise fallback to move data
    const actualPower = moveData?.power ?? move.power;
    const actualAccuracy = moveData?.accuracy ?? move.accuracy;
    const actualCategory = moveData?.category ?? move.category;
    // Add move event
    this.events.push({
      type: 'MOVE',
      target: attackerTeam === 'A' ? this.teamA.activeIndex : this.teamB.activeIndex,
      move: move.name
    });

    // Check if move hits (based on accuracy using Showdown data)
    const accuracyRoll = Math.random() * 100;
    if (accuracyRoll > actualAccuracy) {
      // Move missed
      this.events.push({
        type: 'MOVE',
        target: defenderTeam === 'A' ? 0 : 1,
        move: `${move.name} missed!`
      });
      return;
    }

    // Calculate damage for damaging moves using Showdown data
    if (actualCategory !== 'STATUS' && actualPower > 0) {
      // Calculate type effectiveness using Showdown logic
      const moveType = moveData?.type ?? move.type;
      const defenderTypes = [defender.type1, defender.type2].filter(type => type !== null && type !== undefined) as TypeGen1[];
      const effectiveness = calculateTypeEffectiveness(moveType, defenderTypes);

      // Calculate STAB (Same Type Attack Bonus) - Showdown standard
      const attackerTypes = [attacker.type1, attacker.type2].filter(Boolean);
      const stab = attackerTypes.includes(moveType) ? 1.5 : 1;

      // Use improved critical hit calculation
      const isCritical = Math.random() < this.getCriticalHitRatio(attacker, moveData);

      // Calculate stats using Showdown formulas
      const attackStat = actualCategory === 'PHYSICAL' ? 
        this.calculateStat(attacker, 'atk') : 
        this.calculateStat(attacker, 'spa');
      const defenseStat = actualCategory === 'PHYSICAL' ? 
        this.calculateStat(defender, 'def') : 
        this.calculateStat(defender, 'spd');

      // Apply boosts (Gen 1 style: +1 stage = 1.5x, +2 = 2x, etc.)
      const attackBoost = actualCategory === 'PHYSICAL' ? attacker.boosts.atk : attacker.boosts.spa;
      const defenseBoost = actualCategory === 'PHYSICAL' ? defender.boosts.def : defender.boosts.spd;
      
      const boostedAttack = this.applyStatBoost(attackStat, attackBoost);
      const boostedDefense = this.applyStatBoost(defenseStat, defenseBoost);

      const damage = this.calculateDamage(boostedAttack, boostedDefense, actualPower, stab, effectiveness, isCritical, attacker.level);

      // Apply damage
      defender.hp = Math.max(0, defender.hp - damage);

      // Add damage event
      this.events.push({
        type: 'DAMAGE',
        target: defenderTeam === 'A' ? this.teamA.activeIndex : this.teamB.activeIndex,
        value: damage
      });
    }
  }

  private calculateStat(pokemon: BattlePokemon, stat: 'atk' | 'def' | 'spa' | 'spd' | 'spe'): number {
    // Showdown stat calculation: ((Base + IV) * 2 + EV/4) * Level/100 + 5
    const pokemonData = pokedex.getPokemon(pokemon.species);
    const baseStat = pokemonData?.baseStats?.[stat] ?? 50; // fallback
    const iv = pokemon.ivs[stat] ?? 15;
    const ev = pokemon.evs[stat] ?? 0;
    const level = pokemon.level;
    
    return Math.floor(((baseStat + iv) * 2 + Math.floor(ev / 4)) * level / 100) + 5;
  }

  private getCriticalHitRatio(attacker: BattlePokemon, moveData: any): number {
    // Gen 1 critical hit mechanics - base rate is speed/512
    const speed = this.calculateStat(attacker, 'spe');
    let critRate = speed / 512;
    
    // High critical hit moves (like Slash, Razor Leaf)
    if (moveData?.critRatio && moveData.critRatio > 1) {
      critRate *= moveData.critRatio;
    }
    
    return Math.min(critRate, 0.99); // Cap at 99%
  }

  private applyStatBoost(baseStat: number, boost: number): number {
    // Gen 1 stat boost mechanics
    // Boosts range from -6 to +6
    // Each boost stage multiplies by (2+boost)/2 for positive, 2/(2-boost) for negative
    if (boost === 0) return baseStat;
    
    if (boost > 0) {
      return Math.floor(baseStat * (2 + boost) / 2);
    } else {
      return Math.floor(baseStat * 2 / (2 - boost));
    }
  }

  private calculateDamage(
    attackStat: number,
    defenseStat: number,
    power: number,
    stab: number,
    typeEffectiveness: number,
    isCritical: boolean,
    level: number = 50
  ): number {
    // Gen 1 damage formula (Showdown accurate)
    // Damage = (((2 * Level + 10) / 250) * (Attack / Defense) * Power + 2) * Modifiers
    let damage = Math.floor(((2 * level + 10) / 250) * (attackStat / defenseStat) * power + 2);
    
    // Apply critical hit multiplier (Gen 1: doubles the damage before other modifiers)
    if (isCritical) {
      damage *= 2;
    }
    
    // Apply STAB (Same Type Attack Bonus)
    damage = Math.floor(damage * stab);
    
    // Apply type effectiveness
    damage = Math.floor(damage * typeEffectiveness);
    
    // Add random factor (217-255)/255 in Gen 1 (approximately 85-100%)
    const randomFactor = (217 + Math.floor(Math.random() * 39)) / 255;
    damage = Math.floor(damage * randomFactor);
    
    // Minimum damage is 1
    return Math.max(1, damage);
  }
}