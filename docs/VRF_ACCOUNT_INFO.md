# 🎲 Información del VRF Account

## 📍 **Tu VRF Account PDA:**

Dado que tu programa tiene el ID `PackVRF111111111111111111111111111111111` y usa la semilla `"VRF"`, el VRF Account PDA es:

```
VRF Account PDA: [Se calcula automáticamente con la semilla "VRF"]
```

## 🔧 **Cómo calcularlo manualmente:**

### Opción 1: Usando Solana CLI
```bash
# Calcular PDA
solana address --seed "VRF" --program-id PackVRF111111111111111111111111111111111
```

### Opción 2: Usando JavaScript
```javascript
const { PublicKey } = require('@solana/web3.js');

const programId = new PublicKey('PackVRF111111111111111111111111111111111');
const [vrfAccountPda, vrfBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("VRF")],
  programId
);

console.log("VRF Account:", vrfAccountPda.toString());
```

### Opción 3: Usando Rust
```rust
use anchor_lang::prelude::*;

let (vrf_account, bump) = Pubkey::find_program_address(
    &[b"VRF"],
    &program_id
);
```

## 📝 **Configuración en .env:**

Una vez que tengas el VRF Account PDA, agrégalo a tu `.env`:

```env
SWITCHBOARD_VRF_QUEUE=tu_vrf_account_pda_aqui
```

## 🚀 **Para inicializar el VRF Account:**

### Opción 1: Ejecutar test (recomendado)
```bash
anchor test tests/vrf_integration.test.ts
```

### Opción 2: Usar la función desde tu frontend
```typescript
// En tu frontend
const tx = await program.methods
  .initializeVrf()
  .accounts({
    vrfAccount: vrfAccountPda,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## 💡 **Información importante:**

- **Program ID:** `PackVRF111111111111111111111111111111111`
- **Semilla:** `"VRF"`
- **Authority:** Tu wallet public key
- **Costo:** ~0.002 SOL por solicitud VRF

## 🔗 **URLs útiles:**

- **Devnet Explorer:** https://explorer.solana.com/?cluster=devnet
- **Tu wallet:** `5bsb7tA7CsaCDo8xTVpVKXNAQZus4DPgZr1Bd4K9FGe2`
