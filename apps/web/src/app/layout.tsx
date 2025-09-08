import type { Metadata } from 'next';
import { Press_Start_2P, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const pixelFont = Press_Start_2P({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PokeBattle - Criptojuego PvP con Apuestas en SOL',
  description: 'Juega batallas Pokémon PvP con apuestas en SOL. Colecciona cartas, construye equipos y compite por premios reales.',
  keywords: ['Pokemon', 'PvP', 'Solana', 'Crypto', 'Gaming', 'NFT', 'Trading'],
  authors: [{ name: 'PokeBattle Team' }],
  openGraph: {
    title: 'PokeBattle - Criptojuego PvP con Apuestas en SOL',
    description: 'Juega batallas Pokémon PvP con apuestas en SOL. Colecciona cartas, construye equipos y compite por premios reales.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PokeBattle - Criptojuego PvP con Apuestas en SOL',
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
        </Providers>
      </body>
    </html>
  );
}
