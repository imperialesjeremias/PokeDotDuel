'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
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
    description: 'Ideal para principiantes',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 2,
    name: 'Silver',
    minWager: 0.05,
    maxWager: 0.1,
    description: 'Para jugadores intermedios',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  {
    id: 3,
    name: 'Gold',
    minWager: 0.1,
    maxWager: 0.5,
    description: 'Competencia seria',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 4,
    name: 'Platinum',
    minWager: 0.5,
    maxWager: 1.0,
    description: 'Alto nivel de juego',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 5,
    name: 'Diamond',
    minWager: 1.0,
    maxWager: 5.0,
    description: 'Solo para expertos',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    id: 6,
    name: 'Master',
    minWager: 5.0,
    maxWager: 100.0,
    description: 'Liga de maestros',
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Lobby de Batalla
          </h1>
          <p className="text-gray-600">
            Configura tu lobby y espera a que otro jugador se una para comenzar la batalla
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bracket Selection */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Seleccionar Bracket
                </CardTitle>
                <CardDescription>
                  Elige el nivel de competencia y rango de apuestas
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
                        <Badge className={selectedBracket.id === bracket.id ? bracket.color : 'bg-gray-100 text-gray-600'}>
                          {bracket.minWager} - {bracket.maxWager} SOL
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{bracket.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lobby Configuration */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Configuración del Lobby
                </CardTitle>
                <CardDescription>
                  Establece la cantidad de apuesta para tu batalla
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
                    Rango: {selectedBracket.minWager} - {selectedBracket.maxWager} SOL
                  </p>
                </div>

                {/* Wager Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Apuesta (SOL)
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
                    placeholder={`Entre ${selectedBracket.minWager} y ${selectedBracket.maxWager}`}
                  />
                  {!isValidWager && (
                    <p className="text-red-600 text-sm mt-1">
                      La cantidad debe estar entre {selectedBracket.minWager} y {selectedBracket.maxWager} SOL
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Cantidades rápidas:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[selectedBracket.minWager, (selectedBracket.minWager + selectedBracket.maxWager) / 2, selectedBracket.maxWager].map(amount => (
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
                      Creando Lobby...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Lobby
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
                  ¿Cómo funciona?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      1
                    </div>
                    <p>Crea tu lobby con la apuesta deseada</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      2
                    </div>
                    <p>Comparte el ID del lobby con otro jugador</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      3
                    </div>
                    <p>Ambos seleccionan sus equipos y confirman</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                      4
                    </div>
                    <p>¡La batalla comienza automáticamente!</p>
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