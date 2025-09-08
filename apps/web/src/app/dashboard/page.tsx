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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const winRate = userData ? (userData.stats.wins / (userData.stats.wins + userData.stats.losses) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {userData?.username}!
          </h1>
          <p className="text-gray-600">
            Nivel {userData?.level} • {userData?.xp} XP • {userData?.pokecoins} PokéCoins
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/battle')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <Sword className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Batalla PvP</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Combate por turnos con apuestas en SOL
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/team-builder')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Team Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Construye y optimiza tu equipo
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/packs')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">Booster Packs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compra packs con SOL
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/marketplace')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compra y vende cartas
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Estadísticas de Batalla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Victorias</span>
                  <span className="font-semibold text-green-600">{userData?.stats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Derrotas</span>
                  <span className="font-semibold text-red-600">{userData?.stats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de Victoria</span>
                  <span className="font-semibold">{winRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-500" />
                Economía
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">PokéCoins</span>
                  <span className="font-semibold">{userData?.pokecoins.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Apostado</span>
                  <span className="font-semibold">{userData?.stats.totalWagered} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ganado</span>
                  <span className="font-semibold text-green-600">{userData?.stats.totalWon} SOL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-500" />
                Colección
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cartas</span>
                  <span className="font-semibold">{userData?.stats.cardsOwned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packs Abiertos</span>
                  <span className="font-semibold">{userData?.stats.packsOpened}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel</span>
                  <span className="font-semibold">{userData?.level}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Tus últimas batallas y transacciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Victoria contra PikachuMaster</p>
                    <p className="text-sm text-gray-600">Hace 2 horas • +0.1 SOL</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Victoria</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Pack abierto</p>
                    <p className="text-sm text-gray-600">Hace 4 horas • Charizard Raro</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Pack</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium">Carta vendida</p>
                    <p className="text-sm text-gray-600">Hace 1 día • Blastoise • +0.05 SOL</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Venta</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Economy Panel */}
        <div className="mt-8">
          <EconomyPanel />
        </div>
      </div>
    </div>
  );
}
