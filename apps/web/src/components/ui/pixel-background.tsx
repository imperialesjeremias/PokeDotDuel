import React from 'react';

interface PixelBackgroundProps {
  variant?: 'grass' | 'battle' | 'city' | 'default';
  className?: string;
}

export function PixelBackground({
  variant = 'default',
  className,
}: PixelBackgroundProps) {
  const getBackgroundPattern = () => {
    switch (variant) {
      case 'grass':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h20v20H0V0zm20 20h20v20H20V20z" fill="#306230" fillOpacity="0.2" fillRule="evenodd" />
          </svg>
        );
      case 'battle':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h10v10H0V0zm10 10h10v10H10V10zm10 0h10v10H20V10zm10 10h10v10H30V20zm-10 0h10v10H20V20zm-10 0h10v10H10V20z" fill="#F08030" fillOpacity="0.15" fillRule="evenodd" />
          </svg>
        );
      case 'city':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h10v10H0V0zm20 0h10v10H20V0zm20 0h10v10H30V0zM10 10h10v10H10V10zm20 0h10v10H30V10zM0 20h10v10H0V20zm20 0h10v10H20V20zm20 0h10v10H30V20zM10 30h10v10H10V30zm20 0h10v10H30V30z" fill="#6890F0" fillOpacity="0.15" fillRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h20v20H0V0zm20 20h20v20H20V20z" fill="#306230" fillOpacity="0.1" fillRule="evenodd" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'grass':
        return 'bg-[#9BCC50]/20';
      case 'battle':
        return 'bg-[#F08030]/10';
      case 'city':
        return 'bg-[#6890F0]/10';
      default:
        return 'bg-orange-50';
    }
  };

  return (
    <div
      className={`absolute inset-0 -z-10 ${getBackgroundColor()} ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          getBackgroundPattern().props.children
        )}")`,
        imageRendering: 'pixelated',
      }}
    />
  );
}

export function PixelBorder({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 border-8 border-orange-600 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute inset-[8px] border-4 border-orange-800 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
      {children}
    </div>
  );
}

export function PixelCorner({
  position = 'top-left',
  size = 'md',
  className,
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <svg viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0H8V2H6V4H4V6H2V8H0V0Z" fill="#306230" />
      </svg>
    </div>
  );
}