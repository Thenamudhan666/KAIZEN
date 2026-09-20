import React, { useState } from 'react';
import { GitCommit, Sparkles, Brain, Cpu, MessageSquare, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div id="socratic-cognition-panel" className="bg-[#0a0a0a] border border-[#333] p-4 flex flex-col h-full flex-1">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-[#00f0ff] text-[#00f0ff]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase font-mono">
              Socratic Cognition & Deliberation
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              Argumentation JSON Graph • Probing Questions • Teacher-Critic-Student
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#111] border border-[#333] text-[10px] font-mono font-bold uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('socratic')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'socratic' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-[#00f0ff]'
            }`}
          >
            Socratic Graph
          </button>
          <button
            onClick={() => setActiveTab('deliberation')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'deliberation' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-[#00f0ff]'
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
            <label className="text-[10px] font-mono text-[#666] uppercase tracking-widest block">
              User Logical Proposition or Flawed Code Hypothesis:
            </label>
            <div className="flex gap-2">
              <input
                id="socratic-proposition-input"
                type="text"
                value={propositionInput}
                onChange={(e) => setPropositionInput(e.target.value)}
                placeholder="Enter a logic statement or hypothesis to analyze Socratically..."
                className="flex-1 px-3 py-2 bg-[#111] border border-[#333] text-[11px] font-mono text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#00f0ff]"
              />
              <button
                type="submit"
                disabled={isLoadingSocratic}
                className="px-4 py-2 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50"
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
                className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                  socraticResult.verdict.isValid
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                {socraticResult.verdict.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                )}
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">
                    Verdict: {socraticResult.verdict.isValid ? 'LOGICALLY SOUND' : `FALLACY DETECTED (${socraticResult.verdict.flawType})`}
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">{socraticResult.verdict.flawDescription}</p>
                </div>
              </div>

              {/* JSON Argumentation Graph Nodes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {socraticResult.graph.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-lg border bg-slate-950/90 ${
                      node.valid ? 'border-slate-800 text-slate-200' : 'border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-violet-400 uppercase">[{node.type}]</span>
                      <span className={node.valid ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {node.valid ? 'SOUND' : 'FLAWED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-tight">{node.text}</p>
                  </div>
                ))}
              </div>

              {/* Socratic Probing Question Box */}
              <div className="p-4 bg-[#111] border border-[#333] space-y-2">
                <div className="text-[10px] font-mono font-bold text-[#00f0ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Socratic Probing Question:</span>
                </div>
                <p className="text-[11px] font-mono text-white pl-2 border-l border-[#00f0ff]">
                  "{socraticResult.probingQuestion}"
                </p>
                <div className="text-[10px] font-mono text-[#666] pt-1 uppercase">
                  Elenchus Step: <span className="text-[#00f0ff]">{socraticResult.elenchusStep}</span>
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
            <label className="text-xs font-mono text-slate-300 block">
              Deliberation Prompt for Teacher-Critic-Student Chain:
            </label>
            <div className="flex gap-2">
              <input
                id="deliberation-topic-input"
                type="text"
                value={deliberationTopic}
                onChange={(e) => setDeliberationTopic(e.target.value)}
                placeholder="Topic for internal multi-agent debate..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={isLoadingDeliberation}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                {isLoadingDeliberation ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                <span>Debate</span>
              </button>
            </div>
          </form>

          {deliberationResult && (
            <div className="space-y-3 flex-1 font-mono text-xs">
              {/* Teacher Thesis */}
              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/30">
                <span className="text-sky-400 font-bold uppercase text-[10px] block mb-1">
                  1. Teacher (Thesis Formulation)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{deliberationResult.teacher}</p>
              </div>

              {/* Critic Cross-Examination */}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <span className="text-amber-400 font-bold uppercase text-[10px] block mb-1">
                  2. Critic (Cross-Examination & Bottleneck Detection)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{deliberationResult.critic}</p>
              </div>

              {/* Student Butler Synthesis */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold uppercase text-[10px] block mb-1">
                  3. Student Butler (Optimal Socratic Synthesis)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{deliberationResult.student}</p>
              </div>

              {/* Spoken Output */}
              <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/40 text-slate-100 font-sans italic">
                <span className="text-violet-300 font-mono font-bold text-[10px] uppercase not-italic block mb-1">
                  Final Spoken Butler Utterance (1-2 sentences):
                </span>
                "{deliberationResult.finalSpokenResponse}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
