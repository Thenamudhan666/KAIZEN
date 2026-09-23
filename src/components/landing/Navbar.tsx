import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSmoothScroll, useLenis } from '../SmoothScroll';

interface NavbarProps {
  onEnterSystem: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onEnterSystem, activeSection = 'core' }) => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollToSection } = useSmoothScroll();

  // Lenis reactive scroll observer
  useLenis((lenis) => {
    setScrolled(lenis.scroll > 40);
  });

  // Native scroll fallback
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 py-3.5 sm:py-4 select-none ${
        scrolled
          ? 'bg-[#0e1015]/90 backdrop-blur-2xl border-b border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.7)]'
          : 'bg-transparent border-b border-white/[0.05]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: KAIZEN Brand Identity */}
        <div 
          onClick={() => scrollToSection('hero')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Futuristic delta badge */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-700/30 to-[#1a1e27] border border-amber-400/40 flex items-center justify-center relative shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M12 3 L21 19 L3 19 Z" stroke="url(#navDeltaGrad)" strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="12" cy="13.5" r="2.5" fill="#f59e0b" />
              <defs>
                <linearGradient id="navDeltaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse" />
          </div>

          <div>
            <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-[0.2em] text-white block">
              KAIZEN
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] text-amber-300/80 tracking-widest uppercase block -mt-0.5 font-medium">
              Think. Learn. Act. Improve.
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-[#151821]/80 border border-amber-500/15 backdrop-blur-md">
          {[
            { id: 'hero', label: 'CORE' },
            { id: 'capabilities', label: 'CAPABILITIES' },
            { id: 'architecture', label: 'ARCHITECTURE' },
            { id: 'experience', label: 'EXPERIENCE' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest transition-all cursor-pointer ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-700/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Enter System CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterSystem}
            className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-black tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-300/60 flex items-center gap-2 cursor-pointer active:scale-95 group"
          >
            <span>ENTER SYSTEM</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </header>
  );
};
