import React, { useState } from 'react';
import { Eye, Activity, AlertTriangle, Sparkles } from 'lucide-react';
import { SupervisorIntervention } from '../types';

interface ScreenpipeObserverProps {
  onTriggerIntervention: (intervention: SupervisorIntervention) => void;
}

export const ScreenpipeObserver: React.FC<ScreenpipeObserverProps> = ({
  onTriggerIntervention,
}) => {
  const [stagnationSeconds, setStagnationSeconds] = useState(600); // 10 mins
  const [errorCount, setErrorCount] = useState(4);
  const [activeWindow, setActiveWindow] = useState('LeetCode #312: Burst Balloons (Python 3)');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastIntervention, setLastIntervention] = useState<SupervisorIntervention | null>(null);

  const mockOcrFeed = [
    `def maxCoins(nums):`,
    `    # User has rewritten this 4 times in 10 minutes`,
    `    dp = [[0]*len(nums) for _ in range(len(nums))]`,
    `    for i in range(len(nums)):`,
    `        for j in range(i, len(nums)):`,
    `            # IndexError: list index out of range at nums[k-1]`,
    `            dp[i][j] = max(dp[i][k-1] + nums[i-1]*nums[k]*nums[j+1] + dp[k+1][j])`,
  ].join('\n');

  const runSupervisorEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/gemini/proactive-supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocrStream: mockOcrFeed,
          stagnationDurationSec: stagnationSeconds,
          errorCount,
          activeWindow,
        }),
      });

      const data = await res.json();
      const intervention: SupervisorIntervention = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        isInterventionRequired: data.isInterventionRequired ?? true,
        reason: data.reason || 'Stagnation on recurrence relation bounds in LeetCode DP problem.',
        confidence: data.confidence || 0.95,
        proactiveVocalPrompt: data.proactiveVocalPrompt || "I notice you've been focused on the dynamic programming array for the last ten minutes, sir. Are you struggling with the state transition logic?",
        heuristics: data.heuristics || {
          screenActivityScore: 0.28,
          errorFrequency: '4 exceptions in 5m',
          stagnationDuration: '10 minutes',
          focusTarget: activeWindow,
        },
      };

      setLastIntervention(intervention);
      onTriggerIntervention(intervention);
    } catch (err) {
      console.error('Supervisor eval failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div id="screenpipe-observer-panel" className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl flex flex-col h-full flex-1">
      <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <Eye className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase font-mono">
              The Proactive Observer (Screenpipe)
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              24/7 Desktop Context Ingestion • Local OCR & ASR • Behavioral Heuristics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold tracking-wider uppercase shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>24/7 SENSOR LIVE</span>
          </span>
        </div>
      </div>

      {/* LeetCode Context Scenario Simulation */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Live Desktop Window / OCR Viewport */}
        <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/20 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
            <span className="text-slate-400 font-medium">Active Desktop Viewport:</span>
            <span className="text-amber-300 font-bold">{activeWindow}</span>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-[11px] font-mono text-amber-300 overflow-hidden shadow-inner">
            <pre className="overflow-x-auto whitespace-pre-wrap">{mockOcrFeed}</pre>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono text-slate-500 pt-1">
            <span>OCR Rate: 2.0 FPS</span>
            <span className="text-amber-400 font-semibold">ASR: WHISPER LOCAL</span>
          </div>
        </div>

        {/* Right Column: Intervention Heuristics Controls */}
        <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/20 space-y-3">
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Behavioral Trigger Metrics</span>
            <span className="text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[9px]">Threshold: EXCEEDED</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Stagnation on Code Block:</span>
                <span className="text-amber-400 font-bold">{Math.round(stagnationSeconds / 60)} minutes</span>
              </div>
              <input
                type="range"
                min="60"
                max="1200"
                step="60"
                value={stagnationSeconds}
                onChange={(e) => setStagnationSeconds(Number(e.target.value))}
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Consecutive Terminal Exceptions:</span>
                <span className="text-amber-400 font-bold">{errorCount} IndexError loops</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={errorCount}
                onChange={(e) => setErrorCount(Number(e.target.value))}
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Trigger Intervention Button */}
          <button
            id="trigger-proactive-intervention-btn"
            onClick={runSupervisorEvaluation}
            disabled={isEvaluating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_16px_rgba(245,158,11,0.4)] border border-amber-300/40 active:scale-95"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Evaluating Behavioral Heuristics...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>FIRE PROACTIVE INTERVENTION SCENARIO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Proactive Intervention Alert Card */}
      {lastIntervention && (
        <div className="mt-4 p-4 rounded-xl bg-[#151922] border border-amber-500/30 text-xs font-mono space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-center justify-between text-amber-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Supervisor Trigger Dispatched (Confidence: {(lastIntervention.confidence * 100).toFixed(0)}%)</span>
            </span>
            <span className="text-amber-500/50 text-[10px]">Time: {new Date(lastIntervention.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            <strong className="text-amber-400">Diagnostic Reason:</strong> {lastIntervention.reason}
          </p>
          <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-white font-mono italic">
            "{lastIntervention.proactiveVocalPrompt}"
          </div>
        </div>
      )}
    </div>
  );
};
