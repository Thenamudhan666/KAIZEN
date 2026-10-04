import React, { useState } from 'react';
import { AICore } from './AICore';
import { SystemStatus } from './SystemStatus';
import { ArrowRight, ChevronDown, Play, Sparkles, Shield, Cpu, Zap, Radio, Check } from 'lucide-react';
import { useSmoothScroll } from '../SmoothScroll';
import { GalaxyAIIcon } from '../GalaxyAIIcon';
import { KnoxVaultBadge } from '../KnoxVaultBadge';

interface HeroProps {
  onWake: () => void;
  coreState?: 'idle' | 'active' | 'awakening';
  onReplayIntro?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onWake, coreState = 'idle', onReplayIntro }) => {
  const { scrollToSection } = useSmoothScroll();
  const [selectedFinish, setSelectedFinish] = useState<'black' | 'gray' | 'violet' | 'gold'>('violet');

  const scrollToCapabilities = () => {
    scrollToSection('capabilities', { offset: -60, duration: 1.2 });
  };

  // Samsung Galaxy Titanium Finishes
  const finishes = [
    { id: 'violet', name: 'Titanium Violet', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', bg: '#312e81' },
    { id: 'gray', name: 'Titanium Gray', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)', bg: '#334155' },
    { id: 'black', name: 'Titanium Black', color: '#1e293b', glow: 'rgba(30, 41, 59, 0.5)', bg: '#0f172a' },
    { id: 'gold', name: 'Titanium Amber', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: '#78350f' },
  ] as const;

  const currentFinish = finishes.find((f) => f.id === selectedFinish) || finishes[0];

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden select-none font-samsung"
    >
      {/* Dynamic Ambient Glow matching selected Samsung Titanium finish */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full blur-[160px] pointer-events-none -z-10 transition-all duration-700 opacity-25"
        style={{ background: currentFinish.color }}
      />

      {/* Samsung Top Spec Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-3 border-b border-white/[0.08] text-xs text-slate-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)] animate-pulse" />
            <span className="text-slate-400 font-medium">REALTIME LATENCY:</span>
            <span className="font-bold text-white tracking-wide">&lt; 800 ms TTFT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-400 font-medium">KNOX VAULT:</span>
            <span className="font-bold text-emerald-400">HARDWARE ISOLATED</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px]">
            <GalaxyAIIcon size={13} />
            <span className="text-slate-300 font-semibold">Galaxy AI Engine</span>
            <span className="text-blue-400 font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Main Hero Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        {/* Left Column: Samsung Product Storytelling & CTA */}
        <div className="lg:col-span-6 flex flex-col z-20">
          {/* Samsung Flagship Pill Badge */}
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full galaxy-ai-badge mb-4">
              <GalaxyAIIcon size={15} />
              <span className="font-samsung font-bold text-xs tracking-wide text-white">
                Galaxy AI is here
              </span>
              <span className="text-blue-200/50 text-xs">|</span>
              <span className="text-[11px] text-blue-200 font-medium tracking-tight">
                Samsung Flagship Edition
              </span>
            </div>

            {/* Samsung Main Product Title */}
            <h1 className="font-samsung-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[0.95]">
              Galaxy <span className="galaxy-ai-text">KAIZEN</span>
            </h1>
          </div>

          {/* Samsung Subtitle */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-samsung font-semibold tracking-tight text-slate-200 my-4 leading-snug">
            Autonomous Socratic AI Partner. <br />
            <span className="text-slate-400 font-normal">
              Engineered for seamless reasoning, lifelong learning, and zero-compromise privacy.
            </span>
          </h2>

          {/* Samsung S24/S25 Ultra Titanium Finish Selector */}
          <div className="my-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md max-w-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
              <span className="font-medium text-slate-300">Selected Finish:</span>
              <span className="font-bold text-white tracking-wide">{currentFinish.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {finishes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFinish(f.id)}
                  title={f.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                    selectedFinish === f.id
                      ? 'ring-2 ring-white scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: f.color }}
                >
                  {selectedFinish === f.id && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
              <span className="text-[11px] text-slate-500 font-mono ml-2">
                Grade 5 Titanium Frame
              </span>
            </div>
          </div>

          {/* Key Product Spec Highlights */}
          <div className="grid grid-cols-2 gap-3 my-4 max-w-lg">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">Full-Duplex Voice</div>
                <div className="text-[10px] text-slate-400">Real-time Silero VAD</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">Knox Vault Enclave</div>
                <div className="text-[10px] text-slate-400">Zero Cloud Telemetry</div>
              </div>
            </div>
          </div>

          {/* Samsung CTAs: [ Experience Galaxy AI ] & [ Explore Specs ] */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button
              onClick={onWake}
              className="px-7 py-3.5 samsung-btn-primary flex items-center gap-3 text-sm cursor-pointer group shadow-xl"
            >
              <GalaxyAIIcon size={18} glow={false} />
              <span className="font-samsung font-bold tracking-tight">Experience Galaxy AI</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className="px-5 py-3.5 samsung-btn-secondary text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                title="Watch Galaxy Unpacked Keynote Intro"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Keynote</span>
              </button>
            )}

            <button
              onClick={scrollToCapabilities}
              className="px-5 py-3.5 samsung-btn-secondary text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Features</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Samsung Disclaimer / Asterisk footnote */}
          <div className="mt-8 text-[11px] text-slate-500 leading-relaxed font-sans border-t border-white/[0.05] pt-3">
            * Galaxy AI features are powered locally by Gemini 3.1 Live and Samsung Knox Vault. Internet connection required for WebRTC live audio gateway. Features may vary by user environment.
          </div>
        </div>

        {/* Right Column: 3D Interactive AI Core & Floating System Status */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px] z-10">
          {/* 3D WebGL Three.js Particle Core with Galaxy AI Ring */}
          <div className="w-full h-[440px] sm:h-[520px] relative">
            <AICore state={coreState} />
          </div>

          {/* Floating Samsung One UI Dynamic Now Bar */}
          <div className="absolute -bottom-4 sm:bottom-4 left-0 sm:-left-6 z-30 max-w-xs sm:max-w-sm w-full">
            <SystemStatus isAwakening={coreState === 'awakening'} />
          </div>
        </div>
      </div>
    </section>
  );
};
