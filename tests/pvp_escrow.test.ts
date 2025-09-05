import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PvpEscrow } from "../target/types/pvp_escrow";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("pvp_escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PvpEscrow as Program<PvpEscrow>;
  const provider = anchor.getProvider();

  // Test accounts
  let creator: Keypair;
  let opponent: Keypair;
  let feeVault: Keypair;
  let lobbyId: string;

  before(async () => {
    creator = Keypair.generate();
    opponent = Keypair.generate();
    feeVault = Keypair.generate();
    lobbyId = "test-lobby-" + Date.now();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(opponent.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(feeVault.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Creates a lobby successfully", async () => {
    const wagerLamports = 0.1 * anchor.web3.LAMPORTS_PER_SOL;

    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT"), Buffer.from(lobbyId)],
      program.programId
    );

    const tx = await program.methods
      .createLobby(lobbyId, new anchor.BN(wagerLamports))
      .accounts({
        lobby: lobbyPda,
        vault: vaultPda,
        creator: creator.publicKey,
        feeVault: feeVault.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    console.log("Create lobby transaction:", tx);

    // Verify lobby was created
    const lobby = await program.account.lobby.fetch(lobbyPda);
    expect(lobby.creator.toString()).to.equal(creator.publicKey.toString());
    expect(lobby.lobbyId).to.equal(lobbyId);
    expect(lobby.wagerLamports.toNumber()).to.equal(wagerLamports);
    expect(lobby.status.open).to.be.true;

    // Verify vault has the wager
    const vault = await program.account.vault.fetch(vaultPda);
    expect(vault.totalDeposited.toNumber()).to.equal(wagerLamports);
  });

  it("Allows opponent to join lobby", async () => {
    const wagerLamports = 0.1 * anchor.web3.LAMPORTS_PER_SOL;

    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT"), Buffer.from(lobbyId)],
      program.programId
    );

    const tx = await program.methods
      .joinLobby()
      .accounts({
        lobby: lobbyPda,
        vault: vaultPda,
        opponent: opponent.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([opponent])
      .rpc();

    console.log("Join lobby transaction:", tx);

    // Verify lobby was updated
    const lobby = await program.account.lobby.fetch(lobbyPda);
    expect(lobby.opponent.toString()).to.equal(opponent.publicKey.toString());
    expect(lobby.status.full).to.be.true;

    // Verify vault has both wagers
    const vault = await program.account.vault.fetch(vaultPda);
    expect(vault.totalDeposited.toNumber()).to.equal(wagerLamports * 2);
  });

  it("Locks lobby for battle", async () => {
    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      program.programId
    );

    const tx = await program.methods
      .lockLobby()
      .accounts({
        lobby: lobbyPda,
      })
      .rpc();

    console.log("Lock lobby transaction:", tx);

    // Verify lobby is locked
    const lobby = await program.account.lobby.fetch(lobbyPda);
    expect(lobby.status.inProgress).to.be.true;
  });

  it("Resolves match and distributes winnings", async () => {
    const wagerLamports = 0.1 * anchor.web3.LAMPORTS_PER_SOL;
    const protocolFee = Math.floor((wagerLamports * 2 * 250) / 10000); // 2.5% fee
    const winnings = (wagerLamports * 2) - protocolFee;

    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(lobbyId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT"), Buffer.from(lobbyId)],
      program.programId
    );

    const transcriptHash = new Uint8Array(32).fill(1);

    const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);
    const feeVaultBalanceBefore = await provider.connection.getBalance(feeVault.publicKey);

    const tx = await program.methods
      .resolveMatch(creator.publicKey, transcriptHash)
      .accounts({
        lobby: lobbyPda,
        vault: vaultPda,
        creator: creator.publicKey,
        opponent: opponent.publicKey,
        feeVault: feeVault.publicKey,
      })
      .rpc();

    console.log("Resolve match transaction:", tx);

    // Verify lobby is resolved
    const lobby = await program.account.lobby.fetch(lobbyPda);
    expect(lobby.status.resolved).to.be.true;
    expect(lobby.winner.toString()).to.equal(creator.publicKey.toString());

    // Verify balances
    const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);
    const feeVaultBalanceAfter = await provider.connection.getBalance(feeVault.publicKey);

    expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(winnings);
    expect(feeVaultBalanceAfter - feeVaultBalanceBefore).to.equal(protocolFee);
  });

  it("Cannot join own lobby", async () => {
    const newLobbyId = "test-lobby-own-" + Date.now();
    const wagerLamports = 0.1 * anchor.web3.LAMPORTS_PER_SOL;

    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(newLobbyId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT"), Buffer.from(newLobbyId)],
      program.programId
    );

    // Create lobby
    await program.methods
      .createLobby(newLobbyId, new anchor.BN(wagerLamports))
      .accounts({
        lobby: lobbyPda,
        vault: vaultPda,
        creator: creator.publicKey,
        feeVault: feeVault.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Try to join own lobby (should fail)
    try {
      await program.methods
        .joinLobby()
        .accounts({
          lobby: lobbyPda,
          vault: vaultPda,
          opponent: creator.publicKey, // Same as creator
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();
      
      expect.fail("Should have failed to join own lobby");
    } catch (error) {
      expect(error.message).to.include("Cannot join own lobby");
    }
  });

  it("Can cancel lobby and refund deposits", async () => {
    const cancelLobbyId = "test-lobby-cancel-" + Date.now();
    const wagerLamports = 0.1 * anchor.web3.LAMPORTS_PER_SOL;

    const [lobbyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOBBY"), Buffer.from(cancelLobbyId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT"), Buffer.from(cancelLobbyId)],
      program.programId
    );

    // Create lobby
    await program.methods
      .createLobby(cancelLobbyId, new anchor.BN(wagerLamports))
      .accounts({
        lobby: lobbyPda,
        vault: vaultPda,
        creator: creator.publicKey,
        feeVault: feeVault.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);

    // Cancel lobby
    const tx = await program.methods
      .cancelLobby()
      .accounts({
        lobby: lobbyPda,
        vault: vaultPda,
        creator: creator.publicKey,
        opponent: opponent.publicKey,
      })
      .rpc();

    console.log("Cancel lobby transaction:", tx);

    // Verify lobby is cancelled
    const lobby = await program.account.lobby.fetch(lobbyPda);
    expect(lobby.status.cancelled).to.be.true;

    // Verify creator got refund
    const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);
    expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(wagerLamports);
  });
});
