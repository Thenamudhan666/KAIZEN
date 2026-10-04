import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface KnoxVaultBadgeProps {
  variant?: 'compact' | 'pill' | 'card';
  className?: string;
}

export const KnoxVaultBadge: React.FC<KnoxVaultBadgeProps> = ({ 
  variant = 'pill', 
  className = '' 
}) => {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono tracking-wider ${className}`}>
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span className="font-bold">KNOX VAULT</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-black border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)] ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              Secured by Samsung Knox Vault
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              On-Device Hardware Memory Isolation
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-300/80 leading-relaxed font-sans">
          Zero external telemetry leakage. All voice transactions, syllabi, and execution scripts remain cryptographically locked inside local SQLite enclaves.
        </p>
      </div>
    );
  }

  // Pill variant
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-slate-200 text-xs shadow-sm backdrop-blur-md ${className}`}>
      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
      </div>
      <span className="font-samsung font-bold tracking-tight text-[11px]">
        SAMSUNG <span className="text-emerald-400">Knox Vault</span>
      </span>
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
    </div>
  );
};
