import { PokemonData, TypeGen1, Move } from '@pokebattle/shared';

/**
 * Clase Pokedex que almacena y proporciona acceso a los datos de los Pokémon
 * Basada en la estructura de Pokémon Showdown
 */
export class Pokedex {
  private pokemon: Map<number, PokemonData>;
  private moves: Map<string, Move>;

  constructor() {
    this.pokemon = new Map();
    this.moves = new Map();
    this.initializeData();
  }

  /**
   * Obtiene los datos de un Pokémon por su número de Pokédex
   */
  public getPokemon(dexNumber: number): PokemonData | undefined {
    return this.pokemon.get(dexNumber);
  }

  /**
   * Obtiene los datos de un movimiento por su ID
   */
  public getMove(moveId: string): Move | undefined {
    return this.moves.get(moveId);
  }

  /**
   * Obtiene todos los Pokémon disponibles
   */
  public getAllPokemon(): PokemonData[] {
    return Array.from(this.pokemon.values());
  }

  /**
   * Obtiene todos los movimientos disponibles
   */
  public getAllMoves(): Move[] {
    return Array.from(this.moves.values());
  }

  /**
   * Inicializa los datos del Pokédex con los Pokémon y movimientos de la primera generación
   */
  private initializeData(): void {
    // Inicializar movimientos
    this.initializeMoves();
    
    // Inicializar Pokémon
    this.initializePokemon();
  }

  /**
   * Inicializa los datos de los movimientos
   */
  private initializeMoves(): void {
    // Movimientos básicos para la primera generación
    const moves: Move[] = [
      {
        id: 'tackle',
        name: 'Tackle',
        type: 'NORMAL',
        power: 40,
        accuracy: 100,
        pp: 35,
        category: 'PHYSICAL',
        priority: 0
      },
      {
        id: 'scratch',
        name: 'Scratch',
        type: 'NORMAL',
        power: 40,
        accuracy: 100,
        pp: 35,
        category: 'PHYSICAL',
        priority: 0
      },
      {
        id: 'ember',
        name: 'Ember',
        type: 'FIRE',
        power: 40,
        accuracy: 100,
        pp: 25,
        category: 'SPECIAL',
        priority: 0
      },
      {
        id: 'water-gun',
        name: 'Water Gun',
        type: 'WATER',
        power: 40,
        accuracy: 100,
        pp: 25,
        category: 'SPECIAL',
        priority: 0
      },
      {
        id: 'vine-whip',
        name: 'Vine Whip',
        type: 'GRASS',
        power: 45,
        accuracy: 100,
        pp: 25,
        category: 'PHYSICAL',
        priority: 0
      },
      {
        id: 'thunderbolt',
        name: 'Thunderbolt',
        type: 'ELECTRIC',
        power: 90,
        accuracy: 100,
        pp: 15,
        category: 'SPECIAL',
        priority: 0
      },
      {
        id: 'quick-attack',
        name: 'Quick Attack',
        type: 'NORMAL',
        power: 40,
        accuracy: 100,
        pp: 30,
        category: 'PHYSICAL',
        priority: 1
      },
      {
        id: 'flamethrower',
        name: 'Flamethrower',
        type: 'FIRE',
        power: 90,
        accuracy: 100,
        pp: 15,
        category: 'SPECIAL',
        priority: 0
      },
      {
        id: 'hydro-pump',
        name: 'Hydro Pump',
        type: 'WATER',
        power: 110,
        accuracy: 80,
        pp: 5,
        category: 'SPECIAL',
        priority: 0
      },
      {
        id: 'razor-leaf',
        name: 'Razor Leaf',
        type: 'GRASS',
        power: 55,
        accuracy: 95,
        pp: 25,
        category: 'PHYSICAL',
        priority: 0
      },
      {
        id: 'thunder',
        name: 'Thunder',
        type: 'ELECTRIC',
        power: 110,
        accuracy: 70,
        pp: 10,
        category: 'SPECIAL',
        priority: 0
      }
    ];

    // Agregar movimientos al mapa
    for (const move of moves) {
      this.moves.set(move.id, move);
    }
  }

  /**
   * Inicializa los datos de los Pokémon
   */
  private initializePokemon(): void {
    // Datos básicos de los Pokémon iniciales y algunos otros populares
    const pokemonData: PokemonData[] = [
      {
        dexNumber: 1,
        name: 'Bulbasaur',
        types: ['GRASS', 'POISON'],
        baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
        moves: {
          levelUp: [
            { level: 1, move: 'tackle' },
            { level: 3, move: 'vine-whip' },
            { level: 7, move: 'razor-leaf' }
          ],
          tm: ['razor-leaf'],
          egg: [],
          tutor: []
        }
      },
      {
        dexNumber: 4,
        name: 'Charmander',
        types: ['FIRE'],
        baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
        moves: {
          levelUp: [
            { level: 1, move: 'scratch' },
            { level: 4, move: 'ember' },
            { level: 9, move: 'flamethrower' }
          ],
          tm: ['flamethrower'],
          egg: [],
          tutor: []
        }
      },
      {
        dexNumber: 7,
        name: 'Squirtle',
        types: ['WATER'],
        baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
        moves: {
          levelUp: [
            { level: 1, move: 'tackle' },
            { level: 4, move: 'water-gun' },
            { level: 10, move: 'hydro-pump' }
          ],
          tm: ['hydro-pump'],
          egg: [],
          tutor: []
        }
      },
      {
        dexNumber: 25,
        name: 'Pikachu',
        types: ['ELECTRIC'],
        baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
        moves: {
          levelUp: [
            { level: 1, move: 'quick-attack' },
            { level: 5, move: 'thunderbolt' },
            { level: 10, move: 'thunder' }
          ],
          tm: ['thunderbolt', 'thunder'],
          egg: [],
          tutor: []
        }
      }
    ];

    // Agregar Pokémon al mapa
    for (const pokemon of pokemonData) {
      this.pokemon.set(pokemon.dexNumber, pokemon);
    }
  }
}

// Exportar una instancia singleton del Pokédex
export const pokedex = new Pokedex();