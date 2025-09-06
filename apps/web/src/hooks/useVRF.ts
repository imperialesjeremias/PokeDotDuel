import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { vrfClient } from '../lib/clients';
import { PackReward } from '../types/shared';

interface UseVRFReturn {
  // Pack Management
  buyPack: (packId?: string) => Promise<{ packId: string; signature: string }>;
  requestVrf: (
    packId: string,
    vrfAccount: string,
    permissionAccount: string,
    switchboardState: string
  ) => Promise<string>;
  openPack: (
    packId: string,
    vrfAccount?: string
  ) => Promise<{ rewards: PackReward[]; signature: string }>;
  claimRewards: (packId: string) => Promise<string>;

  // State
  currentPack: any | null;
  loading: boolean;
  error: string | null;

  // Utility
  getPack: (packId: string) => Promise<any>;
  getUserPacks: (userId: string) => Promise<any[]>;
}

export function useVRF(): UseVRFReturn {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [currentPack, setCurrentPack] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyPack = useCallback(async (packId?: string): Promise<{ packId: string; signature: string }> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const finalPackId = packId || `pack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const signature = await vrfClient.buyPack(
        { publicKey, signTransaction },
        { packId: finalPackId }
      );

      // Update local state
      setCurrentPack({
        id: finalPackId,
        status: 'purchased',
        buyer: publicKey.toString(),
      });

      return { packId: finalPackId, signature };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to buy pack';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction]);

  const requestVrf = useCallback(async (
    packId: string,
    vrfAccount: string,
    permissionAccount: string,
    switchboardState: string
  ): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const signature = await vrfClient.requestVrf(
        { publicKey, signTransaction },
        { packId }
      );

      // Update local state
      if (currentPack && currentPack.id === packId) {
        setCurrentPack({
          ...currentPack,
          status: 'vrf_requested',
          vrfRequestId: `vrf-${Date.now()}`,
        });
      }

      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request VRF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, currentPack]);

  const openPack = useCallback(async (
    packId: string,
    vrfAccount?: string
  ): Promise<{ rewards: PackReward[]; signature: string }> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await vrfClient.openPack(
        { publicKey, signTransaction },
        { packId }
      );

      // Update local state
      if (currentPack && currentPack.id === packId) {
        setCurrentPack({
          ...currentPack,
          status: 'opened',
          rewards: result.rewards,
          openedAt: new Date().toISOString(),
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open pack';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, currentPack]);

  const claimRewards = useCallback(async (packId: string): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const signature = await vrfClient.claimRewards(
        { publicKey, signTransaction },
        { packId }
      );

      // Update local state
      if (currentPack && currentPack.id === packId) {
        setCurrentPack({
          ...currentPack,
          status: 'claimed',
          claimedAt: new Date().toISOString(),
        });
      }

      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim rewards';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, currentPack]);

  const getPack = useCallback(async (packId: string): Promise<any> => {
    try {
      const pack = await vrfClient.getPack(packId);
      if (pack.id === currentPack?.id) {
        setCurrentPack(pack);
      }
      return pack;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get pack');
      throw err;
    }
  }, [currentPack]);

  const getUserPacks = useCallback(async (userId: string): Promise<any[]> => {
    try {
      const packs = await vrfClient.getUserPacks(userId);
      return packs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user packs');
      throw err;
    }
  }, []);

  return {
    // Pack Management
    buyPack,
    requestVrf,
    openPack,
    claimRewards,

    // State
    currentPack,
    loading,
    error,

    // Utility
    getPack,
    getUserPacks,
  };
}
