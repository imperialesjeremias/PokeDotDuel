'use client';

import { usePrivy } from '@privy-io/react-auth';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sword className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">PokeBattle</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                En Vivo
              </Badge>
              <Button onClick={login} className="bg-blue-600 hover:bg-blue-700">
                Conectar Wallet
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Batallas Pokémon
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              con Apuestas Reales
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Combate por turnos con mecánicas auténticas de Pokémon Gen 1. 
            Gana SOL real, colecciona cartas raras y construye el equipo definitivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={login}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              <Sword className="w-5 h-5 mr-2" />
              Empezar a Jugar
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/how-to-play')}
              className="text-lg px-8 py-3"
            >
              <Shield className="w-5 h-5 mr-2" />
              Cómo Jugar
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una experiencia de juego completa con tecnología blockchain
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para la Batalla?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Conecta tu wallet y comienza tu aventura Pokémon con apuestas reales
          </p>
          <Button 
            size="lg" 
            onClick={login}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            <Star className="w-5 h-5 mr-2" />
            Conectar y Jugar
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sword className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">PokeBattle</span>
              </div>
              <p className="text-gray-400">
                El primer criptojuego PvP de Pokémon con apuestas en SOL
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Juego</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/how-to-play" className="hover:text-white">Cómo Jugar</a></li>
                <li><a href="/marketplace" className="hover:text-white">Marketplace</a></li>
                <li><a href="/leaderboard" className="hover:text-white">Rankings</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/docs" className="hover:text-white">Documentación</a></li>
                <li><a href="/whitepaper" className="hover:text-white">Whitepaper</a></li>
                <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms" className="hover:text-white">Términos</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacidad</a></li>
                <li><a href="/contact" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PokeBattle. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
