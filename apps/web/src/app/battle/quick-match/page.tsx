'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { initializeBackground } from '@/utils/backgroundManager';
import { QuickMatchPanel } from '@/components/QuickMatchPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function QuickMatchBattlePage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    } else if (authenticated) {
      // Initialize background system for authenticated users
      initializeBackground();
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Zap className="w-8 h-8 mr-3 text-yellow-500" />
            Quick Match
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find an opponent quickly or practice against bots
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Battle Options</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickMatchPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}