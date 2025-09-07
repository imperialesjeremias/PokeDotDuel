import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'PokeDotDuel - Criptojuego PvP con Apuestas en SOL',
  description: 'Juega batallas Pokémon PvP con apuestas en SOL. Colecciona cartas, construye equipos y compite por premios reales.',
  keywords: ['Pokemon', 'PvP', 'Solana', 'Crypto', 'Gaming', 'NFT', 'Trading', 'battles', 'lobby'],
  authors: [{ name: 'PokeDotDuel Team' }],
  viewport: "width=device-width, initial-scale=1",
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
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
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
