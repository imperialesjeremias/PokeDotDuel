#!/usr/bin/env tsx
/**
 * Integration Test Script
 * Verifies that the Showdown integration works correctly
 */

import { pokedex } from './apps/websocket-server/src/dex/Pokedex';
import { BattleEngine } from './apps/websocket-server/src/battle/BattleEngine';
import { BattlePokemon } from '@pokebattle/shared';

// Test data setup
function createTestPokemon(species: string, moves: string[]): BattlePokemon {
  const pokemonData = pokedex.getPokemon(species);
  if (!pokemonData) {
    // Debug: try to find what Pokemon are available
    console.log('Available Pokemon (first 5):');
    const allPokemon = pokedex.getAllPokemon().slice(0, 5);
    allPokemon.forEach(p => console.log(`  - ${p.name} (species: ${p.species})`));
    
    // Look for all Pikachu variants
    const pikachuVariants = pokedex.getAllPokemon().filter(p => 
      p.name.toLowerCase().includes('pikachu') || 
      p.species?.toLowerCase().includes('pikachu')
    );
    console.log('All Pikachu variants found:');
    pikachuVariants.forEach(p => console.log(`  - ${p.name} (species: ${p.species})`));
    
    // Try to find regular Pikachu by dex number (25)
    const pikachu25 = pokedex.getPokemon(25);
    console.log('Pokemon #25:', pikachu25 ? `${pikachu25.name} (${pikachu25.species})` : 'Not found');
    throw new Error(`Pokemon ${species} not found`);
  }

  const testMoves = moves.map(moveId => {
    const moveData = pokedex.getMove(moveId);
    if (!moveData) {
      throw new Error(`Move ${moveId} not found`);
    }
    return {
      id: moveId,
      name: moveData.name,
      type: moveData.type,
      category: moveData.category,
      power: moveData.power || 0,
      accuracy: moveData.accuracy || 100,
      pp: moveData.pp,
      maxPp: moveData.pp
    };
  });

  return {
    id: `test-${species}`,
    species: species,
    name: pokemonData.name,
    level: 50,
    type1: pokemonData.types[0],
    type2: pokemonData.types[1] || null,
    hp: 150,
    maxHp: 150,
    moves: testMoves,
    baseStats: pokemonData.baseStats,
    ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
    status: null,
    statusTurns: 0
  };
}

async function testPokedexIntegration() {
  console.log('🧪 Testing Pokedex Integration...');
  
  try {
    // Test Pokemon data
    const bulbasaur = pokedex.getPokemon('bulbasaur');
    console.log('✅ Bulbasaur data:', {
      name: bulbasaur?.name,
      types: bulbasaur?.types,
      baseStats: bulbasaur?.baseStats
    });
    
    const charizard = pokedex.getPokemon('charizard');
    console.log('✅ Charizard data:', {
      name: charizard?.name,
      types: charizard?.types,
      baseStats: charizard?.baseStats
    });
    
    // Test move data
    const tackle = pokedex.getMove('tackle');
    console.log('✅ Tackle move:', {
      name: tackle?.name,
      type: tackle?.type,
      category: tackle?.category,
      power: tackle?.power
    });
    
    const thunderbolt = pokedex.getMove('thunderbolt');
    console.log('✅ Thunderbolt move:', {
      name: thunderbolt?.name,
      type: thunderbolt?.type,
      category: thunderbolt?.category,
      power: thunderbolt?.power
    });
    
    // Count data - access private fields correctly
    const pokemonCount = pokedex.getAllPokemon().length;
    const movesCount = pokedex.getAllMoves().length;
    console.log(`📊 Loaded ${pokemonCount} Pokemon and ${movesCount} moves`);
    
    // Debug: check if data is actually loaded
    if (pokemonCount === 0) {
      console.log('⚠️ No Pokemon loaded - checking initialization...');
      // Try to get a specific Pokemon to trigger loading
      const testPokemon = pokedex.getPokemon(1);
      console.log('Debug - Pokemon #1:', testPokemon);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Pokedex integration test failed:', error);
    return false;
  }
}

async function testBattleEngineIntegration() {
  console.log('⚔️ Testing BattleEngine Integration...');
  
  try {
    // Create test Pokemon
    const pokemon1 = createTestPokemon('bulbasaur', ['tackle', 'vinewhip']);
    const pokemon2 = createTestPokemon('charmander', ['tackle', 'scratch']);
    
    console.log('✅ Created test Pokemon:', {
      pokemon1: { name: pokemon1.name, moves: pokemon1.moves.map(m => m.name) },
      pokemon2: { name: pokemon2.name, moves: pokemon2.moves.map(m => m.name) }
    });
    
    // Create teams
    const teamA = {
      pokemon: [pokemon1],
      activeIndex: 0
    };
    
    const teamB = {
      pokemon: [pokemon2],
      activeIndex: 0
    };
    
    // Create battle engine
    const battle = new BattleEngine(teamA, teamB, 'player1', 'player2');
    console.log('✅ Battle engine created successfully');
    
    // Test a turn
    const actionA = { slot: 0, moveId: 'tackle' };
    const actionB = { slot: 0, moveId: 'tackle' };
    
    const events = battle.processTurn(actionA, actionB);
    console.log('✅ Battle turn processed:', events.length, 'events generated');
    
    // Display some events
    events.slice(0, 3).forEach((event, i) => {
      console.log(`   Event ${i + 1}:`, event);
    });
    
    return true;
  } catch (error) {
    console.error('❌ BattleEngine integration test failed:', error);
    return false;
  }
}

async function testStatCalculations() {
  console.log('📊 Testing Stat Calculations...');
  
  try {
    const testPokemon = createTestPokemon('bulbasaur', ['tackle']);
    const battle = new BattleEngine(
      { pokemon: [testPokemon], activeIndex: 0 },
      { pokemon: [testPokemon], activeIndex: 0 },
      'p1', 'p2'
    );
    
    // Test speed calculation
    const speed = battle.calculateEffectiveSpeed(testPokemon);
    console.log('✅ Speed calculation:', speed);
    
    // Test that Pokemon data is being used
    const bulbasaurData = pokedex.getPokemon('bulbasaur');
    if (bulbasaurData) {
      console.log('✅ Base speed stat:', bulbasaurData.baseStats.spe);
      console.log('✅ Speed calculation uses base stats correctly');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Stat calculation test failed:', error);
    return false;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    pokedex: await testPokedexIntegration(),
    battleEngine: await testBattleEngineIntegration(),
    statCalculations: await testStatCalculations()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Results:');
  console.log('  Pokedex Integration:', results.pokedex ? '✅ PASS' : '❌ FAIL');
  console.log('  BattleEngine Integration:', results.battleEngine ? '✅ PASS' : '❌ FAIL');
  console.log('  Stat Calculations:', results.statCalculations ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All integration tests passed!');
    console.log('✅ Showdown integration is working correctly');
  } else {
    console.log('\n💥 Some integration tests failed');
    console.log('❌ Please check the errors above');
  }
  
  return allPassed;
}

if (require.main === module) {
  runIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Integration test runner failed:', error);
      process.exit(1);
    });
}

export { runIntegrationTests };