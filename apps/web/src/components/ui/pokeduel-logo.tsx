import React from 'react';

interface PokeDuelLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const PokeDuelLogo: React.FC<PokeDuelLogoProps> = ({ 
  className = '', 
  width = 240, 
  height = 60 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 240 60" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="letterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFA500" />
          <stop offset="50%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#4B0000" />
        </linearGradient>
      </defs>
      
      {/* Shadow layer */}
      <g transform="translate(3, 3)">
        {/* P shadow */}
        <rect x="0" y="8" width="8" height="32" fill="url(#shadowGradient)" />
        <rect x="8" y="8" width="16" height="8" fill="url(#shadowGradient)" />
        <rect x="8" y="24" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="24" y="16" width="8" height="8" fill="url(#shadowGradient)" />
        
        {/* O shadow */}
        <rect x="40" y="8" width="8" height="32" fill="url(#shadowGradient)" />
        <rect x="48" y="8" width="16" height="8" fill="url(#shadowGradient)" />
        <rect x="48" y="32" width="16" height="8" fill="url(#shadowGradient)" />
        <rect x="64" y="16" width="8" height="16" fill="url(#shadowGradient)" />
        
        {/* K shadow */}
        <rect x="80" y="8" width="8" height="32" fill="url(#shadowGradient)" />
        <rect x="88" y="8" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="88" y="20" width="8" height="8" fill="url(#shadowGradient)" />
        <rect x="96" y="28" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="100" y="16" width="8" height="8" fill="url(#shadowGradient)" />
        
        {/* E shadow */}
        <rect x="116" y="8" width="8" height="32" fill="url(#shadowGradient)" />
        <rect x="124" y="8" width="16" height="8" fill="url(#shadowGradient)" />
        <rect x="124" y="20" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="124" y="32" width="16" height="8" fill="url(#shadowGradient)" />
        
        {/* D shadow */}
        <rect x="148" y="8" width="8" height="32" fill="url(#shadowGradient)" />
        <rect x="156" y="8" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="156" y="32" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="168" y="16" width="8" height="16" fill="url(#shadowGradient)" />
        
        {/* U shadow */}
        <rect x="184" y="8" width="8" height="24" fill="url(#shadowGradient)" />
        <rect x="192" y="32" width="16" height="8" fill="url(#shadowGradient)" />
        <rect x="208" y="8" width="8" height="24" fill="url(#shadowGradient)" />
        
        {/* E shadow */}
        <rect x="224" y="8" width="8" height="32" fill="url(#shadowGradient)" />
        <rect x="232" y="8" width="16" height="8" fill="url(#shadowGradient)" />
        <rect x="232" y="20" width="12" height="8" fill="url(#shadowGradient)" />
        <rect x="232" y="32" width="16" height="8" fill="url(#shadowGradient)" />
        
        {/* L shadow */}
        <rect x="0" y="48" width="8" height="8" fill="url(#shadowGradient)" />
        <rect x="8" y="56" width="16" height="8" fill="url(#shadowGradient)" />
      </g>
      
      {/* Main letters */}
      {/* P */}
      <rect x="0" y="8" width="8" height="32" fill="url(#letterGradient)" />
      <rect x="8" y="8" width="16" height="8" fill="url(#letterGradient)" />
      <rect x="8" y="24" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="24" y="16" width="8" height="8" fill="url(#letterGradient)" />
      
      {/* O */}
      <rect x="40" y="8" width="8" height="32" fill="url(#letterGradient)" />
      <rect x="48" y="8" width="16" height="8" fill="url(#letterGradient)" />
      <rect x="48" y="32" width="16" height="8" fill="url(#letterGradient)" />
      <rect x="64" y="16" width="8" height="16" fill="url(#letterGradient)" />
      
      {/* K */}
      <rect x="80" y="8" width="8" height="32" fill="url(#letterGradient)" />
      <rect x="88" y="8" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="88" y="20" width="8" height="8" fill="url(#letterGradient)" />
      <rect x="96" y="28" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="100" y="16" width="8" height="8" fill="url(#letterGradient)" />
      
      {/* E */}
      <rect x="116" y="8" width="8" height="32" fill="url(#letterGradient)" />
      <rect x="124" y="8" width="16" height="8" fill="url(#letterGradient)" />
      <rect x="124" y="20" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="124" y="32" width="16" height="8" fill="url(#letterGradient)" />
      
      {/* D */}
      <rect x="148" y="8" width="8" height="32" fill="url(#letterGradient)" />
      <rect x="156" y="8" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="156" y="32" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="168" y="16" width="8" height="16" fill="url(#letterGradient)" />
      
      {/* U */}
      <rect x="184" y="8" width="8" height="24" fill="url(#letterGradient)" />
      <rect x="192" y="32" width="16" height="8" fill="url(#letterGradient)" />
      <rect x="208" y="8" width="8" height="24" fill="url(#letterGradient)" />
      
      {/* E */}
      <rect x="224" y="8" width="8" height="32" fill="url(#letterGradient)" />
      <rect x="232" y="8" width="16" height="8" fill="url(#letterGradient)" />
      <rect x="232" y="20" width="12" height="8" fill="url(#letterGradient)" />
      <rect x="232" y="32" width="16" height="8" fill="url(#letterGradient)" />
      
      {/* L */}
      <rect x="0" y="48" width="8" height="8" fill="url(#letterGradient)" />
      <rect x="8" y="56" width="16" height="8" fill="url(#letterGradient)" />
    </svg>
  );
};

export default PokeDuelLogo;