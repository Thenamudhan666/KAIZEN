import React from 'react';
import { Github, ExternalLink, ShieldCheck } from 'lucide-react';
import { useSmoothScroll } from '../SmoothScroll';
import { GalaxyAIIcon } from '../GalaxyAIIcon';
import { KnoxVaultBadge } from '../KnoxVaultBadge';

export const Footer: React.FC = () => {
  const { scrollToSection } = useSmoothScroll();

  const scrollTo = (id: string) => {
    scrollToSection(id, { offset: -70, duration: 1.2 });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#07080a] py-14 px-4 sm:px-8 select-none font-samsung text-xs text-slate-400">
      {/* Samsung Legal Disclaimers & Footnotes */}
      <div className="max-w-7xl mx-auto mb-10 pb-8 border-b border-white/[0.06] text-[11px] text-slate-500 leading-relaxed space-y-2">
        <p>
          * 1. Galaxy AI features provided on Samsung Galaxy KAIZEN are powered by Google Gemini 3.1 Live models and local WebRTC agents runtime. Local speech synthesis latency may vary based on microphone hardware and environment.
        </p>
        <p>
          * 2. Samsung Knox Vault hardware-grade memory protection isolates all local SQLite FTS5 database writes, terminal execution logs, and engineering syllabi with zero unauthorized external cloud telemetry.
        </p>
        <p>
          * 3. Socratic Argumentation Engine and Voyager Lifelong Skill Compiler operate locally. Verified skills require compilation in the isolated subprocess sandbox before permanent vault disk persistence.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Samsung Brand Identity */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-samsung-display font-extrabold text-lg tracking-[0.16em] text-white">
              SAMSUNG
            </span>
            <span className="h-4 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="font-samsung font-bold text-sm tracking-tight galaxy-ai-text">
                Galaxy KAIZEN
              </span>
              <GalaxyAIIcon size={14} />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 tracking-normal font-sans">
            Engineered for Autonomous Socratic Partnership & Lifelong Learning.
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
          <button 
            onClick={() => scrollTo('hero')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Overview
          </button>
          <button 
            onClick={() => scrollTo('capabilities')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Galaxy AI
          </button>
          <button 
            onClick={() => scrollTo('knox')} 
            className="hover:text-white transition-colors cursor-pointer text-emerald-400"
          >
            Knox Security
          </button>
          <button 
            onClick={() => scrollTo('compare')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Compare
          </button>
          <button 
            onClick={() => scrollTo('architecture')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <a 
            href="https://github.com/Thenamudhan666/KAIZEN" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        {/* Right: Operational Status */}
        <div className="flex items-center gap-3">
          <KnoxVaultBadge variant="compact" />
        </div>
      </div>

      {/* Samsung Bottom Corporate Legal Bar */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          Copyright © 1995-2026 SAMSUNG. All Rights Reserved.
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Legal Notice</span>
          <span>•</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Samsung Knox</span>
          <span>•</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Accessibility</span>
        </div>
      </div>
    </footer>
  );
};
