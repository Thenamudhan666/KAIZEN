import React from 'react';
import { Minus, Square, X, Cpu } from 'lucide-react';

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      isElectron: boolean;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

interface TitleBarProps {
  isConnected?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ isConnected = false }) => {
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  if (!isElectron) return null;

  return (
    <div
      className="h-10 flex items-center justify-between glass-panel border-b border-amber-500/20 select-none shrink-0 px-3 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: App identity */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-6 h-6 rounded-md brand-gradient flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          <Cpu className="w-3.5 h-3.5 text-slate-950 font-bold" />
        </div>
        <span className="font-display font-bold tracking-tight text-sm bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-300">
          KAIZEN
        </span>
        <span className="font-mono text-[9px] tracking-widest uppercase text-amber-200 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 font-semibold">
          SOCRATIC HUD
        </span>
      </div>

      {/* Center: Connection status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse'
              : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
          }`}
        />
        <span className="font-mono text-[10px] text-slate-400 font-medium">
          {isConnected ? 'CORE OPERATIONAL' : 'STANDBY'}
        </span>
      </div>

      {/* Right: Window controls */}
      <div
        className="flex items-center h-full text-slate-400"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="h-full px-3 flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="h-full px-3 flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="h-full px-3 flex items-center justify-center hover:bg-rose-600/30 hover:text-rose-300 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
