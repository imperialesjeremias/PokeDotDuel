import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface PackReward {
  id: string;
  cardId: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  isShiny: boolean;
}

export interface PackPurchase {
  packId: string;
  paymentRequired: number;
}

@Injectable()
export class PackManagerService {
  private readonly logger = new Logger(PackManagerService.name);

  // Rarity probabilities (out of 10000)
  private readonly RARITY_PROBABILITIES = {
    COMMON: 8000,      // 80%
    RARE: 1800,        // 18%
    LEGENDARY: 200,    // 2%
  };

  private readonly SHINY_CHANCE = 128; // 1/128 chance

  async buyPack(userId: string): Promise<PackPurchase> {
    const packId = uuidv4();
    const paymentRequired = 100_000_000; // 0.1 SOL

    // TODO: Create pack record in database
    this.logger.log(`Created pack ${packId} for user ${userId}`);

    return { packId, paymentRequired };
  }

  async confirmPayment(packId: string, paymentSignature: string): Promise<void> {
    // TODO: Update pack with payment signature in database
    this.logger.log(`Confirmed payment for pack ${packId} with signature ${paymentSignature}`);
  }

  async openPack(packId: string): Promise<PackReward[]> {
    // TODO: Get pack from database
    this.logger.log(`Opening pack ${packId}`);

    // Request VRF for randomness
    const vrfResult = await this.requestVRFForPack(packId);

    // Generate rewards based on VRF result
    const rewards = this.generatePackRewards(vrfResult);

    // TODO: Save rewards to database

    // TODO: Mark pack as opened

    return rewards;
  }

  private async requestVRFForPack(packId: string): Promise<string> {
    try {
      // TODO: Request VRF from the VRF client
      // This would integrate with the VRF client we created
      const mockVrfResult = Math.random().toString(36).substring(2, 15);
      return mockVrfResult;
    } catch (error) {
      this.logger.error('VRF request failed:', error);
      // Fallback to pseudo-random
      return Math.random().toString(36).substring(2, 15);
    }
  }

  private generatePackRewards(vrfResult: string): PackReward[] {
    const rewards: PackReward[] = [];

    // Convert VRF result to number for deterministic randomness
    const seed = this.hashStringToNumber(vrfResult);

    // Generate 5 cards per pack
    for (let i = 0; i < 5; i++) {
      const cardSeed = (seed + i * 1000) % 10000;
      const reward = this.generateSingleCard(cardSeed);
      rewards.push(reward);
    }

    return rewards;
  }

  private generateSingleCard(seed: number): PackReward {
    // Determine rarity
    let rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    if (seed < this.RARITY_PROBABILITIES.LEGENDARY) {
      rarity = 'LEGENDARY';
    } else if (seed < this.RARITY_PROBABILITIES.LEGENDARY + this.RARITY_PROBABILITIES.RARE) {
      rarity = 'RARE';
    } else {
      rarity = 'COMMON';
    }

    // Determine if shiny
    const shinySeed = (seed * 31) % 10000; // Different seed for shiny
    const isShiny = shinySeed < (10000 / this.SHINY_CHANCE);

    // Generate card ID based on rarity and seed
    const cardId = this.generateCardId(rarity, seed);

    return {
      id: uuidv4(),
      cardId,
      rarity,
      isShiny,
    };
  }

  private generateCardId(rarity: 'COMMON' | 'RARE' | 'LEGENDARY', seed: number): string {
    // Simplified card generation
    // In a real implementation, this would select from a pool of available cards
    const cardNumber = (seed % 151) + 1; // Gen 1 has 151 Pokémon
    return `${rarity.toLowerCase()}-${cardNumber.toString().padStart(3, '0')}`;
  }

  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 10000;
  }

  async getPack(packId: string): Promise<any> {
    // TODO: Get pack from database
    this.logger.log(`Getting pack ${packId}`);
    return { id: packId, opened: false };
  }

  async getUserPacks(userId: string): Promise<any[]> {
    // TODO: Get user packs from database
    this.logger.log(`Getting packs for user ${userId}`);
    return [];
  }
}

