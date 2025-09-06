import { supabase } from '../../lib/supabase';
import {
  TypeGen1,
  TYPE_EFFECTIVENESS,
  calculateTypeEffectiveness,
  PokemonData,
  Stats
} from '@pokebattle/shared';

export interface TeamAnalysis {
  typeCoverage: Record<TypeGen1, number>;
  weaknesses: Record<TypeGen1, number>;
  resistances: Record<TypeGen1, number>;
  overallScore: number;
  recommendations: string[];
}

export class TeamBuilder {
  private pokemonData: Map<number, PokemonData> = new Map();

  constructor() {
    this.initializePokemonData();
  }

  async createTeam(ownerId: string, name: string, slots: string[]): Promise<string> {
    const teamId = crypto.randomUUID();

    // Validate team
    const validation = await this.validateTeam(slots);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create team record
    await supabase
      .from('teams')
      .insert({
        id: teamId,
        owner_id: ownerId,
        name,
        slots,
        natures: Array(6).fill(''),
        moves: Object.fromEntries(slots.map((_, i) => [i, []])),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return teamId;
  }

  async updateTeam(teamId: string, ownerId: string, updates: {
    name?: string;
    slots?: string[];
    natures?: string[];
    moves?: Record<string, string[]>;
  }): Promise<void> {
    // Verify ownership
    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', teamId)
      .single();

    if (team?.owner_id !== ownerId) {
      throw new Error('Not authorized to update this team');
    }

    // Validate updates
    if (updates.slots) {
      const validation = await this.validateTeam(updates.slots);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
    }

    // Update team
    await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId);
  }

  async analyzeTeam(teamSlots: string[]): Promise<TeamAnalysis> {
    const teamTypes: TypeGen1[][] = [];

    // Get types for each Pokémon in the team
    for (const slot of teamSlots) {
      if (slot) {
        // Parse card ID to get dex number
        const dexNumber = this.parseCardId(slot);
        const pokemon = this.pokemonData.get(dexNumber);
        if (pokemon) {
          teamTypes.push(pokemon.types);
        }
      }
    }

    return this.calculateTeamAnalysis(teamTypes);
  }

  async getRecommendedMoves(teamId: string, slotIndex: number): Promise<string[]> {
    // Get team data
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) throw new Error('Team not found');

    const cardId = team.slots[slotIndex];
    if (!cardId) return [];

    // Parse card ID to get Pokémon data
    const dexNumber = this.parseCardId(cardId);
    const pokemon = this.pokemonData.get(dexNumber);

    if (!pokemon) return [];

    // Get moves based on team analysis
    const teamAnalysis = await this.analyzeTeam(team.slots);
    return this.recommendMoves(pokemon, teamAnalysis);
  }

  async getSuggestedNature(teamId: string, slotIndex: number): Promise<string> {
    // Get team data
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) throw new Error('Team not found');

    const cardId = team.slots[slotIndex];
    if (!cardId) return '';

    // Parse card ID to get Pokémon data
    const dexNumber = this.parseCardId(cardId);
    const pokemon = this.pokemonData.get(dexNumber);

    if (!pokemon) return '';

