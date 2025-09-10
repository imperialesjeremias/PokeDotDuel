'use client';

import { usePrivy } from '@privy-io/react-auth';

// Force dynamic rendering to avoid static generation issues with Privy
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { initializeBackground } from '@/utils/backgroundManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackOpener } from '@/components/PackOpener';
import { PokemonDataUtil } from '@/lib/pokemon-data';
import { TypeGen1 } from '@pokebattle/shared';
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

interface PackReward {
  name: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  isShiny: boolean;
  dexNumber: number;
  level: number;
  types: TypeGen1[];
}

export default function PacksPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingPack, setOpeningPack] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    } else if (authenticated) {
      // Initialize background system for authenticated users
      initializeBackground();
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



  const getTypeColor = (type: TypeGen1) => {
    const colors: Record<TypeGen1, string> = {
      'NORMAL': 'bg-gray-500 text-white',
      'FIRE': 'bg-red-500 text-white',
      'WATER': 'bg-blue-500 text-white',
      'ELECTRIC': 'bg-yellow-500 text-black dark:text-gray-900',
      'GRASS': 'bg-green-500 text-white',
      'ICE': 'bg-blue-200 text-gray-900',
      'FIGHTING': 'bg-red-700 text-white',
      'POISON': 'bg-purple-600 text-white',
      'GROUND': 'bg-yellow-600 text-white',
      'FLYING': 'bg-indigo-400 text-white',
      'PSYCHIC': 'bg-purple-500 text-white',
      'BUG': 'bg-green-400 text-gray-900',
      'ROCK': 'bg-yellow-800 text-white',
      'GHOST': 'bg-purple-700 text-white',
      'DRAGON': 'bg-indigo-700 text-white',
    };
    return colors[type] || 'bg-gray-500 text-white';
  };

  const generatePackRewards = (): PackReward[] => {
    const allPokemon = PokemonDataUtil.getAllPokemon();
    const rewards: PackReward[] = [];
    
    for (let i = 0; i < 5; i++) {
      const randomPokemon = allPokemon[Math.floor(Math.random() * allPokemon.length)];
      const isShiny = Math.random() < 0.15; // 15% chance for shiny
      const level = Math.floor(Math.random() * 80) + 20; // Level 20-100
      
      // Determine rarity based on Pokemon class
      const cardClass = PokemonDataUtil.getPokemonCardClass(randomPokemon);
      let rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
      switch (cardClass) {
        case 'legendary':
          rarity = 'LEGENDARY';
          break;
        case 'rare':
          rarity = 'RARE';
          break;
        default:
          rarity = 'COMMON';
          break;
      }
      
      rewards.push({
        name: randomPokemon.name,
        rarity,
        isShiny,
        dexNumber: randomPokemon.dexNumber,
        level,
        types: randomPokemon.types,
      });
    }
    
    return rewards;
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
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booster Packs
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Buy packs with SOL and discover rare cards
          </p>
        </div>

        {/* Pack Purchase */}
        <Card className="mb-8 border-2 border-orange-200 dark:border-orange-800">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <Package className="w-6 h-6 mr-2" />
              Buy Booster Pack
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-300">
              Each pack contains 5 random Pokemon cards with a chance for rare and shiny variants
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-200 dark:from-orange-900/30 dark:via-yellow-900/30 dark:to-orange-800/30 rounded-xl border-2 border-orange-300 dark:border-orange-700">
              <div className="flex items-center">
                <div className="relative">
                  <Package className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-800" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold font-pixel text-gray-900 dark:text-white mb-1">BOOSTER PACK</h3>
                  <p className="text-gray-700 dark:text-gray-300 font-pixel text-sm">5 RANDOM CARDS • RARE CHANCE</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge className="bg-green-100 text-green-800 font-pixel text-xs">COMMON</Badge>
                    <Badge className="bg-blue-100 text-blue-800 font-pixel text-xs">RARE</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 font-pixel text-xs">LEGENDARY</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-pixel">
                      ODDS: 80% COMMON, 18% RARE, 2% LEGENDARY
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-pixel">
                      + 1/128 SHINY CHANCE PER CARD
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-3">
                  <Coins className="w-6 h-6 text-yellow-500 mr-2" />
                  <span className="text-3xl font-bold font-pixel text-gray-900 dark:text-white">0.1 SOL</span>
                </div>
                <Button 
                  size="lg" 
                  onClick={buyPack}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-pixel text-lg px-8 py-3 border-2 border-orange-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  BUY PACK
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unopened Packs */}
        {unopenedPacks.length > 0 && (
          <Card className="mb-8 border-2 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
              <Package className="w-6 h-6 mr-2" />
              Unopened Packs ({unopenedPacks.length})
            </CardTitle>
            <CardDescription className="text-yellow-600 dark:text-yellow-300">
              Click on a pack to open it and discover your Pokemon cards
            </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {unopenedPacks.map(pack => (
                  <div
                    key={pack.id}
                    className="relative group cursor-pointer transform hover:scale-105 transition-transform duration-200"
                    onClick={() => openPack(pack.id)}
                  >
                    <div className={`pack-container ${openingPack === pack.id ? 'opening' : ''}`}>
                      <div className="pack-card bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-xl shadow-xl border-4 border-yellow-600 p-6 text-center hover:shadow-2xl transition-shadow">
                        {openingPack === pack.id ? (
                          <div className="animate-pulse">
                            <Zap className="w-16 h-16 text-white mx-auto mb-4 animate-spin" />
                            <p className="text-white font-bold font-pixel text-lg">OPENING...</p>
                            <div className="mt-2 flex justify-center space-x-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="relative mb-4">
                              <Package className="w-20 h-20 text-white mx-auto drop-shadow-lg" />
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center border-2 border-yellow-600">
                                <Gift className="w-4 h-4 text-yellow-800" />
                              </div>
                            </div>
                            <h3 className="text-white font-bold font-pixel text-xl mb-2 drop-shadow-md">BOOSTER PACK</h3>
                            <p className="text-yellow-100 font-pixel text-sm mb-4">5 RANDOM CARDS</p>
                            <div className="flex justify-center space-x-1 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-3 h-4 bg-white rounded-sm opacity-80"></div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-center">
                              <Button 
                                size="sm" 
                                className="bg-white text-orange-600 hover:bg-yellow-100 font-pixel font-bold border-2 border-orange-600 shadow-lg hover:shadow-xl transition-all"
                              >
                                OPEN PACK
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
                <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't opened any packs yet</p>
                <Button onClick={buyPack}>
                  Buy First Pack
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {openedPacks.map(pack => (
                  <div
                    key={pack.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Pack #{pack.id.slice(-6)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(pack.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Pack rewards with marketplace-style cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {generatePackRewards().map((reward, index) => (
                        <div key={index} className="relative">
                          <div className="w-full h-44 bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 p-4 relative overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Pokemon Sprite */}
                            <div className="absolute top-6 right-2 w-20 h-20">
                              <img 
                                src={PokemonDataUtil.getSpriteUrl(reward.dexNumber)}
                                alt={reward.name}
                                className="w-full h-full object-contain pixelated"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>
                            
                            {/* Pokemon Name */}
                            <div className="mb-3">
                              <span className={`text-lg font-bold font-pixel ${
                                reward.isShiny 
                                  ? 'text-yellow-500 dark:text-yellow-400' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {reward.name}
                              </span>
                            </div>
                            
                            {/* Types Stacked Vertically - Left Aligned */}
                            <div className="flex flex-col gap-1 mb-3 items-start">
                              {reward.types.map(type => (
                                <span
                                  key={type}
                                  className={`text-xs font-pixel px-2 py-1 rounded ${getTypeColor(type)}`}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                            
                            {/* Rarity in bottom left corner */}
                            <div className="absolute bottom-2 left-2">
                              <Badge className={`text-sm font-pixel border border-black ${getRarityColor(reward.rarity)}`} style={{fontSize: '12px', padding: '4px 8px'}}>
                                {reward.rarity}
                              </Badge>
                            </div>
                            
                            {/* Level in bottom right corner */}
                            <div className="absolute bottom-2 right-2">
                              <div className="bg-orange-500 text-white px-2 py-1 rounded border-2 border-black">
                                <span className="text-xs font-pixel">
                                  LV.{reward.level}
                                </span>
                              </div>
                            </div>
                            
                            {/* Shiny indicator */}
                            {reward.isShiny && (
                              <div className="absolute top-2 left-2">
                                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded border-2 border-yellow-600">
                                  <span className="text-xs font-pixel">
                                    ✨ SHINY
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {packs.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(packs.length * 5 * 0.0078)} {/* 1/128 chance */}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total cards</p>
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(packs.length * 0.1).toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">In all packs</p>
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
