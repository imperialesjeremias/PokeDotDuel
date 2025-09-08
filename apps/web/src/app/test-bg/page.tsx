'use client';

import { useEffect, useState } from 'react';
import { initializeBackground, getCurrentBackground, toggleBackground } from '@/utils/backgroundManager';

export default function TestBackgroundPage() {
  const [currentBg, setCurrentBg] = useState<string>('day');

  useEffect(() => {
    console.log('🧪 Test page mounted, initializing background...');
    // Initialize background system
    initializeBackground();
    setCurrentBg(getCurrentBackground());
  }, []);

  const handleToggle = () => {
    console.log('🧪 Toggle button clicked');
    toggleBackground();
    setCurrentBg(getCurrentBackground());
  };

  return (
    <div className="min-h-screen p-8">
      <div className="bg-white/70 p-8 rounded-lg max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Background Test Page</h1>
        <p className="mb-4">Current background: <strong>{currentBg}</strong></p>
        <button 
          onClick={handleToggle}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Toggle Background
        </button>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>Check the browser console for debug messages.</p>
          <p>The background should be visible behind this white box.</p>
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold mb-2">Image Test:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1">Day Image:</p>
              <img src="/day.jpg" alt="Day" className="w-20 h-20 object-cover border" />
            </div>
            <div>
              <p className="text-xs mb-1">Afternoon Image:</p>
              <img src="/afternoon.jpg" alt="Afternoon" className="w-20 h-20 object-cover border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}