import type { Metadata } from 'next';
import { Press_Start_2P, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import BackgroundWrapper from '@/components/BackgroundWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const pixelFont = Press_Start_2P({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PokeDotDuel - PvP Crypto Game with SOL Betting',
  description: 'Play Pokémon PvP battles with SOL betting. Collect cards, build teams and compete for real prizes.',
  keywords: ['Pokemon', 'PvP', 'Solana', 'Crypto', 'Gaming', 'NFT', 'Trading', 'battles', 'lobby'],
  authors: [{ name: 'PokeDotDuel Team' }],
  openGraph: {
    title: 'PokeDotDuel - PvP Crypto Game with SOL Betting',
    description: 'Play Pokémon PvP battles with SOL betting. Collect cards, build teams and compete for real prizes.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PokeDotDuel - PvP Crypto Game with SOL Betting',
    description: 'Play Pokémon PvP battles with SOL betting. Collect cards, build teams and compete for real prizes.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${pixelFont.variable}`}>
      <body className="font-sans">
        <Providers>
          <BackgroundWrapper>
            {children}
          </BackgroundWrapper>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
