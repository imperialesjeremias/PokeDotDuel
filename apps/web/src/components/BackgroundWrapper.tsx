'use client';

import { useEffect, useState } from 'react';
import { getCurrentBackground, addBackgroundChangeListener, removeBackgroundChangeListener, initializeBackground } from '@/utils/backgroundManager';

export default function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const [currentBg, setCurrentBg] = useState(getCurrentBackground());

  useEffect(() => {
    // Initialize the background system
    initializeBackground();
    
    const handleBackgroundChange = () => {
      setCurrentBg(getCurrentBackground());
    };

    addBackgroundChangeListener(handleBackgroundChange);
    return () => removeBackgroundChangeListener(handleBackgroundChange);
  }, []);

  const getBackgroundImage = () => {
    return currentBg === 'day' ? '/day.jpg' : '/afternoon.jpg';
  };

  return (
    <>
      {/* Fixed background layer */}
      <div 
        className="fixed inset-0 z-[-10]"
        style={{
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Content */}
      {children}
    </>
  );
}