import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Solana configuration
export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(SOLANA_CLUSTER as any);

// Create connection
export const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: RPC_URL.replace('https://', 'wss://'),
});

// Program IDs - Configurar con las direcciones de los programas desplegados
export const PROGRAMS = {
  PVP_ESCROW: new PublicKey(process.env.NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID || '11111111111111111111111111111112'),
  PACKS_VRF: new PublicKey(process.env.NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID || '11111111111111111111111111111113'),
  POKECOINS_BRIDGE: new PublicKey(process.env.NEXT_PUBLIC_BRIDGE_PROGRAM_ID || '11111111111111111111111111111114'),
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
