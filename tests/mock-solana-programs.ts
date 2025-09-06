import { PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';

// Mock Solana Programs for Testing
export class MockPVPProgram {
  private programId: PublicKey;
  private accounts: Map<string, any> = new Map();

  constructor() {
    this.programId = new PublicKey('PVP111111111111111111111111111111111111111');
  }

  async createLobby(
    wallet: any,
    wagerAmount: number,
    lobbyId: string
  ): Promise<string> {
    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      this.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT"), wallet.publicKey.toBuffer()],
      this.programId
    );

    // Mock account creation
    this.accounts[lobbyPda.toString()] = {
      id: lobbyId,
      creator: wallet.publicKey.toString(),
      wagerAmount,
      status: 'OPEN',
      escrowPda: vaultPda.toString(),
    };

    this.accounts[vaultPda.toString()] = {
      amount: wagerAmount,
      owner: wallet.publicKey.toString(),
    };

    return 'mock-tx-signature-lobby-created';
  }

  async joinLobby(
    wallet: any,
    lobbyId: string
  ): Promise<string> {
    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      this.programId
    );

    const lobby = this.accounts[lobbyPda.toString()];
    if (!lobby || lobby.status !== 'OPEN') {
      throw new Error('Lobby not available');
    }

    lobby.opponent = wallet.publicKey.toString();
    lobby.status = 'FULL';

    return 'mock-tx-signature-lobby-joined';
  }

  async resolveMatch(
    wallet: any,
    lobbyId: string,
    winner: string
  ): Promise<string> {
    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      this.programId
    );

    const lobby = this.accounts[lobbyPda.toString()];
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    lobby.winner = winner;
    lobby.status = 'RESOLVED';

    return 'mock-tx-signature-match-resolved';
  }

  getAccount(pda: PublicKey): any {
    return this.accounts[pda.toString()];
  }
}

export class MockVRFProgram {
  private programId: PublicKey;
  private accounts: Map<string, any> = new Map();

  constructor() {
    this.programId = new PublicKey('VRF111111111111111111111111111111111111111');
  }

  async buyPack(
    wallet: any,
    packId: string
  ): Promise<string> {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      this.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT")],
      this.programId
    );

    // Mock pack creation
    this.accounts[packPda.toString()] = {
      id: packId,
      buyer: wallet.publicKey.toString(),
      price: 100_000_000, // 0.1 SOL
      status: { purchased: true, vrfRequested: false, opened: false },
      rewards: [],
    };

    return 'mock-tx-signature-pack-bought';
  }

  async requestVRF(
    wallet: any,
    packId: string,
    vrfAccount: string,
    permissionAccount: string,
    switchboardState: string
  ): Promise<string> {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      this.programId
    );

    const pack = this.accounts[packPda.toString()];
    if (!pack) {
      throw new Error('Pack not found');
    }

    pack.status.vrfRequested = true;
    pack.vrfRequestId = `vrf-${Date.now()}`;

    return 'mock-tx-signature-vrf-requested';
  }

  async openPack(
    wallet: any,
    packId: string,
    randomness: Uint8Array
  ): Promise<string> {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      this.programId
    );

    const pack = this.accounts[packPda.toString()];
    if (!pack) {
      throw new Error('Pack not found');
    }

    // Generate mock rewards based on randomness
    pack.rewards = this.generateMockRewards(randomness);
    pack.status.opened = true;
    pack.openedAt = new Date().toISOString();

    return 'mock-tx-signature-pack-opened';
  }

  private generateMockRewards(randomness: Uint8Array): any[] {
    const rewards = [];
    for (let i = 0; i < 5; i++) {
      const seed = randomness[i] || Math.floor(Math.random() * 256);
      const rarity = seed < 20 ? 'LEGENDARY' : seed < 80 ? 'RARE' : 'COMMON';
      const dexNumber = (seed % 151) + 1;

      rewards.push({
        dexNumber,
        level: 1,
        rarity,
        isShiny: (seed % 128) === 0,
      });
    }
    return rewards;
  }

  getAccount(pda: PublicKey): any {
    return this.accounts[pda.toString()];
  }
}

export class MockBridgeProgram {
  private programId: PublicKey;
  private accounts: Map<string, any> = new Map();

  constructor() {
    this.programId = new PublicKey('BRIDGE111111111111111111111111111111111111');
  }

  async depositSol(
    wallet: any,
    amount: number
  ): Promise<{ signature: string; pokecoins: number }> {
    const pokecoins = Math.floor((amount / 1_000_000_000) * 10000); // 10,000 PC per SOL

    // Mock bridge account
    const bridgeAccount = this.accounts['bridge-state'] || { totalDeposited: 0 };
    bridgeAccount.totalDeposited += amount;
    this.accounts['bridge-state'] = bridgeAccount;

    return {
      signature: 'mock-tx-signature-bridge-deposit',
      pokecoins,
    };
  }

  async withdrawSol(
    wallet: any,
    pokecoins: number
  ): Promise<{ signature: string; solAmount: number }> {
    const solAmount = Math.floor((pokecoins / 10000) * 1_000_000_000);

    return {
      signature: 'mock-tx-signature-bridge-withdraw',
      solAmount,
    };
  }

  getBridgeState(): any {
    return this.accounts['bridge-state'] || { totalDeposited: 0 };
  }
}

// Test utilities
export function createMockWallet(): any {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey,
    signTransaction: async (tx: Transaction) => {
      tx.sign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]) => {
      return txs.map(tx => {
        tx.sign(keypair);
        return tx;
      });
    },
  };
}

export function createMockConnection(): any {
  return {
    getBalance: async (pubkey: PublicKey) => 1_000_000_000, // 1 SOL
    getAccountInfo: async (pubkey: PublicKey) => ({
      lamports: 1_000_000_000,
      data: Buffer.from('mock-data'),
      owner: new PublicKey('11111111111111111111111111111112'),
      executable: false,
    }),
    sendTransaction: async (tx: Transaction) => 'mock-tx-signature',
    confirmTransaction: async (signature: string) => ({ value: { err: null } }),
  };
}
