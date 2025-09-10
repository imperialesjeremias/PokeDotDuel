import { createClient } from '@supabase/supabase-js';
import { GEN1_POKEMON } from '../data/gen1/pokemon';
import { GEN1_MOVES } from '../data/gen1/moves';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PokedexCacheEntry {
  dex_number: number;
  name: string;
  types: string[];
  base_stats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moves: {
    levelUp: Array<{ level: number; move: string }>;
    tm: string[];
    egg: string[];
    tutor: string[];
  };
}

async function populatePokedexCache() {
  console.log('Starting Pokedex cache population...');
  
  try {
    // Clear existing cache
    const { error: deleteError } = await supabase
      .from('pokedex_cache')
      .delete()
      .neq('dex_number', 0); // Delete all entries
    
    if (deleteError) {
      console.warn('Warning clearing cache:', deleteError.message);
    }
    
    // Prepare data for insertion
    const pokedexEntries: PokedexCacheEntry[] = [];
    
    Object.entries(GEN1_POKEMON).forEach(([pokemonId, pokemonData]) => {
      // Only include Gen 1 Pokemon (1-151)
      if (pokemonData.dexNumber >= 1 && pokemonData.dexNumber <= 151) {
        pokedexEntries.push({
          dex_number: pokemonData.dexNumber,
          name: pokemonData.name,
          types: pokemonData.types,
          base_stats: pokemonData.baseStats,
          moves: {
            levelUp: [], // TODO: Extract from learnsets when available
            tm: [],
            egg: [],
            tutor: []
          }
        });
      }
    });
    
    // Sort by dex number for consistent insertion
    pokedexEntries.sort((a, b) => a.dex_number - b.dex_number);
    
    console.log(`Inserting ${pokedexEntries.length} Pokemon into cache...`);
    
    // Insert in batches to avoid timeout
    const batchSize = 50;
    for (let i = 0; i < pokedexEntries.length; i += batchSize) {
      const batch = pokedexEntries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('pokedex_cache')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(pokedexEntries.length / batchSize)}`);
    }
    
    console.log('✅ Pokedex cache populated successfully!');
    
  } catch (error) {
    console.error('❌ Failed to populate Pokedex cache:', error);
    process.exit(1);
  }
}

async function createMovesTable() {
  console.log('Creating moves table...');
  
  try {
    // Create moves table if it doesn't exist
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.moves_cache (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          power INTEGER DEFAULT 0,
          accuracy INTEGER DEFAULT 100,
          pp INTEGER NOT NULL,
          priority INTEGER DEFAULT 0,
          flags TEXT[] DEFAULT '{}',
          target TEXT DEFAULT 'normal',
          effects JSONB DEFAULT '[]',
          cached_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_moves_cache_type ON public.moves_cache(type);
        CREATE INDEX IF NOT EXISTS idx_moves_cache_category ON public.moves_cache(category);
      `
    });
    
    if (createError) {
      console.warn('Warning creating moves table:', createError.message);
    }
    
    console.log('✅ Moves table ready');
    
  } catch (error) {
    console.error('❌ Failed to create moves table:', error);
  }
}

async function populateMovesCache() {
  console.log('Starting moves cache population...');
  
  try {
    // Clear existing moves cache
    const { error: deleteError } = await supabase
      .from('moves_cache')
      .delete()
      .neq('id', '');
    
    if (deleteError) {
      console.warn('Warning clearing moves cache:', deleteError.message);
    }
    
    // Prepare moves data for insertion
    const movesEntries = Object.entries(GEN1_MOVES).map(([moveId, moveData]) => ({
      id: moveData.id,
      name: moveData.name,
      type: moveData.type,
      category: moveData.category,
      power: moveData.power,
      accuracy: moveData.accuracy,
      pp: moveData.pp,
      priority: moveData.priority,
      flags: moveData.flags,
      target: moveData.target,
      effects: moveData.effects || []
    }));
    
    console.log(`Inserting ${movesEntries.length} moves into cache...`);
    
    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < movesEntries.length; i += batchSize) {
      const batch = movesEntries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('moves_cache')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting moves batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      console.log(`Inserted moves batch ${i / batchSize + 1}/${Math.ceil(movesEntries.length / batchSize)}`);
    }
    
    console.log('✅ Moves cache populated successfully!');
    
  } catch (error) {
    console.error('❌ Failed to populate moves cache:', error);
    process.exit(1);
  }
}

async function verifyData() {
  console.log('Verifying inserted data...');
  
  try {
    // Check Pokemon count
    const { count: pokemonCount, error: pokemonError } = await supabase
      .from('pokedex_cache')
      .select('*', { count: 'exact', head: true });
    
    if (pokemonError) {
      console.error('Error counting Pokemon:', pokemonError);
    } else {
      console.log(`✅ Pokemon in database: ${pokemonCount}`);
    }
    
    // Check moves count
    const { count: movesCount, error: movesError } = await supabase
      .from('moves_cache')
      .select('*', { count: 'exact', head: true });
    
    if (movesError) {
      console.error('Error counting moves:', movesError);
    } else {
      console.log(`✅ Moves in database: ${movesCount}`);
    }
    
    // Sample a few entries
    const { data: samplePokemon, error: sampleError } = await supabase
      .from('pokedex_cache')
      .select('*')
      .eq('dex_number', 1)
      .single();
    
    if (sampleError) {
      console.error('Error fetching sample Pokemon:', sampleError);
    } else {
      console.log('Sample Pokemon (Bulbasaur):', samplePokemon);
    }
    
  } catch (error) {
    console.error('Error verifying data:', error);
  }
}

async function main() {
  console.log('🚀 Starting Supabase population with Showdown data...');
  
  try {
    await populatePokedexCache();
    await createMovesTable();
    await populateMovesCache();
    await verifyData();
    
    console.log('🎉 Database population completed successfully!');
  } catch (error) {
    console.error('💥 Database population failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as populateSupabase };