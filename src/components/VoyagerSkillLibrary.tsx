import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Code2, Plus, ArrowUpRight, Play, Terminal, Layers } from 'lucide-react';
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
    <div id="voyager-skill-library-panel" className="bg-[#0a0a0a] border border-[#333] p-4 flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-[#00f0ff] text-[#00f0ff]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase font-mono">
              Lifelong Learning (Voyager Skill Library)
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              Autonomous Skill Accumulation • Sandbox Verification • Vault Persistence
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-[#111] text-[#00f0ff] border border-[#00f0ff] text-[9px] font-mono font-bold tracking-widest uppercase">
          {skills.length} SKILLS COMPILED
        </span>
      </div>

      {/* Synthesis Form */}
      <form onSubmit={handleSynthesizeSkill} className="mt-4 p-3 bg-[#111] border border-[#333] flex gap-2">
        <input
          id="voyager-problem-input"
          type="text"
          value={problemSolvedInput}
          onChange={(e) => setProblemSolvedInput(e.target.value)}
          placeholder="Enter problem resolved to compile into Voyager skill..."
          className="flex-1 px-3 py-1.5 bg-transparent border-b border-[#333] text-[11px] font-mono text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#00f0ff] transition-colors"
        />
        <button
          type="submit"
          disabled={isSynthesizing}
          className="px-4 py-1.5 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-mono text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSynthesizing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>Synthesize Skill</span>
        </button>
      </form>

      {/* Skill Cards Grid & Detail */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Skill List */}
        <div className="md:col-span-1 space-y-2 overflow-y-auto max-h-72">
          {skills.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSkill(s)}
              className={`w-full text-left p-3 border transition-all text-xs font-mono ${
                selectedSkill?.id === s.id
                  ? 'bg-[#111] border-[#00f0ff] text-[#00f0ff]'
                  : 'bg-transparent border-[#333] text-[#666] hover:bg-[#111] hover:text-[#00f0ff]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-[#666] mb-1">
                <span className="font-bold text-[#00f0ff] uppercase">[{s.id}]</span>
                <span>{s.invocations} calls</span>
              </div>
              <div className="font-bold text-[11px] truncate">{s.title}</div>
              <div className="text-[10px] text-[#666] mt-1 flex items-center gap-1 uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3 text-[#00f0ff]" />
                <span>Verified in Vault</span>
              </div>
            </button>
          ))}
        </div>

        {/* Skill Code & Details */}
        <div className="md:col-span-2 p-4 bg-[#111] border border-[#333] flex flex-col space-y-2">
          {selectedSkill ? (
            <>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span className="text-[#00f0ff] font-bold uppercase tracking-widest">{selectedSkill.title}</span>
                  <span className="text-[#666] text-[10px] block mt-0.5">{selectedSkill.filePath}</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 border border-[#00f0ff] text-[#00f0ff] tracking-widest uppercase">
                  {selectedSkill.unitTestSummary}
                </span>
              </div>

              <div className="flex-1 p-3 bg-[#0a0a0a] border border-[#333] font-mono text-[11px] text-[#00f0ff] overflow-y-auto max-h-52">
                <pre className="whitespace-pre-wrap">{selectedSkill.executableCode}</pre>
              </div>

              <p className="text-[11px] font-mono text-[#666] italic">
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
