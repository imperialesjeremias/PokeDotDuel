# 🎲 Configuración de VRF para PokeDotDuel (TypeScript)

## ✅ Cliente TypeScript Implementado

El cliente VRF ya está completamente implementado en TypeScript. Esta guía te ayuda a configurar la conexión con Switchboard VRF.

## Opción 1: Usando la Interfaz Web (Más Fácil)

### 1. Ve a Switchboard App
- **URL:** https://app.switchboard.xyz/
- Conecta tu wallet de Solana
- Asegúrate de estar en **Devnet**

### 2. Crear VRF Account
1. Ve a la sección **"VRF"**
2. Haz clic en **"Create VRF Account"**
3. Configura:
   - **Authority:** Tu wallet address
   - **Callback Program:** Tu programa ID (después de desplegar)
   - **Callback Accounts:** Las cuentas que necesites
   - **Callback IX Data:** Datos de la instrucción

### 3. Configurar el Cliente
- Copia la **Public Key** del VRF Account creado
- Agrégala a las llamadas del cliente VRF:
```typescript
const vrfAccount = "tu_vrf_account_id_aqui";

// Usar en el cliente
await vrf.requestVrf(packId, vrfAccount, permissionAccount, switchboardState);
```

## Opción 2: Usando el SDK de Switchboard

### 1. El SDK ya está integrado
El cliente TypeScript ya maneja toda la integración con Switchboard VRF automáticamente.

### 2. Parámetros necesarios
```typescript
// Estos parámetros los obtienes de Switchboard App
const vrfAccount = "dirección-del-vrf-account";
const permissionAccount = "dirección-del-permission-account";
const switchboardState = "dirección-del-switchboard-state";
```

## 🚀 Uso del Cliente VRF TypeScript

### 1. Importar el hook
```typescript
import { useVRF } from '../hooks/useVRF';

function PackComponent() {
  const { requestVrf, openPack, loading, error } = useVRF();
  // ...
}
```

### 2. Solicitar VRF
```typescript
const handleRequestVrf = async (packId: string) => {
  const vrfAccount = "tu-vrf-account-id";
  const permissionAccount = "tu-permission-account-id";
  const switchboardState = "tu-switchboard-state-id";

  await requestVrf(packId, vrfAccount, permissionAccount, switchboardState);
};
```

### 3. Abrir pack
```typescript
const handleOpenPack = async (packId: string) => {
  await openPack({ packId }, vrfAccount);
};
```

### 2. Implementar VRF en tu programa
```rust
use switchboard_v2::VrfAccountData;

// En tu función de compra de pack
pub fn buy_pack_with_vrf(ctx: Context<BuyPackWithVrf>) -> Result<()> {
    // Tu lógica existente...
    
    // Solicitar VRF
    let vrf_account = &ctx.accounts.vrf_account;
    let vrf_request = VrfAccountData::new(vrf_account)?;
    
    // Emitir evento para callback
    emit!(VrfRequested {
        pack_id: pack.pack_id.clone(),
        vrf_account: vrf_account.key(),
    });
    
    Ok(())
}
```

## Configuración Final

### 1. Actualizar .env
```env
# Switchboard VRF
SWITCHBOARD_VRF_QUEUE=tu_vrf_account_id
```

### 2. Actualizar tu programa Solana
```rust
// En tu programa packs_vrf
pub fn request_vrf(
    ctx: Context<RequestVrf>,
    vrf_request_id: String,
) -> Result<()> {
    // Tu lógica existente...
    // Ahora con el VRF Account real
}
```

## URLs Importantes

- **Switchboard App:** https://app.switchboard.xyz/
- **Documentación:** https://docs.switchboard.xyz/
- **Devnet Explorer:** https://explorer.solana.com/?cluster=devnet

## Costos

- **Crear VRF Account:** ~0.1 SOL
- **Cada solicitud VRF:** ~0.002 SOL
- **Total por pack:** ~0.102 SOL

## Próximos Pasos

1. ✅ Crear VRF Account
2. ✅ Actualizar configuración
3. ✅ Desplegar programa actualizado
4. ✅ Probar compra de packs con VRF
