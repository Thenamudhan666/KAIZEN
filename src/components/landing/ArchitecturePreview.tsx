import React, { useState, useEffect } from 'react';
import { User, Eye, Database, Brain, Terminal, RefreshCw, Radio, Layers, Zap } from 'lucide-react';

export const ArchitecturePreview: React.FC = () => {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 6);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { id: 0, title: 'USER INTERACTION', label: 'Voice & Multimodal Prompt', sub: 'Voice (Silero VAD + 16kHz PCM)', icon: User, color: 'text-amber-100', border: 'border-white/20' },
    { id: 1, title: 'CONTEXT OBSERVER', label: 'Screenpipe Sensor', sub: 'Screen Observer & OCR Timeline', icon: Eye, color: 'text-amber-400', border: 'border-amber-500/40' },
    { id: 2, title: 'MEMORY VAULT', label: 'Zero-Telemetry Enclave', sub: 'Encrypted SQLite FTS5 Storage', icon: Database, color: 'text-amber-300', border: 'border-amber-600/40' },
    { id: 3, title: 'REASONING ENGINE', label: 'Socratic Dialectic Triad', sub: 'Multi-Agent Teacher-Critic Debate', icon: Brain, color: 'text-amber-400', border: 'border-amber-500/40' },
    { id: 4, title: 'ACTION ROUTER', label: 'Autonomous Tool Executor', sub: 'Sandbox [ACTION:*] Dispatcher', icon: Terminal, color: 'text-amber-300', border: 'border-amber-500/40' },
    { id: 5, title: 'FEEDBACK & SKILL VOYAGER', label: 'Lifelong Accumulation', sub: 'Automated Test & Compilation', icon: RefreshCw, color: 'text-amber-400', border: 'border-amber-500/40' },
  ];

  return (
    <section id="architecture" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono tracking-[0.25em] font-bold uppercase mb-3">
          SYSTEM TOPOLOGY
        </span>
        <h2 className="font-orbitron font-extrabold text-3xl sm:text-5xl tracking-tight text-white">
          INSIDE KAIZEN
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 font-sans">
          A local-first neural loop interconnecting continuous observation, structured dialectic debate, and autonomous side-effect execution.
        </p>
      </div>

      {/* Subsystem Pipeline Card */}
      <div className="ai-glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-2xl relative overflow-hidden">
        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {nodes.map((node) => {
            const Icon = node.icon;
            const isPulsing = pulseIndex === node.id;
            return (
              <div
                key={node.id}
                className={`rounded-2xl p-5 ai-glass-panel border transition-all duration-300 flex flex-col justify-between ${
                  isPulsing
                    ? 'border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)] scale-[1.02]'
                    : `${node.border} hover:border-amber-400/40`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-black/40 border border-white/10 ${node.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPulsing && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
                        NODE 0{node.id + 1}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-orbitron font-bold text-xs sm:text-sm tracking-wider text-white mb-1">
                    {node.title}
                  </h4>
                  <p className={`font-mono text-xs font-semibold mb-2 ${node.color}`}>
                    {node.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {node.sub}
                  </p>
                </div>

                {/* Micro Pipeline Indicator */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>PACKET FLOW</span>
                  <span className={isPulsing ? 'text-amber-300 font-bold' : 'text-slate-600'}>
                    {isPulsing ? 'TRANSMITTING' : 'LISTENING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Loop Bar */}
        <div className="mt-8 pt-6 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>SUB-800MS TTFA VOICE PIPELINE • ZERO CLOUD TELEMETRY • PERSISTED MEMORY VAULT</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>CONTINUOUS CYCLE VERIFIED</span>
          </div>
        </div>
      </div>
    </section>
  );
};
