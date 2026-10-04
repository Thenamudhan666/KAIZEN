import React, { useState } from 'react';
import { Eye, Database, Brain, Terminal, RefreshCw, ArrowRight, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GalaxyAIIcon } from '../GalaxyAIIcon';

export const Capabilities: React.FC = () => {
  const [selectedCap, setSelectedCap] = useState<number>(0);

  const capabilities = [
    {
      num: '01',
      title: 'OBSERVE',
      subtitle: 'Multimodal Screenpipe Vision',
      tagline: 'Understands what is happening around you in real time.',
      details: 'Continuous multimodal observer ingests terminal logs, active IDE buffers, screen pixels, and speech with zero external telemetry leakage.',
      metrics: { latency: '< 18ms', throughput: '16kHz PCM + OCR', pipeline: 'Samsung One UI Observer' },
      icon: Eye,
      color: 'text-blue-400',
      accent: 'from-blue-500 to-indigo-600',
      border: 'border-blue-500/40',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    },
    {
      num: '02',
      title: 'REMEMBER',
      subtitle: 'Knox Vault Local Memory',
      tagline: 'Retains useful context across interactions securely.',
      details: 'Samsung Knox Vault enclave stores technical syllabi, engineering preferences, and past debugging solutions in an encrypted local SQLite FTS5 database.',
      metrics: { latency: '8ms local search', throughput: '1,248 Nodes Indexed', pipeline: 'Knox Hardware Enclave' },
      icon: Database,
      color: 'text-emerald-400',
      accent: 'from-emerald-500 to-teal-700',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    },
    {
      num: '03',
      title: 'REASON',
      subtitle: 'Socratic Dialectic Engine',
      tagline: 'Breaks complex propositions into dialectical discoveries.',
      details: 'Dual-phase Socratic argument generator analyzes user propositions, maps claim-assumption graphs, and poses incisive probing questions rather than passive agreements.',
      metrics: { latency: '385ms TTFT', throughput: 'Dialectic Triad Active', pipeline: 'Socratic Graph Engine' },
      icon: Brain,
      color: 'text-indigo-400',
      accent: 'from-indigo-500 to-purple-600',
      border: 'border-indigo-500/40',
      glow: 'shadow-[0_0_25px_rgba(99,102,241,0.25)]',
    },
    {
      num: '04',
      title: 'ACT',
      subtitle: 'Autonomous Action Router',
      tagline: 'Executes side-effects inside containerized sandboxes.',
      details: 'Autonomous Action Router executes [ACTION:BUILD], [ACTION:BROWSE], [ACTION:RESEARCH], and [ACTION:RUN] tool calls safely with explicit local verification.',
      metrics: { latency: '65ms execution', throughput: '12 Benchmark APIs', pipeline: 'LiveKit Agents Runtime' },
      icon: Terminal,
      color: 'text-sky-400',
      accent: 'from-sky-500 to-blue-600',
      border: 'border-sky-500/40',
      glow: 'shadow-[0_0_25px_rgba(56,189,248,0.25)]',
    },
    {
      num: '05',
      title: 'IMPROVE',
      subtitle: 'Voyager Lifelong Compiler',
      tagline: 'Learns from outcomes and accumulates permanent skills.',
      details: 'Voyager lifelong learning engine compiles verified execution scripts into reusable compositional skills persisted indefinitely to disk under vault/skills/.',
      metrics: { latency: 'Autonomous', throughput: 'Zero-Mock Verified', pipeline: 'Voyager Subprocess Sandbox' },
      icon: RefreshCw,
      color: 'text-purple-400',
      accent: 'from-purple-500 to-pink-600',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    },
  ];

  const active = capabilities[selectedCap];
  const ActiveIcon = active.icon;

  return (
    <section id="capabilities" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none font-samsung">
      {/* Samsung Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full galaxy-ai-badge mb-4">
          <GalaxyAIIcon size={13} />
          <span className="font-samsung font-bold text-xs tracking-wider text-blue-200 uppercase">
            Galaxy AI Core Suite
          </span>
        </div>
        <h2 className="font-samsung-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white">
          Intelligent by Design.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-4 font-samsung max-w-xl mx-auto">
          Experience an unbroken loop of cognitive capabilities engineered directly into the Samsung Galaxy KAIZEN architecture.
        </p>
      </div>

      {/* Samsung One UI Pill Selection Bar */}
      <div className="relative mb-12 p-2 rounded-full samsung-glass-panel border border-white/[0.08] flex items-center justify-between overflow-x-auto gap-2">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          const isSelected = selectedCap === idx;
          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => setSelectedCap(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black shadow-lg scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-black text-white' : 'bg-white/[0.08] text-slate-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className={`text-xs font-bold tracking-tight block ${isSelected ? 'text-black' : 'text-slate-200'}`}>
                    {cap.title}
                  </span>
                </div>
              </button>

              {idx < capabilities.length - 1 && (
                <div className="text-slate-700 px-1 hidden lg:block">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Samsung One UI Squircle Deep Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 samsung-card samsung-squircle-lg p-8 sm:p-12 border border-white/[0.1] relative overflow-hidden">
        {/* Subtle Samsung Aura Glow */}
        <div 
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        />

        {/* Left Sub-Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-4xl font-extrabold font-samsung-display ${active.color}`}>
                {active.num}
              </span>
              <div className="h-6 w-[1px] bg-white/[0.15]" />
              <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                {active.subtitle}
              </span>
            </div>

            <h3 className="font-samsung-display font-extrabold text-3xl sm:text-4xl tracking-tight text-white mb-4">
              {active.title}
            </h3>

            <p className="text-lg sm:text-xl text-slate-200 font-medium mb-4 leading-snug">
              "{active.tagline}"
            </p>

            <p className="text-sm text-slate-400 leading-relaxed font-samsung max-w-xl">
              {active.details}
            </p>
          </div>

          {/* Samsung Knox Verification Tag */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center gap-2 text-xs font-samsung text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Validated by Samsung Knox on-device sandbox security</span>
          </div>
        </div>

        {/* Right Sub-Panel: Samsung Specs Telemetry Card */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-3.5 z-10 font-samsung text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
              EXECUTION PIPELINE
            </span>
            <span className="text-sm font-bold text-white tracking-tight">{active.metrics.pipeline}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
              MEASURED LATENCY
            </span>
            <span className={`text-base font-bold tracking-tight ${active.color}`}>{active.metrics.latency}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
              DATA INTEGRITY
            </span>
            <span className="text-sm font-bold text-slate-200 tracking-tight">{active.metrics.throughput}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