    // Analyze team needs and suggest nature
    const teamAnalysis = await this.analyzeTeam(team.slots);
    return this.suggestNature(pokemon, teamAnalysis);
  }

  private calculateTeamAnalysis(teamTypes: TypeGen1[][]): TeamAnalysis {
    const typeCoverage: Record<TypeGen1, number> = {} as any;
    const weaknesses: Record<TypeGen1, number> = {} as any;
    const resistances: Record<TypeGen1, number> = {} as any;

    // Initialize all types
    Object.keys(TYPE_EFFECTIVENESS).forEach(type => {
      typeCoverage[type as TypeGen1] = 0;
      weaknesses[type as TypeGen1] = 0;
      resistances[type as TypeGen1] = 0;
    });

    // Analyze each Pokémon in the team
    for (const pokemonTypes of teamTypes) {
      for (const attackingType of Object.keys(TYPE_EFFECTIVENESS) as TypeGen1[]) {
        let coverage = 0;

        // Check effectiveness against this type
        for (const defendingType of pokemonTypes) {
          const effectiveness = TYPE_EFFECTIVENESS[attackingType][defendingType];
          if (effectiveness >= 2) coverage += 2; // Super effective
          else if (effectiveness > 0) coverage += 1; // Neutral
          else if (effectiveness === 0) coverage += 0; // No effect
        }

        if (coverage > 0) {
          typeCoverage[attackingType] = Math.max(typeCoverage[attackingType], coverage);
        }
      }

      // Calculate weaknesses and resistances
      for (const defendingType of Object.keys(TYPE_EFFECTIVENESS) as TypeGen1[]) {
        const effectiveness = calculateTypeEffectiveness(defendingType, pokemonTypes);

        if (effectiveness >= 2) {
          weaknesses[defendingType]++;
        } else if (effectiveness < 1) {
          resistances[defendingType]++;
        }
      }
    }

    // Calculate overall score
    const coverageScore = Object.values(typeCoverage).filter(v => v >= 2).length;
    const weaknessScore = Object.values(weaknesses).filter(v => v >= 2).length;
    const overallScore = coverageScore - weaknessScore;

    // Generate recommendations
    const recommendations = this.generateRecommendations(typeCoverage, weaknesses, resistances);

    return {
      typeCoverage,
      weaknesses,
      resistances,
      overallScore,
      recommendations,
    };
  }

  private generateRecommendations(
    coverage: Record<TypeGen1, number>,
    weaknesses: Record<TypeGen1, number>,
    resistances: Record<TypeGen1, number>
  ): string[] {
    const recommendations: string[] = [];

    // Check for major weaknesses
    const majorWeaknesses = Object.entries(weaknesses)
      .filter(([_, count]) => count >= 2)
      .map(([type]) => type);

    if (majorWeaknesses.length > 0) {
      recommendations.push(`Consider adding Pokémon resistant to: ${majorWeaknesses.join(', ')}`);
    }

    // Check for coverage gaps
    const poorCoverage = Object.entries(coverage)
      .filter(([_, effectiveness]) => effectiveness < 1)
      .map(([type]) => type);

    if (poorCoverage.length > 0) {
      recommendations.push(`Improve coverage against: ${poorCoverage.join(', ')}`);
    }

    // Check for over-represented types
    const overResisted = Object.entries(resistances)
      .filter(([_, count]) => count >= 3)
      .map(([type]) => type);

    if (overResisted.length > 0) {
      recommendations.push(`Consider diversifying types, over-resistant to: ${overResisted.join(', ')}`);
    }

    return recommendations;
  }

  private recommendMoves(pokemon: PokemonData, teamAnalysis: TeamAnalysis): string[] {
    const recommendedMoves: string[] = [];

    // Recommend moves that cover team weaknesses
    const teamWeaknesses = Object.entries(teamAnalysis.weaknesses)
      .filter(([_, count]) => count >= 2)
      .map(([type]) => type as TypeGen1);

    for (const weakness of teamWeaknesses) {
      // Find moves that are super effective against this weakness
      for (const move of pokemon.moves.levelUp) {
        if (TYPE_EFFECTIVENESS[move.type as TypeGen1]?.[weakness] >= 2) {
          recommendedMoves.push(move.move);
        }
      }
    }

    // Also recommend STAB moves (Same Type Attack Bonus)
    for (const move of pokemon.moves.levelUp) {
      if (pokemon.types.includes(move.type as TypeGen1)) {
        recommendedMoves.push(move.move);
      }
    }

    return [...new Set(recommendedMoves)].slice(0, 4); // Return up to 4 unique moves
  }

  private suggestNature(pokemon: PokemonData, teamAnalysis: TeamAnalysis): string {
    // Simple nature suggestion based on team needs
    // In a real implementation, this would be more sophisticated

    const teamWeaknesses = Object.entries(teamAnalysis.weaknesses)
      .filter(([_, count]) => count >= 2)
      .map(([type]) => type as TypeGen1);

    // Suggest natures that boost stats useful for covering weaknesses
    if (teamWeaknesses.includes('PSYCHIC')) {
      return 'Modest (+SpA, -Atk)'; // Boost special attack
    } else if (teamWeaknesses.some(type => ['NORMAL', 'FIGHTING'].includes(type))) {
      return 'Adamant (+Atk, -SpA)'; // Boost physical attack
    } else {
      return 'Hardy (Neutral)'; // Default neutral nature
    }
  }

  private async validateTeam(slots: string[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check team size
    if (slots.length !== 6) {
      errors.push('Team must have exactly 6 Pokémon');
    }

    // Check for duplicates
    const uniqueSlots = new Set(slots.filter(slot => slot));
    if (uniqueSlots.size !== slots.filter(slot => slot).length) {
      errors.push('Team cannot have duplicate Pokémon');
    }

    // Check ownership (simplified - would need to verify with database)
    for (const slot of slots) {
      if (slot) {
        // Verify the user owns this card
        // This would be implemented based on your ownership verification logic
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private parseCardId(cardId: string): number {
    // Extract dex number from card ID
    // Format: rarity-dexNumber (e.g., "common-025", "legendary-150")
    const parts = cardId.split('-');
    if (parts.length >= 2) {
      return parseInt(parts[1], 10);
    }
    return 1; // Default to Bulbasaur
  }

  private initializePokemonData(): void {
    // Initialize with Gen 1 Pokémon data
    // This would be a comprehensive database in a real implementation
    const gen1Pokemon: PokemonData[] = [
      {
        dexNumber: 1,
        name: 'Bulbasaur',
        types: ['GRASS', 'POISON'],
        baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
        moves: {
          levelUp: [
            { level: 1, move: 'Tackle' },
            { level: 3, move: 'Growl' },
            { level: 7, move: 'Leech Seed' },
            { level: 13, move: 'Vine Whip' },
          ],
          tm: ['Solar Beam', 'Razor Leaf'],
          egg: ['Petal Dance'],
          tutor: ['Body Slam'],
        },
      },
      // Add more Pokémon data as needed
    ];

    gen1Pokemon.forEach(pokemon => {
      this.pokemonData.set(pokemon.dexNumber, pokemon);
    });
  }
}
