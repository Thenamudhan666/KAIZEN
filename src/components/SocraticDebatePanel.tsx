import React, { useState } from 'react';
import { GitCommit, Sparkles, Brain, Cpu, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SocraticGraphData, MultiAgentDeliberation } from '../types';

interface SocraticDebatePanelProps {
  onAnalyzeProposition: (text: string) => Promise<SocraticGraphData | null>;
  onRunDeliberation: (topic: string) => Promise<MultiAgentDeliberation | null>;
}

export const SocraticDebatePanel: React.FC<SocraticDebatePanelProps> = ({
  onAnalyzeProposition,
  onRunDeliberation,
}) => {
  const [activeTab, setActiveTab] = useState<'socratic' | 'deliberation'>('socratic');
  const [propositionInput, setPropositionInput] = useState(
    "Since subproblems in interval DP are independent, we can greedily pick the maximum element at each step in O(N) time."
  );
  const [deliberationTopic, setDeliberationTopic] = useState(
    "Optimal recurrence formulation for LeetCode #312 Burst Balloons"
  );
  const [isLoadingSocratic, setIsLoadingSocratic] = useState(false);
  const [isLoadingDeliberation, setIsLoadingDeliberation] = useState(false);

  const [socraticResult, setSocraticResult] = useState<SocraticGraphData | null>({
    verdict: {
      isValid: false,
      flawType: "Unchecked Subproblem Coupling",
      flawDescription: "The hypothesis assumes dp[i] can be solved independently of future state transitions in the sliding window.",
    },
    graph: {
      nodes: [
        { id: "n1", type: "Premise", text: "Greedily picking local maximum at each step yields global optimum", valid: false },
        { id: "n2", type: "Assumption", text: "Subproblems exhibit strict independence without overlapping constraints", valid: false },
        { id: "n3", type: "Claim", text: "Time complexity reduces to O(N) by discarding past branch decisions", valid: false },
        { id: "n4", type: "Hypothesis", text: "Single 1D array is sufficient for multi-dimensional state tracking", valid: true },
      ],
      edges: [
        { from: "n1", to: "n3", relation: "independent_support", sound: false },
        { from: "n2", to: "n4", relation: "joined_support", sound: false },
      ],
    },
    probingQuestion: "If choosing the local maximum at step k invalidates the valid permutations at step k+2, does the subproblem truly possess optimal substructure, sir?",
    elenchusStep: "Challenge greedy choice property against counter-example [3, 1, 5, 8]",
  });

  const [deliberationResult, setDeliberationResult] = useState<MultiAgentDeliberation | null>({
    teacher: "The user seeks an optimal recurrence for interval partitioning. We should recommend bottom-up tabulation with dimension N x N, maintaining window length l as the outer loop invariant.",
    critic: "The Teacher's solution neglects boundary expansion when subarrays are length 1. Furthermore, the user's current code is attempting top-down recursion without memoizing state transitions, risking O(2^N) branch explosion. We must probe whether they have indexed the base subarray sizes properly.",
    student: "Synthesized consensus: Rather than supplying the code directly, highlight the length-based window expansion. The butler will remark on their recursion depth and gently nudge them toward checking the 2-element base intervals.",
    finalSpokenResponse: "If I might intervene, sir—your recursive exploration is currently treating overlapping intervals as independent entities. Might we consider how the length of the window dictates the base cases?",
  });

  const handleSocraticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propositionInput.trim()) return;
    setIsLoadingSocratic(true);
    try {
      const res = await onAnalyzeProposition(propositionInput.trim());
      if (res) setSocraticResult(res);
    } finally {
      setIsLoadingSocratic(false);
    }
  };

  const handleDeliberationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliberationTopic.trim()) return;
    setIsLoadingDeliberation(true);
    try {
      const res = await onRunDeliberation(deliberationTopic.trim());
      if (res) setDeliberationResult(res);
    } finally {
      setIsLoadingDeliberation(false);
    }
  };

  return (
    <div id="socratic-cognition-panel" className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl flex flex-col h-full flex-1">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase font-mono">
              Socratic Cognition & Deliberation
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Argumentation JSON Graph • Probing Questions • Teacher-Critic-Student
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#151922] rounded-xl border border-amber-500/15 text-[10px] font-mono font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('socratic')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'socratic'
                ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Socratic Graph
          </button>
          <button
            onClick={() => setActiveTab('deliberation')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'deliberation'
                ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Multi-Agent Debate
          </button>
        </div>
      </div>

      {/* Tab: Socratic Graph */}
      {activeTab === 'socratic' && (
        <div className="mt-4 flex-1 flex flex-col space-y-4">
          {/* Input Proposition */}
          <form onSubmit={handleSocraticSubmit} className="space-y-2">
            <label className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest block font-medium">
              User Logical Proposition or Flawed Code Hypothesis:
            </label>
            <div className="flex gap-2">
              <input
                id="socratic-proposition-input"
                type="text"
                value={propositionInput}
                onChange={(e) => setPropositionInput(e.target.value)}
                placeholder="Enter a logic statement or hypothesis to analyze Socratically..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#151922] border border-amber-500/25 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoadingSocratic}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 border border-amber-300/40 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.35)] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isLoadingSocratic ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <GitCommit className="w-3.5 h-3.5" />}
                <span>Extract Graph</span>
              </button>
            </div>
          </form>

          {/* Socratic Graph Visualizer */}
          {socraticResult && (
            <div className="space-y-3 flex-1">
              {/* Verdict Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 bg-[#151922] ${
                  socraticResult.verdict.isValid
                    ? 'border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-amber-600/40 text-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.15)]'
                }`}
              >
                {socraticResult.verdict.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                )}
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">
                    Verdict: {socraticResult.verdict.isValid ? 'LOGICALLY SOUND' : `FALLACY DETECTED (${socraticResult.verdict.flawType})`}
                  </div>
                  <p className="text-white/80 text-[11px] mt-0.5">{socraticResult.verdict.flawDescription}</p>
                </div>
              </div>

              {/* JSON Argumentation Graph Nodes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                {socraticResult.graph.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-3 rounded-xl border bg-[#151922] ${
                      node.valid ? 'border-amber-500/30' : 'border-amber-700/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold text-amber-400 uppercase">[{node.type}]</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        node.valid ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-amber-950/40 text-amber-500 border border-amber-600/30'
                      }`}>
                        {node.valid ? 'SOUND' : 'FLAWED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 leading-relaxed">{node.text}</p>
                  </div>
                ))}
              </div>

              {/* Socratic Probing Question Box */}
              <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/30 space-y-2">
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Socratic Probing Question:</span>
                </div>
                <p className="font-display italic text-sm text-amber-100 pl-2 border-l-2 border-amber-400 leading-relaxed">
                  "{socraticResult.probingQuestion}"
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 uppercase">
                  Elenchus Step: <span className="text-amber-400 font-semibold">{socraticResult.elenchusStep}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Multi-Agent Deliberation */}
      {activeTab === 'deliberation' && (
        <div className="mt-4 flex-1 flex flex-col space-y-4">
          <form onSubmit={handleDeliberationSubmit} className="space-y-2">
            <label className="text-xs font-mono text-amber-300/80 block font-medium">
              Deliberation Prompt for Teacher-Critic-Student Chain:
            </label>
            <div className="flex gap-2">
              <input
                id="deliberation-topic-input"
                type="text"
                value={deliberationTopic}
                onChange={(e) => setDeliberationTopic(e.target.value)}
                placeholder="Topic for internal multi-agent debate..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#151922] border border-amber-500/25 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoadingDeliberation}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_4px_16px_rgba(245,158,11,0.35)] border border-amber-300/40 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {isLoadingDeliberation ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                <span>Debate</span>
              </button>
            </div>
          </form>

          {deliberationResult && (
            <div className="space-y-3 flex-1 font-mono text-xs">
              {/* Teacher Thesis */}
              <div className="bg-[#151922] rounded-xl p-3 flex flex-col gap-1.5 relative overflow-hidden border border-amber-500/20">
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                <span className="text-amber-400 font-bold uppercase text-[10px] pl-2 block">
                  1. Teacher (Thesis Formulation)
                </span>
                <p className="text-white/90 text-xs pl-2 leading-relaxed">{deliberationResult.teacher}</p>
              </div>

              {/* Critic Cross-Examination */}
              <div className="bg-[#151922] rounded-xl p-3 flex flex-col gap-1.5 relative overflow-hidden border border-amber-700/30">
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-[0_0_8px_rgba(217,119,6,0.6)]"></div>
                <span className="text-amber-500 font-bold uppercase text-[10px] pl-2 block">
                  2. Critic (Cross-Examination & Bottleneck Detection)
                </span>
                <p className="text-white/90 text-xs pl-2 leading-relaxed">{deliberationResult.critic}</p>
              </div>

              {/* Student Butler Synthesis */}
              <div className="bg-[#151922] rounded-xl p-3 flex flex-col gap-1.5 relative overflow-hidden border border-amber-500/30">
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                <span className="text-amber-300 font-bold uppercase text-[10px] pl-2 block">
                  3. Student Butler (Optimal Socratic Synthesis)
                </span>
                <p className="text-white/90 text-xs pl-2 leading-relaxed">{deliberationResult.student}</p>
              </div>

              {/* Spoken Output */}
              <div className="bg-gradient-to-r from-[#181d27] to-[#14171e] rounded-xl p-4 relative overflow-hidden border border-amber-400/30 shadow-lg">
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                <span className="text-amber-400 font-mono font-bold text-[10px] uppercase pl-2 block mb-1">
                  Final Spoken Butler Utterance (1-2 sentences):
                </span>
                <p className="font-display italic text-sm text-white pl-2 leading-relaxed">
                  "{deliberationResult.finalSpokenResponse}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
