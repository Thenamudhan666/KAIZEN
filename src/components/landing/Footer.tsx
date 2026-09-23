import React from 'react';
import { Github, FileText, Cpu, ExternalLink } from 'lucide-react';
import { useSmoothScroll } from '../SmoothScroll';

export const Footer: React.FC = () => {
  const { scrollToSection } = useSmoothScroll();

  const scrollTo = (id: string) => {
    scrollToSection(id, { offset: -70, duration: 1.2 });
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#090a0d] py-12 px-4 sm:px-8 select-none font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand Identity */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="font-orbitron font-extrabold text-lg tracking-[0.2em] text-white">
              KAIZEN
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
              v1.0.4-stable
            </span>
          </div>
          <span className="text-[10px] text-amber-300/70 tracking-widest uppercase">
            Think. Learn. Act. Improve.
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] tracking-wider uppercase font-semibold">
          <button 
            onClick={() => scrollTo('hero')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Core
          </button>
          <button 
            onClick={() => scrollTo('capabilities')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Capabilities
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
          <button 
            onClick={() => scrollTo('capabilities')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Socratic HUD
          </button>
        </div>

        {/* Right: Operational Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse" />
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
        <div>
          © {new Date().getFullYear()} KAIZEN Project. Autonomous Cognitive OS.
        </div>
        <div className="flex items-center gap-4">
          <span>ZERO CLOUD TELEMETRY</span>
          <span>•</span>
          <span>LOCAL SQLITE VAULT</span>
          <span>•</span>
          <span>VOYAGER LIFELONG SYNTHESIS</span>
        </div>
      </div>
    </footer>
  );
};
