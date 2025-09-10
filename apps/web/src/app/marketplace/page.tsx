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
import { 
  TrendingUp, 
  Filter, 
  Search,
  Star,
  Coins,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { PokemonDataUtil, PokemonEntry } from '@/lib/pokemon-data';
import { TypeGen1 } from '@pokebattle/shared';

interface Listing {
  id: string;
  priceLamports: number;
  status: string;
  createdAt: string;
  card: {
    id: string;
    dexNumber: number;
    name: string;
    isShiny: boolean;
    rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
    level: number;
    stats: {
      hp: number;
      atk: number;
      def: number;
      spa: number;
      spd: number;
      spe: number;
    };
    types: TypeGen1[];
  };
}

export default function MarketplacePage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rarity: '',
    minPrice: '',
    maxPrice: '',
    isShiny: '',
  });

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
      fetchListings();
    }
  }, [authenticated, filters]);

  const fetchListings = async () => {
    try {
      // Generate dynamic listings from Pokemon data
      const allPokemon = PokemonDataUtil.getAllPokemon();
      const generatedListings: Listing[] = [];
      
      // Create multiple listings with different variations
      allPokemon.forEach((pokemon, index) => {
        // Generate 1-3 listings per Pokemon with different levels and shiny status
        const numListings = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numListings; i++) {
          const isShiny = Math.random() < 0.15; // 15% chance for shiny
          const level = Math.floor(Math.random() * 80) + 20; // Level 20-100
          const cardClass = PokemonDataUtil.getPokemonCardClass(pokemon);
          
          // Convert card class to rarity
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
          
          // Calculate price based on rarity, level, and shiny status
          let basePrice = 1000000; // 0.001 SOL base
          if (rarity === 'RARE') basePrice *= 5;
          if (rarity === 'LEGENDARY') basePrice *= 15;
          if (isShiny) basePrice *= 4;
          basePrice += (level - 20) * 50000; // Add for higher levels
          
          const listing: Listing = {
            id: `${pokemon.dexNumber}-${i}`,
            priceLamports: Math.floor(basePrice + (Math.random() * basePrice * 0.3)), // ±30% variation
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
            card: {
              id: `card-${pokemon.dexNumber}-${i}`,
              dexNumber: pokemon.dexNumber,
              name: pokemon.name,
              isShiny,
              rarity,
              level,
              stats: pokemon.baseStats,
              types: pokemon.types,
            },
          };
          
          generatedListings.push(listing);
        }
      });
      
      // Shuffle and limit to reasonable number for demo
      const shuffled = generatedListings.sort(() => Math.random() - 0.5);
      setListings(shuffled.slice(0, 20)); // Show 20 random listings
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSol = (lamports: number) => {
    return (lamports / 1000000000).toFixed(3);
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

  const getTypeIcon = (type: TypeGen1) => {
    const icons: Record<TypeGen1, string> = {
      'NORMAL': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/1.png',
      'FIRE': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/10.png',
      'WATER': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/11.png',
      'ELECTRIC': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/13.png',
      'GRASS': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/12.png',
      'ICE': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/15.png',
      'FIGHTING': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/2.png',
      'POISON': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/4.png',
      'GROUND': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/5.png',
      'FLYING': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/3.png',
      'PSYCHIC': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/14.png',
      'BUG': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/7.png',
      'ROCK': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/6.png',
      'GHOST': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/8.png',
      'DRAGON': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/16.png',
    };
    return icons[type] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/1.png';
  };

  const filteredListings = listings.filter(listing => {
    if (filters.rarity && listing.card.rarity !== filters.rarity) return false;
    if (filters.minPrice && listing.priceLamports < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && listing.priceLamports > parseInt(filters.maxPrice)) return false;
    if (filters.isShiny === 'true' && !listing.card.isShiny) return false;
    if (filters.isShiny === 'false' && listing.card.isShiny) return false;
    return true;
  });

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

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Trade your favorite cards with SOLANA
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rarity
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.rarity}
                  onChange={(e) => setFilters({ ...filters, rarity: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="COMMON">Common</option>
                  <option value="RARE">Rare</option>
                  <option value="LEGENDARY">Legendary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Price (SOL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Price (SOL)
                </label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shiny
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.isShiny}
                  onChange={(e) => setFilters({ ...filters, isShiny: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="true">Shiny Only</option>
                  <option value="false">Normal Only</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="w-full h-44 bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 p-4 relative overflow-hidden">
                    {/* Pokemon Sprite */}
                       <div className="absolute top-6 right-2 w-20 h-20">
                         <img 
                           src={PokemonDataUtil.getSpriteUrl(listing.card.dexNumber)}
                           alt={listing.card.name}
                           className="w-full h-full object-contain pixelated"
                           style={{ imageRendering: 'pixelated' }}
                         />
                       </div>
                    
                    {/* Pokemon Name */}
                    <div className="mb-3">
                      <span className={`text-lg font-bold font-pixel ${
                        listing.card.isShiny 
                          ? 'text-yellow-500 dark:text-yellow-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {listing.card.name}
                      </span>
                    </div>
                    
                    {/* Types Stacked Vertically - Left Aligned */}
                    <div className="flex flex-col gap-1 mb-3 items-start">
                      {listing.card.types.map(type => (
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
                      <Badge className={`text-sm font-pixel border border-black ${getRarityColor(listing.card.rarity)}`} style={{fontSize: '12px', padding: '4px 8px'}}>
                        {listing.card.rarity}
                      </Badge>
                    </div>
                    
                    {/* Level in bottom right corner */}
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-orange-500 text-white px-2 py-1 rounded border-2 border-black">
                        <span className="text-xs font-pixel">
                          LV.{listing.card.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatSol(listing.priceLamports)} SOL
                    </span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => router.push(`/marketplace/listing/${listing.id}`)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Buy
                  </Button>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/marketplace/listing/${listing.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">No cards found with these filters</p>
                <Button onClick={() => setFilters({ rarity: '', minPrice: '', maxPrice: '', isShiny: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Cards for Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listings.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Currently</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-500" />
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatSol(listings.reduce((acc, listing) => acc + listing.priceLamports, 0) / listings.length || 0)} SOL
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Per card</p>
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
                {listings.filter(l => l.card.isShiny).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
