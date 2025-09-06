'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Wallet,
  Trophy,
  Coins,
  Package,
  Star,
  Edit3,
  Save,
  X,
  Crown,
  Zap,
  Target
} from 'lucide-react';

interface UserProfile {
  id: string;
  walletAddress: string;
  username: string;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
      return;
    }

    if (authenticated) {
      fetchProfile();
    }
  }, [ready, authenticated, router]);

  const fetchProfile = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setNewUsername(data.user.username || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;

    setSaving(true);
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, username: data.user.username } : null);
        setEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Error updating username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Error updating username');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu cuenta y ve tus estadísticas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Ingresa tu nombre de usuario"
                            maxLength={20}
                          />
                          <Button
                            size="sm"
                            onClick={handleUpdateUsername}
                            disabled={saving || !newUsername.trim()}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditing(false);
                              setNewUsername(profile?.username || '');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold">
                          {profile?.username || 'Sin nombre'}
                        </h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(true)}
                          className="mt-1"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {user?.wallet?.address ?
                        `${user.wallet.address.slice(0, 8)}...${user.wallet.address.slice(-6)}` :
                        'Wallet no conectada'
                      }
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      Nivel {profile?.level || 1}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
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
                  Progreso de Nivel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nivel {profile?.level || 1}</span>
                    <span>{profile?.xp || 0} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {Math.round(getLevelProgress())}% completado para el siguiente nivel
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Battle Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Estadísticas de Batalla
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile?.stats.wins || 0}</div>
                    <div className="text-sm text-gray-600">Victorias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{profile?.stats.losses || 0}</div>
                    <div className="text-sm text-gray-600">Derrotas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{getWinRate()}%</div>
                    <div className="text-sm text-gray-600">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {((profile?.stats.wins || 0) + (profile?.stats.losses || 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collection Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Colección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{profile?.stats.packsOpened || 0}</div>
                    <div className="text-sm text-gray-600">Packs Abiertos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{profile?.stats.cardsOwned || 0}</div>
                    <div className="text-sm text-gray-600">Cartas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{profile?.pokecoins || 0}</div>
                    <div className="text-sm text-gray-600">PokéCoins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Economy Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Economía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(profile?.stats.totalWagered || 0) / 1_000_000_000} SOL
                    </div>
                    <div className="text-sm text-gray-600">Total Apostado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(profile?.stats.totalWon || 0) / 1_000_000_000} SOL
                    </div>
                    <div className="text-sm text-gray-600">Total Ganado</div>
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
