import { TypeGen1, Stats } from '@pokebattle/shared';

// Import the Pokemon data from the websocket server
// Note: In a real implementation, you might want to copy this data to the web app
// or create a shared package for it
interface PokemonEntry {
  dexNumber: number;
  name: string;
  types: TypeGen1[];
  baseStats: Stats;
  height: number;
  weight: number;
  color: string;
  evolutions?: {
    from?: string;
    to?: string[];
  };
}

// This would be imported from the actual data file
// For now, we'll create a sample structure
const POKEMON_DATA: Record<string, PokemonEntry> = {
  "bulbasaur": {
    dexNumber: 1,
    name: "Bulbasaur",
    types: ["GRASS", "POISON"],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    height: 0.7,
    weight: 6.9,
    color: "Green",
    evolutions: { to: ["Ivysaur"] }
  },
  "ivysaur": {
    dexNumber: 2,
    name: "Ivysaur",
    types: ["GRASS", "POISON"],
    baseStats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
    height: 1.0,
    weight: 13.0,
    color: "Green",
    evolutions: { from: "Bulbasaur", to: ["Venusaur"] }
  },
  "venusaur": {
    dexNumber: 3,
    name: "Venusaur",
    types: ["GRASS", "POISON"],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    height: 2.0,
    weight: 100.0,
    color: "Green",
    evolutions: { from: "Ivysaur" }
  },
  "charmander": {
    dexNumber: 4,
    name: "Charmander",
    types: ["FIRE"],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    height: 0.6,
    weight: 8.5,
    color: "Red",
    evolutions: { to: ["Charmeleon"] }
  },
  "charmeleon": {
    dexNumber: 5,
    name: "Charmeleon",
    types: ["FIRE"],
    baseStats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
    height: 1.1,
    weight: 19.0,
    color: "Red",
    evolutions: { from: "Charmander", to: ["Charizard"] }
  },
  "charizard": {
    dexNumber: 6,
    name: "Charizard",
    types: ["FIRE", "FLYING"],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    height: 1.7,
    weight: 90.5,
    color: "Red",
    evolutions: { from: "Charmeleon" }
  },
  "squirtle": {
    dexNumber: 7,
    name: "Squirtle",
    types: ["WATER"],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    height: 0.5,
    weight: 9.0,
    color: "Blue",
    evolutions: { to: ["Wartortle"] }
  },
  "wartortle": {
    dexNumber: 8,
    name: "Wartortle",
    types: ["WATER"],
    baseStats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
    height: 1.0,
    weight: 22.5,
    color: "Blue",
    evolutions: { from: "Squirtle", to: ["Blastoise"] }
  },
  "blastoise": {
    dexNumber: 9,
    name: "Blastoise",
    types: ["WATER"],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    height: 1.6,
    weight: 85.5,
    color: "Blue",
    evolutions: { from: "Wartortle" }
  },
  "pikachu": {
    dexNumber: 25,
    name: "Pikachu",
    types: ["ELECTRIC"],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    height: 0.4,
    weight: 6.0,
    color: "Yellow",
    evolutions: { from: "Pichu", to: ["Raichu"] }
  }
};

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
    
    if (statTotal >= 500) return 'legendary';
    if (statTotal >= 400) return 'rare';
    return 'common';
  }

  /**
   * Get Pokemon types as array
   */
  static getPokemonTypes(pokemon: PokemonEntry): TypeGen1[] {
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
}

// Export types for external use
export type { PokemonEntry };
export { POKEMON_DATA };