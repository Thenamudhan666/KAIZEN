import React, { useState } from 'react';
import { Play, ArrowRight, Target, MessagesSquare, Terminal, Compass, ChevronUp, ChevronDown } from 'lucide-react';
import { GalaxyAIIcon } from './GalaxyAIIcon';

interface QuickScenarioLauncherProps {
  onLaunchScenario: (scenarioKey: 'leetcode' | 'flawed_arch' | 'research_build' | 'morning_brief') => void;
  onRunAllPhases?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const QuickScenarioLauncher: React.FC<QuickScenarioLauncherProps> = ({ 
  onLaunchScenario,
  onRunAllPhases,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const scenarios = [
    {
      key: 'leetcode' as const,
      num: '01',
      badge: 'PROACTIVE OBSERVER',
      title: 'LeetCode 312 DP Stagnation',
      desc: 'Multimodal observer detects 10m stall on 2D recurrence relation → Proactive vocal inquiry → Socratic dependency graph → Voyager verified skill compilation.',
      phaseText: 'Phase 1 & 5 • Observer + Socratic',
      icon: Target,
      theme: {
        numColor: 'text-blue-400',
        badgeClass: 'bg-blue-950/50 border-blue-500/40 text-blue-300',
        iconWrap: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        cardBorder: 'border-white/[0.08] hover:border-blue-400/50',
        cardBg: 'bg-gradient-to-b from-[#151822]/95 via-[#10131a]/95 to-[#0b0c10]/95',
        phaseText: 'text-blue-400',
        arrowColor: 'text-blue-400',
        glow: 'hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)]',
      },
    },
    {
      key: 'flawed_arch' as const,
      num: '02',
      badge: 'DIALOGUE REASONING',
      title: 'Multi-Agent Deliberation & Barge-In',
      desc: 'User proposes flawed consensus assumption → Teacher-Critic-Student internal triad debate → Spoken counter-argumentation → Force instant voice interruption.',
      phaseText: 'Phase 4 & 5 • Voice + Dialectic',
      icon: MessagesSquare,
      theme: {
        numColor: 'text-indigo-400',
        badgeClass: 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300',
        iconWrap: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
        cardBorder: 'border-white/[0.08] hover:border-indigo-400/50',
        cardBg: 'bg-gradient-to-b from-[#151822]/95 via-[#10131a]/95 to-[#0b0c10]/95',
        phaseText: 'text-indigo-400',
        arrowColor: 'text-indigo-400',
        glow: 'hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)]',
      },
    },
    {
      key: 'research_build' as const,
      num: '03',
      badge: 'ACTION ROUTER',
      title: 'Autonomous Side-Effect Sandbox',
      desc: 'Emits [ACTION:RESEARCH], [ACTION:BROWSE], [ACTION:BUILD] streams executed inside verified containerized local sandboxes with zero external leakage.',
      phaseText: 'Phase 1 & 2 • Terminal + Router',
      icon: Terminal,
      theme: {
        numColor: 'text-emerald-400',
        badgeClass: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300',
        iconWrap: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        cardBorder: 'border-white/[0.08] hover:border-emerald-400/50',
        cardBg: 'bg-gradient-to-b from-[#151822]/95 via-[#10131a]/95 to-[#0b0c10]/95',
        phaseText: 'text-emerald-400',
        arrowColor: 'text-emerald-400',
        glow: 'hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]',
      },
    },
    {
      key: 'morning_brief' as const,
      num: '04',
      badge: 'KNOX VAULT HOOKS',
      title: 'Executive Briefing & Vault Quest',
      desc: 'System agenda and read-only context synthesized by erudite persona without invented deadlines, querying encrypted SQLite FTS5 memory.',
      phaseText: 'Phase 1 & 2 • Knox Vault Enclave',
      icon: Compass,
      theme: {
        numColor: 'text-purple-400',
        badgeClass: 'bg-purple-950/50 border-purple-500/40 text-purple-300',
        iconWrap: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
        cardBorder: 'border-white/[0.08] hover:border-purple-400/50',
        cardBg: 'bg-gradient-to-b from-[#151822]/95 via-[#10131a]/95 to-[#0b0c10]/95',
        phaseText: 'text-purple-400',
        arrowColor: 'text-purple-400',
        glow: 'hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)]',
      },
    },
  ];

  const handleRunAll = () => {
    if (onRunAllPhases) {
      onRunAllPhases();
    } else {
      onLaunchScenario('leetcode');
    }
  };

  return (
    <div 
      id="quick-scenario-launcher" 
      className={`w-full shrink-0 min-h-max samsung-card samsung-squircle p-5 sm:p-7 border border-white/[0.1] shadow-2xl relative overflow-hidden font-samsung transition-all duration-300 ${className}`}
    >
      {/* Subtle Samsung Galaxy AI Aura Glow in Background */}
      <div 
        className="absolute -top-12 -right-12 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ background: 'linear-gradient(135deg, #2b59ff, #8b5cf6)' }}
      />

      {/* Top Header Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 relative z-10 transition-all duration-300 ${isExpanded ? 'pb-4 border-b border-white/[0.08]' : 'pb-0 border-b-0'}`}>
        <div className="flex items-center gap-3.5">
          {/* Samsung One UI Live Indicator Badge */}
          <div className="px-3 py-1 rounded-full galaxy-ai-badge text-white text-[11px] font-samsung font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>LIVE SCENARIOS</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-samsung-display font-extrabold tracking-tight text-white">
                Live Phase Demonstration Scenarios
              </h3>
              <GalaxyAIIcon size={15} />
            </div>
            <p className="text-xs text-slate-400 font-samsung tracking-normal mt-0.5">
              1-click end-to-end orchestration across all 5 cognitive phases
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Samsung Pill Action Button */}
          <button
            onClick={handleRunAll}
            className="px-5 py-2.5 samsung-btn-primary text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 group shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current text-black" />
            <span>Run All Scenarios</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-black" />
          </button>

          {/* Expand / Collapse Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-samsung font-semibold active:scale-95 shrink-0"
            title={isExpanded ? "Collapse scenario cards" : "Expand scenario cards"}
            aria-label={isExpanded ? "Collapse scenario cards" : "Expand scenario cards"}
          >
            <span className="hidden md:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4 Cards in Adaptive Responsive Grid - Fully Sized, No Truncation */}
      {isExpanded && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10 transition-all duration-300">
          {scenarios.map((sc) => {
            const IconComp = sc.icon;
            return (
              <button
                key={sc.key}
                onClick={() => onLaunchScenario(sc.key)}
                className={`rounded-2xl p-5 border transition-all duration-300 text-left flex flex-col justify-between group cursor-pointer shadow-md hover:-translate-y-1 active:scale-[0.99] min-h-[220px] ${sc.theme.cardBg} ${sc.theme.cardBorder} ${sc.theme.glow}`}
              >
                {/* Card Body */}
                <div className="flex flex-col w-full flex-1">
                  {/* Header row: Icon, Badge, and Big Phase Number */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-inner ${sc.theme.iconWrap}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-samsung font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${sc.theme.badgeClass}`}>
                        {sc.badge}
                      </span>
                    </div>

                    <span className={`text-2xl font-black font-samsung-display tracking-tight leading-none ${sc.theme.numColor}`}>
                      {sc.num}
                    </span>
                  </div>

                  {/* Scenario Title - 100% Fully Visible, No Line Clamp */}
                  <h4 className="text-sm font-bold font-samsung text-white mb-2 tracking-tight group-hover:text-blue-200 transition-colors leading-snug">
                    {sc.title}
                  </h4>

                  {/* Scenario Description - 100% Fully Visible, No Line Clamp */}
                  <p className="text-xs text-slate-300/85 leading-relaxed font-samsung flex-1">
                    {sc.desc}
                  </p>
                </div>

                {/* Bottom Footer Row: Phase Tag on Left, Arrow on Right */}
                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-samsung tracking-tight font-medium w-full">
                  <span className={`${sc.theme.phaseText} font-semibold`}>
                    {sc.phaseText}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.15] transition-colors">
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 ${sc.theme.arrowColor}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
