import React from 'react';
import { Play, ArrowUp, Sparkles, Shield, Cpu } from 'lucide-react';
import { useSmoothScroll } from '../SmoothScroll';

interface FinalCTAProps {
  onEnter: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onEnter }) => {
  const { scrollToTop } = useSmoothScroll();

  return (
    <section id="experience" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none relative">
      <div className="rounded-3xl ai-glass-card border border-amber-500/30 p-8 sm:p-16 text-center relative overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.18)]">
        {/* Background ambient radial gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/15 via-amber-700/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] tracking-[0.25em] font-bold uppercase mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AUTONOMOUS OPERATING CO-PILOT</span>
        </div>

        {/* Large Heading */}
        <h2 className="font-orbitron font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white mb-6">
          MORE THAN AN <span className="text-gradient-amber">ASSISTANT.</span>
        </h2>

        {/* Supporting Copy */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed mb-10">
          An intelligent system designed to help you think, act, and improve.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={onEnter}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-sm font-black tracking-wider uppercase transition-all shadow-[0_0_35px_rgba(245,158,11,0.45)] border border-amber-300/60 flex items-center gap-3 cursor-pointer active:scale-95 group"
          >
            <span>ENTER KAIZEN</span>
            <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={scrollToTop}
            className="px-6 py-4 rounded-xl ai-glass-panel hover:bg-white/[0.06] text-slate-300 hover:text-white font-mono text-xs sm:text-sm font-semibold tracking-wider transition-all border border-white/10 hover:border-amber-400/40 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>EXPLORE THE CORE</span>
            <ArrowUp className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Brand & Slogan Footer Stamp */}
        <div className="pt-8 border-t border-white/10 max-w-md mx-auto">
          <span className="font-orbitron font-extrabold text-lg sm:text-xl tracking-[0.25em] text-white block mb-1">
            KAIZEN
          </span>
          <span className="font-mono text-[11px] text-amber-300/80 tracking-[0.2em] uppercase font-semibold">
            THINK. LEARN. ACT. IMPROVE.
          </span>
        </div>
      </div>
    </section>
  );
};
