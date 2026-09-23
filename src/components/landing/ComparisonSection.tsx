import React from 'react';
import { ArrowDown, RefreshCw, XCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono tracking-[0.25em] font-bold uppercase mb-3">
          PARADIGM SHIFT
        </span>
        <h2 className="font-orbitron font-extrabold text-3xl sm:text-5xl tracking-tight text-white">
          NOT JUST A CHATBOT.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 font-sans">
          Traditional LLM assistants wait for input and discard context. KAIZEN operates as an autonomous cognitive loop.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Traditional Assistant */}
        <div className="ai-glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 opacity-70 hover:opacity-90 transition-opacity flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-slate-400">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-orbitron font-bold text-sm sm:text-base tracking-wider text-slate-300">
                  TRADITIONAL ASSISTANT
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">EPHEMERAL & PASSIVE</span>
            </div>

            {/* Static Linear Steps */}
            <div className="flex flex-col items-center gap-4 py-8 font-mono text-xs sm:text-sm">
              <div className="w-48 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-center text-slate-300 font-semibold shadow-sm">
                Prompt
              </div>
              <ArrowDown className="w-4 h-4 text-slate-600" />

              <div className="w-48 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-center text-slate-300 font-semibold shadow-sm">
                Response
              </div>
              <ArrowDown className="w-4 h-4 text-slate-600" />

              <div className="w-48 py-3 px-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-center text-rose-400/80 font-bold shadow-sm">
                Done (Discarded)
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-center text-[11px] font-mono text-slate-500">
            No continuous context • No memory vault • No autonomous side-effects
          </div>
        </div>

        {/* Right: KAIZEN Autonomous Cognitive Loop */}
        <div className="ai-glass-card rounded-3xl p-6 sm:p-8 border border-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.18)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle electric amber background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-orbitron font-extrabold text-sm sm:text-base tracking-[0.15em] text-white">
                  KAIZEN
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300 uppercase font-bold tracking-wider">
                CONTINUOUS AGENTIC LOOP
              </span>
            </div>

            {/* Dynamic Circular Steps */}
            <div className="flex flex-col items-center gap-2.5 py-4 font-mono text-xs sm:text-sm">
              {[
                { name: 'Observe', desc: 'Screenpipe context & speech ingestion', color: 'text-amber-300', border: 'border-amber-500/30' },
                { name: 'Understand', desc: 'Deep semantic problem grounding', color: 'text-amber-200', border: 'border-amber-600/30' },
                { name: 'Remember', desc: 'Encrypted SQLite FTS5 Vault recall', color: 'text-amber-400', border: 'border-amber-500/30' },
                { name: 'Reason', desc: 'Dialectic multi-agent Socratic debate', color: 'text-amber-300', border: 'border-amber-600/30' },
                { name: 'Act', desc: 'Autonomous terminal & sandbox router', color: 'text-amber-400', border: 'border-amber-500/30' },
                { name: 'Learn', desc: 'Voyager lifelong skill accumulation', color: 'text-amber-300', border: 'border-amber-400/30' },
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className={`w-full max-w-sm py-2 px-4 rounded-xl bg-black/40 border ${step.border} flex items-center justify-between shadow-sm`}>
                    <span className={`font-bold tracking-wider ${step.color}`}>{step.name}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{step.desc}</span>
                  </div>
                  {idx < 5 && <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                </React.Fragment>
              ))}

              {/* Loop Return Indicator */}
              <div className="flex items-center gap-2 mt-2 text-amber-400 font-mono text-xs font-bold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Continuous Lifelong Improvement (↺)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-500/20 text-center text-[11px] font-mono text-amber-300/80">
            Local-first privacy • Zero external telemetry • Socratic co-pilot
          </div>
        </div>
      </div>
    </section>
  );
};
