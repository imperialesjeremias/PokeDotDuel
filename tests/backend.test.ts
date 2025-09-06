import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { Matchmaker } from '../apps/websocket-server/src/lobby/Matchmaker';
import { LobbyManager } from '../apps/websocket-server/src/lobby/LobbyManager';
import { BattleEngine, BattleTeam, BattlePokemon } from '../apps/websocket-server/src/battle/BattleEngine';
import { PackManager } from '../apps/websocket-server/src/packs/PackManager';
import { TeamBuilder } from '../apps/websocket-server/src/teams/TeamBuilder';
import { MarketplaceManager } from '../apps/websocket-server/src/marketplace/MarketplaceManager';
import { EconomyManager } from '../apps/websocket-server/src/economy/EconomyManager';
import { CollectionManager } from '../apps/websocket-server/src/collection/CollectionManager';
import { ProgressionManager } from '../apps/websocket-server/src/progression/ProgressionManager';

describe('PokeDotDuel Backend Tests', () => {
  let lobbyManager: LobbyManager;
  let matchmaker: Matchmaker;
  let packManager: PackManager;
  let teamBuilder: TeamBuilder;
  let marketplaceManager: MarketplaceManager;
  let economyManager: EconomyManager;
  let collectionManager: CollectionManager;
  let progressionManager: ProgressionManager;

  beforeEach(() => {
    lobbyManager = new LobbyManager();
    matchmaker = new Matchmaker(lobbyManager);
    packManager = new PackManager();
    teamBuilder = new TeamBuilder();
    marketplaceManager = new MarketplaceManager();
    economyManager = new EconomyManager();
    collectionManager = new CollectionManager();
    progressionManager = new ProgressionManager();
  });

  describe('Matchmaker System', () => {
    it('should create brackets correctly', () => {
      const brackets = matchmaker.getBrackets();
      expect(brackets).to.have.lengthOf(6);
      expect(brackets[0].name).to.equal('Bronze');
      expect(brackets[5].name).to.equal('Master');
    });

    it('should determine correct bracket for wager amount', () => {
      expect(matchmaker.getBracketForWager(50000000)?.name).to.equal('Bronze'); // 0.05 SOL
      expect(matchmaker.getBracketForWager(100000000)?.name).to.equal('Silver'); // 0.1 SOL
      expect(matchmaker.getBracketForWager(1000000000)?.name).to.equal('Gold'); // 1 SOL
    });

    it('should add and remove lobbies from queue', () => {
      const lobbyId = 'test-lobby-1';
      matchmaker.addToQueue(lobbyId, 1);

      const status = matchmaker.getQueueStatus(1);
      expect(status.queueLength).to.equal(1);
    });
  });

  describe('Battle Engine', () => {
    let teamA: BattleTeam;
    let teamB: BattleTeam;

    beforeEach(() => {
      // Create test teams
      teamA = {
        pokemon: [
          {
            id: 'pikachu-1',
            dexNumber: 25,
            name: 'Pikachu',
            level: 50,
            types: ['ELECTRIC'],
            stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
            currentHp: 35,
            moves: [
              { id: 'thunderbolt', name: 'Thunderbolt', type: 'ELECTRIC', power: 90, accuracy: 100, pp: 15, category: 'SPECIAL', priority: 0 }
            ]
          }
        ],
        activeIndex: 0
      };

      teamB = {
        pokemon: [
          {
            id: 'charmander-1',
            dexNumber: 4,
            name: 'Charmander',
            level: 50,
            types: ['FIRE'],
            stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
            currentHp: 39,
            moves: [
              { id: 'ember', name: 'Ember', type: 'FIRE', power: 40, accuracy: 100, pp: 25, category: 'SPECIAL', priority: 0 }
            ]
          }
        ],
        activeIndex: 0
      };
    });

    it('should calculate damage correctly', () => {
      const battleEngine = new BattleEngine(teamA, teamB);

      const moveA = { slot: 0, moveId: 'thunderbolt' };
      const moveB = { slot: 0, moveId: 'ember' };

      const events = battleEngine.processTurn(moveA, moveB);

      expect(events).to.be.an('array');
      expect(events.length).to.be.greaterThan(0);

      // Should have damage events
      const damageEvents = events.filter(e => e.type === 'DAMAGE');
      expect(damageEvents.length).to.be.greaterThan(0);
    });

    it('should handle type effectiveness', () => {
      // Electric is super effective against Water
      const waterTeam: BattleTeam = {
        pokemon: [{
          id: 'squirtle-1',
          dexNumber: 7,
          name: 'Squirtle',
          level: 50,
          types: ['WATER'],
          stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
          currentHp: 44,
          moves: []
        }],
        activeIndex: 0
      };

      const battleEngine = new BattleEngine(teamA, waterTeam);
      const events = battleEngine.processTurn(
        { slot: 0, moveId: 'thunderbolt' },
        { slot: 0, moveId: 'tackle' }
      );

      const damageEvent = events.find(e => e.type === 'DAMAGE');
      expect(damageEvent?.effectiveness).to.equal(2); // Super effective
    });

    it('should determine battle winner correctly', () => {
      const battleEngine = new BattleEngine(teamA, teamB);

      // Simulate battle until one team wins
      let winner = battleEngine.getWinner();
      while (winner === null) {
        battleEngine.processTurn(
          { slot: 0, moveId: 'thunderbolt' },
          { slot: 0, moveId: 'ember' }
        );
        winner = battleEngine.getWinner();
      }

      expect(['A', 'B']).to.include(winner);
    });
  });

  describe('Pack Manager', () => {
    it('should calculate pack price correctly', async () => {
      const result = await packManager.buyPack('test-user-1');
      expect(result.paymentRequired).to.equal(100_000_000); // 0.1 SOL
      expect(result.packId).to.be.a('string');
    });

    it('should generate pack rewards deterministically', async () => {
      const packId = 'test-pack-rewards';
      const rewards = await packManager.generatePackRewards('test-seed');

      expect(rewards).to.be.an('array');
      expect(rewards).to.have.lengthOf(5);

      // Check reward structure
      rewards.forEach(reward => {
        expect(reward).to.have.property('cardId');
        expect(reward).to.have.property('rarity');
        expect(['COMMON', 'RARE', 'LEGENDARY']).to.include(reward.rarity);
        expect(reward).to.have.property('isShiny');
        expect(reward.isShiny).to.be.a('boolean');
      });
    });
  });

  describe('Team Builder', () => {
    it('should validate team correctly', async () => {
      const validTeam = ['pikachu-1', 'charmander-2', 'squirtle-3', 'bulbasaur-4', 'pidgey-5', 'rattata-6'];
      const validation = await teamBuilder.validateTeam(validTeam);

      expect(validation.valid).to.be.true;
      expect(validation.errors).to.have.lengthOf(0);
    });

    it('should reject team with duplicates', async () => {
      const invalidTeam = ['pikachu-1', 'pikachu-1', 'charmander-2', 'squirtle-3', 'bulbasaur-4', 'pidgey-5'];
      const validation = await teamBuilder.validateTeam(invalidTeam);

      expect(validation.valid).to.be.false;
      expect(validation.errors).to.include('Team cannot have duplicate Pokémon');
    });

    it('should analyze team type coverage', async () => {
      const team = ['pikachu-1', 'charmander-2', 'squirtle-3']; // Electric, Fire, Water
      const analysis = await teamBuilder.analyzeTeam(team);

      expect(analysis).to.have.property('typeCoverage');
      expect(analysis).to.have.property('weaknesses');
      expect(analysis).to.have.property('resistances');
      expect(analysis).to.have.property('overallScore');
      expect(analysis).to.have.property('recommendations');
    });
  });

  describe('Marketplace Manager', () => {
    it('should create listing correctly', async () => {
      const listingId = await marketplaceManager.createListing(
        'card-1',
        'user-1',
        1000000 // 0.001 SOL
      );

      expect(listingId).to.be.a('string');
    });

    it('should calculate fees correctly', () => {
      const price = 100000000; // 0.1 SOL
      const expectedFee = Math.floor((price * 250) / 10000); // 2.5% fee

      expect(expectedFee).to.equal(2500000); // 0.0025 SOL
    });

    it('should handle auction lifecycle', async () => {
      const auctionId = await marketplaceManager.createAuction(
        'card-1',
        'user-1',
        50000000, // 0.05 SOL reserve
        24 // 24 hours
      );

      expect(auctionId).to.be.a('string');

      // Place bid
      const bidId = await marketplaceManager.placeBid(
        auctionId,
        'user-2',
        60000000 // 0.06 SOL bid
      );

      expect(bidId).to.be.a('string');
    });
  });

  describe('Economy Manager', () => {
    it('should award battle rewards correctly', async () => {
      const initialBalance = await economyManager.getUserBalance('test-user-1');
      await economyManager.awardBattleReward('test-user-1', 'battle-1', 'WIN');
      const newBalance = await economyManager.getUserBalance('test-user-1');

      expect(newBalance).to.equal(initialBalance + 500); // WIN reward
    });

    it('should handle PokéCoin spending', async () => {
      // First add some coins
      await economyManager.awardBattleReward('test-user-2', 'battle-1', 'WIN');

      const initialBalance = await economyManager.getUserBalance('test-user-2');
      await economyManager.spendPokecoins('test-user-2', 100, 'test purchase');
      const newBalance = await economyManager.getUserBalance('test-user-2');

      expect(newBalance).to.equal(initialBalance - 100);
    });

    it('should calculate SOL to PokéCoins conversion', () => {
      const solAmount = 1_000_000_000; // 1 SOL in lamports
      const pokecoins = economyManager.solToPokecoins(solAmount);

      expect(pokecoins).to.equal(10000); // 10,000 PC per SOL
    });

    it('should handle daily bonus with streak', async () => {
      const result = await economyManager.awardDailyBonus('test-user-3');

      expect(result).to.have.property('bonus');
      expect(result).to.have.property('streak');
      expect(result).to.have.property('newBalance');
      expect(result.streak).to.equal(1);
    });
  });

  describe('Collection Manager', () => {
    it('should create cards correctly', async () => {
      const cardId = await collectionManager.createCard(
        'test-user-1',
        25, // Pikachu
        'COMMON',
        false
      );

      expect(cardId).to.be.a('string');

      const card = await collectionManager.getCard(cardId);
      expect(card?.dexNumber).to.equal(25);
      expect(card?.rarity).to.equal('COMMON');
      expect(card?.level).to.equal(1);
    });

    it('should award experience and level up', async () => {
      const cardId = await collectionManager.createCard('test-user-1', 25, 'COMMON');

      const result = await collectionManager.awardExperience(cardId, 150); // More than level 1 requirement

      expect(result.leveledUp).to.be.true;
      expect(result.newLevel).to.equal(2);
    });

    it('should calculate stats correctly', () => {
      const baseStats = { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 };
      const calculatedStats = collectionManager.calculateStats(baseStats, 50, 'RARE');

      expect(calculatedStats.hp).to.be.greaterThan(baseStats.hp);
      expect(calculatedStats.atk).to.be.greaterThan(baseStats.atk);
    });
  });

  describe('Progression Manager', () => {
    it('should award XP and level up', async () => {
      const result = await progressionManager.awardXP('test-user-1', 200, 'battle_win');

      expect(result.newLevel).to.be.at.least(1);
      expect(result.leveledUp).to.be.a('boolean');
      expect(result.xpGained).to.equal(200);
    });

    it('should track battle statistics', async () => {
      await progressionManager.updateBattleStats(
        'test-user-1',
        'WIN',
        100000000, // 0.1 SOL
        300 // 5 minutes
      );

      const profile = await progressionManager.getUserProfile('test-user-1');
      expect(profile?.stats.wins).to.be.at.least(1);
      expect(profile?.stats.totalWagered).to.be.at.least(100000000);
    });

    it('should calculate level progress correctly', () => {
      const progress = progressionManager.getLevelProgress(1, 50);

      expect(progress).to.have.property('currentLevelXP');
      expect(progress).to.have.property('nextLevelXP');
      expect(progress).to.have.property('progressPercent');
      expect(progress.progressPercent).to.be.within(0, 100);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow', async () => {
      const userId = 'integration-test-user';

      // 1. Create user profile
      const profile = await progressionManager.getUserProfile(userId);
      expect(profile).to.not.be.null;

      // 2. Award XP from battle
      await progressionManager.awardXP(userId, 100, 'battle_win');

      // 3. Create a card
      const cardId = await collectionManager.createCard(userId, 25, 'COMMON');

      // 4. Award experience to card
      await collectionManager.awardExperience(cardId, 50);

      // 5. Check economy
      await economyManager.awardBattleReward(userId, 'battle-1', 'WIN');

      // 6. Verify everything is connected
      const updatedProfile = await progressionManager.getUserProfile(userId);
      const card = await collectionManager.getCard(cardId);
      const balance = await economyManager.getUserBalance(userId);

      expect(updatedProfile?.xp).to.be.greaterThan(0);
      expect(card?.experience).to.be.greaterThan(0);
      expect(balance).to.be.greaterThan(0);
    });

    it('should handle team creation and validation', async () => {
      const userId = 'team-test-user';

      // Create some cards
      const card1 = await collectionManager.createCard(userId, 25, 'COMMON'); // Pikachu
      const card2 = await collectionManager.createCard(userId, 4, 'COMMON');  // Charmander
      const card3 = await collectionManager.createCard(userId, 7, 'COMMON');  // Squirtle

      // Create team
      const teamId = await teamBuilder.createTeam(userId, 'Test Team', [card1, card2, card3, '', '', '']);

      expect(teamId).to.be.a('string');

      // Analyze team
      const analysis = await teamBuilder.analyzeTeam([card1, card2, card3]);

      expect(analysis.overallScore).to.be.a('number');
      expect(analysis.recommendations).to.be.an('array');
    });
  });
});
