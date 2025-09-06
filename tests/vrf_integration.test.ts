import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PacksVrf } from "../target/types/packs_vrf";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("VRF Integration", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PacksVrf as Program<PacksVrf>;
  const provider = anchor.getProvider();

  // Test accounts
  let authority: Keypair;
  let vrfAccountPda: PublicKey;
  let vrfBump: number;

  before(async () => {
    authority = Keypair.generate();
    
    // Airdrop SOL to test account
    await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Find VRF Account PDA
    [vrfAccountPda, vrfBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("VRF")],
      program.programId
    );
    
    console.log("🎲 VRF Account PDA:", vrfAccountPda.toString());
    console.log("🔢 VRF Bump:", vrfBump);
  });

  it("Initializes VRF Account", async () => {
    console.log("📋 Inicializando VRF Account...");
    
    const tx = await program.methods
      .initializeVrf()
      .accounts({
        vrfAccount: vrfAccountPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("✅ VRF Account inicializado!");
    console.log("🔗 Transaction:", tx);

    // Verify the VRF Account was created
    const vrfAccount = await program.account.vrfAccount.fetch(vrfAccountPda);
    expect(vrfAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(vrfAccount.bump).to.equal(vrfBump);

    console.log("📊 VRF Account Data:", {
      authority: vrfAccount.authority.toString(),
      bump: vrfAccount.bump,
    });

    console.log("\n🎉 ¡VRF Account creado exitosamente!");
    console.log("📝 Agrega esto a tu .env:");
    console.log(`SWITCHBOARD_VRF_QUEUE=${vrfAccountPda.toString()}`);
  });

  it("Cannot initialize VRF Account twice", async () => {
    try {
      await program.methods
        .initializeVrf()
        .accounts({
          vrfAccount: vrfAccountPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();
      
      expect.fail("Should have failed to initialize VRF Account twice");
    } catch (error) {
      expect(error.message).to.include("already in use");
    }
  });
});
