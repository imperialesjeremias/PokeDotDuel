'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { initializeBackground } from '@/utils/backgroundManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { PokemonDataUtil } from '@/lib/pokemon-data';
import { TypeGen1 } from '@pokebattle/shared';
import { useUser } from '@/hooks/useUser';
import { 
  Package, 
  Search,
  Star,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface UserCard {
  id: string;
  dex_number: number;
  name: string;
  is_shiny: boolean;
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
  created_at: string;
}

export default function CollectionPage() {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<UserCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    initializeBackground();
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (ready && authenticated && user) {
      loadUserCards();
    }
  }, [ready, authenticated, user]);

  useEffect(() => {
    filterAndSortCards();
  }, [cards, searchTerm, selectedRarity, selectedType, sortBy, sortOrder]);

  const loadUserCards = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available');
        setCards([]);
        setLoading(false);
        return;
      }
      
      // Obtener cartas del usuario autenticado
      const { data: userCards, error } = await supabase
        .from('cards')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user cards:', error);
        setCards([]);
        setLoading(false);
        return;
      }

      // Transformar datos para el frontend
      const transformedCards: UserCard[] = (userCards || []).map(card => ({
        id: card.id,
        dex_number: card.dex_number,
        name: card.name,
        is_shiny: card.is_shiny,
        rarity: card.rarity,
        level: card.level,
        stats: {
          hp: card.hp,
          atk: card.atk,
          def: card.def,
          spa: card.spa,
          spd: card.spd,
          spe: card.spe
        },
        types: card.types || [],
        created_at: card.created_at
      }));

      setCards(transformedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCards = () => {
    let filtered = [...cards];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rareza
    if (selectedRarity !== 'ALL') {
      filtered = filtered.filter(card => card.rarity === selectedRarity);
    }

    // Filtrar por tipo
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(card => 
        card.types.includes(selectedType as TypeGen1)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'rarity':
          const rarityOrder = { 'COMMON': 1, 'RARE': 2, 'LEGENDARY': 3 };
          aValue = rarityOrder[a.rarity];
          bValue = rarityOrder[b.rarity];
          break;
        case 'dex_number':
          aValue = a.dex_number;
          bValue = b.dex_number;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCards(filtered);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-100 text-gray-800';
      case 'RARE': return 'bg-blue-100 text-blue-800';
      case 'LEGENDARY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'NORMAL': 'bg-gray-400',
      'FIRE': 'bg-red-500',
      'WATER': 'bg-blue-500',
      'ELECTRIC': 'bg-yellow-400',
      'GRASS': 'bg-green-500',
      'ICE': 'bg-blue-300',
      'FIGHTING': 'bg-red-700',
      'POISON': 'bg-purple-500',
      'GROUND': 'bg-yellow-600',
      'FLYING': 'bg-indigo-400',
      'PSYCHIC': 'bg-pink-500',
      'BUG': 'bg-green-400',
      'ROCK': 'bg-yellow-800',
      'GHOST': 'bg-purple-700',
      'DRAGON': 'bg-indigo-700',
      'DARK': 'bg-gray-800',
      'STEEL': 'bg-gray-500',
      'FAIRY': 'bg-pink-300'
    };
    return colors[type] || 'bg-gray-400';
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

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Collection</h1>
          <p className="text-gray-600 dark:text-gray-300">View and manage your Pokémon cards</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-500" />
                Total Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cards.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Shiny Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cards.filter(card => card.is_shiny).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="w-5 h-5 mr-2 text-purple-500" />
                Legendary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cards.filter(card => card.rarity === 'LEGENDARY').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className="w-5 h-5 mr-2 text-blue-500" />
                Rare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cards.filter(card => card.rarity === 'RARE').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Rarity Filter */}
              <div>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Rarities</option>
                  <option value="COMMON">Common</option>
                  <option value="RARE">Rare</option>
                  <option value="LEGENDARY">Legendary</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="level">Level</option>
                  <option value="rarity">Rarity</option>
                  <option value="dex_number">Pokédex #</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full"
                >
                  {sortOrder === 'asc' ? (
                    <><SortAsc className="w-4 h-4 mr-2" />Ascending</>
                  ) : (
                    <><SortDesc className="w-4 h-4 mr-2" />Descending</>
                  )}
                </Button>
              </div>

              {/* View Mode */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="w-full"
                >
                  {viewMode === 'grid' ? (
                    <><List className="w-4 h-4 mr-2" />List View</>
                  ) : (
                    <><Grid3X3 className="w-4 h-4 mr-2" />Grid View</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Display */}
        <Card>
          <CardHeader>
            <CardTitle>Cards ({filteredCards.length})</CardTitle>
            <CardDescription>
              {filteredCards.length === 0 ? 'No cards found' : `Showing ${filteredCards.length} of ${cards.length} cards`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">No cards found</p>
                <Button onClick={() => router.push('/packs')}>Open Packs</Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' : 'space-y-4'}>
                {filteredCards.map(card => (
                  <div key={card.id} className={viewMode === 'grid' ? 'group' : 'flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'}>
                    {viewMode === 'grid' ? (
                      <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer">
                        {/* Shiny indicator */}
                        {card.is_shiny && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold border border-yellow-600">
                              ✨ SHINY
                            </div>
                          </div>
                        )}

                        {/* Rarity badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`text-xs font-bold ${getRarityColor(card.rarity)}`}>
                            {card.rarity}
                          </Badge>
                        </div>

                        {/* Level */}
                        <div className="absolute bottom-2 right-2">
                          <div className="bg-orange-500 text-white px-2 py-1 rounded border-2 border-black">
                            <span className="text-xs font-bold">LV.{card.level}</span>
                          </div>
                        </div>

                        {/* Card content */}
                        <div className="mt-8 mb-8">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{card.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">#{card.dex_number.toString().padStart(3, '0')}</p>
                          
                          {/* Types */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {card.types.map(type => (
                              <span
                                key={type}
                                className={`px-2 py-1 rounded text-xs font-bold text-white ${getTypeColor(type)}`}
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>HP: {card.stats.hp}</div>
                            <div>ATK: {card.stats.atk}</div>
                            <div>DEF: {card.stats.def}</div>
                            <div>SPA: {card.stats.spa}</div>
                            <div>SPD: {card.stats.spd}</div>
                            <div>SPE: {card.stats.spe}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-bold text-lg">{card.name}</h3>
                              <p className="text-sm text-gray-600">#{card.dex_number.toString().padStart(3, '0')}</p>
                            </div>
                            <div className="flex space-x-2">
                              {card.types.map(type => (
                                <span
                                  key={type}
                                  className={`px-2 py-1 rounded text-xs font-bold text-white ${getTypeColor(type)}`}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                            <Badge className={`${getRarityColor(card.rarity)}`}>
                              {card.rarity}
                            </Badge>
                            {card.is_shiny && (
                              <Badge className="bg-yellow-400 text-yellow-900">
                                ✨ SHINY
                              </Badge>
                            )}
                            <div className="bg-orange-500 text-white px-2 py-1 rounded">
                              LV.{card.level}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}