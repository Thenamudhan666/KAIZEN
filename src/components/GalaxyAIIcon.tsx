import React from 'react';

interface GalaxyAIIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const GalaxyAIIcon: React.FC<GalaxyAIIconProps> = ({ 
  className = 'w-4 h-4', 
  size = 20,
  glow = true 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 28 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_rgba(147,197,253,0.7)]' : ''}`}
    >
      <defs>
        <linearGradient id="galaxyAIGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#93c5fd" />
          <stop offset="70%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      
      {/* Primary 4-pointed Star (Center-Right) */}
      <path 
        d="M17.5 4 C17.5 9 13.5 12.5 8.5 12.5 C13.5 12.5 17.5 16 17.5 21 C17.5 16 21.5 12.5 26.5 12.5 C21.5 12.5 17.5 9 17.5 4 Z" 
        fill="url(#galaxyAIGrad)" 
      />
      
      {/* Top Left Star */}
      <path 
        d="M7 2 C7 4.5 5 6.5 2.5 6.5 C5 6.5 7 8.5 7 11 C7 8.5 9 6.5 11.5 6.5 C9 6.5 7 4.5 7 2 Z" 
        fill="url(#galaxyAIGrad)" 
        opacity="0.9"
      />
      
      {/* Bottom Left Star */}
      <path 
        d="M7 16 C7 18 5.5 19.5 3.5 19.5 C5.5 19.5 7 21 7 23 C7 21 8.5 19.5 10.5 19.5 C8.5 19.5 7 18 7 16 Z" 
        fill="url(#galaxyAIGrad)" 
        opacity="0.85"
      />

      {/* Bottom Right Star */}
      <path 
        d="M21 20 C21 21.5 19.8 22.5 18.5 22.5 C19.8 22.5 21 23.5 21 25 C21 23.5 22.2 22.5 23.5 22.5 C22.2 22.5 21 21.5 21 20 Z" 
        fill="url(#galaxyAIGrad)" 
        opacity="0.8"
      />
    </svg>
  );
};
