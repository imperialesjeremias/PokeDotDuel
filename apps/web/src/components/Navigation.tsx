'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sword,
  User,
  LogOut,
  Home,
  Trophy,
  Package,
  ShoppingCart,
  Users
} from 'lucide-react';
import Link from 'next/link';

export function Navigation() {
  const { user, logout } = usePrivy();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/battle', label: 'Batalla', icon: Sword },
    { href: '/packs', label: 'Packs', icon: Package },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { href: '/team-builder', label: 'Equipo', icon: Users },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PokeBattle</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <User className="w-3 h-3 mr-1" />
                {user?.wallet?.address ?
                  `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` :
                  'Usuario'
                }
              </Badge>
            </div>

            {/* Profile Link */}
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-1" />
                Perfil
              </Button>
            </Link>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
