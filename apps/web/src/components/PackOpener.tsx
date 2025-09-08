import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useVRF } from '../hooks/useVRF';
import { PackReward } from '../types/shared';

export function PackOpener() {
  const { publicKey } = useWallet();
  const {
    buyPack,
    requestVrf,
    openPack,
    claimRewards,
    currentPack,
    loading,
    error,
    getUserPacks,
  } = useVRF();

  const [userPacks, setUserPacks] = useState<any[]>([]);
  const [openingPack, setOpeningPack] = useState(false);
  const [revealedRewards, setRevealedRewards] = useState<PackReward[]>([]);

  useEffect(() => {
    if (publicKey) {
      loadUserPacks();
    }
  }, [publicKey]);

  const loadUserPacks = async () => {
    try {
      const packs = await getUserPacks(publicKey!.toString());
      setUserPacks(packs);
    } catch (err) {
      console.error('Failed to load packs:', err);
    }
  };

  const handleBuyPack = async () => {
    try {
      const result = await buyPack();
      console.log('Pack bought:', result);
      await loadUserPacks(); // Reload packs
    } catch (err) {
      console.error('Failed to buy pack:', err);
    }
  };

  const handleOpenPack = async (packId: string) => {
    setOpeningPack(true);
    setRevealedRewards([]);

    try {
      // Simulate VRF request (in real implementation, this would be automatic)
      await requestVrf(
        packId,
        'mock-vrf-account', // Would be real VRF account
        'mock-permission-account',
        'mock-switchboard-state'
      );

      // Open pack
      const result = await openPack(packId);
      setRevealedRewards(result.rewards);

      // Claim rewards
      await claimRewards(packId);

      // Reload packs
      await loadUserPacks();

      console.log('Pack opened:', result);
    } catch (err) {
      console.error('Failed to open pack:', err);
    } finally {
      setOpeningPack(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-500 border-yellow-500';
      case 'RARE': return 'text-blue-500 border-blue-500';
      case 'COMMON': return 'text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400';
        default: return 'text-gray-500 dark:text-gray-400 border-gray-500 dark:border-gray-400';
    }
  };

  const getPokemonImage = (dexNumber: number) => {
    // Placeholder for Pokemon images
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Pack Opener</h1>
        <p className="mb-4">Connect your wallet to open packs!</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Booster Pack Opener</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Buy Pack */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Buy Booster Pack</h2>
        <p className="mb-4">Price: 0.1 SOL</p>
        <button
          onClick={handleBuyPack}
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Buying...' : 'Buy Pack (0.1 SOL)'}
        </button>
      </div>

      {/* Current Pack Animation */}
      {openingPack && (
        <div className="bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-lg shadow-md mb-6 text-center border-4 border-orange-600">
          <h2 className="text-xl font-pixel text-orange-800 mb-4">OPENING PACK...</h2>
          <div className="w-16 h-16 border-4 border-orange-600 bg-orange-400 animate-pulse mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-800 animate-pixel-step"></div>
          </div>
        </div>
      )}

      {/* Revealed Rewards */}
      {revealedRewards.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Pack Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {revealedRewards.map((reward, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 text-center ${getRarityColor(reward.rarity)}`}
              >
                <img
                  src={getPokemonImage(reward.dexNumber)}
                  alt={`Pokemon ${reward.dexNumber}`}
                  className="w-16 h-16 mx-auto mb-2"
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=?';
                  }}
                />
                <p className="font-semibold">#{reward.dexNumber.toString().padStart(3, '0')}</p>
                <p className="text-sm">{reward.rarity}</p>
                {reward.isShiny && (
                  <p className="text-yellow-500 font-bold">✨ SHINY ✨</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Packs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Packs</h2>

        {userPacks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No packs yet. Buy your first pack!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userPacks.map((pack) => (
              <div key={pack.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">Pack #{pack.id.slice(-8)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Status: {pack.opened ? 'Opened' : 'Unopened'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Purchased: {new Date(pack.created_at).toLocaleDateString()}
                </p>

                {!pack.opened && (
                  <button
                    onClick={() => handleOpenPack(pack.id)}
                    disabled={loading || openingPack}
                    className="mt-2 w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50"
                  >
                    {openingPack ? 'Opening...' : 'Open Pack'}
                  </button>
                )}

                {pack.opened && pack.pack_rewards && (
                  <div className="mt-2">
                    <p className="text-sm font-medium dark:text-gray-200">Contents:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pack.pack_rewards.map((reward: PackReward, index: number) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded ${getRarityColor(reward.rarity)}`}
                        >
                          #{reward.dexNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pack Statistics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Pack Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{userPacks.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Packs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {userPacks.filter(p => p.opened).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Opened</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {userPacks.reduce((total, pack) =>
                total + (pack.pack_rewards?.length || 0), 0
              )}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Cards Collected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {userPacks.reduce((total, pack) =>
                total + (pack.pack_rewards?.filter((r: any) => r.is_shiny).length || 0), 0
              )}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Shiny Cards</p>
          </div>
        </div>
      </div>
    </div>
  );
}
