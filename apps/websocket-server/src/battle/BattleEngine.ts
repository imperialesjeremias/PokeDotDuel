import { TypeGen1, calculateTypeEffectiveness, BattleEvent, BattleTeam as SharedBattleTeam, BattlePokemon } from '@pokebattle/shared';

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
    // Add move event
    this.events.push({
      type: 'MOVE',
      target: attackerTeam === 'A' ? this.teamA.activeIndex : this.teamB.activeIndex,
      move: move.name
    });

    // Check if move hits (based on accuracy)
    const accuracyRoll = Math.random() * 100;
    if (accuracyRoll > move.accuracy) {
      // Move missed
      return;
    }

    // Calculate damage for damaging moves
    if (move.power > 0) {
      // Determine if it's a critical hit (6.25% chance in Gen 1)
      const isCritical = Math.random() < 0.0625;

      // Calculate type effectiveness
      const defenderTypes = [defender.type1, defender.type2].filter(type => type !== null && type !== undefined) as TypeGen1[];
      const effectiveness = calculateTypeEffectiveness(move.type, defenderTypes);

      // Calculate STAB (Same Type Attack Bonus)
      const attackerTypes = [attacker.type1, attacker.type2].filter(Boolean);
      const stab = attackerTypes.includes(move.type) ? 1.5 : 1;

      // Calculate damage
      let damage: number;
      if (move.category === 'PHYSICAL') {
        // Physical damage formula
        const attackStat = isCritical ? attacker.boosts.atk * 2 : attacker.boosts.atk;
        const defenseStat = defender.boosts.def;
        damage = this.calculateDamage(attackStat, defenseStat, move.power, stab, effectiveness, isCritical);
      } else {
        // Special damage formula
        const attackStat = isCritical ? attacker.boosts.spa * 2 : attacker.boosts.spa;
        const defenseStat = defender.boosts.spd;
        damage = this.calculateDamage(attackStat, defenseStat, move.power, stab, effectiveness, isCritical);
      }

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

  private calculateDamage(
    attackStat: number,
    defenseStat: number,
    power: number,
    stab: number,
    typeEffectiveness: number,
    isCritical: boolean
  ): number {
    // Base damage formula
    const level = 50; // Assuming level 50 battles
    const baseDamage = Math.floor((2 * level) / 5 + 2);
    const attackDefenseRatio = attackStat / defenseStat;
    const damageBeforeModifiers = Math.floor(baseDamage * power * attackDefenseRatio / 50);

    // Apply modifiers
    const criticalModifier = isCritical ? 1.5 : 1;
    const randomModifier = (Math.random() * 0.15 + 0.85); // Random factor between 0.85 and 1.0

    // Final damage calculation
    const finalDamage = Math.floor(damageBeforeModifiers * stab * typeEffectiveness * criticalModifier * randomModifier);
    return Math.max(1, finalDamage); // Minimum 1 damage
  }
}