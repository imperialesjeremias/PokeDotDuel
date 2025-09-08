# PokeDotDuel TypeScript Client

Complete TypeScript client for interacting with PokeDotDuel's Solana programs.

## 📦 Installation

Dependencies are already included in `package.json`:

```json
{
  "@solana/web3.js": "^1.87.6",
  "@solana/wallet-adapter-react": "...",
  "@solana/wallet-adapter-wallets": "..."
}
```

## 🏗️ Arquitectura

### Available Clients

- **PVPEscrowClient**: PVP lobby management
- **VRFClient**: Pack opening system with VRF
- **BridgeClient**: PokéCoins/SOL bridge

### React Hooks

- `usePVP()`: For PVP battles
- `useVRF()`: For pack system
- `useBridge()`: For token bridge

## 🚀 Basic Usage

### 1. Initial Setup

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { usePVP, useVRF, useBridge } from '../hooks';

function MyComponent() {
  const { publicKey } = useWallet();
  const pvp = usePVP();
  const vrf = useVRF();
  const bridge = useBridge();

  // Your logic here
}
```

### 2. PVP Escrow - Crear Lobby

```typescript
const handleCreateLobby = async () => {
  try {
    const lobbyData = {
      lobbyId: `lobby-${Date.now()}`,
      wagerLamports: 0.1 * 1_000_000_000, // 0.1 SOL
    };

    const signature = await pvp.createLobby(lobbyData, feeVault);
    console.log('Lobby created:', signature);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. VRF - Abrir Pack

```typescript
const handleOpenPack = async (packId: string) => {
  try {
    // 1. Solicitar VRF
    await vrf.requestVrf(packId, vrfAccount, permissionAccount, switchboardState);

    // 2. Monitor status
    const pack = await vrf.getPack(packId);

    // 3. Open when VRF is ready
    if (pack?.status === 'vrfRequested') {
      await vrf.openPack({ packId }, vrfAccount);
    }

    // 4. Claim rewards
    await vrf.claimRewards(packId);

  } catch (error) {
    console.error('Error opening pack:', error);
  }
};
```

### 4. Bridge - Depositar SOL

```typescript
const handleDeposit = async (amount: number) => {
  try {
    const signature = await bridge.depositSol({
      amount: amount * 1_000_000_000 // Convertir a lamports
    });
    console.log('Deposit completed:', signature);
  } catch (error) {
    console.error('Error in deposit:', error);
  }
};
```

## 📋 Tipos de Datos

### Lobby States
```typescript
enum LobbyStatus {
  Open = "open",
  Full = "full",
  InProgress = "inProgress",
  Resolved = "resolved",
  Cancelled = "cancelled"
}
```

### Pack States
```typescript
enum PackStatus {
  Purchased = "purchased",
  VrfRequested = "vrfRequested",
  Opened = "opened",
  Claimed = "claimed"
}
```

### Card Rarities
```typescript
enum CardRarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary"
}
```

## 🔧 Connection Configuration

```typescript
// En .env.local
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

// Program IDs (Update with real addresses)
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=11111111111111111111111111111112
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=11111111111111111111111111111113
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=11111111111111111111111111111114
```

## ⚙️ Program IDs Configuration

**IMPORTANT**: Update the `NEXT_PUBLIC_*_PROGRAM_ID` variables with the real addresses of your Solana programs once you deploy them.

### For local development:
1. Deploy your programs using Anchor or similar
2. Copy the generated addresses
3. Update the environment variables
4. Restart the development server

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Available Tests
- `pvp_escrow.test.ts`: Tests for PVP system
- `packs_vrf.test.ts`: Tests for VRF system
- `vrf_integration.test.ts`: VRF integration tests

## 📚 Complete Examples

Check the files in `src/examples/`:

- `pvpExample.ts`: Complete PVP usage example
- `vrfExample.ts`: Complete pack opening example

## ⚠️ Notas Importantes

1. **Wallet Connection**: Make sure the user has a wallet connected
2. **Error Handling**: Always handle errors in transactions
3. **Loading States**: Use loading states to improve UX
4. **Network**: Verify that you're on the correct network (devnet/mainnet)

## 🔗 Enlaces Útiles

- [Documentación Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Switchboard VRF](https://switchboard.xyz/docs/solana/vrf/)

---

The TypeScript client is ready to use! 🎉
