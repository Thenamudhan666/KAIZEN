import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useSmoothScroll, useLenis } from '../SmoothScroll';
import { GalaxyAIIcon } from '../GalaxyAIIcon';
import { KnoxVaultBadge } from '../KnoxVaultBadge';

interface NavbarProps {
  onEnterSystem: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onEnterSystem, activeSection = 'core' }) => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollToSection } = useSmoothScroll();

  // Lenis reactive scroll observer
  useLenis((lenis) => {
    setScrolled(lenis.scroll > 30);
  });

  // Native scroll fallback
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 select-none">
      {/* Samsung Top Notification Ticker Banner */}
      <div className="bg-[#050608] border-b border-white/[0.06] py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs font-samsung text-slate-300">
          <GalaxyAIIcon size={13} className="shrink-0" />
          <span className="font-semibold text-white">Galaxy AI is here.</span>
          <span className="hidden sm:inline text-slate-400">
            Meet Samsung Galaxy KAIZEN with Gemini 3.1 Live and Knox Vault.
          </span>
          <button 
            onClick={() => scrollToSection('capabilities')} 
            className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors cursor-pointer group"
          >
            <span>Learn more</span>
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Main Samsung Global Navigation Bar */}
      <div 
        className={`transition-all duration-300 px-4 sm:px-8 py-3 select-none ${
          scrolled
            ? 'bg-[#0a0c10]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
            : 'bg-[#0b0c0e]/60 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Samsung Brand Identity */}
          <div 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Samsung Official Wordmark */}
            <div className="flex items-center gap-2">
              <span className="font-samsung-display font-extrabold text-sm sm:text-base tracking-[0.18em] text-white">
                SAMSUNG
              </span>
              <span className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="font-samsung font-bold text-sm sm:text-base tracking-tight galaxy-ai-text">
                  Galaxy KAIZEN
                </span>
                <GalaxyAIIcon size={16} />
              </div>
            </div>
          </div>

          {/* Center Navigation Links - Samsung Product Sub-Nav Style */}
          <nav className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            {[
              { id: 'hero', label: 'Overview' },
              { id: 'scenarios', label: 'Scenarios' },
              { id: 'capabilities', label: 'Galaxy AI' },
              { id: 'knox', label: 'Knox Security' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'compare', label: 'Compare' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3.5 py-1.5 rounded-full font-samsung text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Knox Security Pill & Samsung Action Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <KnoxVaultBadge variant="pill" />
            </div>

            <button
              onClick={onEnterSystem}
              className="px-4 sm:px-5 py-2 samsung-btn-primary flex items-center gap-2 text-xs cursor-pointer group"
            >
              <GalaxyAIIcon size={14} className="text-black" glow={false} />
              <span className="font-samsung font-bold">Experience Galaxy AI</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-black" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
