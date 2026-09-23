import React, { useState, useEffect } from 'react';
import { Cpu, Activity, ShieldCheck, Zap } from 'lucide-react';

interface SystemStatusProps {
  className?: string;
  isAwakening?: boolean;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ className = '', isAwakening = false }) => {
  const [cycle, setCycle] = useState(0);

  // Subtle telemetry cycle tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((prev) => (prev + 1) % 1000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const subsystems = [
    { name: 'COGNITIVE ENGINE', status: 'ONLINE', dot: 'bg-amber-400', latency: '12ms' },
    { name: 'MEMORY SYSTEM', status: 'READY', dot: 'bg-amber-500', latency: '1.24GB' },
    { name: 'REASONING ENGINE', status: 'ONLINE', dot: 'bg-amber-400', latency: '42ms' },
    { name: 'ACTION ROUTER', status: 'READY', dot: 'bg-amber-500', latency: 'ACTIVE' },
    { name: 'CONTEXT OBSERVER', status: 'ACTIVE', dot: 'bg-emerald-400', latency: '60fps' },
  ];

  return (
    <div 
      className={`ai-glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.65)] font-mono text-xs select-none backdrop-blur-2xl ${className} ${
        isAwakening ? 'border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/15 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
          <span className="font-bold tracking-widest text-[11px] text-white uppercase font-display">
            KAIZEN CORE
          </span>
        </div>
        <span className="text-[10px] text-amber-400/80 tracking-widest uppercase">
          SYS.{(0x8A0 + (cycle % 16)).toString(16).toUpperCase()} // v4.2
        </span>
      </div>

      {/* Subsystem rows */}
      <div className="space-y-2.5">
        {subsystems.map((sub, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between gap-4 py-1 px-2 rounded-lg bg-black/25 border border-white/[0.04] hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${sub.dot} shadow-[0_0_6px_currentColor] animate-pulse`} />
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wider text-slate-300">
                {sub.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-slate-500 hidden sm:inline">{sub.latency}</span>
              <span className="text-[10px] font-bold tracking-wider text-amber-300">
                {isAwakening ? 'INITIALIZING' : sub.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Telemetry Baseline */}
      <div className="mt-3.5 pt-3 border-t border-amber-500/15 flex items-center justify-between text-[9px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>REALTIME SYNAPSE</span>
        </div>
        <span className="text-amber-400 font-bold tracking-widest">
          {isAwakening ? 'BURST 100%' : 'NOMINAL 99.8%'}
        </span>
      </div>
    </div>
  );
};
