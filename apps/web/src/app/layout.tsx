import type { Metadata } from 'next';
import { Press_Start_2P, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

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
  title: 'PokeDotDuel - Criptojuego PvP con Apuestas en SOL',
  description: 'Juega batallas Pokémon PvP con apuestas en SOL. Colecciona cartas, construye equipos y compite por premios reales.',
  keywords: ['Pokemon', 'PvP', 'Solana', 'Crypto', 'Gaming', 'NFT', 'Trading', 'battles', 'lobby'],
  authors: [{ name: 'PokeDotDuel Team' }],
  openGraph: {
    title: 'PokeDotDuel - Criptojuego PvP con Apuestas en SOL',
    description: 'Juega batallas Pokémon PvP con apuestas en SOL. Colecciona cartas, construye equipos y compite por premios reales.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PokeDotDuel - Criptojuego PvP con Apuestas en SOL',
    description: 'Juega batallas Pokémon PvP con apuestas en SOL. Colecciona cartas, construye equipos y compite por premios reales.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${pixelFont.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
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
