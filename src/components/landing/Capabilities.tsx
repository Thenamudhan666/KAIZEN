import React, { useState } from 'react';
import { Eye, Database, Brain, Terminal, RefreshCw, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const Capabilities: React.FC = () => {
  const [selectedCap, setSelectedCap] = useState<number>(0);

  const capabilities = [
    {
      num: '01',
      title: 'OBSERVE',
      tagline: 'Understands what is happening around you.',
      details: 'Continuous multimodal observer ingests terminal logs, active workspace files, screen context, and speech in real-time with zero external telemetry leakage.',
      metrics: { latency: '<18ms', throughput: '16kHz PCM + OCR', pipeline: 'Screenpipe Interceptor' },
      icon: Eye,
      accent: 'from-amber-500 to-amber-700',
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    },
    {
      num: '02',
      title: 'REMEMBER',
      tagline: 'Retains useful context across interactions.',
      details: 'Local Memory Vault stores technical syllabi, engineering preferences, and past debugging solutions in an encrypted SQLite FTS5 enclave.',
      metrics: { latency: '8ms', throughput: '1,248 Nodes Indexed', pipeline: 'Vault Knowledge Enclave' },
      icon: Database,
      accent: 'from-amber-600 to-amber-800',
      color: 'text-amber-300',
      border: 'border-amber-400/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    },
    {
      num: '03',
      title: 'REASON',
      tagline: 'Breaks complex problems into actionable decisions.',
      details: 'Dual-phase Socratic argument generator analyzes user propositions, maps dependency graphs, and runs multi-agent teacher-critic-student internal deliberation.',
      metrics: { latency: '385ms TTFT', throughput: 'Dialectic Triad Active', pipeline: 'Socratic Argument Graph' },
      icon: Brain,
      accent: 'from-amber-500 to-orange-600',
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    },
    {
      num: '04',
      title: 'ACT',
      tagline: 'Turns decisions into real actions.',
      details: 'Autonomous Action Router executes [ACTION:BUILD], [ACTION:BROWSE], [ACTION:RESEARCH], and [ACTION:RUN] tool calls inside local containerized sandboxes.',
      metrics: { latency: '65ms execution', throughput: '5 Subsystem Tools', pipeline: 'Local Action Router' },
      icon: Terminal,
      accent: 'from-amber-400 to-amber-600',
      color: 'text-amber-300',
      border: 'border-amber-400/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    },
    {
      num: '05',
      title: 'IMPROVE',
      tagline: 'Learns from outcomes and continuously adapts.',
      details: 'Voyager lifelong learning engine compiles verified execution scripts into reusable compositional skills persisted indefinitely for future sessions.',
      metrics: { latency: 'Autonomous', throughput: 'Infinite Skill Retention', pipeline: 'Voyager Compiler Loop' },
      icon: RefreshCw,
      accent: 'from-amber-500 to-amber-700',
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    },
  ];

  const active = capabilities[selectedCap];
  const ActiveIcon = active.icon;

  return (
    <section id="capabilities" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Section Header */}
      <div className="mb-14">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono tracking-[0.25em] font-bold uppercase mb-3">
          CIRCULAR INTELLIGENCE PIPELINE
        </span>
        <h2 className="font-orbitron font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-tight">
          ONE SYSTEM.<br />
          <span className="text-gradient-ai">MULTIPLE INTELLIGENCES.</span>
        </h2>
      </div>

      {/* Connected Loop Navigation Bar */}
      <div className="relative mb-12 p-3 rounded-2xl ai-glass-panel border border-amber-500/15 flex items-center justify-between overflow-x-auto gap-2">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          const isSelected = selectedCap === idx;
          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => setSelectedCap(idx)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? `bg-amber-500/10 ${cap.border} ${cap.glow} border`
                    : 'hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isSelected ? `${cap.border} ${cap.color} bg-black/40` : 'border-white/10 text-slate-400 bg-white/5'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left font-mono">
                  <span className={`text-[10px] block ${isSelected ? cap.color : 'text-slate-500'}`}>
                    {cap.num}
                  </span>
                  <span className={`text-xs font-bold tracking-wider ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {cap.title}
                  </span>
                </div>
              </button>

              {/* Connecting arrow in loop */}
              {idx < capabilities.length - 1 ? (
                <div className="text-slate-600 px-1 hidden sm:block">
                  <ArrowRight className="w-4 h-4" />
                </div>
              ) : (
                <div className="text-amber-400 px-1 hidden sm:block" title="Continuous feedback loop">
                  <RefreshCw className="w-4 h-4 animate-spin duration-3000" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Deep Dive Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 ai-glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Sub-Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${active.color}`}>
                {active.num}
              </span>
              <div className="h-6 w-[1px] bg-amber-500/30" />
              <h3 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-wider text-white">
                {active.title}
              </h3>
            </div>

            <p className="text-base sm:text-lg text-slate-200 font-medium mb-4">
              "{active.tagline}"
            </p>

            <p className="text-sm text-slate-300/80 leading-relaxed font-sans max-w-xl">
              {active.details}
            </p>
          </div>

          {/* Loop indicator */}
          <div className="mt-8 pt-6 border-t border-amber-500/15 flex items-center gap-2 text-xs font-mono text-amber-300">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>CONNECTS SEAMLESSLY TO STAGE {((selectedCap + 1) % 5) + 1} ({capabilities[(selectedCap + 1) % 5].title})</span>
          </div>
        </div>

        {/* Right Sub-Panel: Live Simulated Telemetry & Architecture Node */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-3.5 z-10 font-mono text-xs">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">EXECUTION PIPELINE</span>
            <span className="text-sm font-bold text-white tracking-wide">{active.metrics.pipeline}</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">MEASURED LATENCY</span>
            <span className={`text-sm font-bold tracking-wide ${active.color}`}>{active.metrics.latency}</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">DATA THROUGHPUT</span>
            <span className="text-sm font-bold text-slate-200 tracking-wide">{active.metrics.throughput}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
