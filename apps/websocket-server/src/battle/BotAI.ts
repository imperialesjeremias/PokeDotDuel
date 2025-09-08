import { BattleState, BattlePokemon, Move } from '@pokebattle/shared';

/**
 * Clase que maneja la inteligencia artificial de los bots
 */
export class BotAI {
  private difficulty: 'easy' | 'medium' | 'hard';

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.difficulty = difficulty;
  }

  /**
   * Decide la próxima acción del bot basada en el estado de la batalla
   */
  public decideAction(battleState: BattleState, botPlayerId: string): {
    action: 'MOVE' | 'SWITCH';
    moveId?: string;
    target?: number;
    switchTo?: number;
  } {
    const botTeam = battleState.player1Id === botPlayerId ? battleState.player1Team : battleState.player2Team;
    const opponentTeam = battleState.player1Id === botPlayerId ? battleState.player2Team : battleState.player1Team;
    
    const activePokemon = botTeam[0]; // Asumiendo que el primer Pokémon es el activo
    const opponentActivePokemon = opponentTeam[0];

    // Verificar si el Pokémon activo está debilitado y necesita cambiar
    if (activePokemon.hp <= 0) {
      const switchTarget = this.decideSwitchTarget(botTeam, opponentActivePokemon);
      if (switchTarget !== -1) {
        return {
          action: 'SWITCH',
          switchTo: switchTarget
        };
      }
    }

    // Decidir si cambiar de Pokémon estratégicamente
    if (this.shouldSwitch(activePokemon, opponentActivePokemon, botTeam)) {
      const switchTarget = this.decideSwitchTarget(botTeam, opponentActivePokemon);
      if (switchTarget !== -1) {
        return {
          action: 'SWITCH',
          switchTo: switchTarget
        };
      }
    }

    // Decidir qué movimiento usar
    const moveId = this.decideBestMove(activePokemon, opponentActivePokemon);
    
    return {
      action: 'MOVE',
      moveId,
      target: 0 // Siempre atacar al Pokémon activo del oponente
    };
  }

  /**
   * Decide si el bot debería cambiar de Pokémon
   */
  private shouldSwitch(activePokemon: BattlePokemon, opponentPokemon: BattlePokemon, team: any): boolean {
    // Solo considerar cambio en dificultad media y alta
    if (this.difficulty === 'easy') {
      return false;
    }

    // Cambiar si el Pokémon activo tiene desventaja de tipo significativa
    const effectiveness = this.getTypeEffectiveness(activePokemon, opponentPokemon);
    
    // En dificultad difícil, ser más estratégico
    if (this.difficulty === 'hard') {
      // Cambiar si tiene desventaja y hay un mejor Pokémon disponible
      if (effectiveness < 0.5 && this.hasAdvantageousPokemon(team, opponentPokemon)) {
        return Math.random() < 0.7; // 70% de probabilidad
      }
    } else if (this.difficulty === 'medium') {
      // Cambiar ocasionalmente si tiene desventaja severa
      if (effectiveness < 0.25) {
        return Math.random() < 0.4; // 40% de probabilidad
      }
    }

    return false;
  }

  /**
   * Decide a qué Pokémon cambiar
   */
  private decideSwitchTarget(team: any, opponentPokemon: BattlePokemon): number {
    let bestIndex = -1;
    let bestScore = -1;

    for (let i = 1; i < team.pokemon.length; i++) { // Empezar desde 1 para evitar el Pokémon activo
      const pokemon = team.pokemon[i];
      
      // Solo considerar Pokémon que no estén debilitados
      if (pokemon.hp <= 0) continue;

      let score = 0;
      
      // Calcular ventaja de tipo
      const effectiveness = this.getTypeEffectiveness(pokemon, opponentPokemon);
      score += effectiveness * 10;
      
      // Considerar HP restante
      score += (pokemon.hp / pokemon.maxHp) * 5;
      
      // Considerar estadísticas
      score += (pokemon.attack + pokemon.speed) / 20;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /**
   * Verifica si hay un Pokémon con ventaja de tipo disponible
   */
  private hasAdvantageousPokemon(team: any, opponentPokemon: BattlePokemon): boolean {
    for (let i = 1; i < team.pokemon.length; i++) {
      const pokemon = team.pokemon[i];
      if (pokemon.hp > 0 && this.getTypeEffectiveness(pokemon, opponentPokemon) > 1.5) {
        return true;
      }
    }
    return false;
  }

  /**
   * Decide el mejor movimiento a usar
   */
  private decideBestMove(activePokemon: BattlePokemon, opponentPokemon: BattlePokemon): string {
    if (!activePokemon.moves || activePokemon.moves.length === 0) {
      return 'tackle'; // Movimiento por defecto
    }

    let bestMove = activePokemon.moves[0];
    let bestScore = -1;

    for (const move of activePokemon.moves) {
      let score = 0;
      
      // Calcular efectividad del tipo del movimiento
      const effectiveness = this.getMoveEffectiveness(move, opponentPokemon);
      score += effectiveness * move.power * 0.1;
      
      // Considerar precisión
      score += move.accuracy * 0.01;
      
      // En dificultad fácil, agregar algo de aleatoriedad
      if (this.difficulty === 'easy') {
        score += Math.random() * 20;
      }
      
      // En dificultad difícil, ser más estratégico
      if (this.difficulty === 'hard') {
        // Priorizar movimientos de estado si el oponente tiene mucha vida
        if (move.power === 0 && opponentPokemon.hp > opponentPokemon.maxHp * 0.7) {
          score += 15;
        }
        
        // Priorizar movimientos poderosos si el oponente tiene poca vida
        if (move.power > 100 && opponentPokemon.hp < opponentPokemon.maxHp * 0.3) {
          score += 25;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove.id;
  }

  /**
   * Calcula la efectividad de tipo entre dos Pokémon
   */
  private getTypeEffectiveness(attacker: BattlePokemon, defender: BattlePokemon): number {
    // Tabla simplificada de efectividad de tipos
    const typeChart: { [key: string]: { [key: string]: number } } = {
      fire: { grass: 2, water: 0.5, fire: 0.5, electric: 1, psychic: 1, fighting: 1, normal: 1, flying: 1, poison: 1 },
      water: { fire: 2, grass: 0.5, water: 0.5, electric: 0.5, psychic: 1, fighting: 1, normal: 1, flying: 1, poison: 1 },
      grass: { water: 2, fire: 0.5, grass: 0.5, electric: 1, psychic: 1, fighting: 1, normal: 1, flying: 0.5, poison: 0.5 },
      electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, psychic: 1, fighting: 1, normal: 1, fire: 1, poison: 1 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, fire: 1, water: 1, grass: 1, electric: 1, normal: 1, flying: 1 },
      fighting: { normal: 2, psychic: 0.5, flying: 0.5, poison: 0.5, fire: 1, water: 1, grass: 1, electric: 1 },
      normal: { fighting: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, flying: 1, poison: 1 },
      flying: { grass: 2, fighting: 2, electric: 0.5, fire: 1, water: 1, psychic: 1, normal: 1, poison: 1 },
      poison: { grass: 2, psychic: 1, fighting: 1, fire: 1, water: 1, electric: 1, normal: 1, flying: 1 }
    };

    let effectiveness = 1;
    
    // Verificar efectividad del tipo principal del atacante
    if (typeChart[attacker.type1]) {
      effectiveness *= typeChart[attacker.type1][defender.type1] || 1;
      if (defender.type2) {
        effectiveness *= typeChart[attacker.type1][defender.type2] || 1;
      }
    }
    
    // Si el atacante tiene segundo tipo, también considerarlo
    if (attacker.type2 && typeChart[attacker.type2]) {
      let secondTypeEffectiveness = 1;
      secondTypeEffectiveness *= typeChart[attacker.type2][defender.type1] || 1;
      if (defender.type2) {
        secondTypeEffectiveness *= typeChart[attacker.type2][defender.type2] || 1;
      }
      // Tomar el promedio de ambos tipos
      effectiveness = (effectiveness + secondTypeEffectiveness) / 2;
    }

    return effectiveness;
  }

  /**
   * Calcula la efectividad de un movimiento específico
   */
  private getMoveEffectiveness(move: Move, defender: BattlePokemon): number {
    const typeChart: { [key: string]: { [key: string]: number } } = {
      fire: { grass: 2, water: 0.5, fire: 0.5, electric: 1, psychic: 1, fighting: 1, normal: 1, flying: 1, poison: 1 },
      water: { fire: 2, grass: 0.5, water: 0.5, electric: 0.5, psychic: 1, fighting: 1, normal: 1, flying: 1, poison: 1 },
      grass: { water: 2, fire: 0.5, grass: 0.5, electric: 1, psychic: 1, fighting: 1, normal: 1, flying: 0.5, poison: 0.5 },
      electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, psychic: 1, fighting: 1, normal: 1, fire: 1, poison: 1 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, fire: 1, water: 1, grass: 1, electric: 1, normal: 1, flying: 1 },
      fighting: { normal: 2, psychic: 0.5, flying: 0.5, poison: 0.5, fire: 1, water: 1, grass: 1, electric: 1 },
      normal: { fighting: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, flying: 1, poison: 1 },
      flying: { grass: 2, fighting: 2, electric: 0.5, fire: 1, water: 1, psychic: 1, normal: 1, poison: 1 },
      poison: { grass: 2, psychic: 1, fighting: 1, fire: 1, water: 1, electric: 1, normal: 1, flying: 1 }
    };

    let effectiveness = 1;
    
    if (typeChart[move.type]) {
      effectiveness *= typeChart[move.type][defender.type1] || 1;
      if (defender.type2) {
        effectiveness *= typeChart[move.type][defender.type2] || 1;
      }
    }

    return effectiveness;
  }

  /**
   * Introduce un retraso aleatorio para simular "pensamiento" del bot
   */
  public async getActionDelay(): Promise<number> {
    const baseDelay = {
      easy: 1000,    // 1 segundo
      medium: 1500,  // 1.5 segundos
      hard: 2000     // 2 segundos
    };

    const randomVariation = Math.random() * 1000; // Hasta 1 segundo adicional
    return baseDelay[this.difficulty] + randomVariation;
  }

  /**
   * Cambia la dificultad del bot
   */
  public setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.difficulty = difficulty;
  }

  /**
   * Obtiene la dificultad actual
   */
  public getDifficulty(): 'easy' | 'medium' | 'hard' {
    return this.difficulty;
  }
}