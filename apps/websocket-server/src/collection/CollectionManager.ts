import { supabase } from '../../lib/supabase';
import { Rarity, TypeGen1, Stats } from '@pokebattle/shared';

export interface Card {
  id: string;
  ownerId: string;
  dexNumber: number;
  name: string;
  isShiny: boolean;
  rarity: Rarity;
  level: number;
  stats: Stats;
  types: TypeGen1[];
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CollectionManager {
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
    const cardId = crypto.randomUUID();

    // Get base Pokémon data
    const baseStats = this.getBaseStats(dexNumber);
    const name = this.getPokemonName(dexNumber);
    const types = this.getPokemonTypes(dexNumber);

    // Calculate initial stats
    const stats = this.calculateStats(baseStats, 1, rarity);

    await supabase
      .from('cards')
      .insert({
        id: cardId,
        owner_id: ownerId,
        dex_number: dexNumber,
        name,
        is_shiny: isShiny,
        rarity,
        level: 1,
        stats,
        types,
        experience: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return cardId;
  }

  async awardExperience(cardId: string, experience: number): Promise<{
    newLevel: number;
    leveledUp: boolean;
    newStats?: Stats;
  }> {
    // Get current card
    const { data: card } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (!card) throw new Error('Card not found');

    const newExperience = card.experience + experience;
    let newLevel = card.level;
    let leveledUp = false;

    // Calculate new level
    const requiredXP = this.getRequiredExperience(card.level);
    if (newExperience >= requiredXP && card.level < this.MAX_LEVEL) {
      newLevel = Math.min(card.level + 1, this.MAX_LEVEL);
      leveledUp = newLevel > card.level;
    }

    // Update card
    const updateData: any = {
      experience: newExperience,
      updated_at: new Date().toISOString(),
    };

    if (leveledUp) {
      // Recalculate stats for new level
      const baseStats = this.getBaseStats(card.dex_number);
      updateData.level = newLevel;
      updateData.stats = this.calculateStats(baseStats, newLevel, card.rarity);
    }

    await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardId);

    return {
      newLevel,
      leveledUp,
      newStats: leveledUp ? updateData.stats : undefined,
    };
  }

  async getUserCollection(userId: string): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('owner_id', userId)
      .order('dex_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUserCollectionByRarity(userId: string, rarity: Rarity): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('owner_id', userId)
      .eq('rarity', rarity)
      .order('dex_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCard(cardId: string): Promise<Card | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error) return null;
    return data;
  }

  async transferCard(cardId: string, fromUserId: string, toUserId: string): Promise<void> {
    // Verify ownership
    const { data: card } = await supabase
      .from('cards')
      .select('owner_id')
      .eq('id', cardId)
      .single();

    if (!card) throw new Error('Card not found');
    if (card.owner_id !== fromUserId) throw new Error('Not authorized to transfer this card');

    // Transfer ownership
    await supabase
      .from('cards')
      .update({
        owner_id: toUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId);
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
      if (card.is_shiny) shinyCount++;
      totalLevel += card.level;
      uniqueDexNumbers.add(card.dex_number);
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
    const ownedDexNumbers = new Set(collection.map(card => card.dex_number));

    const missing: number[] = [];
    for (let i = 1; i <= 151; i++) {
      if (!ownedDexNumbers.has(i)) {
        missing.push(i);
      }
    }

    return missing;
  }

  async evolveCard(cardId: string): Promise<boolean> {
    // Simplified evolution logic
    // In a real implementation, this would check evolution requirements
    const { data: card } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (!card) throw new Error('Card not found');

    // Check evolution requirements (simplified)
    const canEvolve = card.level >= 16 && card.dex_number < 151; // Very basic check

    if (canEvolve) {
      const evolvedDexNumber = this.getEvolution(card.dex_number);
      const evolvedName = this.getPokemonName(evolvedDexNumber);
      const evolvedTypes = this.getPokemonTypes(evolvedDexNumber);

      await supabase
        .from('cards')
        .update({
          dex_number: evolvedDexNumber,
          name: evolvedName,
          types: evolvedTypes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId);

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
