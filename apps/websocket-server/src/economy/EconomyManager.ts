import { supabase } from '../../lib/supabase';

export interface PokecoinsTransaction {
  id: string;
  userId: string;
  amount: number; // Positive for earnings, negative for spending
  reason: 'BATTLE_WIN' | 'BATTLE_LOSS' | 'PACK_PURCHASE' | 'CARD_SALE' | 'DAILY_BONUS' | 'ACHIEVEMENT';
  referenceId?: string; // Battle ID, pack ID, etc.
  createdAt: Date;
}

export class EconomyManager {
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
    const { data, error } = await supabase
      .from('users')
      .select('pokecoins')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.pokecoins || 0;
  }

  async awardBattleReward(
    userId: string,
    battleId: string,
    result: 'WIN' | 'LOSS' | 'DRAW'
  ): Promise<number> {
    const reward = this.BATTLE_REWARDS[result];

    // Update user balance
    const { data: user } = await supabase
      .from('users')
      .select('pokecoins')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('User not found');

    const newBalance = user.pokecoins + reward;

    await supabase
      .from('users')
      .update({ pokecoins: newBalance })
      .eq('id', userId);

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        kind: 'PACK_REWARD',
        sol_lamports: 0,
        pokecoins_delta: reward,
        ref_id: battleId,
        metadata: { result, type: 'battle_reward' },
        created_at: new Date().toISOString(),
      });

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

    // Update balance
    await supabase
      .from('users')
      .update({ pokecoins: newBalance })
      .eq('id', userId);

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        kind: 'PACK_PURCHASE', // Could be more specific based on reason
        sol_lamports: 0,
        pokecoins_delta: -amount,
        ref_id: referenceId,
        metadata: { reason, type: 'spending' },
        created_at: new Date().toISOString(),
      });

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

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyPurchases } = await supabase
      .from('transactions')
      .select('pokecoins_delta')
      .eq('user_id', userId)
      .eq('kind', 'BUY_POKECOINS')
      .gte('created_at', `${today}T00:00:00.000Z`);

    const dailyTotal = dailyPurchases?.reduce((sum, tx) => sum + Math.abs(tx.pokecoins_delta), 0) || 0;

    if (dailyTotal + pokecoinsToReceive > this.MAX_DAILY_PURCHASE) {
      throw new Error(`Daily purchase limit exceeded. Max: ${this.MAX_DAILY_PURCHASE} PokéCoins`);
    }

    // Get current balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + pokecoinsToReceive;

    // Update balance
    await supabase
      .from('users')
      .update({ pokecoins: newBalance })
      .eq('id', userId);

    // Record transaction
    const transactionId = crypto.randomUUID();
    await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        user_id: userId,
        kind: 'BUY_POKECOINS',
        sol_lamports: solAmount,
        pokecoins_delta: pokecoinsToReceive,
        metadata: { exchange_rate: this.POKECOINS_PER_SOL },
        created_at: new Date().toISOString(),
      });

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
    // Get user's last login
    const { data: user } = await supabase
      .from('users')
      .select('last_daily_bonus, daily_streak, pokecoins')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastBonus = user.last_daily_bonus ? new Date(user.last_daily_bonus) : null;
    let streak = user.daily_streak || 0;

    // Check if bonus already claimed today
    if (lastBonus) {
      const lastBonusDate = lastBonus.toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      if (lastBonusDate === today) {
        throw new Error('Daily bonus already claimed today');
      }

      // Check if streak continues
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastBonusDate === yesterdayStr) {
        streak += 1;
      } else {
        streak = 1; // Reset streak
      }
    } else {
      streak = 1; // First time
    }

    // Calculate bonus with streak multiplier
    const baseBonus = this.DAILY_BONUS.BASE_AMOUNT;
    const streakMultiplier = Math.min(streak, this.DAILY_BONUS.MAX_STREAK_DAYS) * 0.1;
    const totalMultiplier = 1 + streakMultiplier;
    const bonus = Math.floor(baseBonus * totalMultiplier);

    // Update user
    const newBalance = user.pokecoins + bonus;
    await supabase
      .from('users')
      .update({
        pokecoins: newBalance,
        last_daily_bonus: now.toISOString(),
        daily_streak: streak,
      })
      .eq('id', userId);

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        kind: 'DAILY_BONUS',
        sol_lamports: 0,
        pokecoins_delta: bonus,
        metadata: { streak, multiplier: totalMultiplier },
        created_at: now.toISOString(),
      });

    return { bonus, streak, newBalance };
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async awardAchievementReward(
    userId: string,
    achievementId: string,
    reward: number
  ): Promise<number> {
    // Update user balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + reward;

    await supabase
      .from('users')
      .update({ pokecoins: newBalance })
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
        ref_id: achievementId,
        metadata: { achievement: achievementId },
        created_at: new Date().toISOString(),
      });

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
