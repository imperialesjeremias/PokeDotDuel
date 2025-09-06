# PokeDotDuel TypeScript Client

Cliente TypeScript completo para interactuar con los programas de Solana de PokeDotDuel.

## 📦 Instalación

Las dependencias ya están incluidas en `package.json`:

```json
{
  "@solana/web3.js": "^1.87.6",
  "@solana/wallet-adapter-react": "...",
  "@solana/wallet-adapter-wallets": "..."
}
```

## 🏗️ Arquitectura

### Clientes Disponibles

- **PVPEscrowClient**: Gestión de lobbies PVP
- **VRFClient**: Sistema de apertura de packs con VRF
- **BridgeClient**: Puente PokéCoins/SOL

### Hooks de React

- `usePVP()`: Para batallas PVP
- `useVRF()`: Para sistema de packs
- `useBridge()`: Para puente de tokens

## 🚀 Uso Básico

### 1. Configuración Inicial

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { usePVP, useVRF, useBridge } from '../hooks';

function MyComponent() {
  const { publicKey } = useWallet();
  const pvp = usePVP();
  const vrf = useVRF();
  const bridge = useBridge();

  // Tu lógica aquí
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
    console.log('Lobby creado:', signature);
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

    // 2. Monitorear estado
    const pack = await vrf.getPack(packId);

    // 3. Abrir cuando VRF esté listo
    if (pack?.status === 'vrfRequested') {
      await vrf.openPack({ packId }, vrfAccount);
    }

    // 4. Reclamar recompensas
    await vrf.claimRewards(packId);

  } catch (error) {
    console.error('Error abriendo pack:', error);
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
    console.log('Depósito realizado:', signature);
  } catch (error) {
    console.error('Error en depósito:', error);
  }
};
```

## 📋 Tipos de Datos

### Estados de Lobby
```typescript
enum LobbyStatus {
  Open = "open",
  Full = "full",
  InProgress = "inProgress",
  Resolved = "resolved",
  Cancelled = "cancelled"
}
```

### Estados de Pack
```typescript
enum PackStatus {
  Purchased = "purchased",
  VrfRequested = "vrfRequested",
  Opened = "opened",
  Claimed = "claimed"
}
```

### Rarezas de Cartas
```typescript
enum CardRarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary"
}
```

## 🔧 Configuración de Conexión

```typescript
// En .env.local
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

// Program IDs (Actualizar con direcciones reales)
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=11111111111111111111111111111112
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=11111111111111111111111111111113
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=11111111111111111111111111111114
```

## ⚙️ Configuración de Program IDs

**IMPORTANTE**: Actualiza las variables `NEXT_PUBLIC_*_PROGRAM_ID` con las direcciones reales de tus programas de Solana una vez que los despliegues.

### Para desarrollo local:
1. Despliega tus programas usando Anchor o similar
2. Copia las direcciones generadas
3. Actualiza las variables de entorno
4. Reinicia el servidor de desarrollo

## 🧪 Testing

### Ejecutar Tests
```bash
npm run test
```

### Tests Disponibles
- `pvp_escrow.test.ts`: Tests para sistema PVP
- `packs_vrf.test.ts`: Tests para sistema VRF
- `vrf_integration.test.ts`: Tests de integración VRF

## 📚 Ejemplos Completos

Revisa los archivos en `src/examples/`:

- `pvpExample.ts`: Ejemplo completo de uso PVP
- `vrfExample.ts`: Ejemplo completo de apertura de packs

## ⚠️ Notas Importantes

1. **Wallet Connection**: Asegúrate de que el usuario tenga una wallet conectada
2. **Error Handling**: Siempre maneja errores en las transacciones
3. **Loading States**: Usa los estados de loading para mejorar UX
4. **Network**: Verifica que estés en la red correcta (devnet/mainnet)

## 🔗 Enlaces Útiles

- [Documentación Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Switchboard VRF](https://switchboard.xyz/docs/solana/vrf/)

---

¡El cliente TypeScript está listo para usar! 🎉
