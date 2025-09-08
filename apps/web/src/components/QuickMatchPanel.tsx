import React, { useState } from 'react';
import { usePVP } from '../hooks/usePVP';

interface QuickMatchPanelProps {
  onClose?: () => void;
}

export function QuickMatchPanel({ onClose }: QuickMatchPanelProps) {
  const {
    joinQuickMatch,
    leaveQuickMatch,
    playVsBot,
    getMatchmakingStatus,
    matchmakingStatus,
    loading,
    error,
    currentLobby
  } = usePVP();

  const [bracketId, setBracketId] = useState(1);
  const [wagerAmount, setWagerAmount] = useState(1000000); // 0.001 SOL in lamports
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [inQueue, setInQueue] = useState(false);

  const handleJoinQuickMatch = async () => {
    try {
      await joinQuickMatch(bracketId, wagerAmount);
      setInQueue(true);
      // Poll for matchmaking status
      const interval = setInterval(async () => {
        try {
          await getMatchmakingStatus();
        } catch (err) {
          console.error('Failed to get matchmaking status:', err);
        }
      }, 2000);
      
      // Clean up interval when component unmounts or match is found
      return () => clearInterval(interval);
    } catch (err) {
      console.error('Failed to join quick match:', err);
    }
  };

  const handleLeaveQuickMatch = async () => {
    try {
      await leaveQuickMatch();
      setInQueue(false);
    } catch (err) {
      console.error('Failed to leave quick match:', err);
    }
  };

  const handlePlayVsBot = async () => {
    try {
      await playVsBot(bracketId, wagerAmount, botDifficulty);
    } catch (err) {
      console.error('Failed to start bot battle:', err);
    }
  };

  // If already in a lobby, show lobby info
  if (currentLobby) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Lobby Actual</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">ID del Lobby:</p>
            <p className="font-mono text-sm">{currentLobby.id}</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Estado:</p>
            <p className="font-semibold">{currentLobby.status}</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Apuesta:</p>
            <p className="font-semibold">{(currentLobby.wagerLamports / 1000000000).toFixed(3)} SOL</p>
          </div>
          
          {currentLobby.isBot && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold">🤖 Batalla contra Bot</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Modos de Juego</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Configuration */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bracket ID
          </label>
          <select
            value={bracketId}
            onChange={(e) => setBracketId(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || inQueue}
          >
            <option value={1}>Bracket 1 (Principiante)</option>
            <option value={2}>Bracket 2 (Intermedio)</option>
            <option value={3}>Bracket 3 (Avanzado)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apuesta (SOL)
          </label>
          <select
            value={wagerAmount}
            onChange={(e) => setWagerAmount(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || inQueue}
          >
            <option value={1000000}>0.001 SOL</option>
            <option value={5000000}>0.005 SOL</option>
            <option value={10000000}>0.01 SOL</option>
            <option value={50000000}>0.05 SOL</option>
          </select>
        </div>
      </div>

      {/* Quick Match Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🚀 Partida Rápida</h3>
        
        {inQueue ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-700 font-medium">Buscando oponente...</p>
              {matchmakingStatus && (
                <div className="mt-2 text-sm text-blue-600">
                  <p>Jugadores en cola: {matchmakingStatus.queueLength}</p>
                  <p>Tiempo estimado: {matchmakingStatus.estimatedWaitTime}s</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLeaveQuickMatch}
              disabled={loading}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saliendo...' : 'Salir de la Cola'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoinQuickMatch}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uniéndose...' : 'Buscar Partida'}
          </button>
        )}
      </div>

      {/* Bot Battle Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🤖 Contra Bot</h3>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dificultad del Bot
          </label>
          <select
            value={botDifficulty}
            onChange={(e) => setBotDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || inQueue}
          >
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>
        </div>
        
        <button
          onClick={handlePlayVsBot}
          disabled={loading || inQueue}
          className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando...' : 'Jugar contra Bot'}
        </button>
      </div>

      {/* Matchmaking Status */}
      {matchmakingStatus && !inQueue && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Estado del Matchmaking:</p>
          <p className="text-sm">Jugadores en cola: {matchmakingStatus.queueLength}</p>
        </div>
      )}
    </div>
  );
}

export default QuickMatchPanel;