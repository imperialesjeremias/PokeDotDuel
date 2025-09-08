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
import { PVPBattle } from '@/components/PVPBattle';
import { 
  Sword, 
  Users, 
  Clock, 
  Coins,
  Plus,
  Search,
  Zap
} from 'lucide-react';

interface WagerBracket {
  id: number;
  name: string;
  minLamports: number;
  maxLamports: number;
}

interface Lobby {
  id: string;
  bracketId: number;
  creatorId: string;
  opponentId?: string;
  wagerLamports: number;
  status: string;
  bracket: {
    name: string;
    minLamports: number;
    maxLamports: number;
  };
  createdAt: string;
}

export default function BattlePage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [brackets, setBrackets] = useState<WagerBracket[]>([]);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [selectedBracket, setSelectedBracket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      fetchBrackets();
      fetchLobbies();
    }
  }, [authenticated]);

  const fetchBrackets = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setBrackets([
        { id: 1, name: '0.001 - 0.005 SOL', minLamports: 1000000, maxLamports: 5000000 },
        { id: 2, name: '0.005 - 0.01 SOL', minLamports: 5000000, maxLamports: 10000000 },
        { id: 3, name: '0.01 - 0.025 SOL', minLamports: 10000000, maxLamports: 25000000 },
        { id: 4, name: '0.025 - 0.05 SOL', minLamports: 25000000, maxLamports: 50000000 },
        { id: 5, name: '0.05 - 0.1 SOL', minLamports: 50000000, maxLamports: 100000000 },
      ]);
    } catch (error) {
      console.error('Error fetching brackets:', error);
    }
  };

  const fetchLobbies = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setLobbies([
        {
          id: '1',
          bracketId: 2,
          creatorId: 'user1',
          wagerLamports: 7500000,
          status: 'OPEN',
          bracket: { name: '0.005 - 0.01 SOL', minLamports: 5000000, maxLamports: 10000000 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          bracketId: 3,
          creatorId: 'user2',
          opponentId: 'user3',
          wagerLamports: 15000000,
          status: 'FULL',
          bracket: { name: '0.01 - 0.025 SOL', minLamports: 10000000, maxLamports: 25000000 },
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching lobbies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSol = (lamports: number) => {
    return (lamports / 1000000000).toFixed(3);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-orange-100 text-orange-800';
      case 'FULL':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'FULL':
        return 'Full';
      case 'IN_PROGRESS':
        return 'In Progress';
      default:
        return status;
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

  const filteredLobbies = selectedBracket 
    ? lobbies.filter(lobby => lobby.bracketId === selectedBracket)
    : lobbies;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PvP Battles
          </h1>
          <p className="text-gray-600">
            Turn-based combat with SOL betting
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sword className="w-5 h-5 mr-2 text-orange-600" />
                Create Lobby
              </CardTitle>
              <CardDescription>
                Create a new lobby for battles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push('/create-lobby')}
              >
                Create Lobby
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Find Match
              </CardTitle>
              <CardDescription>
                Find a quick match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push('/battle/quick-match')}
              >
                Quick Match
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bracket Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter by Betting Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedBracket === null ? "default" : "outline"}
                onClick={() => setSelectedBracket(null)}
              >
                All
              </Button>
              {brackets.map(bracket => (
                <Button
                  key={bracket.id}
                  variant={selectedBracket === bracket.id ? "default" : "outline"}
                  onClick={() => setSelectedBracket(bracket.id)}
                >
                  {bracket.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lobbies List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Available Lobbies
            </CardTitle>
            <CardDescription>
              Join an existing lobby or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLobbies.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No lobbies available</p>
                <Button onClick={() => router.push('/battle/create')}>
                  Create First Lobby
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLobbies.map(lobby => (
                  <div
                    key={lobby.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Sword className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {lobby.bracket.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Wager: {formatSol(lobby.wagerLamports)} SOL
                        </p>
                        <p className="text-xs text-gray-500">
                          Created {Math.floor(Math.random() * 60)} minutes ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(lobby.status)}>
                        {getStatusText(lobby.status)}
                      </Badge>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {lobby.opponentId ? '2/2' : '1/2'}
                      </div>
                      
                      <Button
                        size="sm"
                        disabled={lobby.status !== 'OPEN'}
                        onClick={() => router.push(`/battle/lobby/${lobby.id}`)}
                      >
                        {lobby.status === 'OPEN' ? 'Join' : 'View'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Battle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Active Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {lobbies.filter(l => l.status === 'IN_PROGRESS').length}
              </div>
              <p className="text-sm text-gray-600">Right now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Online Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {lobbies.reduce((acc, lobby) => acc + (lobby.opponentId ? 2 : 1), 0)}
              </div>
              <p className="text-sm text-gray-600">In lobbies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2 text-orange-500" />
                SOL in Bets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatSol(lobbies.reduce((acc, lobby) => acc + lobby.wagerLamports, 0))}
              </div>
              <p className="text-sm text-gray-600">Total wagered</p>
            </CardContent>
          </Card>
        </div>

        {/* PVP Battle Component */}
        <div className="mt-8">
          <PVPBattle />
        </div>
      </div>
    </div>
  );
}
