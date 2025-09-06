import { supabase } from '../../lib/supabase';

export interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  level: number;
  xp: number;
  badges: Badge[];
  pokecoins: number;
  stats: UserStats;
  achievements: Achievement[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  packsOpened: number;
  cardsOwned: number;
  totalWagered: number;
  totalWon: number;
  winStreak: number;
  bestWinStreak: number;
  favoriteType?: string;
  totalPlayTime: number; // in minutes
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: Date;
  reward?: number; // PokéCoins reward
}

export class ProgressionManager {
  // XP requirements for each level
  private readonly XP_REQUIREMENTS: number[] = [];
  private readonly MAX_LEVEL = 100;

  constructor() {
    this.initializeXPRequirements();
  }

  private initializeXPRequirements(): void {
    // Calculate XP requirements (similar to Pokémon games)
    for (let level = 1; level <= this.MAX_LEVEL; level++) {
      const xp = Math.floor((level ** 3) * 0.8); // Medium-slow growth
      this.XP_REQUIREMENTS.push(xp);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_badges (
          badges (*)
        ),
        user_achievements (
          achievements (*)
        )
      `)
      .eq('id', userId)
      .single();

    if (error) return null;

    // Transform data to match interface
    return {
      id: data.id,
      walletAddress: data.wallet_address,
      username: data.username,
      level: data.level,
      xp: data.xp,
      badges: data.user_badges?.map((ub: any) => ub.badges) || [],
      pokecoins: data.pokecoins,
      stats: data.stats || this.getDefaultStats(),
      achievements: data.user_achievements?.map((ua: any) => ua.achievements) || [],
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async awardXP(userId: string, xpAmount: number, reason: string): Promise<{
    newLevel: number;
    leveledUp: boolean;
    xpGained: number;
  }> {
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User not found');

    const newXP = profile.xp + xpAmount;
    let newLevel = profile.level;
    let leveledUp = false;

    // Check for level up
    while (newLevel < this.MAX_LEVEL && newXP >= this.XP_REQUIREMENTS[newLevel]) {
      newLevel++;
      leveledUp = true;
    }

    // Update user
    await supabase
      .from('users')
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Award level up bonus
    if (leveledUp) {
      await this.awardLevelUpBonus(userId, newLevel);
    }

    return {
      newLevel,
      leveledUp,
      xpGained: xpAmount,
    };
  }

  private async awardLevelUpBonus(userId: string, newLevel: number): Promise<void> {
    const bonus = newLevel * 100; // 100 PokéCoins per level

    // Update PokéCoins
    const { data: user } = await supabase
      .from('users')
      .select('pokecoins')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({
          pokecoins: user.pokecoins + bonus,
        })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          kind: 'ACHIEVEMENT',
          sol_lamports: 0,
          pokecoins_delta: bonus,
          metadata: { type: 'level_up', level: newLevel },
          created_at: new Date().toISOString(),
        });
    }
  }

  async updateBattleStats(
    userId: string,
    result: 'WIN' | 'LOSS' | 'DRAW',
    wageredAmount: number,
    battleTime: number // in minutes
  ): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('stats')
      .eq('id', userId)
      .single();

    if (!user) return;

    const stats = user.stats || this.getDefaultStats();

    // Update stats based on result
    switch (result) {
      case 'WIN':
        stats.wins++;
        stats.winStreak++;
        stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.winStreak);
        stats.totalWon += wageredAmount;
        break;
      case 'LOSS':
        stats.losses++;
        stats.winStreak = 0;
        break;
      case 'DRAW':
        stats.draws++;
        stats.winStreak = 0;
        break;
    }

    stats.totalWagered += wageredAmount;
    stats.totalPlayTime += battleTime;

    // Update user
    await supabase
      .from('users')
      .update({
        stats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Check for achievements
    await this.checkAchievements(userId, stats);
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (existing) return; // Already has badge

    // Award badge
    await supabase
      .from('user_badges')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        badge_id: badgeId,
        unlocked_at: new Date().toISOString(),
      });
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<boolean> {
    // Get achievement details
    const { data: achievement } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (!achievement) return false;

    // Check current progress
    const { data: userAchievement } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    const currentProgress = userAchievement?.progress || 0;
    const newProgress = Math.min(currentProgress + progress, achievement.max_progress);
    const completed = newProgress >= achievement.max_progress;

    if (userAchievement) {
      // Update existing
      await supabase
        .from('user_achievements')
        .update({
          progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', userAchievement.id);
    } else {
      // Create new
      await supabase
        .from('user_achievements')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          achievement_id: achievementId,
          progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });
    }

    // Award reward if completed
    if (completed && achievement.reward && !userAchievement?.completed) {
      await this.awardAchievementReward(userId, achievement.reward);
    }

    return completed;
  }

  private async checkAchievements(userId: string, stats: UserStats): Promise<void> {
    // First Win
    if (stats.wins === 1) {
      await this.updateAchievementProgress(userId, 'first-win', 1);
    }

    // Win Streaks
    if (stats.winStreak === 5) {
      await this.updateAchievementProgress(userId, 'win-streak-5', 1);
    }
    if (stats.winStreak === 10) {
      await this.updateAchievementProgress(userId, 'win-streak-10', 1);
    }

    // Total Wins
    if (stats.wins >= 10) {
      await this.updateAchievementProgress(userId, 'wins-10', stats.wins);
    }
    if (stats.wins >= 50) {
      await this.updateAchievementProgress(userId, 'wins-50', stats.wins);
    }

    // High Roller
    if (stats.totalWagered >= 1000000000) { // 1 SOL
      await this.updateAchievementProgress(userId, 'high-roller', 1);
    }
  }

  private async awardAchievementReward(userId: string, reward: number): Promise<void> {
    // Update PokéCoins
    const { data: user } = await supabase
      .from('users')
      .select('pokecoins')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({
          pokecoins: user.pokecoins + reward,
        })
        .eq('id', userId);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          kind: 'ACHIEVEMENT',
          sol_lamports: 0,
          pokecoins_delta: reward,
          metadata: { type: 'achievement_reward' },
          created_at: new Date().toISOString(),
        });
    }
  }

  private getDefaultStats(): UserStats {
    return {
      wins: 0,
      losses: 0,
      draws: 0,
      packsOpened: 0,
      cardsOwned: 0,
      totalWagered: 0,
      totalWon: 0,
      winStreak: 0,
      bestWinStreak: 0,
      totalPlayTime: 0,
    };
  }

  // Utility functions
  getXPForLevel(level: number): number {
    return this.XP_REQUIREMENTS[level - 1] || 0;
  }

  getXPToNextLevel(currentLevel: number, currentXP: number): number {
    if (currentLevel >= this.MAX_LEVEL) return 0;
    const requiredXP = this.XP_REQUIREMENTS[currentLevel];
    return Math.max(0, requiredXP - currentXP);
  }

  getLevelProgress(currentLevel: number, currentXP: number): {
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercent: number;
  } {
    const currentLevelXP = currentLevel > 1 ? this.XP_REQUIREMENTS[currentLevel - 1] : 0;
    const nextLevelXP = this.XP_REQUIREMENTS[currentLevel] || this.XP_REQUIREMENTS[this.MAX_LEVEL - 1];
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const progressPercent = requiredXP > 0 ? (progressXP / requiredXP) * 100 : 100;

    return {
      currentLevelXP,
      nextLevelXP,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
    };
  }
}
