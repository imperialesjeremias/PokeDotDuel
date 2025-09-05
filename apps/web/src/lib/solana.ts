import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Solana configuration
export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(SOLANA_CLUSTER);

// Create connection
export const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: RPC_URL.replace('https://', 'wss://'),
});

// Program IDs (these will be set after deployment)
export const PROGRAMS = {
  PVP_ESCROW: new PublicKey('11111111111111111111111111111111'), // Placeholder
  PACKS_VRF: new PublicKey('11111111111111111111111111111111'), // Placeholder
  POKECOINS_BRIDGE: new PublicKey('11111111111111111111111111111111'), // Placeholder
} as const;

// Constants
export const LAMPORTS_PER_SOL = 1_000_000_000;
export const PACK_PRICE_LAMPORTS = 100_000_000; // 0.1 SOL

// Utility functions
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function formatSol(lamports: number): string {
  return `${lamportsToSol(lamports).toFixed(4)} SOL`;
}

// PDA helpers
export function getLobbyPDA(lobbyId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('LOBBY'), Buffer.from(lobbyId)],
    PROGRAMS.PVP_ESCROW
  );
}

export function getVaultPDA(lobbyId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('VAULT'), Buffer.from(lobbyId)],
    PROGRAMS.PVP_ESCROW
  );
}

export function getPackPDA(packId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('PACK'), Buffer.from(packId)],
    PROGRAMS.PACKS_VRF
  );
}
