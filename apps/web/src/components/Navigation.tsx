'use client';

import { useState } from 'react';
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
  Users,
  Menu,
  X,
  Zap,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import Image from "next/image";
import pokeDuelLogo from "@/components/ui/pokeduel-logo.png";

export function Navigation() {
  const { user, logout } = usePrivy();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { href: '/quickmatch', label: 'Partida Rápida', icon: Zap },
    { href: '/create-lobby', label: 'Crear Lobby', icon: Plus },
    { href: '/battle', label: 'Batalla', icon: Sword },
    { href: '/team-builder', label: 'Equipo', icon: Users },
    { href: '/packs', label: 'Packs', icon: Package },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-red-600 border-b-4 border-red-800 shadow-[0_4px_0px_0px_#8B0000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* POKEDUEL Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <Image 
                src={pokeDuelLogo} 
                alt="PokeDuel Logo" 
                width={120} 
                height={30} 
                className="drop-shadow-lg" 
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-3 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all hover:shadow-[1px_1px_0px_0px_#8B0000] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                <div className="flex items-center space-x-1">
                  <item.icon className="w-3 h-3 text-orange-200" />
                  <span className="font-pixel text-orange-100 text-xs">{item.label.toUpperCase()}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="px-2 py-1 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 text-orange-100" />
                ) : (
                  <Menu className="w-4 h-4 text-orange-100" />
                )}
              </button>
            </div>

            {/* Desktop Trainer Menu */}
            <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
              {/* Trainer Info */}
              <div className="px-2 py-1 bg-orange-600 border-2 border-orange-800 shadow-[2px_2px_0px_0px_#8B0000]">
                <span className="font-pixel text-white text-xs">
                  {user?.wallet?.address ?
                    `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-3)}` :
                    'TRAINER'
                  }
                </span>
              </div>

              {/* Profile Link */}
              <Link href="/profile">
                <div className="px-2 py-1 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all hover:shadow-[1px_1px_0px_0px_#8B0000] hover:translate-x-[1px] hover:translate-y-[1px]">
                  <span className="font-pixel text-orange-100 text-xs">PROFILE</span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-2 py-1 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all hover:shadow-[1px_1px_0px_0px_#8B0000] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                <span className="font-pixel text-orange-100 text-xs">LOGOUT</span>
              </button>
            </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-red-800 bg-gradient-to-r from-orange-600 to-red-600">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all"
                >
                  <item.icon className="w-4 h-4 text-orange-200" />
                  <span className="font-pixel text-orange-100 text-sm">{item.label.toUpperCase()}</span>
                </Link>
              ))}
              
              {/* Mobile User Menu */}
              <div className="pt-2 border-t border-red-800 space-y-2">
                {/* Trainer Info */}
                <div className="px-3 py-2 bg-orange-600 border-2 border-orange-800 shadow-[2px_2px_0px_0px_#8B0000]">
                  <span className="font-pixel text-white text-xs">
                    {user?.wallet?.address ?
                      `TRAINER ${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` :
                      'TRAINER'
                    }
                  </span>
                </div>
                
                {/* Profile Link */}
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all">
                    <User className="w-4 h-4 text-orange-200" />
                    <span className="font-pixel text-orange-100 text-sm">PROFILE</span>
                  </div>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 bg-red-700 hover:bg-red-800 border-2 border-red-900 shadow-[2px_2px_0px_0px_#8B0000] transition-all"
                >
                  <LogOut className="w-4 h-4 text-orange-200" />
                  <span className="font-pixel text-orange-100 text-sm">LOGOUT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
