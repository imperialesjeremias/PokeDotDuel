import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { bridgeClient } from '../lib/clients';

interface UseBridgeReturn {
  // Bridge Operations
  depositSol: (amount: number) => Promise<{ signature: string; pokecoins: number }>;
  withdrawSol: (pokecoins: number) => Promise<{ signature: string; solAmount: number }>;

  // Economy
  getUserBalance: (userId: string) => Promise<number>;
  getExchangeRate: () => Promise<{ pokecoinsPerSol: number; solPerPokecoin: number }>;

  // State
  loading: boolean;
  error: string | null;

  // Utility
  solToPokecoins: (solAmount: number) => number;
  pokecoinsToSol: (pokecoinsAmount: number) => number;
}

export function useBridge(): UseBridgeReturn {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositSol = useCallback(async (
    amount: number
  ): Promise<{ signature: string; pokecoins: number }> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await bridgeClient.depositSol(
        { publicKey, signTransaction },
        { amount: amount * 1_000_000_000 } // Convert to lamports
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit SOL';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction]);

  const withdrawSol = useCallback(async (
    pokecoins: number
  ): Promise<{ signature: string; solAmount: number }> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (pokecoins <= 0) {
      throw new Error('PokéCoins amount must be positive');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await bridgeClient.withdrawSol(
        { publicKey, signTransaction },
        { pokecoins }
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw SOL';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction]);

  const getUserBalance = useCallback(async (userId: string): Promise<number> => {
    try {
      // This would typically call an API endpoint
      // For now, return a mock value
      return 1000; // Mock balance
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balance');
      throw err;
    }
  }, []);

  const getExchangeRate = useCallback(async (): Promise<{
    pokecoinsPerSol: number;
    solPerPokecoin: number;
  }> => {
    try {
      // This would typically call an API endpoint
      return {
        pokecoinsPerSol: 10000,
        solPerPokecoin: 0.0001,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get exchange rate');
      throw err;
    }
  }, []);

  const solToPokecoins = useCallback((solAmount: number): number => {
    return Math.floor(solAmount * 10000); // 10,000 PC per SOL
  }, []);

  const pokecoinsToSol = useCallback((pokecoinsAmount: number): number => {
    return pokecoinsAmount / 10000; // 0.0001 SOL per PC
  }, []);

  return {
    // Bridge Operations
    depositSol,
    withdrawSol,

    // Economy
    getUserBalance,
    getExchangeRate,

    // State
    loading,
    error,

    // Utility
    solToPokecoins,
    pokecoinsToSol,
  };
}
