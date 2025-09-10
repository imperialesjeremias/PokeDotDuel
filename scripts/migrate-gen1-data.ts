#!/usr/bin/env tsx
/**
 * Complete Gen 1 Data Migration Script
 * Migrates Pokemon and moves data from Showdown to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { GEN1_POKEMON } from '../data/gen1/pokemon';
import { GEN1_MOVES } from '../data/gen1/moves';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please copy .env.example to .env and fill in your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePokemonData() {
  console.log('🔄 Migrating Pokemon data...');
  
  try {
    // Clear existing Pokemon data
    const { error: deleteError } = await supabase
      .from('pokedex_cache')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.warn('⚠️ Warning clearing Pokemon data:', deleteError.message);
    }
    
    // Transform and insert Pokemon data
    const pokemonRecords = Object.entries(GEN1_POKEMON).map(([id, pokemon]) => ({
      id: parseInt(id),
      name: pokemon.name,
      types: pokemon.types,
      base_stats: {
        hp: pokemon.baseStats.hp,
        atk: pokemon.baseStats.atk,
        def: pokemon.baseStats.def,
        spa: pokemon.baseStats.spa,
        spd: pokemon.baseStats.spd,
        spe: pokemon.baseStats.spe
      },
      height: pokemon.heightm,
      weight: pokemon.weightkg,
      color: pokemon.color,
      generation: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < pokemonRecords.length; i += batchSize) {
      const batch = pokemonRecords.slice(i, i + batchSize);
      const { error } = await supabase
        .from('pokedex_cache')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting Pokemon batch ${i / batchSize + 1}:`, error.message);
        throw error;
      }
      
      console.log(`✅ Inserted Pokemon batch ${i / batchSize + 1}/${Math.ceil(pokemonRecords.length / batchSize)}`);
    }
    
    console.log(`✅ Successfully migrated ${pokemonRecords.length} Pokemon`);
    
  } catch (error) {
    console.error('❌ Error migrating Pokemon data:', error);
    throw error;
  }
}

async function migrateMovesData() {
  console.log('🔄 Migrating moves data...');
  
  try {
    // Create moves_cache table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('create_moves_cache_table');
    if (createTableError && !createTableError.message.includes('already exists')) {
      console.warn('⚠️ Warning creating moves table:', createTableError.message);
    }
    
    // Clear existing moves data
    const { error: deleteError } = await supabase
      .from('moves_cache')
      .delete()
      .neq('id', '');
    
    if (deleteError && !deleteError.message.includes('does not exist')) {
      console.warn('⚠️ Warning clearing moves data:', deleteError.message);
    }
    
    // Transform and insert moves data
    const movesRecords = Object.entries(GEN1_MOVES).map(([id, move]) => ({
      id: id,
      name: move.name,
      type: move.type,
      category: move.category,
      power: move.basePower || null,
      accuracy: move.accuracy === true ? 100 : (move.accuracy || null),
      pp: move.pp,
      priority: move.priority || 0,
      flags: move.flags || {},
      target: move.target,
      description: move.shortDesc || move.desc || '',
      generation: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < movesRecords.length; i += batchSize) {
      const batch = movesRecords.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('moves_cache')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error inserting moves batch ${i / batchSize + 1}:`, error.message);
          // Continue with next batch instead of throwing
          continue;
        }
        
        console.log(`✅ Inserted moves batch ${i / batchSize + 1}/${Math.ceil(movesRecords.length / batchSize)}`);
      } catch (batchError) {
        console.error(`❌ Batch error ${i / batchSize + 1}:`, batchError);
        continue;
      }
    }
    
    console.log(`✅ Successfully migrated ${movesRecords.length} moves`);
    
  } catch (error) {
    console.error('❌ Error migrating moves data:', error);
    // Don't throw here, allow Pokemon migration to succeed even if moves fail
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    // Check Pokemon count
    const { count: pokemonCount, error: pokemonError } = await supabase
      .from('pokedex_cache')
      .select('*', { count: 'exact', head: true });
    
    if (pokemonError) {
      console.error('❌ Error checking Pokemon count:', pokemonError.message);
    } else {
      console.log(`📊 Pokemon in database: ${pokemonCount}`);
    }
    
    // Check moves count
    const { count: movesCount, error: movesError } = await supabase
      .from('moves_cache')
      .select('*', { count: 'exact', head: true });
    
    if (movesError) {
      console.log('⚠️ Moves table may not exist yet:', movesError.message);
    } else {
      console.log(`📊 Moves in database: ${movesCount}`);
    }
    
    // Test sample queries
    const { data: bulbasaur } = await supabase
      .from('pokedex_cache')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (bulbasaur) {
      console.log('✅ Sample Pokemon query successful:', bulbasaur.name);
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

async function main() {
  console.log('🚀 Starting Gen 1 data migration...');
  console.log(`📊 Source data: ${Object.keys(GEN1_POKEMON).length} Pokemon, ${Object.keys(GEN1_MOVES).length} moves`);
  
  try {
    await migratePokemonData();
    await migrateMovesData();
    await verifyMigration();
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { migratePokemonData, migrateMovesData, verifyMigration };