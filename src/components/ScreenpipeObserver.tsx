import React, { useState } from 'react';
import { Eye, Activity, AlertTriangle, Play, Sparkles, Clock, CheckCircle, Terminal, HelpCircle } from 'lucide-react';
import { ScreenpipeEvent, SupervisorIntervention } from '../types';

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
    <div id="screenpipe-observer-panel" className="bg-[#0a0a0a] border border-[#333] p-4 flex flex-col h-full flex-1">
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-[#ffaa00] text-[#ffaa00]">
            <Eye className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#ffaa00] uppercase font-mono">
              The Proactive Observer (Screenpipe)
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              24/7 Desktop Context Ingestion • Local OCR & ASR • Behavioral Heuristics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111] border border-[#00ffaa] text-[#00ffaa] text-[9px] font-mono font-bold tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>24/7 OBSERVER LIVE</span>
          </span>
        </div>
      </div>

      {/* LeetCode Context Scenario Simulation */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Live Desktop Window / OCR Viewport */}
        <div className="p-4 bg-[#111] border border-[#333] space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest">
            <span className="text-[#666]">Active Desktop Viewport:</span>
            <span className="text-[#ffaa00] font-bold">{activeWindow}</span>
          </div>

          <div className="p-3 bg-[#0a0a0a] border border-[#333] text-[11px] font-mono text-[#00ffaa]">
            <pre className="overflow-x-auto whitespace-pre-wrap">{mockOcrFeed}</pre>
          </div>

          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-mono text-[#666] pt-1">
            <span>OCR Rate: 2.0 FPS</span>
            <span>ASR: Whisper.cpp</span>
          </div>
        </div>

        {/* Right Column: Intervention Heuristics Controls */}
        <div className="p-4 bg-[#111] border border-[#333] space-y-3">
          <div className="text-[11px] font-mono font-bold text-[#e0e0e0] uppercase tracking-widest flex items-center justify-between">
            <span>Behavioral Trigger Metrics</span>
            <span className="text-[#ffaa00]">Threshold: EXCEEDED</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Stagnation on Code Block:</span>
                <span className="text-rose-400 font-bold">{Math.round(stagnationSeconds / 60)} minutes</span>
              </div>
              <input
                type="range"
                min="60"
                max="1200"
                step="60"
                value={stagnationSeconds}
                onChange={(e) => setStagnationSeconds(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Consecutive Terminal Exceptions:</span>
                <span className="text-rose-400 font-bold">{errorCount} IndexError loops</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={errorCount}
                onChange={(e) => setErrorCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Trigger Intervention Button */}
          <button
            id="trigger-proactive-intervention-btn"
            onClick={runSupervisorEvaluation}
            disabled={isEvaluating}
            className="w-full py-2.5 px-4 border border-[#ffaa00] text-[#ffaa00] hover:bg-[#ffaa00] hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="mt-4 p-4 bg-[#111] border border-[#ffaa00] text-[11px] font-mono space-y-2">
          <div className="flex items-center justify-between text-[#ffaa00] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Supervisor Trigger Dispatched (Confidence: {(lastIntervention.confidence * 100).toFixed(0)}%)</span>
            </span>
            <span className="text-[#666] text-[9px]">Time: {new Date(lastIntervention.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-white leading-relaxed">
            <strong className="text-[#ffaa00]">Diagnostic Reason:</strong> {lastIntervention.reason}
          </p>
          <div className="p-2.5 bg-[#0a0a0a] border border-[#333] text-white font-mono italic">
            "{lastIntervention.proactiveVocalPrompt}"
          </div>
        </div>
      )}
    </div>
  );
};
