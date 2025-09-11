'use client';

import { PrivyProvider, WagmiProvider, config, queryClient } from '@/lib/privy';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Configure Solana network
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#FF6B35',
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI1MCIgZm9udC1mYW1pbHk9IidQcmVzcyBTdGFydCAyUCcsIG1vbm9zcGFjZSIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGNkIzNSIgZmlsdGVyPSJkcm9wLXNoYWRvdygyMnggMnB4IDAgIzk5MUIxQikiPlBPS0VEVUVMPC90ZXh0Pjwvc3ZnPg==',
        },
        loginMethods: ['wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                {children}
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
