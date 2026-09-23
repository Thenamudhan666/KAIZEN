import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export const ScrollTransition: React.FC = () => {
  return (
    <div className="relative py-20 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Central vertical glowing amber energy line */}
      <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.6)]" />

      {/* Floating Transition Badge */}
      <div className="my-6 px-4 py-1.5 rounded-full ai-glass-panel border border-amber-500/30 text-amber-300 font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>UNDERSTANDING HUMAN INTENT</span>
      </div>

      <div className="w-[1px] h-16 bg-gradient-to-b from-amber-400 via-amber-600 to-transparent" />
    </div>
  );
};
