import React from 'react';
import { ArrowRight, ArrowUp, ShieldCheck, Sparkles } from 'lucide-react';
import { useSmoothScroll } from '../SmoothScroll';
import { GalaxyAIIcon } from '../GalaxyAIIcon';
import { KnoxVaultBadge } from '../KnoxVaultBadge';

interface FinalCTAProps {
  onEnter: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onEnter }) => {
  const { scrollToTop } = useSmoothScroll();

  return (
    <section id="experience" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto select-none relative font-samsung">
      <div className="samsung-card samsung-squircle-lg border border-white/[0.12] p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl">
        {/* Subtle Samsung Aura Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-transparent rounded-full blur-[150px] pointer-events-none" />

        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full galaxy-ai-badge mb-6">
          <GalaxyAIIcon size={14} />
          <span className="font-samsung font-bold text-xs tracking-wider text-blue-200 uppercase">
            Galaxy AI Ecosystem
          </span>
        </div>

        {/* Large Samsung Heading */}
        <h2 className="font-samsung-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white mb-6">
          The next era is here.<br />
          <span className="galaxy-ai-text">Experience Galaxy KAIZEN.</span>
        </h2>

        {/* Supporting Copy */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-samsung leading-relaxed mb-10">
          Step into a live, full-duplex Socratic intelligence engine protected by Samsung Knox Vault hardware isolation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={onEnter}
            className="px-8 py-4 samsung-btn-primary flex items-center gap-3 text-sm cursor-pointer shadow-2xl"
          >
            <GalaxyAIIcon size={18} glow={false} />
            <span className="font-samsung font-bold tracking-tight">Launch Galaxy AI Cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToTop}
            className="px-6 py-4 samsung-btn-secondary text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Samsung Knox Vault Certified Stamp */}
        <div className="pt-8 border-t border-white/[0.08] max-w-md mx-auto flex flex-col items-center justify-center gap-2">
          <KnoxVaultBadge variant="pill" />
          <span className="text-[11px] text-slate-500 font-samsung">
            Samsung Electronics Co., Ltd. • Galaxy AI Platform
          </span>
        </div>
      </div>
    </section>
  );
};
