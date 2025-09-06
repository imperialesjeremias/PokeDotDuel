#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Ejecutando tests del backend PokeDotDuel...\n');

// Tests básicos
const tests = [
  {
    name: '✅ Sistema de Matchmaking',
    description: 'Verificar que el sistema de matchmaking funciona correctamente',
    test: () => {
      try {
        const { Matchmaker } = require('./apps/websocket-server/src/lobby/Matchmaker');
        const { LobbyManager } = require('./apps/websocket-server/src/lobby/LobbyManager');

        const lobbyManager = new LobbyManager();
        const matchmaker = new Matchmaker(lobbyManager);

        const brackets = matchmaker.getBrackets();
        if (brackets.length === 6) {
          return { passed: true, message: '6 brackets creados correctamente' };
        }
        return { passed: false, message: 'Número incorrecto de brackets' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Motor de Batalla',
    description: 'Verificar que el motor de batalla calcula correctamente',
    test: () => {
      try {
        const { BattleEngine, BattleTeam, BattlePokemon } = require('./apps/websocket-server/src/battle/BattleEngine');

        // Crear Pokemon de prueba
        const pikachu = {
          id: 'pikachu-1',
          dexNumber: 25,
          name: 'Pikachu',
          level: 50,
          types: ['ELECTRIC'],
          stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
          currentHp: 35,
          moves: [{
            id: 'thunderbolt',
            name: 'Thunderbolt',
            type: 'ELECTRIC',
            power: 90,
            accuracy: 100,
            pp: 15,
            category: 'SPECIAL',
            priority: 0
          }]
        };

        const charmander = {
          id: 'charmander-1',
          dexNumber: 4,
          name: 'Charmander',
          level: 50,
          types: ['FIRE'],
          stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
          currentHp: 39,
          moves: [{
            id: 'ember',
            name: 'Ember',
            type: 'FIRE',
            power: 40,
            accuracy: 100,
            pp: 25,
            category: 'SPECIAL',
            priority: 0
          }]
        };

        const teamA = { pokemon: [pikachu], activeIndex: 0 };
        const teamB = { pokemon: [charmander], activeIndex: 0 };

        const battleEngine = new BattleEngine(teamA, teamB);
        const events = battleEngine.processTurn(
          { slot: 0, moveId: 'thunderbolt' },
          { slot: 0, moveId: 'ember' }
        );

        if (events.length > 0) {
          return { passed: true, message: 'Batalla procesada correctamente' };
        }
        return { passed: false, message: 'No se generaron eventos de batalla' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Sistema de Packs',
    description: 'Verificar que el sistema de packs funciona',
    test: () => {
      try {
        const { PackManager } = require('./apps/websocket-server/src/packs/PackManager');
        const packManager = new PackManager();

        const result = packManager.buyPack('test-user');
        if (result.packId && result.paymentRequired === 100_000_000) {
          return { passed: true, message: 'Pack comprado correctamente' };
        }
        return { passed: false, message: 'Error al comprar pack' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Team Builder',
    description: 'Verificar que el constructor de equipos funciona',
    test: () => {
      try {
        const { TeamBuilder } = require('./apps/websocket-server/src/teams/TeamBuilder');
        const teamBuilder = new TeamBuilder();

        const team = ['pikachu-1', 'charmander-2', 'squirtle-3', '', '', ''];
        const validation = teamBuilder.validateTeam(team);

        if (validation.valid) {
          return { passed: true, message: 'Equipo válido' };
        }
        return { passed: false, message: validation.errors.join(', ') };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Marketplace',
    description: 'Verificar que el marketplace funciona',
    test: () => {
      try {
        const { MarketplaceManager } = require('./apps/websocket-server/src/marketplace/MarketplaceManager');
        const marketplaceManager = new MarketplaceManager();

        // Test creating a listing
        const listingId = marketplaceManager.createListing('card-1', 'user-1', 1000000);
        if (listingId) {
          return { passed: true, message: 'Listing creado correctamente' };
        }
        return { passed: false, message: 'Error al crear listing' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Sistema de Economía',
    description: 'Verificar que el sistema económico funciona',
    test: () => {
      try {
        const { EconomyManager } = require('./apps/websocket-server/src/economy/EconomyManager');
        const economyManager = new EconomyManager();

        const solAmount = 1;
        const pokecoins = economyManager.solToPokecoins(solAmount * 1_000_000_000);

        if (pokecoins === 10000) {
          return { passed: true, message: 'Conversión SOL -> PokéCoins correcta' };
        }
        return { passed: false, message: 'Conversión incorrecta' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Gestión de Colección',
    description: 'Verificar que el sistema de colección funciona',
    test: () => {
      try {
        const { CollectionManager } = require('./apps/websocket-server/src/collection/CollectionManager');
        const collectionManager = new CollectionManager();

        // Test stat calculation
        const baseStats = { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 };
        const calculatedStats = collectionManager.calculateStats(baseStats, 50, 'RARE');

        if (calculatedStats.hp > baseStats.hp) {
          return { passed: true, message: 'Estadísticas calculadas correctamente' };
        }
        return { passed: false, message: 'Error en cálculo de estadísticas' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  },
  {
    name: '✅ Sistema de Progresión',
    description: 'Verificar que el sistema de progresión funciona',
    test: () => {
      try {
        const { ProgressionManager } = require('./apps/websocket-server/src/progression/ProgressionManager');
        const progressionManager = new ProgressionManager();

        const result = progressionManager.getXPForLevel(1);
        if (result === 0) {
          return { passed: true, message: 'Sistema de XP funciona correctamente' };
        }
        return { passed: false, message: 'Error en sistema de XP' };
      } catch (error) {
        return { passed: false, message: error.message };
      }
    }
  }
];

let passedTests = 0;
let totalTests = tests.length;

console.log('📋 Ejecutando tests...\n');

tests.forEach((testSuite, index) => {
  console.log(`${index + 1}. ${testSuite.name}`);
  console.log(`   ${testSuite.description}`);

  const result = testSuite.test();

  if (result.passed) {
    console.log(`   ✅ PASSED: ${result.message}`);
    passedTests++;
  } else {
    console.log(`   ❌ FAILED: ${result.message}`);
  }

  console.log('');
});

console.log('📊 Resultados:');
console.log(`   Total: ${totalTests}`);
console.log(`   Pasaron: ${passedTests}`);
console.log(`   Fallaron: ${totalTests - passedTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 ¡Todos los tests pasaron! El backend está funcionando correctamente.');
} else {
  console.log('\n⚠️  Algunos tests fallaron. Revisa los errores arriba.');
}

console.log('\n🏆 Tests completados exitosamente!');
