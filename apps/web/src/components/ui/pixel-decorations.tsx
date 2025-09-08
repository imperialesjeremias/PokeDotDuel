import React from 'react';
import { cn } from '@/lib/utils';

interface PixelDividerProps {
  className?: string;
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: 'dark' | 'light' | 'accent';
}

export function PixelDivider({
  className,
  variant = 'solid',
  color = 'dark',
}: PixelDividerProps) {
  const colorClasses = {
    dark: 'border-orange-800',
    light: 'border-orange-400',
    accent: 'border-orange-600',
  };

  const variantClasses = {
    solid: 'border-t-4',
    dashed: 'border-t-4 border-dashed',
    dotted: 'border-t-4 border-dotted',
  };

  return (
    <div
      className={cn(
        'w-full my-4',
        variantClasses[variant],
        colorClasses[color],
        className
      )}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

interface PixelFrameProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'simple' | 'double' | 'shadow';
}

export function PixelFrame({
  className,
  children,
  variant = 'simple',
}: PixelFrameProps) {
  const variantClasses = {
    simple: 'border-4 border-orange-600',
    double: 'border-8 border-orange-600 p-1',
    shadow: 'border-4 border-orange-600 shadow-[4px_4px_0px_0px_theme(\'colors.orange.800\')]',
  };

  return (
    <div
      className={cn(
        'p-4 bg-orange-50',
        variantClasses[variant],
        className
      )}
      style={{ imageRendering: 'pixelated' }}
    >
      {variant === 'double' && (
        <div className="border-4 border-orange-800 p-3">{children}</div>
      )}
      {variant !== 'double' && children}
    </div>
  );
}

interface PixelIconProps {
  className?: string;
  icon: 'pokeball' | 'star' | 'heart' | 'coin';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function PixelIcon({
  className,
  icon,
  size = 'md',
  color,
}: PixelIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const getIconSvg = () => {
    switch (icon) {
      case 'pokeball':
        return (
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="2" width="8" height="4" fill="currentColor" />
            <rect x="2" y="6" width="12" height="4" fill="currentColor" />
            <rect x="4" y="10" width="8" height="4" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="#FFFFFF" />
            <rect x="7" y="7" width="2" height="2" fill="currentColor" />
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="1" width="2" height="14" fill="currentColor" />
            <rect x="1" y="7" width="14" height="2" fill="currentColor" />
            <rect x="3" y="3" width="2" height="2" fill="currentColor" />
            <rect x="11" y="3" width="2" height="2" fill="currentColor" />
            <rect x="3" y="11" width="2" height="2" fill="currentColor" />
            <rect x="11" y="11" width="2" height="2" fill="currentColor" />
          </svg>
        );
      case 'heart':
        return (
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="3" height="3" fill="currentColor" />
            <rect x="10" y="3" width="3" height="3" fill="currentColor" />
            <rect x="6" y="6" width="4" height="1" fill="currentColor" />
            <rect x="4" y="7" width="8" height="2" fill="currentColor" />
            <rect x="5" y="9" width="6" height="1" fill="currentColor" />
            <rect x="6" y="10" width="4" height="1" fill="currentColor" />
            <rect x="7" y="11" width="2" height="1" fill="currentColor" />
          </svg>
        );
      case 'coin':
        return (
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="2" width="6" height="1" fill="currentColor" />
            <rect x="3" y="3" width="10" height="2" fill="currentColor" />
            <rect x="2" y="5" width="12" height="6" fill="currentColor" />
            <rect x="3" y="11" width="10" height="2" fill="currentColor" />
            <rect x="5" y="13" width="6" height="1" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="#FFFFFF" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        'inline-block',
        className
      )}
      style={{ 
        imageRendering: 'pixelated',
        color: color || 'currentColor'
      }}
    >
      {getIconSvg()}
    </div>
  );
}