import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { VRFClient } from '../../../web/src/lib/vrfClient';

export interface PackReward {
  id: string;
  cardId: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  isShiny: boolean;
}

export class PackManager {
  private vrfClient: VRFClient;

  constructor() {
    this.vrfClient = new VRFClient();
  }

  // Rarity probabilities (out of 10000)
  private readonly RARITY_PROBABILITIES = {
    COMMON: 8000,      // 80%
    RARE: 1800,        // 18%
    LEGENDARY: 200,    // 2%
  };

  private readonly SHINY_CHANCE = 128; // 1/128 chance

  async buyPack(userId: string): Promise<{ packId: string; paymentRequired: number }> {
    const packId = uuidv4();
    const paymentRequired = 100_000_000; // 0.1 SOL

    // Create pack record
    await supabase
      .from('packs')
      .insert({
        id: packId,
        buyer_id: userId,
        opened: false,
        created_at: new Date().toISOString(),
      });

    return { packId, paymentRequired };
  }

  async confirmPayment(packId: string, paymentSignature: string): Promise<void> {
    // Update pack with payment signature
    await supabase
      .from('packs')
      .update({
        payment_sig: paymentSignature,
      })
      .eq('id', packId);
  }

  async openPack(packId: string): Promise<PackReward[]> {
    // Get pack from database
    const { data: pack, error } = await supabase
      .from('packs')
      .select('*')
      .eq('id', packId)
      .single();

    if (error || !pack) {
      throw new Error('Pack not found');
    }

    if (pack.opened) {
      throw new Error('Pack already opened');
    }

    // Request VRF for randomness
    const vrfResult = await this.requestVRFForPack(packId);

    // Generate rewards based on VRF result
    const rewards = this.generatePackRewards(vrfResult);

    // Save rewards to database
    const rewardRecords = rewards.map(reward => ({
      id: uuidv4(),
      pack_id: packId,
      card_id: reward.cardId,
      rarity: reward.rarity,
      is_shiny: reward.isShiny,
      created_at: new Date().toISOString(),
    }));

    await supabase
      .from('pack_rewards')
      .insert(rewardRecords);

    // Mark pack as opened
    await supabase
      .from('packs')
      .update({
        opened: true,
        opened_at: new Date().toISOString(),
      })
      .eq('id', packId);

    return rewards;
  }

  private async requestVRFForPack(packId: string): Promise<string> {
    try {
      // Request VRF from the VRF client
      // This would integrate with the VRF client we created
      const mockVrfResult = Math.random().toString(36).substring(2, 15);
      return mockVrfResult;
    } catch (error) {
      console.error('VRF request failed:', error);
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
    const { data, error } = await supabase
      .from('packs')
      .select(`
        *,
        pack_rewards (*)
      `)
      .eq('id', packId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserPacks(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('packs')
      .select(`
        *,
        pack_rewards (*)
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
