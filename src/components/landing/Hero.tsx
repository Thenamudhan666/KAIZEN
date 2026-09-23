import React from 'react';
import { AICore } from './AICore';
import { SystemStatus } from './SystemStatus';
import { ArrowDown, Play, Sparkles, Activity, ShieldCheck, Database, Zap } from 'lucide-react';
import { useSmoothScroll } from '../SmoothScroll';

interface HeroProps {
  onWake: () => void;
  coreState?: 'idle' | 'active' | 'awakening';
  onReplayIntro?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onWake, coreState = 'idle', onReplayIntro }) => {
  const { scrollToSection } = useSmoothScroll();

  const scrollToCapabilities = () => {
    scrollToSection('capabilities', { offset: -60, duration: 1.2 });
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden select-none"
    >
      {/* Background ambient radial gradients & fine grid */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/10 via-amber-700/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Micro-Telemetry Top Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-3 border-b border-white/[0.08] font-mono text-[10px] sm:text-[11px] text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse" />
            <span className="text-slate-400">LOCAL LATENCY:</span>
            <span className="font-bold text-white">42 ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            <span className="text-slate-400">MEMORY:</span>
            <span className="font-bold text-white">1.24 GB</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            <span className="text-slate-400">CONTEXT:</span>
            <span className="font-bold text-amber-400">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-slate-400">COGNITIVE STATE:</span>
            <span className="font-bold text-amber-300">READY</span>
          </div>
        </div>
      </div>

      {/* Main Hero Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-6 flex flex-col z-20">
          {/* Autonomous Substrate Tag */}
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono tracking-[0.25em] font-bold uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              AUTONOMOUS AI OPERATING SYSTEM
            </span>
            <h1 className="font-orbitron font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none">
              <span className="text-gradient-amber">KAIZEN</span>
            </h1>
          </div>

          {/* Iconic Stacked Story Mantra: THINK. LEARN. ACT. IMPROVE. */}
          <div className="my-5 flex flex-col space-y-1 sm:space-y-1.5 font-orbitron font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-[0.22em] text-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
              <span className="hover:text-amber-400 transition-colors">THINK.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
              <span className="hover:text-amber-300 transition-colors">LEARN.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
              <span className="hover:text-amber-400 transition-colors">ACT.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-gradient-ai hover:opacity-90 transition-opacity">IMPROVE.</span>
            </div>
          </div>

          {/* Supporting text */}
          <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed max-w-xl font-sans mb-8">
            An intelligent cognitive system that understands context, retains high-density memory, reasons dialectically, and acts with purpose.
          </p>

          {/* Action CTAs: [ ENTER SYSTEM ] */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onWake}
              className="relative px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-sm font-black tracking-[0.15em] uppercase transition-all shadow-[0_0_30px_rgba(245,158,11,0.45)] border border-amber-300/60 flex items-center gap-3 cursor-pointer active:scale-95 group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
              <span>[ ENTER SYSTEM ]</span>
              <Play className="w-3.5 h-3.5 fill-current ml-1 transition-transform group-hover:translate-x-1" />
            </button>

            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className="px-5 py-3.5 rounded-xl ai-glass-panel hover:bg-white/[0.06] text-amber-300 hover:text-white font-mono text-xs sm:text-sm font-semibold tracking-wider transition-all border border-amber-500/30 hover:border-amber-400/60 flex items-center gap-2 cursor-pointer active:scale-95"
                title="Replay cinematic genesis intro"
              >
                <span>REPLAY INTRO</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            <button
              onClick={scrollToCapabilities}
              className="px-6 py-3.5 rounded-xl ai-glass-panel hover:bg-white/[0.06] text-slate-300 hover:text-white font-mono text-xs sm:text-sm font-semibold tracking-wider transition-all border border-white/10 hover:border-amber-400/40 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>EXPLORE SYSTEM</span>
              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Right Column: 3D Interactive AI Core & Floating System Status */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px] z-10">
          {/* 3D WebGL Three.js Particle Core */}
          <div className="w-full h-[440px] sm:h-[520px] relative">
            <AICore state={coreState} />
          </div>

          {/* Floating System Status Overlay */}
          <div className="absolute -bottom-4 sm:bottom-4 left-0 sm:-left-6 z-30 max-w-xs sm:max-w-sm w-full">
            <SystemStatus isAwakening={coreState === 'awakening'} />
          </div>
        </div>
      </div>
    </section>
  );
};
