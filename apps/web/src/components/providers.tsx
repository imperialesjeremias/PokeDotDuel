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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <PrivyProvider
              appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
              config={{
                appearance: {
                  theme: 'light',
                  accentColor: '#3B82F6',
                  logo: '/logo.png',
                },
                loginMethods: ['wallet', 'email', 'google', 'twitter'],
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
              <WagmiProvider config={config}>
                {children}
              </WagmiProvider>
            </PrivyProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
