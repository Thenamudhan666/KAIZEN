import React from 'react';
import { ArrowDown, RefreshCw, XCircle, CheckCircle2, Sparkles, Check, Minus } from 'lucide-react';
import { GalaxyAIIcon } from '../GalaxyAIIcon';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="compare" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none font-samsung">
      {/* Samsung Section Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full galaxy-ai-badge mb-4">
          <GalaxyAIIcon size={13} />
          <span className="font-samsung font-bold text-xs tracking-wider text-blue-200 uppercase">
            Product Comparison
          </span>
        </div>
        <h2 className="font-samsung-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white">
          Why Galaxy KAIZEN?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-4 font-samsung max-w-xl mx-auto">
          Compare the breakthrough capabilities of Samsung Galaxy KAIZEN against conventional conversational chatbots.
        </p>
      </div>

      {/* Samsung Spec Comparison Table / Grid */}
      <div className="samsung-card samsung-squircle-lg p-6 sm:p-10 border border-white/[0.1] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 pb-6 border-b border-white/[0.1] items-center text-xs font-samsung font-bold uppercase tracking-wider text-slate-400">
          <div className="col-span-5 sm:col-span-6 text-white text-sm">
            Core Capability
          </div>
          <div className="col-span-3 sm:col-span-3 text-center text-slate-400">
            Standard AI Assistant
          </div>
          <div className="col-span-4 sm:col-span-3 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-white font-bold text-xs">
              <GalaxyAIIcon size={12} />
              <span>Galaxy KAIZEN</span>
            </div>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="divide-y divide-white/[0.06] text-xs sm:text-sm font-samsung">
          {[
            {
              feature: 'Full-Duplex Voice & Interruption',
              sub: 'Sub-800ms real-time audio with neural barge-in',
              standard: 'Half-duplex push-to-talk (1500ms+ latency)',
              kaizen: 'Ultra-low latency (< 800ms) with Silero VAD',
              winner: true,
            },
            {
              feature: 'Hardware Memory Isolation',
              sub: 'Protected by Samsung Knox Vault',
              standard: 'Transmitted to external cloud servers',
              kaizen: 'Hardware-isolated local SQLite FTS5 enclave',
              winner: true,
            },
            {
              feature: 'Socratic Argumentation Engine',
              sub: 'Dialectical discovery vs passive echo-chamber',
              standard: 'Passive sycophancy (always agrees with user)',
              kaizen: 'Analyzes argument graphs & challenges flaws',
              winner: true,
            },
            {
              feature: 'Voyager Lifelong Skill Compiler',
              sub: 'Autonomous code compilation into permanent skills',
              standard: 'Ephemeral answers forgotten after session',
              kaizen: 'Compiles, tests in sandbox & saves to vault',
              winner: true,
            },
            {
              feature: '12 Domain Benchmark APIs',
              sub: 'Travel, Finance, Housing, Commerce benchmark',
              standard: 'Mock or simulated responses',
              kaizen: 'Full FDB-v3 compliant tool calling engine',
              winner: true,
            },
            {
              feature: 'Multimodal Observer Context',
              sub: 'Continuous workspace, terminal, and screen context',
              standard: 'Isolated text box with no peripheral awareness',
              kaizen: 'Continuous local Screenpipe ingestion',
              winner: true,
            },
          ].map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 py-5 items-center gap-2 hover:bg-white/[0.02] transition-colors">
              <div className="col-span-5 sm:col-span-6 pr-4">
                <div className="font-bold text-white tracking-tight">{row.feature}</div>
                <div className="text-[11px] text-slate-400 font-normal mt-0.5">{row.sub}</div>
              </div>

              <div className="col-span-3 sm:col-span-3 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                <Minus className="w-4 h-4 text-slate-500 mb-1" />
                <span className="hidden sm:inline text-[11px]">{row.standard}</span>
              </div>

              <div className="col-span-4 sm:col-span-3 text-center flex flex-col items-center justify-center font-bold text-blue-300 text-xs">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-1 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[11px] text-slate-200">{row.kaizen}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
