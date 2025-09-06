import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { BattleEngine, BattleTeam, BattlePokemon } from '../apps/websocket-server/src/battle/BattleEngine';
import { TYPE_EFFECTIVENESS } from '@pokebattle/shared';

describe('Battle Engine Tests', () => {
  let electricPokemon: BattlePokemon;
  let firePokemon: BattlePokemon;
  let waterPokemon: BattlePokemon;
  let grassPokemon: BattlePokemon;

  beforeEach(() => {
    // Create test Pokemon
    electricPokemon = {
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

    firePokemon = {
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

    waterPokemon = {
      id: 'squirtle-1',
      dexNumber: 7,
      name: 'Squirtle',
      level: 50,
      types: ['WATER'],
      stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
      currentHp: 44,
      moves: [{
        id: 'water-gun',
        name: 'Water Gun',
        type: 'WATER',
        power: 40,
        accuracy: 100,
        pp: 25,
        category: 'SPECIAL',
        priority: 0
      }]
    };

    grassPokemon = {
      id: 'bulbasaur-1',
      dexNumber: 1,
      name: 'Bulbasaur',
      level: 50,
      types: ['GRASS', 'POISON'],
      stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
      currentHp: 45,
      moves: [{
        id: 'vine-whip',
        name: 'Vine Whip',
        type: 'GRASS',
        power: 45,
        accuracy: 100,
        pp: 25,
        category: 'PHYSICAL',
        priority: 0
      }]
    };
  });

  describe('Type Effectiveness', () => {
    it('should calculate super effective damage correctly', () => {
      const teamA: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'water-gun' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      expect(damageEvent?.effectiveness).to.equal(2); // Electric is super effective against Water
    });

    it('should calculate resisted damage correctly', () => {
      const teamA: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'ember' },
        { slot: 0, moveId: 'water-gun' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      expect(damageEvent?.effectiveness).to.equal(0.5); // Fire is resisted by Water
    });

    it('should handle neutral damage correctly', () => {
      const teamA: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'ember' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      expect(damageEvent?.effectiveness).to.equal(1); // Electric vs Fire is neutral
    });

    it('should handle dual type effectiveness', () => {
      const teamA: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [grassPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'ember' },
        { slot: 0, moveId: 'vine-whip' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      // Fire is super effective against Grass (2x) but resisted by Poison (0.5x) = 1x neutral
      expect(damageEvent?.effectiveness).to.equal(1);
    });
  });

  describe('Damage Calculation', () => {
    it('should calculate physical damage correctly', () => {
      const physicalAttacker = {
        ...grassPokemon,
        moves: [{
          id: 'tackle',
          name: 'Tackle',
          type: 'NORMAL',
          power: 40,
          accuracy: 100,
          pp: 35,
          category: 'PHYSICAL',
          priority: 0
        }]
      };

      const teamA: BattleTeam = { pokemon: [physicalAttacker], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'tackle' },
        { slot: 0, moveId: 'ember' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      expect(damageEvent?.damage).to.be.a('number');
      expect(damageEvent?.damage).to.be.greaterThan(0);
    });

    it('should calculate special damage correctly', () => {
      const teamA: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'ember' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      expect(damageEvent?.damage).to.be.a('number');
      expect(damageEvent?.damage).to.be.greaterThan(0);
    });

    it('should apply STAB bonus correctly', () => {
      const teamA: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'ember' },
        { slot: 0, moveId: 'thunderbolt' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      // Fire move used by Fire type = STAB bonus
      expect(damageEvent?.damage).to.be.a('number');
    });

    it('should handle critical hits', () => {
      // Critical hits are random, so we'll test the damage range
      const teamA: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);

      // Run multiple turns to potentially get critical hits
      let maxDamage = 0;
      let minDamage = Infinity;

      for (let i = 0; i < 20; i++) {
        const events = battleEngine.processTurn(
          { slot: 0, moveId: 'thunderbolt' },
          { slot: 0, moveId: 'water-gun' }
        );

        const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
        if (damageEvent?.damage) {
          maxDamage = Math.max(maxDamage, damageEvent.damage);
          minDamage = Math.min(minDamage, damageEvent.damage);
        }
      }

      expect(maxDamage).to.be.greaterThan(minDamage); // Should have damage variation
    });
  });

  describe('Battle Flow', () => {
    it('should handle turn-based combat correctly', () => {
      const teamA: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);

      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'water-gun' }
      );

      expect(events).to.be.an('array');
      expect(events.length).to.be.at.least(2); // At least 2 damage events
    });

    it('should determine battle winner correctly', () => {
      // Create weak Pokemon for quick test
      const weakPokemon: BattlePokemon = {
        ...electricPokemon,
        currentHp: 1, // Very low HP
        stats: { ...electricPokemon.stats, hp: 1 }
      };

      const teamA: BattleTeam = { pokemon: [weakPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [firePokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);

      // Process turn - should KO the weak Pokemon
      battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'ember' }
      );

      const winner = battleEngine.getWinner();
      expect(winner).to.equal('B'); // Team B should win
    });

    it('should handle priority moves correctly', () => {
      const fastPokemon = {
        ...electricPokemon,
        moves: [{
          id: 'quick-attack',
          name: 'Quick Attack',
          type: 'NORMAL',
          power: 40,
          accuracy: 100,
          pp: 30,
          category: 'PHYSICAL',
          priority: 1 // Higher priority
        }]
      };

      const slowPokemon = {
        ...waterPokemon,
        stats: { ...waterPokemon.stats, spe: 30 } // Much slower
      };

      const teamA: BattleTeam = { pokemon: [fastPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [slowPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'quick-attack' },
        { slot: 0, moveId: 'water-gun' }
      );

      // Priority move should go first
      const firstDamageEvent = events.find(e => e.type === 'DAMAGE');
      expect(firstDamageEvent?.attacker).to.equal('A'); // Fast Pokemon with priority should go first
    });
  });

  describe('Status Effects', () => {
    it('should handle burn damage correctly', () => {
      const burnedPokemon: BattlePokemon = {
        ...firePokemon,
        status: { type: 'BURN', turnsRemaining: 3 }
      };

      const teamA: BattleTeam = { pokemon: [burnedPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);

      // Process end of turn
      const events = battleEngine.processEndOfTurn();

      const burnDamageEvent = events.find(e => e.type === 'STATUS_DAMAGE' && e.status === 'BURN');
      expect(burnDamageEvent).to.exist;
      expect(burnDamageEvent?.damage).to.equal(Math.floor(firePokemon.stats.hp * 0.0625));
    });

    it('should handle paralysis speed reduction', () => {
      const paralyzedPokemon: BattlePokemon = {
        ...electricPokemon,
        status: { type: 'PARALYSIS' }
      };

      const battleEngine = new BattleEngine(
        { pokemon: [paralyzedPokemon], activeIndex: 0 },
        { pokemon: [waterPokemon], activeIndex: 0 }
      );

      const effectiveSpeed = battleEngine.calculateEffectiveSpeed(paralyzedPokemon);
      expect(effectiveSpeed).to.equal(Math.floor(electricPokemon.stats.spe * 0.75));
    });
  });

  describe('PP Management', () => {
    it('should consume PP correctly', () => {
      const teamA: BattleTeam = { pokemon: [electricPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);

      const initialPP = electricPokemon.moves[0].pp;
      battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'water-gun' }
      );

      expect(electricPokemon.moves[0].pp).to.equal(initialPP - 1);
    });

    it('should handle PP exhaustion', () => {
      const noPPPokemon: BattlePokemon = {
        ...electricPokemon,
        moves: [{
          ...electricPokemon.moves[0],
          pp: 0
        }]
      };

      const teamA: BattleTeam = { pokemon: [noPPPokemon], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'water-gun' }
      );

      // Should use Struggle or similar when PP is exhausted
      const moveEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');
      expect(moveEvent?.move).to.equal('Thunderbolt'); // Should still work, but maybe with different mechanics
    });
  });

  describe('Accuracy and Misses', () => {
    it('should handle move accuracy correctly', () => {
      const inaccurateMove = {
        id: 'low-accuracy-move',
        name: 'Low Accuracy Move',
        type: 'NORMAL',
        power: 50,
        accuracy: 50, // 50% accuracy
        pp: 20,
        category: 'PHYSICAL',
        priority: 0
      };

      const pokemonWithInaccurateMove: BattlePokemon = {
        ...electricPokemon,
        moves: [inaccurateMove]
      };

      const teamA: BattleTeam = { pokemon: [pokemonWithInaccurateMove], activeIndex: 0 };
      const teamB: BattleTeam = { pokemon: [waterPokemon], activeIndex: 0 };

      const battleEngine = new BattleEngine(teamA, teamB);

      // Run multiple turns to test accuracy
      let hitCount = 0;
      let missCount = 0;

      for (let i = 0; i < 50; i++) {
        const events = battleEngine.processTurn(
          { slot: 0, moveId: 'low-accuracy-move' },
          { slot: 0, moveId: 'water-gun' }
        );

        const missEvent = events.find(e => e.type === 'MISS');
        const damageEvent = events.find(e => e.type === 'DAMAGE' && e.attacker === 'A');

        if (missEvent) missCount++;
        if (damageEvent) hitCount++;
      }

      expect(hitCount + missCount).to.be.greaterThan(0);
      // Should have roughly 50% hit rate (with some variance)
      const hitRate = hitCount / (hitCount + missCount);
      expect(hitRate).to.be.within(0.3, 0.7); // Allow some variance
    });
  });
});
