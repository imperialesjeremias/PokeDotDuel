import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Card, Rarity, TypeGen1, Stats } from '../shared/interfaces/types';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  private readonly EXPERIENCE_PER_LEVEL = 100; // Base XP per level
  private readonly MAX_LEVEL = 100;

  // XP multipliers by rarity
  private readonly RARITY_XP_MULTIPLIERS: Record<Rarity, number> = {
    COMMON: 1.0,
    RARE: 1.2,
    LEGENDARY: 1.5,
  };

  async createCard(
    ownerId: string,
    dexNumber: number,
    rarity: Rarity,
    isShiny: boolean = false
  ): Promise<string> {
    const cardId = uuidv4();

    // Get base Pokémon data
    const baseStats = this.getBaseStats(dexNumber);
    const name = this.getPokemonName(dexNumber);
    const types = this.getPokemonTypes(dexNumber);

    // Calculate initial stats
    const stats = this.calculateStats(baseStats, 1, rarity);

    // TODO: Save card to database
    this.logger.log(`Created card ${cardId} for user ${ownerId}: ${name} (${rarity})`);

    return cardId;
  }

  async awardExperience(cardId: string, experience: number): Promise<{
    newLevel: number;
    leveledUp: boolean;
    newStats?: Stats;
  }> {
    // TODO: Get current card from database
    const mockCard = {
      id: cardId,
      level: 1,
      experience: 0,
      dex_number: 25,
      rarity: 'COMMON' as Rarity,
    };

    const newExperience = mockCard.experience + experience;
    let newLevel = mockCard.level;
    let leveledUp = false;

    // Calculate new level
    const requiredXP = this.getRequiredExperience(mockCard.level);
    if (newExperience >= requiredXP && mockCard.level < this.MAX_LEVEL) {
      newLevel = Math.min(mockCard.level + 1, this.MAX_LEVEL);
      leveledUp = newLevel > mockCard.level;
    }

    // Update card
    if (leveledUp) {
      // Recalculate stats for new level
      const baseStats = this.getBaseStats(mockCard.dex_number);
      const newStats = this.calculateStats(baseStats, newLevel, mockCard.rarity);
      // TODO: Update card in database
      this.logger.log(`Card ${cardId} leveled up to ${newLevel}`);
    }

    return {
      newLevel,
      leveledUp,
      newStats: leveledUp ? this.calculateStats(this.getBaseStats(mockCard.dex_number), newLevel, mockCard.rarity) : undefined,
    };
  }

  async getUserCollection(userId: string): Promise<Card[]> {
    // TODO: Get user collection from database
    this.logger.log(`Getting collection for user ${userId}`);
    return [];
  }

  async getUserCollectionByRarity(userId: string, rarity: Rarity): Promise<Card[]> {
    // TODO: Get user collection by rarity from database
    this.logger.log(`Getting ${rarity} cards for user ${userId}`);
    return [];
  }

  async getCard(cardId: string): Promise<Card | null> {
    // TODO: Get card from database
    this.logger.log(`Getting card ${cardId}`);
    return null;
  }

  async transferCard(cardId: string, fromUserId: string, toUserId: string): Promise<void> {
    // TODO: Verify ownership and transfer card
    this.logger.log(`Transferring card ${cardId} from ${fromUserId} to ${toUserId}`);
  }

  async getCollectionStats(userId: string): Promise<{
    totalCards: number;
    uniquePokemon: number;
    shinyCount: number;
    rarityBreakdown: Record<Rarity, number>;
    averageLevel: number;
    completionPercentage: number;
  }> {
    const collection = await this.getUserCollection(userId);

    const rarityBreakdown: Record<Rarity, number> = {
      COMMON: 0,
      RARE: 0,
      LEGENDARY: 0,
    };

    let shinyCount = 0;
    let totalLevel = 0;
    const uniqueDexNumbers = new Set<number>();

    for (const card of collection) {
      rarityBreakdown[card.rarity]++;
      if (card.isShiny) shinyCount++;
      totalLevel += card.level;
      uniqueDexNumbers.add(card.dexNumber);
    }

    const totalCards = collection.length;
    const uniquePokemon = uniqueDexNumbers.size;
    const averageLevel = totalCards > 0 ? totalLevel / totalCards : 0;
    const completionPercentage = (uniquePokemon / 151) * 100; // Gen 1 has 151 Pokémon

    return {
      totalCards,
      uniquePokemon,
      shinyCount,
      rarityBreakdown,
      averageLevel,
      completionPercentage,
    };
  }

  async getMissingPokemon(userId: string): Promise<number[]> {
    const collection = await this.getUserCollection(userId);
    const ownedDexNumbers = new Set(collection.map(card => card.dexNumber));

    const missing: number[] = [];
    for (let i = 1; i <= 151; i++) {
      if (!ownedDexNumbers.has(i)) {
        missing.push(i);
      }
    }

    return missing;
  }

  async evolveCard(cardId: string): Promise<boolean> {
    // TODO: Get card from database
    const mockCard = {
      id: cardId,
      level: 20,
      dex_number: 1,
    };

    // Check evolution requirements (simplified)
    const canEvolve = mockCard.level >= 16 && mockCard.dex_number < 151;

    if (canEvolve) {
      const evolvedDexNumber = this.getEvolution(mockCard.dex_number);
      const evolvedName = this.getPokemonName(evolvedDexNumber);
      const evolvedTypes = this.getPokemonTypes(evolvedDexNumber);

      // TODO: Update card in database
      this.logger.log(`Card ${cardId} evolved to ${evolvedName}`);
      return true;
    }

    return false;
  }

  // Utility functions
  private calculateStats(baseStats: Stats, level: number, rarity: Rarity): Stats {
    const multiplier = this.RARITY_XP_MULTIPLIERS[rarity];

    // Simplified stat calculation (similar to Pokémon games)
    const calculatedStats: Stats = {
      hp: Math.floor(((2 * baseStats.hp + 0) * level) / 100) + level + 10,
      atk: Math.floor(((((2 * baseStats.atk + 0) * level) / 100) + 5) * multiplier),
      def: Math.floor(((((2 * baseStats.def + 0) * level) / 100) + 5) * multiplier),
      spa: Math.floor(((((2 * baseStats.spa + 0) * level) / 100) + 5) * multiplier),
      spd: Math.floor(((((2 * baseStats.spd + 0) * level) / 100) + 5) * multiplier),
      spe: Math.floor(((((2 * baseStats.spe + 0) * level) / 100) + 5) * multiplier),
    };

    return calculatedStats;
  }

  private getRequiredExperience(currentLevel: number): number {
    // Simplified XP curve
    return currentLevel * this.EXPERIENCE_PER_LEVEL;
  }

  private getBaseStats(dexNumber: number): Stats {
    // Simplified - in a real implementation, this would be a comprehensive database
    const baseStatsMap: Record<number, Stats> = {
      1: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 }, // Bulbasaur
      25: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 }, // Pikachu
      150: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 }, // Mewtwo
    };

    return baseStatsMap[dexNumber] || { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 };
  }

  private getPokemonName(dexNumber: number): string {
    const nameMap: Record<number, string> = {
      1: 'Bulbasaur',
      25: 'Pikachu',
      150: 'Mewtwo',
    };

    return nameMap[dexNumber] || `Pokemon-${dexNumber}`;
  }

  private getPokemonTypes(dexNumber: number): TypeGen1[] {
    const typeMap: Record<number, TypeGen1[]> = {
      1: ['GRASS', 'POISON'], // Bulbasaur
      25: ['ELECTRIC'], // Pikachu
      150: ['PSYCHIC'], // Mewtwo
    };

    return typeMap[dexNumber] || ['NORMAL'];
  }

  private getEvolution(dexNumber: number): number {
    // Simplified evolution chain
    const evolutionMap: Record<number, number> = {
      1: 2, // Bulbasaur -> Ivysaur
      2: 3, // Ivysaur -> Venusaur
      4: 5, // Charmander -> Charmeleon
      // Add more evolutions as needed
    };

    return evolutionMap[dexNumber] || dexNumber;
  }
}

