import React from 'react';
import { Play, ArrowRight, Target, MessagesSquare, Terminal, Compass } from 'lucide-react';

interface QuickScenarioLauncherProps {
  onLaunchScenario: (scenarioKey: 'leetcode' | 'flawed_arch' | 'research_build' | 'morning_brief') => void;
  onRunAllPhases?: () => void;
}

export const QuickScenarioLauncher: React.FC<QuickScenarioLauncherProps> = ({ 
  onLaunchScenario,
  onRunAllPhases,
}) => {
  const scenarios = [
    {
      key: 'leetcode' as const,
      num: '01',
      badge: 'PROACTIVE INTERVENTION',
      title: 'LEETCODE 312 DP STAGNATION',
      desc: 'Screenpipe detects 10m stall on 2D recurrence → Proactive Butler inquiry → Socratic logic graph → Voyager skill accumulation.',
      phaseText: 'PHASE 1 & 5 (OBSERVER + SOCRATIC)',
      icon: Target,
      theme: {
        numColor: 'text-amber-400',
        badgeClass: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
        iconWrap: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        cardBorder: 'border-amber-500/25 hover:border-amber-400/60',
        cardBg: 'bg-gradient-to-b from-[#181d27]/90 via-[#13161f]/85 to-[#0e1017]/90',
        phaseText: 'text-amber-400',
        arrowColor: 'text-amber-400',
        glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
      },
    },
    {
      key: 'flawed_arch' as const,
      num: '02',
      badge: 'DIALOGUE REASON',
      title: 'MULTI-AGENT DELIBERATION & BARGE-IN',
      desc: 'User proposes flawed greedy architecture → Teacher-Critic-Student internal debate → Butler vocalization → Force instant barge-in test.',
      phaseText: 'PHASE 4 & 5 (VOICE + DEBATE)',
      icon: MessagesSquare,
      theme: {
        numColor: 'text-amber-300',
        badgeClass: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
        iconWrap: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        cardBorder: 'border-amber-500/25 hover:border-amber-400/60',
        cardBg: 'bg-gradient-to-b from-[#181d27]/90 via-[#13161f]/85 to-[#0e1017]/90',
        phaseText: 'text-amber-300',
        arrowColor: 'text-amber-300',
        glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
      },
    },
    {
      key: 'research_build' as const,
      num: '03',
      badge: 'ACTION ROUTER',
      title: 'AUTONOMOUS ACTION STREAM',
      desc: 'Emits [ACTION:RESEARCH], [ACTION:BROWSE], [ACTION:BUILD] streams executed in local Claude Code loop.',
      phaseText: 'PHASE 1 & 2 (TERMINAL + ROUTER)',
      icon: Terminal,
      theme: {
        numColor: 'text-amber-400',
        badgeClass: 'bg-amber-950/40 border-amber-500/40 text-amber-400',
        iconWrap: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        cardBorder: 'border-amber-500/25 hover:border-amber-400/60',
        cardBg: 'bg-gradient-to-b from-[#181d27]/90 via-[#13161f]/85 to-[#0e1017]/90',
        phaseText: 'text-amber-400',
        arrowColor: 'text-amber-400',
        glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
      },
    },
    {
      key: 'morning_brief' as const,
      num: '04',
      badge: 'NATIVE OS HOOKS',
      title: 'EXECUTIVE BRIEFING & VAULT QUEST',
      desc: 'Apple Calendar agenda + read-only Mail headers synthesized by British Butler persona without invented deadlines.',
      phaseText: 'PHASE 1 & 2 (VAULT + OS HOOKS)',
      icon: Compass,
      theme: {
        numColor: 'text-amber-300',
        badgeClass: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
        iconWrap: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        cardBorder: 'border-amber-500/25 hover:border-amber-400/60',
        cardBg: 'bg-gradient-to-b from-[#181d27]/90 via-[#13161f]/85 to-[#0e1017]/90',
        phaseText: 'text-amber-300',
        arrowColor: 'text-amber-300',
        glow: 'hover:shadow-[0_0_24px_rgba(251,191,36,0.2)]',
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
      className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-amber-500/15 relative z-10">
        <div className="flex items-center gap-3">
          {/* Mockup-exact amber LIVE pill */}
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 text-[11px] font-mono font-black tracking-wider uppercase shadow-[0_0_14px_rgba(245,158,11,0.5)] flex items-center justify-center">
            LIVE
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white font-display">
              Live Phase Demonstration Scenarios
            </h3>
            <p className="text-[11px] text-slate-400 font-sans tracking-normal mt-0.5">
              1-click end-to-end orchestration of all 5 phases
            </p>
          </div>
        </div>

        {/* Vibrant Amber Run All Phases button */}
        <button
          onClick={handleRunAll}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run All Phases</span>
        </button>
      </div>

      {/* 4 Cards in Horizontal Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        {scenarios.map((sc) => {
          const IconComp = sc.icon;
          return (
            <button
              key={sc.key}
              onClick={() => onLaunchScenario(sc.key)}
              className={`rounded-2xl p-4 border transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer shadow-lg active:scale-[0.98] ${sc.theme.cardBg} ${sc.theme.cardBorder} ${sc.theme.glow}`}
            >
              {/* Card Body with Left Sidebar (Icon + Big Number) and Right Content */}
              <div className="flex items-start gap-3.5">
                {/* Left Side: Icon + Big Bold Number */}
                <div className="flex flex-col items-center shrink-0 w-9 sm:w-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border mb-2 shadow-inner ${sc.theme.iconWrap}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight leading-none ${sc.theme.numColor}`}>
                    {sc.num}
                  </span>
                </div>

                {/* Right Side: Pill Badge + Title + Description */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className={`inline-block text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${sc.theme.badgeClass}`}>
                      {sc.badge}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold font-mono text-white mb-1.5 tracking-wider uppercase group-hover:text-amber-200 transition-colors line-clamp-2">
                    {sc.title}
                  </h4>

                  <p className="text-[11px] text-slate-300/80 leading-relaxed font-sans line-clamp-3">
                    {sc.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Row: Phase Tag on Left, Arrow on Right */}
              <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-wider uppercase font-semibold">
                <span className={sc.theme.phaseText}>
                  {sc.phaseText}
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${sc.theme.arrowColor}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
