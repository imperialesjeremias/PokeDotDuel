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
import { PackOpener } from '@/components/PackOpener';
import { 
  Package, 
  Coins,
  Star,
  Zap,
  Gift,
  ShoppingCart
} from 'lucide-react';

interface Pack {
  id: string;
  buyerId: string;
  opened: boolean;
  createdAt: string;
}

import { PackReward } from '../../types/shared';

export default function PacksPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingPack, setOpeningPack] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      fetchPacks();
    }
  }, [authenticated]);

  const fetchPacks = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setPacks([
        {
          id: 'pack1',
          buyerId: 'user1',
          opened: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pack2',
          buyerId: 'user1',
          opened: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'pack3',
          buyerId: 'user1',
          opened: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const buyPack = async () => {
    try {
      // In a real implementation, this would:
      // 1. Create a transaction on Solana
      // 2. Call the packs API
      // 3. Update the packs list
      
      const newPack: Pack = {
        id: `pack_${Date.now()}`,
        buyerId: 'user1',
        opened: false,
        createdAt: new Date().toISOString(),
      };
      
      setPacks(prev => [newPack, ...prev]);
    } catch (error) {
      console.error('Error buying pack:', error);
    }
  };

  const openPack = async (packId: string) => {
    try {
      setOpeningPack(packId);
      
      // Simulate pack opening animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would call the API to open the pack
      setPacks(prev => prev.map(pack => 
        pack.id === packId ? { ...pack, opened: true } : pack
      ));
    } catch (error) {
      console.error('Error opening pack:', error);
    } finally {
      setOpeningPack(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return 'bg-gray-100 text-gray-800';
      case 'RARE':
        return 'bg-blue-100 text-blue-800';
      case 'LEGENDARY':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const unopenedPacks = packs.filter(pack => !pack.opened);
  const openedPacks = packs.filter(pack => pack.opened);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booster Packs
          </h1>
          <p className="text-gray-600">
            Buy packs with SOL and discover rare cards
          </p>
        </div>

        {/* Pack Purchase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-600" />
              Buy Booster Pack
            </CardTitle>
            <CardDescription>
              Each pack contains 5 random cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Coins className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">0.1 SOL</span>
                </div>
                <p className="text-sm text-gray-600">
                  Odds: 80% Common, 18% Rare, 2% Legendary
                </p>
                <p className="text-sm text-gray-600">
                  + 1/128 Shiny chance per card
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={buyPack}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Pack
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unopened Packs */}
        {unopenedPacks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-yellow-600" />
              Unopened Packs ({unopenedPacks.length})
            </CardTitle>
            <CardDescription>
              Click on a pack to open it
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unopenedPacks.map(pack => (
                  <div
                    key={pack.id}
                    className="relative group cursor-pointer"
                    onClick={() => openPack(pack.id)}
                  >
                    <div className={`pack-container ${openingPack === pack.id ? 'opening' : ''}`}>
                      <div className="pack-card bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-center">
                        {openingPack === pack.id ? (
                          <div className="animate-pulse">
                            <Zap className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
                            <p className="text-white font-semibold">Opening...</p>
                          </div>
                        ) : (
                          <>
                            <Package className="w-16 h-16 text-white mx-auto mb-4" />
                            <h3 className="text-white font-bold text-lg mb-2">Booster Pack</h3>
                            <p className="text-white text-sm">5 Cards</p>
                            <div className="mt-4 flex justify-center">
                              <Button 
                                size="sm" 
                                className="bg-white text-orange-600 hover:bg-gray-100 mx-auto"
                              >
                                Open Pack
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pack History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              Pack History
            </CardTitle>
            <CardDescription>
              Your opened packs and rewards obtained
            </CardDescription>
          </CardHeader>
          <CardContent>
            {openedPacks.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't opened any packs yet</p>
                <Button onClick={buyPack}>
                  Buy First Pack
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {openedPacks.map(pack => (
                  <div
                    key={pack.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-900">
                          Pack #{pack.id.slice(-6)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(pack.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Mock rewards - in real implementation, fetch from API */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { name: 'Bulbasaur', rarity: 'COMMON', isShiny: false },
                        { name: 'Charmander', rarity: 'RARE', isShiny: true },
                        { name: 'Squirtle', rarity: 'COMMON', isShiny: false },
                        { name: 'Pikachu', rarity: 'RARE', isShiny: false },
                        { name: 'Mewtwo', rarity: 'LEGENDARY', isShiny: false },
                      ].map((reward, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white border border-gray-200 rounded text-center"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900">
                              {reward.name}
                            </span>
                            {reward.isShiny && (
                              <Star className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          <Badge className={`text-xs ${getRarityColor(reward.rarity)}`}>
                            {reward.rarity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pack Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-500" />
                Purchased Packs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {packs.length}
              </div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-500" />
                Shiny Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(packs.length * 5 * 0.0078)} {/* 1/128 chance */}
              </div>
              <p className="text-sm text-gray-600">Total cards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-500" />
                Spent SOL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(packs.length * 0.1).toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">In all packs</p>
            </CardContent>
          </Card>
        </div>

        {/* Pack Opener Component */}
        <div className="mt-8">
          <PackOpener />
        </div>
      </div>
    </div>
  );
}
