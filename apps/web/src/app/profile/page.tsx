'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { initializeBackground } from '@/utils/backgroundManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useUserStats } from '@/hooks/useUser';
import {
  User,
  Wallet,
  Trophy,
  Coins,
  Package,
  Star,
  Crown,
  Zap,
  Target
} from 'lucide-react';

interface UserProfile {
  id: string;
  walletAddress: string;
  level: number;
  xp: number;
  pokecoins: number;
  badges: any[];
  stats: {
    wins: number;
    losses: number;
    packsOpened: number;
    cardsOwned: number;
    totalWagered: number;
    totalWon: number;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const router = useRouter();
  const { user: profile, loading: profileLoading, error: profileError, refetch } = useUser();
  const userStats = useUserStats(profile);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
      return;
    }

    if (ready) {
      // Initialize background system for authenticated users
      initializeBackground();
      setIsLoading(false);
    }
  }, [ready, authenticated, router]);





  const getWinRate = () => {
    if (!profile) return 0;
    const total = profile.stats.wins + profile.stats.losses;
    return total > 0 ? Math.round((profile.stats.wins / total) * 100) : 0;
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    // Simple XP calculation - adjust based on your game mechanics
    const xpForNextLevel = profile.level * 1000;
    const currentLevelXP = (profile.level - 1) * 1000;
    const progress = ((profile.xp - currentLevelXP) / (xpForNextLevel - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!ready || isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600">
        <div className="w-32 h-32 border-8 border-orange-800 bg-orange-400 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-900 animate-pixel-step"></div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and view your statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profile?.walletAddress ? 
                          `${profile.walletAddress.slice(0, 8)}...${profile.walletAddress.slice(-6)}` : 
                          'Wallet not connected'
                        }
                      </h3>
                      <p className="text-sm text-gray-500">Wallet Address</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user?.wallet?.address ?
                        `${user.wallet.address.slice(0, 8)}...${user.wallet.address.slice(-6)}` :
                        'Wallet not connected'
                      }
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Level {profile?.level || 1}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {profile?.xp || 0} XP
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level {profile?.level || 1}</span>
                    <span>{profile?.xp || 0} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {Math.round(getLevelProgress())}% completed to next level
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Battle Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Battle Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile?.stats.wins || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{profile?.stats.losses || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{getWinRate()}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(profile?.stats.wins || 0) + (profile?.stats.losses || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collection Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile?.stats.packs_opened || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Packs Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{profile?.stats.cards_owned || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{profile?.pokecoins || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">PokéCoins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Economy Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Economy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(profile?.stats.total_wagered || 0) / 1_000_000_000} SOL
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Wagered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(profile?.stats.total_won || 0) / 1_000_000_000} SOL
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Won</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
