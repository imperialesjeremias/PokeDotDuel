import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { usePVP } from '../hooks/usePVP';
import { LobbyState, ServerMessage, BattleTeam } from '../types/shared';

export function PVPBattle() {
  const { publicKey } = useWallet();
  const {
    createLobby,
    joinLobby,
    getLobby,
    selectTeam,
    ready,
    makeMove,
    forfeit,
    currentLobby,
    currentBattle,
    isConnected,
    loading,
    error,
    onMessage,
  } = usePVP();

  const [lobbyId, setLobbyId] = useState('');
  const [bracketId, setBracketId] = useState(1);
  const [wagerAmount, setWagerAmount] = useState(0.01);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [battleEvents, setBattleEvents] = useState<any[]>([]);

  // Handle WebSocket messages
  useEffect(() => {
    onMessage((message: ServerMessage) => {
      console.log('Received message:', message);

      if (message.type === 'TURN_RESULT') {
        setBattleEvents(prev => [...prev, ...message.events]);
      }

      if (message.type === 'BATTLE_END') {
        alert(`Battle ended! Winner: ${message.winner}`);
      }

      if (message.type === 'ERROR') {
        alert(`Error: ${message.message}`);
      }
    });
  }, [onMessage]);

  const handleCreateLobby = async () => {
    try {
      const wagerLamports = Math.floor(wagerAmount * 1_000_000_000); // Convert to lamports
      await createLobby(bracketId, wagerLamports);
    } catch (err) {
      console.error('Failed to create lobby:', err);
    }
  };

  const handleJoinLobby = async () => {
    try {
      await joinLobby(lobbyId);
    } catch (err) {
      console.error('Failed to join lobby:', err);
    }
  };

  const handleSelectTeam = async () => {
    if (!selectedTeamId) {
      console.error('No team ID entered');
      return;
    }
    try {
      // Create a BattleTeam object from the team ID
      const team: BattleTeam = {
        id: selectedTeamId,
        name: `Team ${selectedTeamId}`,
        pokemon: [] // This should be populated with actual Pokemon data
      };
      await selectTeam(team);
    } catch (err) {
      console.error('Failed to select team:', err);
    }
  };

  const handleReady = async () => {
    try {
      await ready();
    } catch (err) {
      console.error('Failed to ready up:', err);
    }
  };

  const handleMakeMove = async (move: any) => {
    try {
      await makeMove(move);
    } catch (err) {
      console.error('Failed to make move:', err);
    }
  };

  const handleForfeit = async () => {
    try {
      await forfeit();
    } catch (err) {
      console.error('Failed to forfeit:', err);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">PVP Battle</h1>
        <p className="mb-4">Connect your wallet to start battling!</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">PVP Battle Arena</h1>

      {/* Connection Status */}
      <div className="mb-4">
        <span className={`px-2 py-1 rounded text-sm ${
          isConnected ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading...
        </div>
      )}

      {/* Create Lobby */}
      {!currentLobby && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Lobby</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bracket</label>
              <select
                value={bracketId}
                onChange={(e) => setBracketId(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value={1}>Bronze (0.01 - 0.05 SOL)</option>
                <option value={2}>Silver (0.05 - 0.1 SOL)</option>
                <option value={3}>Gold (0.1 - 0.5 SOL)</option>
                <option value={4}>Platinum (0.5 - 1 SOL)</option>
                <option value={5}>Diamond (1 - 5 SOL)</option>
                <option value={6}>Master (5+ SOL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wager Amount (SOL)</label>
              <input
                type="number"
                step="0.01"
                value={wagerAmount}
                onChange={(e) => setWagerAmount(Number(e.target.value))}
                className="w-full p-2 border rounded"
                min="0.01"
              />
            </div>
            <button
              onClick={handleCreateLobby}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Create Lobby
            </button>
          </div>
        </div>
      )}

      {/* Join Lobby */}
      {!currentLobby && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Join Lobby</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lobby ID</label>
              <input
                type="text"
                value={lobbyId}
                onChange={(e) => setLobbyId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter lobby ID"
              />
            </div>
            <button
              onClick={handleJoinLobby}
              disabled={loading || !lobbyId}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              Join Lobby
            </button>
          </div>
        </div>
      )}

      {/* Current Lobby */}
      {currentLobby && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Lobby</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {currentLobby.id}</p>
            <p><strong>Status:</strong> {currentLobby.status}</p>
            <p><strong>Wager:</strong> {(currentLobby.wagerLamports / 1_000_000_000).toFixed(3)} SOL</p>
            <p><strong>Creator:</strong> {currentLobby.creatorId.slice(0, 8)}...</p>
            {currentLobby.opponentId && (
              <p><strong>Opponent:</strong> {currentLobby.opponentId.slice(0, 8)}...</p>
            )}
          </div>

          {/* Team Selection */}
          {currentLobby.status === 'FULL' && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Team</label>
                <input
                  type="text"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter team ID"
                />
              </div>
              <button
                onClick={handleSelectTeam}
                disabled={loading || !selectedTeamId}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Select Team
              </button>
            </div>
          )}

          {/* Ready Button */}
          {currentLobby.status === 'FULL' && (
            <div className="mt-4">
              <button
                onClick={handleReady}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Ready
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current Battle */}
      {currentBattle && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Battle in Progress</h2>
          <div className="space-y-2">
            <p><strong>Battle ID:</strong> {currentBattle.id}</p>
            <p><strong>Turn:</strong> {currentBattle.turn || 0}</p>
          </div>

          {/* Battle Actions */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => handleMakeMove({
                slot: 0,
                action: 'MOVE',
                moveId: 'thunderbolt',
                target: 0
              })}
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Thunderbolt
            </button>

            <button
              onClick={handleForfeit}
              disabled={loading}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Forfeit
            </button>
          </div>
        </div>
      )}

      {/* Battle Events */}
      {battleEvents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Battle Events</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {battleEvents.map((event, index) => (
              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                <strong>{event.type}:</strong> {JSON.stringify(event, null, 2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
