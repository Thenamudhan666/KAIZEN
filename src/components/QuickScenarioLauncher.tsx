import React from 'react';
import { Play, Sparkles, Terminal, ShieldAlert, Cpu, Eye, BookOpen, Layers } from 'lucide-react';

interface QuickScenarioLauncherProps {
  onLaunchScenario: (scenarioKey: 'leetcode' | 'flawed_arch' | 'research_build' | 'morning_brief') => void;
}

export const QuickScenarioLauncher: React.FC<QuickScenarioLauncherProps> = ({ onLaunchScenario }) => {
  const scenarios = [
    {
      key: 'leetcode' as const,
      title: '1. LeetCode 312 DP Stagnation',
      phase: 'Phase 3 & 5 (Observer + Socratic)',
      desc: 'Screenpipe detects 10m stall on 2D recurrence -> Proactive Butler inquiry -> Socratic logic graph -> Voyager skill accumulation.',
      badge: 'PROACTIVE INTERVENTION',
      color: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20 text-amber-300',
    },
    {
      key: 'flawed_arch' as const,
      title: '2. Multi-Agent Deliberation & Barge-In',
      phase: 'Phase 4 & 5 (Voice + Debate)',
      desc: 'User proposes flawed greedy architecture -> Teacher-Critic-Student internal debate -> Butler vocalization -> Force instant barge-in test.',
      badge: 'DIALOGUE REASON',
      color: 'border-violet-500/30 hover:border-violet-500/60 bg-violet-950/20 text-violet-300',
    },
    {
      key: 'research_build' as const,
      title: '3. Autonomous Action Stream',
      phase: 'Phase 1 & 2 (Terminal + Router)',
      desc: 'Emits [ACTION:RESEARCH], [ACTION:BROWSE], [ACTION:BUILD] streams executed in local Claude Code loop.',
      badge: 'ACTION ROUTER',
      color: 'border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/20 text-cyan-300',
    },
    {
      key: 'morning_brief' as const,
      title: '4. Executive Briefing & Vault Quest',
      phase: 'Phase 1 & 2 (Vault + OS Hooks)',
      desc: 'Apple Calendar agenda + read-only Mail headers synthesized by British Butler persona without invented deadlines.',
      badge: 'NATIVE OS HOOKS',
      color: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20 text-emerald-300',
    },
  ];

  return (
    <div id="quick-scenario-launcher" className="bg-[#0a0a0a] border border-[#333] p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-[#00f0ff] text-[#00f0ff]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase font-mono">
              Live Phase Demonstration Scenarios
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              1-Click End-to-End Orchestration of All 5 Phases
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => (
          <button
            key={sc.key}
            onClick={() => onLaunchScenario(sc.key)}
            className={`p-4 border transition-all text-left flex flex-col justify-between group bg-transparent hover:bg-[#111] border-[#333] hover:border-[#00f0ff] text-[#e0e0e0]`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border uppercase tracking-widest ${sc.color.replace('rounded', 'rounded-none').replace('border-amber-500/30', 'border-[#ffaa00] text-[#ffaa00]').replace('border-violet-500/30', 'border-[#aa00ff] text-[#aa00ff]').replace('border-cyan-500/30', 'border-[#00f0ff] text-[#00f0ff]').replace('border-emerald-500/30', 'border-[#00ffaa] text-[#00ffaa]').split(' ').filter(c => !c.includes('bg-') && !c.includes('hover:') && !c.includes('text-amber-') && !c.includes('text-violet-') && !c.includes('text-cyan-') && !c.includes('text-emerald-')).join(' ')}`}>
                  {sc.badge}
                </span>
                <Play className="w-3.5 h-3.5 text-[#00f0ff] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-[11px] font-bold font-mono text-[#00f0ff] mb-1 uppercase tracking-wider">{sc.title}</h4>
              <p className="text-[10px] font-mono text-[#666] leading-snug">{sc.desc}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#333] text-[9px] font-mono text-[#00f0ff] uppercase tracking-widest opacity-60">
              {sc.phase}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
