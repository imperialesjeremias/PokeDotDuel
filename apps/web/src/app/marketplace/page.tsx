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
import { 
  TrendingUp, 
  Filter, 
  Search,
  Star,
  Coins,
  ShoppingCart,
  Eye
} from 'lucide-react';

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
    types: string[];
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
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      fetchListings();
    }
  }, [authenticated, filters]);

  const fetchListings = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setListings([
        {
          id: '1',
          priceLamports: 5000000, // 0.005 SOL
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          card: {
            id: 'card1',
            dexNumber: 25,
            name: 'Pikachu',
            isShiny: false,
            rarity: 'RARE',
            level: 25,
            stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
            types: ['ELECTRIC'],
          },
        },
        {
          id: '2',
          priceLamports: 15000000, // 0.015 SOL
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          card: {
            id: 'card2',
            dexNumber: 150,
            name: 'Mewtwo',
            isShiny: true,
            rarity: 'LEGENDARY',
            level: 50,
            stats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
            types: ['PSYCHIC'],
          },
        },
        {
          id: '3',
          priceLamports: 2000000, // 0.002 SOL
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          card: {
            id: 'card3',
            dexNumber: 1,
            name: 'Bulbasaur',
            isShiny: false,
            rarity: 'COMMON',
            level: 15,
            stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
            types: ['GRASS', 'POISON'],
          },
        },
        {
          id: '4',
          priceLamports: 8000000, // 0.008 SOL
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          card: {
            id: 'card4',
            dexNumber: 4,
            name: 'Charmander',
            isShiny: true,
            rarity: 'RARE',
            level: 20,
            stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
            types: ['FIRE'],
          },
        },
      ]);
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'GRASS': 'bg-green-500 text-white',
      'FIRE': 'bg-red-500 text-white',
      'WATER': 'bg-blue-500 text-white',
      'ELECTRIC': 'bg-yellow-500 text-black',
      'PSYCHIC': 'bg-purple-500 text-white',
      'NORMAL': 'bg-gray-500 text-white',
      'POISON': 'bg-purple-600 text-white',
    };
    return colors[type] || 'bg-gray-500 text-white';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'GRASS': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/12.png',
      'FIRE': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/10.png',
      'WATER': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/11.png',
      'ELECTRIC': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/13.png',
      'PSYCHIC': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/14.png',
      'NORMAL': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/1.png',
      'POISON': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/4.png',
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace
          </h1>
          <p className="text-gray-600">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map(listing => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-white to-gray-100 rounded-lg border border-gray-200 p-4 relative overflow-hidden">
                    {/* Pokemon Sprite */}
                       <div className="absolute top-8 right-2 w-16 h-16">
                         <img 
                           src={`https://play.pokemonshowdown.com/sprites/gen1/${listing.card.name.toLowerCase()}.png`}
                           alt={listing.card.name}
                           className="w-full h-full object-contain pixelated"
                           style={{ imageRendering: 'pixelated' }}
                         />
                       </div>
                    
                    {/* Pokemon Name and Shiny */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900 font-pixel">
                        {listing.card.name}
                      </span>
                      {listing.card.isShiny && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-xs font-pixel text-yellow-600">SHINY</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Type Text Only */}
                       <div className="flex flex-wrap gap-1 mb-3 mt-2">
                         {listing.card.types.map(type => (
                           <span
                             key={type}
                             className={`text-xs font-pixel px-2 py-1 rounded ${getTypeColor(type)}`}
                           >
                             {type}
                           </span>
                         ))}
                       </div>
                    
                    {/* Rarity and Level */}
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs font-pixel border-2 border-black ${getRarityColor(listing.card.rarity)}`}>
                        {listing.card.rarity}
                      </Badge>
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
                    <span className="font-semibold text-gray-900">
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
                <p className="text-gray-600 mb-4">No cards found with these filters</p>
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
              <div className="text-2xl font-bold text-gray-900">
                {listings.length}
              </div>
              <p className="text-sm text-gray-600">Currently</p>
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
              <div className="text-2xl font-bold text-gray-900">
                {formatSol(listings.reduce((acc, listing) => acc + listing.priceLamports, 0) / listings.length || 0)} SOL
              </div>
              <p className="text-sm text-gray-600">Per card</p>
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
                {listings.filter(l => l.card.isShiny).length}
              </div>
              <p className="text-sm text-gray-600">Available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
