'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { initializeBackground } from '@/utils/backgroundManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePVP } from '@/hooks/usePVP';
import { 
  Plus, 
  Users, 
  Trophy,
  Coins,
  Clock,
  Shield
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface BracketInfo {
  id: number;
  name: string;
  minWager: number;
  maxWager: number;
  description: string;
  color: string;
}

const BRACKETS: BracketInfo[] = [
  {
    id: 1,
    name: 'Bronze',
    minWager: 0.01,
    maxWager: 0.05,
    description: 'Ideal for beginners',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 2,
    name: 'Silver',
    minWager: 0.05,
    maxWager: 0.1,
    description: 'For intermediate players',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  {
    id: 3,
    name: 'Gold',
    minWager: 0.1,
    maxWager: 0.5,
    description: 'Serious competition',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 4,
    name: 'Platinum',
    minWager: 0.5,
    maxWager: 1.0,
    description: 'High level gameplay',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 5,
    name: 'Diamond',
    minWager: 1.0,
    maxWager: 5.0,
    description: 'Experts only',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    id: 6,
    name: 'Master',
    minWager: 5.0,
    maxWager: 100.0,
    description: 'Masters league',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

export default function CreateLobbyPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const { createLobby, loading, error } = usePVP();
  
  const [selectedBracket, setSelectedBracket] = useState<BracketInfo>(BRACKETS[0]);
  const [wagerAmount, setWagerAmount] = useState(0.01);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    } else if (authenticated) {
      // Initialize background system for authenticated users
      initializeBackground();
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    // Ajustar el wager amount cuando cambie el bracket
    setWagerAmount(selectedBracket.minWager);
  }, [selectedBracket]);

  const handleCreateLobby = async () => {
    try {
      setIsCreating(true);
      const wagerLamports = Math.floor(wagerAmount * 1_000_000_000); // Convert to lamports
      const lobbyId = await createLobby(selectedBracket.id, wagerLamports);
      
      // Redirigir a la página de batalla o lobby
      router.push(`/battle?lobby=${lobbyId}`);
    } catch (err) {
      console.error('Failed to create lobby:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const isValidWager = wagerAmount >= selectedBracket.minWager && wagerAmount <= selectedBracket.maxWager;

  if (!ready) {
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
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Battle Lobby
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure your lobby and wait for another player to join to start the battle
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Bracket Selection */}
          <div className="flex">
            <Card className="flex-1 h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Select Bracket
                </CardTitle>
                <CardDescription>
                  Choose competition level and betting range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {BRACKETS.map(bracket => (
                    <div
                      key={bracket.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBracket.id === bracket.id 
                          ? `${bracket.color} border-current` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBracket(bracket)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{bracket.name}</h3>
                        <Badge className={selectedBracket.id === bracket.id ? bracket.color : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}>
                          {bracket.minWager} - {bracket.maxWager} SOL
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{bracket.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lobby Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Lobby Configuration
                </CardTitle>
                <CardDescription>
                  Set the wager amount for your battle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Bracket Info */}
                <div className={`p-4 rounded-lg border-2 ${selectedBracket.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{selectedBracket.name} League</h3>
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="text-sm mb-2">{selectedBracket.description}</p>
                  <p className="text-xs">
                    Range: {selectedBracket.minWager} - {selectedBracket.maxWager} SOL
                  </p>
                </div>

                {/* Wager Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wager Amount (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={selectedBracket.minWager}
                    max={selectedBracket.maxWager}
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(Number(e.target.value))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !isValidWager ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={`Between ${selectedBracket.minWager} and ${selectedBracket.maxWager}`}
                  />
                  {!isValidWager && (
                    <p className="text-red-600 text-sm mt-1">
                      Amount must be between {selectedBracket.minWager} and {selectedBracket.maxWager} SOL
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick amounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {[0.1, 0.5, 1].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setWagerAmount(amount)}
                        className={`flex-1 min-w-0 text-xs px-2 py-1 ${wagerAmount === amount ? 'bg-blue-50 border-blue-300' : ''}`}
                      >
                        {amount} SOL
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreateLobby}
                  disabled={!isValidWager || isCreating || loading}
                  className="w-full py-3 text-lg"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Creating Lobby...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Lobby
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2" />
                  How does it work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      1
                    </div>
                    <p>Create your lobby with the desired wager</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      2
                    </div>
                    <p>Share the lobby ID with another player</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      3
                    </div>
                    <p>Both players select their teams and confirm</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      4
                    </div>
                    <p>The battle starts automatically!</p>
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