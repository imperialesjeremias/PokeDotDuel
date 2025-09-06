import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface PokecoinsTransaction {
  id: string;
  userId: string;
  amount: number; // Positive for earnings, negative for spending
  reason: 'BATTLE_WIN' | 'BATTLE_LOSS' | 'PACK_PURCHASE' | 'CARD_SALE' | 'DAILY_BONUS' | 'ACHIEVEMENT';
  referenceId?: string; // Battle ID, pack ID, etc.
  createdAt: Date;
}

@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);

  private readonly POKECOINS_PER_SOL = 10000; // 1 SOL = 10,000 PokéCoins
  private readonly MIN_POKECOINS_PURCHASE = 1000; // Minimum purchase
  private readonly MAX_DAILY_PURCHASE = 50000; // Maximum daily purchase per user

  // PokéCoins rewards
  private readonly BATTLE_REWARDS = {
    WIN: 500,
    LOSS: 100,
    DRAW: 250,
  };

  private readonly PACK_REWARDS = {
    OPEN_PACK: 50, // Bonus for opening packs
  };

  private readonly DAILY_BONUS = {
    STREAK_MULTIPLIER: 1.5, // Multiplier for consecutive days
    MAX_STREAK_DAYS: 30,
    BASE_AMOUNT: 100,
  };

  async getUserBalance(userId: string): Promise<number> {
    // TODO: Get user balance from database
    this.logger.log(`Getting balance for user ${userId}`);
    return 1000; // Mock balance
  }

  async awardBattleReward(
    userId: string,
    battleId: string,
    result: 'WIN' | 'LOSS' | 'DRAW'
  ): Promise<number> {
    const reward = this.BATTLE_REWARDS[result];
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + reward;

    // TODO: Update user balance in database
    this.logger.log(`Awarded ${reward} PokéCoins to user ${userId} for battle ${battleId}`);

    // TODO: Record transaction in database

    return newBalance;
  }

  async spendPokecoins(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string
  ): Promise<number> {
    if (amount <= 0) throw new Error('Amount must be positive');

    // Check balance
    const currentBalance = await this.getUserBalance(userId);
    if (currentBalance < amount) {
      throw new Error('Insufficient PokéCoins balance');
    }

    const newBalance = currentBalance - amount;

    // TODO: Update balance in database
    this.logger.log(`User ${userId} spent ${amount} PokéCoins for ${reason}`);

    // TODO: Record transaction in database

    return newBalance;
  }

  async buyPokecoinsWithSol(
    userId: string,
    solAmount: number // In lamports
  ): Promise<{
    pokecoinsReceived: number;
    newBalance: number;
    transactionId: string;
  }> {
    // Validate minimum purchase
    const solInSol = solAmount / 1_000_000_000;
    const pokecoinsToReceive = Math.floor(solInSol * this.POKECOINS_PER_SOL);

    if (pokecoinsToReceive < this.MIN_POKECOINS_PURCHASE) {
      throw new Error(`Minimum purchase is ${this.MIN_POKECOINS_PURCHASE} PokéCoins`);
    }

    // TODO: Check daily limit from database

    // Get current balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + pokecoinsToReceive;

    // TODO: Update balance in database

    // Record transaction
    const transactionId = uuidv4();

    // TODO: Save transaction to database

    this.logger.log(`User ${userId} bought ${pokecoinsToReceive} PokéCoins for ${solInSol} SOL`);

    return {
      pokecoinsReceived: pokecoinsToReceive,
      newBalance,
      transactionId,
    };
  }

  async awardDailyBonus(userId: string): Promise<{
    bonus: number;
    streak: number;
    newBalance: number;
  }> {
    // TODO: Get user's last login from database
    const now = new Date();
    let streak = 1; // Mock streak

    // Calculate bonus with streak multiplier
    const baseBonus = this.DAILY_BONUS.BASE_AMOUNT;
    const streakMultiplier = Math.min(streak, this.DAILY_BONUS.MAX_STREAK_DAYS) * 0.1;
    const totalMultiplier = 1 + streakMultiplier;
    const bonus = Math.floor(baseBonus * totalMultiplier);

    // Update user
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + bonus;

    // TODO: Update user in database

    // TODO: Record transaction in database

    this.logger.log(`Awarded daily bonus of ${bonus} PokéCoins to user ${userId}`);

    return { bonus, streak, newBalance };
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    // TODO: Get transaction history from database
    this.logger.log(`Getting transaction history for user ${userId}`);
    return [];
  }

  async awardAchievementReward(
    userId: string,
    achievementId: string,
    reward: number
  ): Promise<number> {
    // Update user balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + reward;

    // TODO: Update balance in database
    this.logger.log(`Awarded achievement reward of ${reward} PokéCoins to user ${userId}`);

    // TODO: Record transaction in database

    return newBalance;
  }

  // Utility functions
  solToPokecoins(solAmount: number): number {
    return Math.floor(solAmount * this.POKECOINS_PER_SOL);
  }

  pokecoinsToSol(pokecoinsAmount: number): number {
    return pokecoinsAmount / this.POKECOINS_PER_SOL;
  }

  async getExchangeRate(): Promise<{
    pokecoinsPerSol: number;
    solPerPokecoin: number;
  }> {
    return {
      pokecoinsPerSol: this.POKECOINS_PER_SOL,
      solPerPokecoin: 1 / this.POKECOINS_PER_SOL,
    };
  }
}

