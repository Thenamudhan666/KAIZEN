import React, { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle2, Zap, X } from 'lucide-react';

interface WakeSequenceProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const WakeSequence: React.FC<WakeSequenceProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);

  const lines = [
    { text: 'Cognitive core', status: 'ONLINE', delay: 400, color: 'text-amber-400' },
    { text: 'Context engine', status: 'ONLINE', delay: 800, color: 'text-amber-400' },
    { text: 'Memory vault', status: 'READY', delay: 1300, color: 'text-amber-300' },
    { text: 'Reasoning engine', status: 'ONLINE', delay: 1800, color: 'text-amber-400' },
    { text: 'Action router', status: 'READY', delay: 2300, color: 'text-amber-500' },
    { text: 'Voice interface', status: 'STANDBY', delay: 2800, color: 'text-amber-200' },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    lines.forEach((_, idx) => {
      const timer = setTimeout(() => {
        setStep(idx + 1);
      }, lines[idx].delay);
      timers.push(timer);
    });

    const finishTimer = setTimeout(() => {
      setStep(lines.length + 1);
      setTimeout(() => {
        onComplete();
      }, 700);
    }, 3400);
    timers.push(finishTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl px-4 animate-in fade-in duration-300">
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Modal HUD Window */}
      <div className="relative w-full max-w-lg rounded-2xl ai-glass-panel border border-amber-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Corner Reticles */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-6">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-orbitron font-bold text-xs sm:text-sm tracking-[0.2em] text-white">
              INITIALIZING KAIZEN...
            </span>
          </div>
          <button
            onClick={onSkip}
            className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>SKIP</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Diagnostic Logs */}
        <div className="space-y-3 font-mono text-xs sm:text-[13px] min-h-[220px]">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between transition-all duration-300 ${
                step > idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-amber-400 font-bold">&gt;</span>
                <span>{line.text}</span>
                <span className="text-slate-600 font-normal">
                  {'.'.repeat(Math.max(4, 22 - line.text.length))}
                </span>
              </span>
              <span className={`font-bold tracking-wider ${line.color}`}>
                {line.status}
              </span>
            </div>
          ))}

          {/* Final Ready Callout */}
          {step > lines.length && (
            <div className="pt-4 mt-4 border-t border-amber-500/25 flex items-center justify-center gap-2.5 text-amber-400 font-bold font-orbitron tracking-[0.2em] text-sm sm:text-base animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-5 h-5 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <span>KAIZEN IS READY.</span>
            </div>
          )}
        </div>

        {/* Loading progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${Math.min(100, (step / (lines.length + 1)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
