'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PokemonBattleUIProps {
  className?: string;
  children?: React.ReactNode;
}

interface HPBarProps {
  current: number;
  max: number;
  className?: string;
  showNumbers?: boolean;
}

interface StatusWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface BattleMenuProps {
  options: string[];
  onSelect: (option: string, index: number) => void;
  selectedIndex?: number;
  className?: string;
}

interface PokemonStatusProps {
  name: string;
  level: number;
  hp: { current: number; max: number };
  exp?: { current: number; max: number };
  status?: 'normal' | 'poisoned' | 'burned' | 'frozen' | 'paralyzed' | 'asleep';
  isPlayer?: boolean;
  className?: string;
}

// HP Bar Component
export function HPBar({ current, max, className, showNumbers = true }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const getHPColor = () => {
    if (percentage > 50) return 'bg-battle-hp-green';
    if (percentage > 20) return 'bg-battle-hp-yellow';
    return 'bg-battle-hp-red';
  };

  return (
    <div className={cn('w-full', className)}>
      {showNumbers && (
        <div className="flex justify-between font-pixel text-xs text-black mb-1">
          <span>HP</span>
          <span>{current}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-gray-300 border border-black">
        <div 
          className={cn('h-full transition-all duration-300', getHPColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// EXP Bar Component
export function EXPBar({ current, max, className }: { current: number; max: number; className?: string }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1 bg-gray-300 border border-black">
        <div 
          className="h-full bg-battle-exp-blue transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Status Window Component
export function StatusWindow({ title, children, className }: StatusWindowProps) {
  return (
    <div className={cn('status-window', className)}>
      {title && (
        <div className="border-b-2 border-black pb-2 mb-2">
          <h3 className="font-pixel text-black text-sm">{title}</h3>
        </div>
      )}
      <div className="font-pixel text-black text-sm">
        {children}
      </div>
    </div>
  );
}

// Battle Menu Component
export function BattleMenu({ options, onSelect, selectedIndex = 0, className }: BattleMenuProps) {
  return (
    <div className={cn('pokemon-menu', className)}>
      {options.map((option, index) => (
        <div
          key={index}
          className={cn(
            'pokemon-menu-item cursor-pointer',
            index === selectedIndex && 'bg-blue-200'
          )}
          onClick={() => onSelect(option, index)}
        >
          <span className="font-pixel">
            {index === selectedIndex ? '► ' : '  '}{option}
          </span>
        </div>
      ))}
    </div>
  );
}

// Pokemon Status Display
export function PokemonStatus({ 
  name, 
  level, 
  hp, 
  exp, 
  status = 'normal', 
  isPlayer = false, 
  className 
}: PokemonStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'poisoned': return 'text-purple-600';
      case 'burned': return 'text-red-600';
      case 'frozen': return 'text-blue-600';
      case 'paralyzed': return 'text-yellow-600';
      case 'asleep': return 'text-gray-600';
      default: return 'text-black';
    }
  };

  return (
    <div className={cn('battle-ui p-3', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-pixel text-white text-sm">{name}</span>
        <span className="font-pixel text-white text-xs">Lv.{level}</span>
      </div>
      
      <HPBar current={hp.current} max={hp.max} showNumbers={isPlayer} />
      
      {exp && isPlayer && (
        <div className="mt-1">
          <EXPBar current={exp.current} max={exp.max} />
        </div>
      )}
      
      {status !== 'normal' && (
        <div className={cn('mt-1 font-pixel text-xs', getStatusColor())}>
          {status.toUpperCase()}
        </div>
      )}
    </div>
  );
}

// Main Battle UI Container
export function PokemonBattleUI({ className, children }: PokemonBattleUIProps) {
  return (
    <div className={cn('battle-ui', className)}>
      {children}
    </div>
  );
}

// Battle Text Box
export function BattleTextBox({ 
  text, 
  isTyping = false, 
  className 
}: { 
  text: string; 
  isTyping?: boolean; 
  className?: string; 
}) {
  return (
    <div className={cn('status-window p-4', className)}>
      <p className="font-pixel text-black text-sm">
        {text}
        {isTyping && <span className="animate-pulse">▌</span>}
      </p>
    </div>
  );
}

// Pokemon Type Badge
export function TypeBadge({ 
  type, 
  className 
}: { 
  type: string; 
  className?: string; 
}) {
  const getTypeColor = () => {
    const typeColors: Record<string, string> = {
      normal: 'bg-type-normal',
      fire: 'bg-type-fire',
      water: 'bg-type-water',
      electric: 'bg-type-electric',
      grass: 'bg-type-grass',
      ice: 'bg-type-ice',
      fighting: 'bg-type-fighting',
      poison: 'bg-type-poison',
      ground: 'bg-type-ground',
      flying: 'bg-type-flying',
      psychic: 'bg-type-psychic',
      bug: 'bg-type-bug',
      rock: 'bg-type-rock',
      ghost: 'bg-type-ghost',
      dragon: 'bg-type-dragon',
    };
    return typeColors[type.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <span className={cn(
      'type-badge text-white',
      getTypeColor(),
      className
    )}>
      {type.toUpperCase()}
    </span>
  );
}

// Pokeball Selector
export function PokeballSelector({ 
  count, 
  className 
}: { 
  count: number; 
  className?: string; 
}) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {Array.from({ length: 6 }, (_, i) => (
        <div 
          key={i} 
          className={cn(
            'pokeball w-4 h-4',
            i >= count && 'opacity-30'
          )}
        />
      ))}
    </div>
  );
}

export default PokemonBattleUI;