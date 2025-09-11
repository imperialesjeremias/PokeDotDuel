import { TypeGen1, Stats } from '@pokebattle/shared';
import { GEN1_POKEMON } from '../data/gen1-pokemon';

// Pokemon entry interface that matches the data structure
interface PokemonEntry {
  dexNumber: number;
  name: string;
  types: readonly TypeGen1[];
  baseStats: Stats;
  height: number;
  weight: number;
  color: string;
  evolutions?: {
    from?: string;
    to?: readonly string[];
  };
}

// Valid Gen1 types
const VALID_GEN1_TYPES: TypeGen1[] = [
  'NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE',
  'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC',
  'BUG', 'ROCK', 'GHOST', 'DRAGON'
];

// Transform the imported data to match our interface
const POKEMON_DATA: Record<string, PokemonEntry> = Object.fromEntries(
  Object.entries(GEN1_POKEMON)
    .filter(([key, pokemon]) => {
      // Filter out mega evolutions and other variants for marketplace
      // Keep only base forms and regular evolutions
      const keyLower = key.toLowerCase();
      const isValidVariant = !keyLower.includes('mega') && !keyLower.includes('gmax') && !keyLower.includes('alola') && !keyLower.includes('galar');
      
      // Filter out Pokemon with non-Gen1 types
      const hasValidTypes = pokemon.types.every(type => VALID_GEN1_TYPES.includes(type as TypeGen1));
      
      return isValidVariant && hasValidTypes;
    })
    .map(([key, pokemon]) => [
      key,
      {
        dexNumber: pokemon.dexNumber,
        name: pokemon.name,
        types: pokemon.types as readonly TypeGen1[],
        baseStats: pokemon.baseStats,
        height: pokemon.height,
        weight: pokemon.weight,
        color: pokemon.color,
        evolutions: pokemon.evolutions
      }
    ])
);

/**
 * Pokemon data utility class for retrieving Pokemon information
 */
export class PokemonDataUtil {
  /**
   * Get Pokemon by dex number
   */
  static getPokemonByDexNumber(dexNumber: number): PokemonEntry | null {
    const pokemon = Object.values(POKEMON_DATA).find(p => p.dexNumber === dexNumber);
    return pokemon || null;
  }

  /**
   * Get Pokemon by name (case insensitive)
   */
  static getPokemonByName(name: string): PokemonEntry | null {
    const normalizedName = name.toLowerCase();
    const pokemon = POKEMON_DATA[normalizedName];
    return pokemon || null;
  }

  /**
   * Get all Pokemon data
   */
  static getAllPokemon(): PokemonEntry[] {
    return Object.values(POKEMON_DATA);
  }

  /**
   * Get Pokemon by type
   */
  static getPokemonByType(type: TypeGen1): PokemonEntry[] {
    return Object.values(POKEMON_DATA).filter(pokemon => 
      pokemon.types.includes(type)
    );
  }

  /**
   * Get Pokemon design information (sprite URL)
   */
  static getPokemonDesign(pokemon: PokemonEntry): string {
    return `https://play.pokemonshowdown.com/sprites/gen1/${pokemon.name.toLowerCase()}.png`;
  }

  /**
   * Get Pokemon card class based on rarity (you can customize this logic)
   */
  static getPokemonCardClass(pokemon: PokemonEntry): string {
    // Base the class on the Pokemon's base stat total
    const statTotal = Object.values(pokemon.baseStats).reduce((sum, stat) => sum + stat, 0);
    
    if ((statTotal as number) >= 500) return 'legendary';
    if ((statTotal as number) >= 400) return 'rare';
    return 'common';
  }

  /**
   * Get Pokemon types as array
   */
  static getPokemonTypes(pokemon: PokemonEntry): readonly TypeGen1[] {
    return pokemon.types;
  }

  /**
   * Search Pokemon by partial name match
   */
  static searchPokemon(query: string): PokemonEntry[] {
    const normalizedQuery = query.toLowerCase();
    return Object.values(POKEMON_DATA).filter(pokemon => 
      pokemon.name.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Get Pokemon evolution chain
   */
  static getEvolutionChain(pokemon: PokemonEntry): PokemonEntry[] {
    const chain: PokemonEntry[] = [pokemon];
    
    // Find pre-evolutions
    let current = pokemon;
    while (current.evolutions?.from) {
      const preEvo = this.getPokemonByName(current.evolutions.from);
      if (preEvo) {
        chain.unshift(preEvo);
        current = preEvo;
      } else {
        break;
      }
    }
    
    // Find evolutions
    current = pokemon;
    while (current.evolutions?.to && current.evolutions.to.length > 0) {
      const evoName = current.evolutions.to[0]; // Take first evolution
      const evo = this.getPokemonByName(evoName);
      if (evo) {
        chain.push(evo);
        current = evo;
      } else {
        break;
      }
    }
    
    return chain;
  }

  /**
   * Get sprite URL for a Pokemon by dex number
   */
  static getSpriteUrl(dexNumber: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
  }
}

// Export types for external use
export type { PokemonEntry };
export { POKEMON_DATA };