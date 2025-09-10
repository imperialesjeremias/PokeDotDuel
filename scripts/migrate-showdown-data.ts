import fs from 'fs';
import path from 'path';

// Import Showdown data
const showdownDataPath = path.join(__dirname, '../pokemon-showdown-master/data');
const gen1ModPath = path.join(__dirname, '../pokemon-showdown-master/data/mods/gen1');

// Import base data
const basePokedex = require(path.join(showdownDataPath, 'pokedex.ts'));
const baseMoves = require(path.join(showdownDataPath, 'moves.ts'));

// Import Gen 1 specific data
const gen1Pokedex = require(path.join(gen1ModPath, 'pokedex.ts'));
const gen1Moves = require(path.join(gen1ModPath, 'moves.ts'));

// Type mapping from Showdown to our format
const typeMapping: Record<string, string> = {
  'Normal': 'NORMAL',
  'Fire': 'FIRE',
  'Water': 'WATER',
  'Electric': 'ELECTRIC',
  'Grass': 'GRASS',
  'Ice': 'ICE',
  'Fighting': 'FIGHTING',
  'Poison': 'POISON',
  'Ground': 'GROUND',
  'Flying': 'FLYING',
  'Psychic': 'PSYCHIC',
  'Bug': 'BUG',
  'Rock': 'ROCK',
  'Ghost': 'GHOST',
  'Dragon': 'DRAGON'
};

// Category mapping
const categoryMapping: Record<string, string> = {
  'Physical': 'PHYSICAL',
  'Special': 'SPECIAL',
  'Status': 'STATUS'
};

interface ShowdownPokemon {
  num: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities?: Record<string, string>;
  heightm?: number;
  weightkg?: number;
  color?: string;
  prevo?: string;
  evos?: string[];
  eggGroups?: string[];
}

interface ShowdownMove {
  num: number;
  name: string;
  type: string;
  category: string;
  basePower: number;
  accuracy: number | true;
  pp: number;
  priority: number;
  flags: Record<string, number>;
  target: string;
  secondary?: any;
  boosts?: Record<string, number>;
}

interface OurPokemon {
  dexNumber: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  height?: number;
  weight?: number;
  color?: string;
  evolutions?: {
    from?: string;
    to?: string[];
  };
}

interface OurMove {
  id: string;
  name: string;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  flags: string[];
  target: string;
  effects?: any[];
}

function convertPokemon(showdownData: Record<string, ShowdownPokemon>): Record<string, OurPokemon> {
  const converted: Record<string, OurPokemon> = {};
  
  // Filter Gen 1 Pokemon (dex numbers 1-151)
  Object.entries(showdownData).forEach(([key, pokemon]) => {
    if (pokemon.num >= 1 && pokemon.num <= 151) {
      // Apply Gen 1 specific overrides if they exist
      const gen1Override = gen1Pokedex.Pokedex?.[key];
      const finalData = gen1Override?.inherit ? { ...pokemon, ...gen1Override } : pokemon;
      
      converted[key] = {
        dexNumber: finalData.num,
        name: finalData.name,
        types: finalData.types.map((type: string) => typeMapping[type] || type.toUpperCase()),
        baseStats: finalData.baseStats,
        height: finalData.heightm,
        weight: finalData.weightkg,
        color: finalData.color,
        evolutions: {
          from: finalData.prevo,
          to: finalData.evos
        }
      };
    }
  });
  
  return converted;
}

function convertMoves(showdownData: Record<string, ShowdownMove>): Record<string, OurMove> {
  const converted: Record<string, OurMove> = {};
  
  Object.entries(showdownData).forEach(([key, move]) => {
    // Apply Gen 1 specific overrides if they exist
    const gen1Override = gen1Moves.Moves?.[key];
    const finalData = gen1Override?.inherit ? { ...move, ...gen1Override } : move;
    
    // Only include moves that existed in Gen 1
    if (finalData.num <= 165) { // Gen 1 had moves up to #165
      converted[key] = {
        id: key,
        name: finalData.name,
        type: typeMapping[finalData.type] || finalData.type.toUpperCase(),
        category: categoryMapping[finalData.category] || 'STATUS',
        power: finalData.basePower || 0,
        accuracy: typeof finalData.accuracy === 'number' ? finalData.accuracy : 100,
        pp: finalData.pp,
        priority: finalData.priority || 0,
        flags: Object.keys(finalData.flags || {}),
        target: finalData.target,
        effects: finalData.secondary ? [finalData.secondary] : []
      };
    }
  });
  
  return converted;
}

function generateMigrationFiles() {
  try {
    console.log('Starting Showdown data migration...');
    
    // Convert Pokemon data
    const convertedPokemon = convertPokemon(basePokedex.Pokedex);
    console.log(`Converted ${Object.keys(convertedPokemon).length} Pokemon`);
    
    // Convert Move data
    const convertedMoves = convertMoves(baseMoves.Moves);
    console.log(`Converted ${Object.keys(convertedMoves).length} moves`);
    
    // Create output directory
    const outputDir = path.join(__dirname, '../data/gen1');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write Pokemon data
    fs.writeFileSync(
      path.join(outputDir, 'pokemon.json'),
      JSON.stringify(convertedPokemon, null, 2)
    );
    
    // Write Move data
    fs.writeFileSync(
      path.join(outputDir, 'moves.json'),
      JSON.stringify(convertedMoves, null, 2)
    );
    
    // Generate TypeScript definitions
    const pokemonTs = `// Generated from Showdown data
export const GEN1_POKEMON = ${JSON.stringify(convertedPokemon, null, 2)} as const;

export type Gen1PokemonId = keyof typeof GEN1_POKEMON;`;
    
    const movesTs = `// Generated from Showdown data
export const GEN1_MOVES = ${JSON.stringify(convertedMoves, null, 2)} as const;

export type Gen1MoveId = keyof typeof GEN1_MOVES;`;
    
    fs.writeFileSync(path.join(outputDir, 'pokemon.ts'), pokemonTs);
    fs.writeFileSync(path.join(outputDir, 'moves.ts'), movesTs);
    
    console.log('Migration completed successfully!');
    console.log(`Files generated in: ${outputDir}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  generateMigrationFiles();
}

export { generateMigrationFiles, convertPokemon, convertMoves };