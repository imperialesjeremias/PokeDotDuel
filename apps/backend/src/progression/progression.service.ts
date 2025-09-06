import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class ProgressionService {
  private readonly logger = new Logger(ProgressionService.name);

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
    // TODO: Get user profile from database
    this.logger.log(`Getting profile for user ${userId}`);

    // Mock profile
    return {
      id: userId,
      walletAddress: 'mock-wallet',
      level: 1,
      xp: 0,
      badges: [],
      pokecoins: 1000,
      stats: this.getDefaultStats(),
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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

    // TODO: Update user in database
    this.logger.log(`Awarded ${xpAmount} XP to user ${userId}, new level: ${newLevel}`);

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

    // TODO: Update PokéCoins in database
    this.logger.log(`Awarded level up bonus of ${bonus} PokéCoins to user ${userId}`);
  }

  async updateBattleStats(
    userId: string,
    result: 'WIN' | 'LOSS' | 'DRAW',
    wageredAmount: number,
    battleTime: number // in minutes
  ): Promise<void> {
    // TODO: Get user stats from database
    const stats = this.getDefaultStats();

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

    // TODO: Update user stats in database
    this.logger.log(`Updated battle stats for user ${userId}: ${result}`);

    // Check for achievements
    await this.checkAchievements(userId, stats);
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    // TODO: Check if user already has this badge
    // TODO: Award badge to user
    this.logger.log(`Awarded badge ${badgeId} to user ${userId}`);
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<boolean> {
    // TODO: Get achievement details from database
    // TODO: Update achievement progress
    this.logger.log(`Updated achievement ${achievementId} progress for user ${userId}`);
    return false;
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
    // TODO: Update PokéCoins in database
    this.logger.log(`Awarded achievement reward of ${reward} PokéCoins to user ${userId}`);
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

