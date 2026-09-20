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
      className="h-9 flex items-center justify-between bg-[#050505] border-b border-[#222] select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: App identity */}
      <div className="flex items-center gap-2 pl-4">
        <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
        <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#00f0ff] uppercase">
          J.A.R.V.I.S
        </span>
        <span className="text-[9px] font-mono text-[#444] ml-1">
          Autonomous AI Partner
        </span>
      </div>

      {/* Center: Connection status */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected
              ? 'bg-[#00ffaa] shadow-[0_0_6px_#00ffaa]'
              : 'bg-[#ff0055] shadow-[0_0_6px_#ff0055]'
          }`}
        />
        <span className="text-[9px] font-mono text-[#666]">
          {isConnected ? 'CORE ONLINE' : 'CONNECTING'}
        </span>
      </div>

      {/* Right: Window controls */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="h-full px-3.5 flex items-center justify-center text-[#666] hover:bg-[#222] hover:text-[#ccc] transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="h-full px-3.5 flex items-center justify-center text-[#666] hover:bg-[#222] hover:text-[#ccc] transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="h-full px-3.5 flex items-center justify-center text-[#666] hover:bg-[#991133] hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
