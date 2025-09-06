# Configuración del Entorno - PokeDotDuel

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Program IDs (Actualizar con las direcciones reales de los programas desplegados)
NEXT_PUBLIC_PVP_ESCROW_PROGRAM_ID=11111111111111111111111111111112
NEXT_PUBLIC_PACKS_VRF_PROGRAM_ID=11111111111111111111111111111113
NEXT_PUBLIC_BRIDGE_PROGRAM_ID=11111111111111111111111111111114

# Privy Configuration (si usas Privy para autenticación)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Supabase Configuration (si usas Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Configuración de Program IDs

Una vez que despliegues tus programas de Solana (usando Anchor u otro framework), actualiza las variables `NEXT_PUBLIC_*_PROGRAM_ID` con las direcciones reales de tus programas desplegados.

### IDs de Programas de Ejemplo:
- PVP_ESCROW: Dirección del programa de escrow para batallas
- PACKS_VRF: Dirección del programa VRF para apertura de packs
- BRIDGE: Dirección del programa de puente PokéCoins/SOL

## Desarrollo Local

1. Copia el contenido de arriba a `.env.local`
2. Actualiza las direcciones de programas cuando los despliegues
3. Reinicia el servidor de desarrollo

```bash
npm run dev
```
