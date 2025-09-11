import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

// Configure wagmi chains
export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Create a client for React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Privy configuration
export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  config: {
    // Customize the appearance of the login modal
    appearance: {
      theme: 'light',
      accentColor: '#676FFF',
      logo: 'https://your-domain.com/logo.png',
    },
    // Configure login methods
    loginMethods: ['wallet'],
    // Configure embedded wallets
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    // Configure legal
    legal: {
      termsAndConditionsUrl: 'https://your-domain.com/terms',
      privacyPolicyUrl: 'https://your-domain.com/privacy',
    },
  },
};

// Export the providers
export { PrivyProvider, WagmiProvider };
