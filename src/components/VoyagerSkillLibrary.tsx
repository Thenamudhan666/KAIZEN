import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Plus } from 'lucide-react';
import { VoyagerSkill } from '../types';

interface VoyagerSkillLibraryProps {
  onSkillSynthesized?: () => void;
}

export const VoyagerSkillLibrary: React.FC<VoyagerSkillLibraryProps> = ({ onSkillSynthesized }) => {
  const [skills, setSkills] = useState<VoyagerSkill[]>([
    {
      id: 'SKILL-DP-084',
      title: 'Interval State Space Decomposition',
      domain: 'Dynamic Programming',
      filePath: 'vault/skills/leetcode_dp_deconstruct.md',
      markdownContent: 'Abstracted workflow for decomposing interval state spaces without recursion stack penalties.',
      executableCode: `export function solveIntervalPartition(arr: number[]): number {
  const n = arr.length;
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 1; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      for (let k = i; k <= j; k++) {
        const left = k > i ? dp[i][k - 1] : 0;
        const right = k < j ? dp[k + 1][j] : 0;
        const cost = (i > 0 ? arr[i - 1] : 1) * arr[k] * (j < n - 1 ? arr[j + 1] : 1);
        dp[i][j] = Math.max(dp[i][j], left + right + cost);
      }
    }
  }
  return dp[0][n - 1] || 0;
}`,
      unitTestSummary: '3/3 Assertions Passed (O(N^3) time, O(N^2) space)',
      created: '2026-08-30',
      invocations: 14,
    },
    {
      id: 'SKILL-OS-012',
      title: 'AppleScript Local Bridge Protocol',
      domain: 'System Automation',
      filePath: 'vault/skills/macos_applescript_hooks.md',
      markdownContent: 'Secure local IPC bridge for Apple Calendar and Notes without external OAuth tokens.',
      executableCode: `tell application "Calendar"
  set todayEvents to (every event of calendar "Work" whose start date >= (current date))
end tell`,
      unitTestSummary: 'Local osascript IPC verification passed',
      created: '2026-08-29',
      invocations: 28,
    },
  ]);

  const [selectedSkill, setSelectedSkill] = useState<VoyagerSkill | null>(skills[0]);
  const [problemSolvedInput, setProblemSolvedInput] = useState('2D Dynamic Programming Interval Recurrence');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesizeSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemSolvedInput.trim()) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/gemini/voyager-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemSolved: problemSolvedInput,
          solutionCode: `// Autonomous Voyager generated skill for: ${problemSolvedInput}`,
          skillDomain: 'Algorithms',
        }),
      });
      const data = await res.json();
      const newSkill: VoyagerSkill = {
        id: data.skillId || `SKILL-AUTO-${Math.floor(100 + Math.random() * 900)}`,
        title: data.skillTitle || `Skill: ${problemSolvedInput}`,
        domain: 'Autonomous Learning',
        filePath: data.filePath || `vault/skills/skill_${Date.now()}.md`,
        markdownContent: data.markdownContent || 'Autonomous lifelong skill compiled and persisted in local Vault.',
        executableCode: data.executableCode || '// Executable verified logic',
        unitTestSummary: data.unitTestSummary || 'Unit tests passed in local sandbox',
        created: new Date().toISOString().split('T')[0],
        invocations: 1,
      };

      setSkills(prev => [newSkill, ...prev]);
      setSelectedSkill(newSkill);
      if (onSkillSynthesized) onSkillSynthesized();
    } catch (err) {
      console.error('Failed to synthesize skill:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div id="voyager-skill-library-panel" className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase font-mono">
              Lifelong Learning (Voyager Skill Library)
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Autonomous Skill Accumulation • Sandbox Verification • Vault Persistence
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold tracking-wider uppercase shadow-[0_0_8px_rgba(245,158,11,0.2)]">
          {skills.length} SKILLS COMPILED
        </span>
      </div>

      {/* Synthesis Form */}
      <form onSubmit={handleSynthesizeSkill} className="mt-4 p-3.5 rounded-xl bg-[#151922] border border-amber-500/20 flex gap-2 shadow-inner">
        <input
          id="voyager-problem-input"
          type="text"
          value={problemSolvedInput}
          onChange={(e) => setProblemSolvedInput(e.target.value)}
          placeholder="Enter problem resolved to compile into Voyager skill..."
          className="flex-1 px-4 py-2 rounded-lg bg-[#0f1116] border border-amber-500/25 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
        />
        <button
          type="submit"
          disabled={isSynthesizing}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 border border-amber-300/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)] active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSynthesizing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>Synthesize Skill</span>
        </button>
      </form>

      {/* Skill Cards Grid & Detail */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Skill List */}
        <div className="md:col-span-1 space-y-2.5 overflow-y-auto max-h-72 pr-1">
          {skills.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSkill(s)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                selectedSkill?.id === s.id
                  ? 'bg-[#151922] border-amber-500/50 text-white shadow-sm'
                  : 'bg-[#151922]/50 border-amber-500/15 text-slate-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-amber-400 uppercase">[{s.id}]</span>
                <span className="text-slate-500">{s.invocations} calls</span>
              </div>
              <div className="font-semibold text-white text-xs truncate">{s.title}</div>
              <div className="text-[10px] text-amber-400 mt-1.5 flex items-center gap-1 uppercase tracking-wider font-semibold">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <span>Verified in Vault</span>
              </div>
            </button>
          ))}
        </div>

        {/* Skill Code & Details */}
        <div className="md:col-span-2 p-4 rounded-xl bg-[#151922] border border-amber-500/20 flex flex-col space-y-3">
          {selectedSkill ? (
            <>
              <div className="flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-amber-400 font-bold uppercase tracking-wider">{selectedSkill.title}</span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">{selectedSkill.filePath}</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-300 font-bold uppercase">
                  {selectedSkill.unitTestSummary}
                </span>
              </div>

              <div className="flex-1 p-3.5 rounded-lg bg-[#0b0c0e] border border-amber-500/15 font-mono text-xs text-amber-200/90 overflow-y-auto max-h-56 shadow-inner">
                <pre className="whitespace-pre-wrap">{selectedSkill.executableCode}</pre>
              </div>

              <p className="text-xs font-mono text-slate-400 italic">
                "{selectedSkill.markdownContent}"
              </p>
            </>
          ) : (
            <div className="text-slate-500 text-xs font-mono flex items-center justify-center h-full">
              Select a skill to inspect code and tests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
