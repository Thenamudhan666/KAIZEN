import React from 'react';
import { ShieldCheck, Lock, HardDrive, Key, CheckCircle, FileCode, Cpu } from 'lucide-react';
import { KnoxVaultBadge } from '../KnoxVaultBadge';

export const KnoxSecuritySection: React.FC = () => {
  return (
    <section id="knox" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none font-samsung">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full knox-badge mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-samsung font-bold text-xs tracking-wider text-emerald-300 uppercase">
            Samsung Knox Vault
          </span>
        </div>
        <h2 className="font-samsung-display font-black text-4xl sm:text-6xl tracking-tight text-white">
          Hardware-grade privacy.<br />
          <span className="text-emerald-400">Zero cloud leakage.</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-xl mx-auto font-samsung">
          Engineered under Samsung's strictest Knox security standards. Your voice, documents, and memory vault never leave the physical device.
        </p>
      </div>

      {/* Knox Vault 3-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1: Local SQLite Enclave */}
        <div className="samsung-card samsung-squircle p-8 flex flex-col justify-between border border-white/[0.08] hover:border-emerald-500/30 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="font-samsung font-bold text-xl text-white mb-2 tracking-tight">
              On-Device SQLite Enclave
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-samsung">
              All engineering syllabi, user profiles, and past conversational sessions are indexed inside a hardened local SQLite FTS5 database on physical disk.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-xs font-mono text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Encrypted at REST (AES-256)</span>
          </div>
        </div>

        {/* Card 2: Subprocess Sandbox */}
        <div className="samsung-card samsung-squircle p-8 flex flex-col justify-between border border-white/[0.08] hover:border-emerald-500/30 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-samsung font-bold text-xl text-white mb-2 tracking-tight">
              Isolated Execution Sandbox
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-samsung">
              Voyager skills compile in an isolated subprocess sandbox (<code className="text-blue-300">python -I -c</code>) before touching memory, eliminating arbitrary code injection risks.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-xs font-mono text-blue-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero-Mock Subprocess Verification</span>
          </div>
        </div>

        {/* Card 3: Absolute Operational Guardrails */}
        <div className="samsung-card samsung-squircle p-8 flex flex-col justify-between border border-white/[0.08] hover:border-emerald-500/30 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="font-samsung font-bold text-xl text-white mb-2 tracking-tight">
              Zero External Telemetry
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-samsung">
              No metrics, prompt logs, or personal context are transmitted to third-party tracking services. Your machine is your sovereign fortress.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-xs font-mono text-indigo-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Certified Air-Gapped Capable</span>
          </div>
        </div>
      </div>
    </section>
  );
};
