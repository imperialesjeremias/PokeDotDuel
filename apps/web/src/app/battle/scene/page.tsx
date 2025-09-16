'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PVPBattle } from '@/components/PVPBattle';
import { usePVP } from '@/hooks/usePVP';
import { initializeBackground } from '@/utils/backgroundManager';
import { Sword } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function BattleScenePage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const { currentBattle, currentLobby } = usePVP();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    } else if (authenticated) {
      // Initialize background system for authenticated users
      initializeBackground();
    }
  }, [ready, authenticated, router]);

  // Redirect back to battle page if no active battle
  useEffect(() => {
    if (ready && authenticated && !currentBattle && !currentLobby) {
      router.push('/battle');
    }
  }, [ready, authenticated, currentBattle, currentLobby, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600">
        <div className="w-32 h-32 border-8 border-orange-800 bg-orange-400 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-900 animate-pixel-step"></div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Sword className="w-8 h-8 mr-3 text-red-600" />
            Battle Arena
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {currentBattle ? 'Battle in progress' : 'Preparing for battle...'}
          </p>
        </div>

        {/* Battle Interface */}
        <PVPBattle />
      </div>
    </div>
  );
}