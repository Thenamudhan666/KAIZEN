import React from 'react';
import { Minus, Square, X, ShieldCheck } from 'lucide-react';
import { GalaxyAIIcon } from './GalaxyAIIcon';

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
      className="h-10 flex items-center justify-between bg-[#08090d]/95 backdrop-blur-2xl border-b border-white/[0.08] select-none shrink-0 px-3 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.6)] font-samsung"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: Samsung Galaxy AI Identity */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <span className="font-samsung-display font-extrabold tracking-[0.16em] text-xs text-white">
          SAMSUNG
        </span>
        <span className="h-3 w-[1px] bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="font-samsung font-bold tracking-tight text-xs galaxy-ai-text">
            Galaxy KAIZEN
          </span>
          <GalaxyAIIcon size={13} />
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-300 font-mono font-medium">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
          <span>Knox Vault</span>
        </div>
      </div>

      {/* Center: Connection status */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)] animate-pulse'
              : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
          }`}
        />
        <span className="font-samsung text-[10px] text-slate-300 font-semibold tracking-wide">
          {isConnected ? 'GALAXY AI CONNECTED' : 'OFFLINE'}
        </span>
      </div>

      {/* Right: Window controls */}
      <div
        className="flex items-center h-full text-slate-400 gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="h-7 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="h-7 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-colors"
          title="Maximize"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="h-7 w-8 rounded-lg flex items-center justify-center hover:bg-rose-600/40 hover:text-rose-200 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
