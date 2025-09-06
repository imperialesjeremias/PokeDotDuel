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
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  Star,
  Zap,
  Shield
} from 'lucide-react';

interface Card {
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
}

interface Team {
  id: string;
  name: string;
  slots: string[];
  natures: string[];
  moves: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export default function TeamBuilderPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      fetchTeams();
      fetchCards();
    }
  }, [authenticated]);

  const fetchTeams = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setTeams([
        {
          id: '1',
          name: 'Equipo Principal',
          slots: ['card1', 'card2', 'card3', 'card4', 'card5', 'card6'],
          natures: ['Adamant', 'Modest', 'Jolly', 'Bold', 'Timid', 'Careful'],
          moves: {
            'card1': ['Tackle', 'Growl', 'Vine Whip', 'Poison Powder'],
            'card2': ['Scratch', 'Growl', 'Ember', 'Leer'],
            'card3': ['Tackle', 'Tail Whip', 'Bubble', 'Water Gun'],
            'card4': ['Thunder Shock', 'Growl', 'Thunder Wave', 'Quick Attack'],
            'card5': ['Sing', 'Pound', 'Disable', 'Defense Curl'],
            'card6': ['Confusion', 'Disable', 'Barrier', 'Swift'],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchCards = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setCards([
        {
          id: 'card1',
          dexNumber: 1,
          name: 'Bulbasaur',
          isShiny: false,
          rarity: 'COMMON',
          level: 15,
          stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
          types: ['GRASS', 'POISON'],
        },
        {
          id: 'card2',
          dexNumber: 4,
          name: 'Charmander',
          isShiny: true,
          rarity: 'RARE',
          level: 18,
          stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
          types: ['FIRE'],
        },
        {
          id: 'card3',
          dexNumber: 7,
          name: 'Squirtle',
          isShiny: false,
          rarity: 'COMMON',
          level: 16,
          stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
          types: ['WATER'],
        },
        {
          id: 'card4',
          dexNumber: 25,
          name: 'Pikachu',
          isShiny: false,
          rarity: 'RARE',
          level: 20,
          stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
          types: ['ELECTRIC'],
        },
        {
          id: 'card5',
          dexNumber: 39,
          name: 'Jigglypuff',
          isShiny: false,
          rarity: 'COMMON',
          level: 12,
          stats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 },
          types: ['NORMAL'],
        },
        {
          id: 'card6',
          dexNumber: 150,
          name: 'Mewtwo',
          isShiny: false,
          rarity: 'LEGENDARY',
          level: 50,
          stats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
          types: ['PSYCHIC'],
        },
      ]);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'GRASS': 'bg-green-100 text-green-800',
      'FIRE': 'bg-red-100 text-red-800',
      'WATER': 'bg-blue-100 text-blue-800',
      'ELECTRIC': 'bg-yellow-100 text-yellow-800',
      'PSYCHIC': 'bg-purple-100 text-purple-800',
      'NORMAL': 'bg-gray-100 text-gray-800',
      'POISON': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Team Builder
          </h1>
          <p className="text-gray-600">
            Construye y optimiza tu equipo de 6 Pokémon
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Mis Equipos
                  </CardTitle>
                  <Button size="sm" onClick={() => router.push('/team-builder/create')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nuevo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map(team => (
                    <div
                      key={team.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTeam?.id === team.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600">
                            {team.slots.length}/6 Pokémon
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Builder */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      <CardDescription>
                        Equipo de 6 Pokémon para batallas
                      </CardDescription>
                    </div>
                    <Button>
                      <Save className="w-4 h-4 mr-1" />
                      Guardar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, index) => {
                      const cardId = selectedTeam.slots[index];
                      const card = cards.find(c => c.id === cardId);
                      
                      return (
                        <div
                          key={index}
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          {card ? (
                            <div className="w-full h-full p-2">
                              <div className="relative">
                                <div className="w-full h-24 bg-gradient-to-br from-white to-gray-100 rounded-lg border border-gray-200 p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-900">
                                      {card.name}
                                    </span>
                                    {card.isShiny && (
                                      <Star className="w-3 h-3 text-yellow-500" />
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {card.types.map(type => (
                                      <Badge
                                        key={type}
                                        className={`text-xs ${getTypeColor(type)}`}
                                      >
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Badge className={`text-xs ${getRarityColor(card.rarity)}`}>
                                      {card.rarity}
                                    </Badge>
                                    <span className="text-xs text-gray-600">
                                      Lv.{card.level}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Agregar Pokémon</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Selecciona un equipo para editarlo</p>
                    <Button onClick={() => router.push('/team-builder/create')}>
                      Crear Nuevo Equipo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Team Analysis */}
        {selectedTeam && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Análisis del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cobertura de Tipos</h3>
                  <div className="space-y-1">
                    {['FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC'].map(type => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{type}</span>
                        <Badge className={getTypeColor(type)}>
                          {Math.random() > 0.5 ? 'Cubierto' : 'Débil'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Estadísticas</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ataque Promedio</span>
                      <span className="text-sm font-semibold">85</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Defensa Promedio</span>
                      <span className="text-sm font-semibold">78</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Velocidad Promedio</span>
                      <span className="text-sm font-semibold">92</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sugerencias</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        Considera agregar un Pokémon tipo Roca para mejor cobertura
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        Buen balance entre ataque y defensa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
