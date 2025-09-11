import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export interface UserStats {
  wins: number;
  losses: number;
  packs_opened: number;
  cards_owned: number;
  total_wagered: number;
  total_won: number;
}

export interface User {
  id: string;
  walletAddress: string;
  generatedWalletAddress?: string;
  level: number;
  xp: number;
  badges: string[];
  pokecoins: number;
  solBalance: number;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const { user: privyUser, authenticated } = usePrivy();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!authenticated || !privyUser?.wallet?.address) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/user/by-wallet?wallet=${encodeURIComponent(privyUser.wallet.address)}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else if (response.status === 404) {
        // User doesn't exist yet
        setUser(null);
        setError('User not found. Please create an account.');
      } else {
        setError(data.error || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!authenticated || !privyUser?.wallet?.address) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/by-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: privyUser.wallet.address,
  
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [authenticated, privyUser?.wallet?.address]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    createUser,
  };
}

// Hook para obtener estadísticas calculadas del usuario
export function useUserStats(user: User | null) {
  if (!user) return null;

  const winRate = user.stats.wins + user.stats.losses > 0 
    ? (user.stats.wins / (user.stats.wins + user.stats.losses)) * 100 
    : 0;

  const netWinnings = user.stats.total_won - user.stats.total_wagered;
  
  const xpToNextLevel = user.level * 1000; // Assuming 1000 XP per level
  const xpProgress = (user.xp % 1000) / 1000 * 100; // Progress to next level

  return {
    winRate: Math.round(winRate * 100) / 100,
    netWinnings,
    xpToNextLevel,
    xpProgress: Math.round(xpProgress * 100) / 100,
    totalGames: user.stats.wins + user.stats.losses,
  };
}