# 🎲 Configuración VRF en TypeScript - PokeDotDuel

## ✅ Cliente TypeScript Implementado:

1. **Cliente VRF completo** en `apps/web/src/lib/vrfClient.ts`
2. **Hooks de React** en `apps/web/src/hooks/useVRF.ts`
3. **Tipos TypeScript** definidos en `apps/web/src/types/solana.ts`
4. **Configuración flexible** via variables de entorno

## 🎯 Configuración del Cliente VRF:

### 1. Variables de Entorno

Actualiza tu `.env.local` con las direcciones de los programas:

```env
# Program IDs
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=tu_program_id_real
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=tu_pvp_program_id
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=tu_bridge_program_id

# Solana RPC
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### 2. Calcular PDAs

Los PDAs se calculan automáticamente en el cliente TypeScript:

```typescript
// Para packs
const [packPDA] = getPackPDA(packId);

// Para VRF accounts (depende del programa externo)
const [vrfPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("VRF")],
  new PublicKey(process.env.NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID!)
);
```

## 🚀 Uso del Cliente VRF:

### 1. Usar el Hook de React

```typescript
import { useVRF } from '../hooks/useVRF';

function PackComponent() {
  const { buyPack, requestVrf, openPack, claimRewards, loading, error } = useVRF();

  const handleBuyPack = async () => {
    try {
      const signature = await buyPack({
        packId: `pack-${Date.now()}`,
      });
      console.log('Pack comprado:', signature);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleOpenPack = async (packId: string) => {
    try {
      // 1. Solicitar VRF
      await requestVrf(packId, vrfAccount, permissionAccount, switchboardState);

      // 2. Abrir pack
      await openPack({ packId }, vrfAccount);

      // 3. Reclamar recompensas
      await claimRewards(packId);
    } catch (err) {
      console.error('Error abriendo pack:', err);
    }
  };

  return (
    <div>
      <button onClick={handleBuyPack} disabled={loading}>
        Comprar Pack
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### 2. Usar el Cliente Directamente

```typescript
import { vrfClient } from '../lib/clients';

const signature = await vrfClient.buyPack(wallet, {
  packId: 'pack-123'
});
```

## 💡 Ventajas de TypeScript:

- ✅ **Integración perfecta** con React/Next.js
- ✅ **Type safety** completo con IntelliSense
- ✅ **Desarrollo rápido** con hot reload
- ✅ **Manejo de errores** con try/catch
- ✅ **Reutilizable** en múltiples componentes

## 📋 Funciones Disponibles:

### Compras y Packs
- `buyPack()` - Comprar booster pack
- `getPack()` - Obtener información del pack

### VRF Operations
- `requestVrf()` - Solicitar aleatoriedad VRF
- `openPack()` - Abrir pack con resultado VRF
- `claimRewards()` - Reclamar recompensas

## 🔧 Configuración Avanzada:

### Custom VRF Parameters
```typescript
// Puedes personalizar los parámetros VRF
const vrfConfig = {
  queue: 'custom-queue-address',
  callback: 'custom-callback-address',
  authority: 'vrf-authority-address'
};
```

### Error Handling
```typescript
const { buyPack, error, loading } = useVRF();

// El hook maneja automáticamente:
// - Conexión de wallet
// - Errores de red
// - Estados de carga
// - Validación de parámetros
```
