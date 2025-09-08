'use client';

import { usePrivy } from '@privy-io/react-auth';

// Force dynamic rendering to avoid static generation issues with Privy
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sword, 
  Coins, 
  Users, 
  Package, 
  Trophy, 
  Zap,
  Shield,
  Star
} from 'lucide-react';

export default function HomePage() {
  const { ready, authenticated, login, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  const features = [
    {
      icon: Sword,
      title: 'Batallas PvP',
      description: 'Combate por turnos con mecánicas auténticas de Pokémon Gen 1',
    },
    {
      icon: Coins,
      title: 'Apuestas en SOL',
      description: 'Gana SOL real compitiendo en batallas con apuestas',
    },
    {
      icon: Users,
      title: 'Matchmaking',
      description: 'Sistema de emparejamiento por rangos de apuesta',
    },
    {
      icon: Package,
      title: 'Booster Packs',
      description: 'Compra packs con SOL y descubre cartas raras',
    },
    {
      icon: Trophy,
      title: 'Rankings',
      description: 'Sube de nivel y desbloquea insignias especiales',
    },
    {
      icon: Zap,
      title: 'Tiempo Real',
      description: 'WebSockets para batallas fluidas y sincronizadas',
    },
  ];

  const stats = [
    { label: 'Jugadores Activos', value: '1,234' },
    { label: 'SOL en Apuestas', value: '45.6' },
    { label: 'Cartas Coleccionadas', value: '12,345' },
    { label: 'Batallas Jugadas', value: '5,678' },
  ];

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600">
        <div className="w-32 h-32 border-8 border-orange-800 bg-orange-400 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-900 animate-pixel-step"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pokemon-blue-bg">
      {/* Pokemon Game Style Header */}
      <header className="pokecenter-ui border-b-8 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-pixel text-black">POKEDOTDUEL</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="battle-ui px-3 py-1">
                <span className="text-xs">ONLINE</span>
              </div>
              <Button onClick={login} className="pokemon-red-theme border-4 border-black font-pixel px-6 py-3 hover:bg-pokemon-red-accent">
                Conectar Wallet
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Pokemon Game Style Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pokemon-menu p-8 mb-12 animate-pixel-fade">
            <h1 className="text-4xl md:text-6xl font-pixel text-black mb-6">
              POKEMON BATTLE
              <span className="block text-pokemon-red-primary">
                ARENA
              </span>
            </h1>
            <div className="status-window max-w-3xl mx-auto mb-8">
              <p className="text-lg font-pixel text-black">
                ► Combate por turnos con mecánicas auténticas de Pokémon Gen 1<br/>
                ► Gana SOL real, colecciona cartas raras<br/>
                ► Construye el equipo definitivo
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={login}
                className="pokemon-red-theme border-4 border-black font-pixel px-8 py-4 text-lg hover:bg-pokemon-red-accent"
              >
                ► EMPEZAR BATALLA
              </Button>
              <Button 
                size="lg" 
                onClick={() => router.push('/how-to-play')}
                className="pokemon-blue-theme border-4 border-black font-pixel px-8 py-4 text-lg hover:bg-pokemon-blue-accent"
              >
                ► COMO JUGAR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pokemon Stats Section */}
      <section className="py-16 bg-pokemon-yellow-bg border-t-8 border-b-8 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="battle-ui text-center animate-pixel-fade" style={{animationDelay: `${index * 150}ms`}}>
                <div className="text-3xl font-pixel text-white mb-2">{stat.value}</div>
                <div className="text-gray-300 font-pixel text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pokemon Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="pokemon-menu p-6 inline-block">
              <h2 className="text-4xl font-pixel text-black mb-4 animate-pixel-step">
                ► CARACTERISTICAS ◄
              </h2>
            </div>
            <div className="status-window max-w-2xl mx-auto mt-6">
              <p className="text-lg font-pixel text-black">
                Una experiencia de juego completa con tecnología blockchain
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`pokemon-menu animate-pixel-fade`} style={{animationDelay: `${index * 100}ms`}}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="pokeball mr-3"></div>
                    <feature.icon className="w-6 h-6 text-black mr-2" />
                    <h3 className="text-lg font-pixel text-black">{feature.title}</h3>
                  </div>
                  <div className="status-window">
                    <p className="text-black font-pixel text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pokemon CTA Section */}
      <section className="py-20 pokecenter-ui">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="battle-ui p-8 inline-block">
            <h2 className="text-4xl font-pixel text-white mb-6">
              ¿LISTO PARA LA BATALLA?
            </h2>
            <p className="text-lg font-pixel text-gray-300 mb-8">
              ► Conecta tu wallet y comienza tu aventura Pokémon
            </p>
            <Button 
              size="lg" 
              onClick={login}
              className="pokemon-yellow-theme border-4 border-black font-pixel text-lg px-8 py-4 hover:bg-pokemon-yellow-accent"
            >
              ★ CONECTAR Y JUGAR ★
            </Button>
          </div>
        </div>
      </section>

      {/* Pokemon Footer */}
      <footer className="bg-black border-t-8 border-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl font-pixel text-white">POKEDOTDUEL</span>
              </div>
              <div className="status-window">
                <p className="text-black font-pixel text-sm">
                  El primer criptojuego PvP de Pokémon con apuestas en SOL
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-pixel text-white mb-4 border-b-2 border-white pb-2">► JUEGO</h3>
              <div className="pokemon-menu">
                <div className="pokemon-menu-item"><a href="/how-to-play">Cómo Jugar</a></div>
                <div className="pokemon-menu-item"><a href="/marketplace">Marketplace</a></div>
                <div className="pokemon-menu-item"><a href="/leaderboard">Rankings</a></div>
              </div>
            </div>
            <div>
              <h3 className="font-pixel text-white mb-4 border-b-2 border-white pb-2">► RECURSOS</h3>
              <div className="pokemon-menu">
                <div className="pokemon-menu-item"><a href="/docs">Documentación</a></div>
                <div className="pokemon-menu-item"><a href="/whitepaper">Whitepaper</a></div>
                <div className="pokemon-menu-item"><a href="/faq">FAQ</a></div>
              </div>
            </div>
            <div>
              <h3 className="font-pixel text-white mb-4 border-b-2 border-white pb-2">► LEGAL</h3>
              <div className="pokemon-menu">
                <div className="pokemon-menu-item"><a href="/terms">Términos</a></div>
                <div className="pokemon-menu-item"><a href="/privacy">Privacidad</a></div>
                <div className="pokemon-menu-item"><a href="/contact">Contacto</a></div>
              </div>
            </div>
          </div>
          <div className="border-t-4 border-white mt-8 pt-8 text-center">
            <p className="font-pixel text-white">&copy; 2024 POKEDOTDUEL. TODOS LOS DERECHOS RESERVADOS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
