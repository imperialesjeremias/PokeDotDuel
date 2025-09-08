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
import { QuickMatchPanel } from '@/components/QuickMatchPanel';
import { 
  Zap, 
  Users, 
  Trophy,
  Coins,
  Clock,
  Search,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface BracketInfo {
  id: number;
  name: string;
  minWager: number;
  maxWager: number;
  description: string;
  color: string;
  estimatedWait: string;
}

const BRACKETS: BracketInfo[] = [
  {
    id: 1,
    name: 'Bronze',
    minWager: 0.01,
    maxWager: 0.05,
    description: 'Ideal for beginners',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    estimatedWait: '< 30s'
  },
  {
    id: 2,
    name: 'Silver',
    minWager: 0.05,
    maxWager: 0.1,
    description: 'For intermediate players',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    estimatedWait: '< 1m'
  },
  {
    id: 3,
    name: 'Gold',
    minWager: 0.1,
    maxWager: 0.5,
    description: 'Serious competition',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    estimatedWait: '< 2m'
  },
  {
    id: 4,
    name: 'Platinum',
    minWager: 0.5,
    maxWager: 1.0,
    description: 'High level gameplay',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    estimatedWait: '< 3m'
  },
  {
    id: 6,
    name: 'Master',
    minWager: 5.0,
    maxWager: 100.0,
    description: 'Masters league',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    estimatedWait: '< 10m'
  }
];

type MatchmakingState = 'idle' | 'searching' | 'found' | 'error';

export default function QuickMatchPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const { quickMatch, loading, error } = usePVP();
  
  const [selectedBracket, setSelectedBracket] = useState<BracketInfo>(BRACKETS[0]);
  const [wagerAmount, setWagerAmount] = useState(0.01);
  const [matchmakingState, setMatchmakingState] = useState<MatchmakingState>('idle');
  const [searchTime, setSearchTime] = useState(0);
  const [foundMatch, setFoundMatch] = useState<any>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    } else if (authenticated) {
      // Initialize background system for authenticated users
      initializeBackground();
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    // Adjust wager amount when bracket changes
    setWagerAmount(selectedBracket.minWager);
  }, [selectedBracket]);

  // Timer for search time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchmakingState === 'searching') {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [matchmakingState]);

  const handleQuickMatch = async () => {
    try {
      setMatchmakingState('searching');
      setSearchTime(0);
      
      const wagerLamports = Math.floor(wagerAmount * 1_000_000_000); // Convert to lamports
      const matchResult = await quickMatch(selectedBracket.id, wagerLamports);
      
      if (matchResult) {
        setFoundMatch(matchResult);
        setMatchmakingState('found');
        
        // Redirect to battle after a brief delay
        setTimeout(() => {
          router.push(`/battle?match=${matchResult.matchId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to find match:', err);
      setMatchmakingState('error');
    }
  };

  const handleCancelSearch = () => {
    setMatchmakingState('idle');
    setSearchTime(0);
    // Here you could call a function to cancel the search on the server
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-yellow-500" />
            Quick Match
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find an opponent automatically and start battling instantly
          </p>
        </div>

        {/* Error Display */}
        {(error || matchmakingState === 'error') && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error || 'Could not find a match. Please try again.'}
          </div>
        )}

        {/* Matchmaking Status */}
        {matchmakingState === 'searching' && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Searching for opponent...
                </h3>
                <p className="text-blue-700 mb-4">
                  Search time: {formatTime(searchTime)}
                </p>
                <p className="text-sm text-blue-600 mb-4">
                  Bracket: {selectedBracket.name} | Wager: {wagerAmount} SOL
                </p>
                <Button 
                  onClick={handleCancelSearch}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Found */}
        {matchmakingState === 'found' && foundMatch && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Match found!
                </h3>
                <p className="text-green-700 mb-4">
                  Opponent: {foundMatch.opponent?.name || 'Anonymous Player'}
                </p>
                <p className="text-sm text-green-600">
                  Redirecting to battle...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration (only show when idle) */}
        {matchmakingState === 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bracket Selection */}
            <div className="flex">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Select Bracket
                  </CardTitle>
                  <CardDescription>
                    Choose your competition level for matchmaking
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
                          <div className="flex items-center space-x-2">
                            <Badge className={selectedBracket.id === bracket.id ? bracket.color : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}>
                              {bracket.minWager} - {bracket.maxWager} SOL
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {bracket.estimatedWait}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{bracket.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Match Configuration */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="w-5 h-5 mr-2" />
                    Match Configuration
                  </CardTitle>
                  <CardDescription>
                    Set your wager and start the search
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Selected Bracket Info */}
                  <div className={`p-4 rounded-lg border-2 ${selectedBracket.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{selectedBracket.name} League</h3>
                      <Badge className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {selectedBracket.estimatedWait}
                      </Badge>
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
                    <div className="grid grid-cols-3 gap-2">
                      {[selectedBracket.minWager, ((selectedBracket.maxWager - selectedBracket.minWager) / 2), selectedBracket.maxWager].map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setWagerAmount(amount)}
                          className={wagerAmount === amount ? 'bg-blue-50 border-blue-300' : ''}
                        >
                          {amount} SOL
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Match Button */}
                  <Button
                    onClick={handleQuickMatch}
                    disabled={!isValidWager || loading}
                    className="w-full py-3 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    size="lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Find Quick Match
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2" />
                    Smart Matchmaking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                        ⚡
                      </div>
                      <p>Automatic search for opponents at your level</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                        🎯
                      </div>
                      <p>Matchmaking based on bracket and wager</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                        ⏱️
                      </div>
                      <p>Wait times optimized by bracket</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                        🏆
                      </div>
                      <p>Fair and competitive battles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Match Panel - Bot Battle */}
              {/* <QuickMatchPanel /> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}