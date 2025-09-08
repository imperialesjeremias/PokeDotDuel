'use client';

import { usePrivy } from '@privy-io/react-auth';

// Force dynamic rendering to avoid static generation issues with Privy
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EconomyPanel } from '@/components/EconomyPanel';
import { 
  PokemonStatus, 
  HPBar, 
  EXPBar, 
  StatusWindow, 
  BattleMenu, 
  TypeBadge, 
  PokeballSelector 
} from '@/components/ui/pokemon-battle-ui';
import { 
  Sword, 
  Coins, 
  Package, 
  Trophy, 
  Users, 
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';

interface UserStats {
  wins: number;
  losses: number;
  packsOpened: number;
  cardsOwned: number;
  totalWagered: number;
  totalWon: number;
}

interface User {
  id: string;
  walletAddress: string;
  username: string;
  level: number;
  xp: number;
  pokecoins: number;
  stats: UserStats;
}

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated && user) {
      fetchUserData();
    }
  }, [authenticated, user]);

  const fetchUserData = async () => {
    try {
      // In a real implementation, you would fetch from your API
      // For now, we'll use mock data
      setUserData({
        id: '1',
        walletAddress: user?.wallet?.address || '',
        username: 'PokemonMaster',
        level: 15,
        xp: 2500,
        pokecoins: 5000,
        stats: {
          wins: 45,
          losses: 12,
          packsOpened: 23,
          cardsOwned: 156,
          totalWagered: 2.5,
          totalWon: 3.2,
        },
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!ready || loading) {
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

  const winRate = userData ? (userData.stats.wins / (userData.stats.wins + userData.stats.losses) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-pokemon-red-bg">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pokemon Trainer Status */}
        <div className="mb-8">
          <StatusWindow title="TRAINER STATUS" className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-pixel text-black">
                TRAINER {userData?.username?.toUpperCase()}
              </h1>
              <PokeballSelector count={6} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="battle-ui p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-pixel text-white text-sm">LEVEL</span>
                  <span className="font-pixel text-white text-sm">{userData?.level}</span>
                </div>
                <EXPBar current={userData?.xp || 0} max={3000} />
              </div>
              
              <div className="battle-ui p-3">
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-white text-sm">POKECOINS</span>
                  <span className="font-pixel text-white text-sm">{userData?.pokecoins}</span>
                </div>
              </div>
            </div>
          </StatusWindow>
        </div>

        {/* Pokemon Menu Actions */}
        <div className="mb-8">
          <StatusWindow title="POKEMON MENU">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                className="pokemon-menu-item cursor-pointer p-4 hover:bg-blue-200 transition-colors"
                onClick={() => router.push('/battle')}
              >
                <div className="flex items-center space-x-3">
                  <Sword className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">BATTLE</div>
                    <div className="font-pixel text-gray-600 text-xs">PvP Combat</div>
                  </div>
                </div>
              </div>

              <div 
                className="pokemon-menu-item cursor-pointer p-4 hover:bg-blue-200 transition-colors"
                onClick={() => router.push('/team-builder')}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">POKEMON</div>
                    <div className="font-pixel text-gray-600 text-xs">Team Builder</div>
                  </div>
                </div>
              </div>

              <div 
                className="pokemon-menu-item cursor-pointer p-4 hover:bg-blue-200 transition-colors"
                onClick={() => router.push('/packs')}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">PACK</div>
                    <div className="font-pixel text-gray-600 text-xs">Booster Packs</div>
                  </div>
                </div>
              </div>

              <div 
                className="pokemon-menu-item cursor-pointer p-4 hover:bg-blue-200 transition-colors"
                onClick={() => router.push('/marketplace')}
              >
                <div className="flex items-center space-x-3">
                  <Coins className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">TRADE</div>
                    <div className="font-pixel text-gray-600 text-xs">Marketplace</div>
                  </div>
                </div>
              </div>
            </div>
          </StatusWindow>
        </div>

        {/* Battle Stats */}
        <div className="mb-8">
          <StatusWindow title="BATTLE RECORD">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="battle-ui p-3 text-center">
                <div className="font-pixel text-white text-lg">{userData?.stats.wins}</div>
                <div className="font-pixel text-white text-xs">WINS</div>
              </div>
              <div className="battle-ui p-3 text-center">
                <div className="font-pixel text-white text-lg">{userData?.stats.losses}</div>
                <div className="font-pixel text-white text-xs">LOSSES</div>
              </div>
              <div className="battle-ui p-3 text-center">
                <div className="font-pixel text-white text-lg">{winRate}%</div>
                <div className="font-pixel text-white text-xs">WIN RATE</div>
              </div>
              <div className="battle-ui p-3 text-center">
                <div className="font-pixel text-white text-lg">{userData?.stats.cardsOwned}</div>
                <div className="font-pixel text-white text-xs">POKEMON</div>
              </div>
            </div>
          </StatusWindow>
        </div>

        {/* Pokemon Collection */}
        <div className="mb-8">
          <StatusWindow title="POKEMON COLLECTION">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="battle-ui p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-white text-sm">TOTAL POKEMON</span>
                  <div className="pokeball w-6 h-6" />
                </div>
                <div className="font-pixel text-white text-2xl">{userData?.stats.cardsOwned}</div>
              </div>
              
              <div className="battle-ui p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-white text-sm">PACKS OPENED</span>
                  <div className="pokeball w-6 h-6" />
                </div>
                <div className="font-pixel text-white text-2xl">{userData?.stats.packsOpened}</div>
              </div>
              
              <div className="battle-ui p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-white text-sm">SOL EARNED</span>
                  <div className="pokeball w-6 h-6" />
                </div>
                <div className="font-pixel text-white text-2xl">{userData?.stats.totalWon}</div>
              </div>
            </div>
          </StatusWindow>
        </div>

        {/* Pokemon Activity Log */}
        <StatusWindow title="ACTIVITY LOG">
          <div className="space-y-3">
            <div className="pokemon-menu-item p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">BATTLE WON vs PIKACHUMASTER</div>
                    <div className="font-pixel text-gray-600 text-xs">2 HOURS AGO • +0.1 SOL</div>
                  </div>
                </div>
                <TypeBadge type="victory" className="bg-orange-600" />
              </div>
            </div>
            
            <div className="pokemon-menu-item p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">BOOSTER PACK OPENED</div>
                    <div className="font-pixel text-gray-600 text-xs">4 HOURS AGO • CHARIZARD FOUND</div>
                  </div>
                </div>
                <TypeBadge type="fire" />
              </div>
            </div>
            
            <div className="pokemon-menu-item p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Coins className="w-6 h-6 text-yellow-600" />
                  <div>
                    <div className="font-pixel text-black text-sm">POKEMON TRADED</div>
                    <div className="font-pixel text-gray-600 text-xs">1 DAY AGO • BLASTOISE • +0.05 SOL</div>
                  </div>
                </div>
                <TypeBadge type="water" />
              </div>
            </div>
          </div>
        </StatusWindow>
      </div>
    </div>
  );
}
