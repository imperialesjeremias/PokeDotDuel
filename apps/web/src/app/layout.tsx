import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
