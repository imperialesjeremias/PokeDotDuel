import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PacksVrf } from "../target/types/packs_vrf";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("packs_vrf", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PacksVrf as Program<PacksVrf>;
  const provider = anchor.getProvider();

  // Test accounts
  let buyer: Keypair;
  let packId: string;

  before(async () => {
    buyer = Keypair.generate();
    packId = "test-pack-" + Date.now();

    // Airdrop SOL to test account
    await provider.connection.requestAirdrop(buyer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Purchases a booster pack successfully", async () => {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT")],
      program.programId
    );

    const buyerBalanceBefore = await provider.connection.getBalance(buyer.publicKey);

    const tx = await program.methods
      .buyPack(packId)
      .accounts({
        pack: packPda,
        vault: vaultPda,
        buyer: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    console.log("Buy pack transaction:", tx);

    // Verify pack was created
    const pack = await program.account.pack.fetch(packPda);
    expect(pack.buyer.toString()).to.equal(buyer.publicKey.toString());
    expect(pack.packId).to.equal(packId);
    expect(pack.priceLamports.toNumber()).to.equal(100_000_000); // 0.1 SOL
    expect(pack.status.purchased).to.be.true;

    // Verify payment was made
    const buyerBalanceAfter = await provider.connection.getBalance(buyer.publicKey);
    expect(buyerBalanceBefore - buyerBalanceAfter).to.equal(100_000_000);
  });

  it("Requests VRF for pack opening", async () => {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      program.programId
    );

    const vrfRequestId = "vrf-request-" + Date.now();

    const tx = await program.methods
      .requestVrf(vrfRequestId)
      .accounts({
        pack: packPda,
      })
      .rpc();

    console.log("Request VRF transaction:", tx);

    // Verify pack status updated
    const pack = await program.account.pack.fetch(packPda);
    expect(pack.vrfRequestId).to.equal(vrfRequestId);
    expect(pack.status.vrfRequested).to.be.true;
  });

  it("Fulfills VRF and generates pack rewards", async () => {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      program.programId
    );

    // Generate random seed
    const randomness = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      randomness[i] = Math.floor(Math.random() * 256);
    }

    const tx = await program.methods
      .fulfillVrf(randomness)
      .accounts({
        pack: packPda,
      })
      .rpc();

    console.log("Fulfill VRF transaction:", tx);

    // Verify pack was opened
    const pack = await program.account.pack.fetch(packPda);
    expect(pack.status.opened).to.be.true;
    expect(pack.rewards).to.not.be.null;
    expect(pack.rewards.length).to.equal(5); // 5 cards per pack
    expect(pack.openedAt).to.not.be.null;

    // Verify rewards structure
    for (const reward of pack.rewards) {
      expect(reward.dexNumber).to.be.greaterThan(0);
      expect(reward.dexNumber).to.be.lessThanOrEqual(151);
      expect(reward.level).to.equal(1);
      expect(['Common', 'Rare', 'Legendary']).to.include(reward.rarity);
    }
  });

  it("Claims pack rewards", async () => {
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(packId)],
      program.programId
    );

    const tx = await program.methods
      .claimRewards()
      .accounts({
        pack: packPda,
      })
      .rpc();

    console.log("Claim rewards transaction:", tx);

    // Verify pack is claimed
    const pack = await program.account.pack.fetch(packPda);
    expect(pack.claimed).to.be.true;
  });

  it("Cannot request VRF for unpurchased pack", async () => {
    const newPackId = "test-pack-unpurchased-" + Date.now();
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(newPackId)],
      program.programId
    );

    try {
      await program.methods
        .requestVrf("vrf-request")
        .accounts({
          pack: packPda,
        })
        .rpc();
      
      expect.fail("Should have failed to request VRF for unpurchased pack");
    } catch (error) {
      expect(error.message).to.include("Pack not purchased");
    }
  });

  it("Cannot fulfill VRF without request", async () => {
    const newPackId = "test-pack-no-vrf-" + Date.now();
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(newPackId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT")],
      program.programId
    );

    // Purchase pack
    await program.methods
      .buyPack(newPackId)
      .accounts({
        pack: packPda,
        vault: vaultPda,
        buyer: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    // Try to fulfill VRF without request (should fail)
    try {
      const randomness = new Uint8Array(32).fill(1);
      await program.methods
        .fulfillVrf(randomness)
        .accounts({
          pack: packPda,
        })
        .rpc();
      
      expect.fail("Should have failed to fulfill VRF without request");
    } catch (error) {
      expect(error.message).to.include("VRF not requested");
    }
  });

  it("Cannot claim rewards twice", async () => {
    const newPackId = "test-pack-double-claim-" + Date.now();
    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("PACK"), Buffer.from(newPackId)],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT")],
      program.programId
    );

    // Purchase pack
    await program.methods
      .buyPack(newPackId)
      .accounts({
        pack: packPda,
        vault: vaultPda,
        buyer: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    // Request VRF
    await program.methods
      .requestVrf("vrf-request")
      .accounts({
        pack: packPda,
      })
      .rpc();

    // Fulfill VRF
    const randomness = new Uint8Array(32).fill(1);
    await program.methods
      .fulfillVrf(randomness)
      .accounts({
        pack: packPda,
      })
      .rpc();

    // Claim rewards
    await program.methods
      .claimRewards()
      .accounts({
        pack: packPda,
      })
      .rpc();

    // Try to claim again (should fail)
    try {
      await program.methods
        .claimRewards()
        .accounts({
          pack: packPda,
        })
        .rpc();
      
      expect.fail("Should have failed to claim rewards twice");
    } catch (error) {
      expect(error.message).to.include("Already claimed");
    }
  });
});
