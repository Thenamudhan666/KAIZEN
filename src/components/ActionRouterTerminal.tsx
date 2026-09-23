import React, { useState } from 'react';
import { Terminal, Calendar, Mail, Globe, Layers } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionRouterTerminalProps {
  actions: ActionItem[];
  onExecuteAction: (actionId: string) => void;
  onRunCustomCommand: (cmd: string) => void;
}

export const ActionRouterTerminal: React.FC<ActionRouterTerminalProps> = ({
  actions,
  onExecuteAction,
  onRunCustomCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'hooks' | 'playwright'>('terminal');
  const [terminalInput, setTerminalInput] = useState('');
  const [mockTerminalLogs, setMockTerminalLogs] = useState<Array<{ id: string; type: 'cmd' | 'out' | 'err' | 'action'; text: string; time: string }>>([
    { id: '1', type: 'out', text: '[KAIZEN Engine] Claude Code Local Agent Loop Initialized.', time: '08:00:01' },
    { id: '2', type: 'out', text: '[Security Guardrail] Zero external telemetry rule: ACTIVE (Localhost only).', time: '08:00:02' },
    { id: '3', type: 'out', text: '[Action Router] Listening for [ACTION:*] tag streams in LLM generation...', time: '08:00:03' },
  ]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const time = new Date().toLocaleTimeString();
    const cmd = terminalInput.trim();
    setMockTerminalLogs(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'cmd', text: `$ ${cmd}`, time },
    ]);

    // Parse commands
    if (cmd.startsWith('claude action') || cmd.startsWith('run')) {
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'action', text: `[ACTION:RUN] Executing localized workflow on host environment...`, time },
        { id: (Date.now() + 2).toString(), type: 'out', text: `Process exited with code 0. Status: COMPLETED.`, time },
      ]);
    } else if (cmd.includes('calendar') || cmd.includes('applescript')) {
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'action', text: `[ACTION:APPLESCRIPT] Querying Apple Calendar (Work Calendar)...`, time },
        { id: (Date.now() + 2).toString(), type: 'out', text: `Found 2 events today: "System Architecture Review (10:00 AM)" & "Distributed Systems Study (02:00 PM)"`, time },
      ]);
    } else if (cmd.includes('mail') || cmd.includes('brief')) {
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'action', text: `[ACTION:APPLESCRIPT] Ingesting Apple Mail headers (Read-Only)...`, time },
        { id: (Date.now() + 2).toString(), type: 'out', text: `Digest generated: 3 critical items requiring review from thesis supervisor.`, time },
      ]);
    } else if (cmd.includes('playwright') || cmd.includes('scrape') || cmd.includes('browse')) {
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'action', text: `[ACTION:BROWSE] Headless Chromium launched via Playwright...`, time },
        { id: (Date.now() + 2).toString(), type: 'out', text: `Extracted documentation context. Ingested into local Memory Vault vector space.`, time },
      ]);
    } else {
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'out', text: `Command received. Dispatching to local action sandbox executor...`, time },
      ]);
    }

    setTerminalInput('');
  };

  return (
    <div id="action-router-terminal" className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl flex flex-col h-full flex-1">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase font-mono">
              Action Router & System Hooks
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Local Terminal Agent Loop • Native AppleScript • Playwright
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#151922] rounded-xl border border-amber-500/15 text-xs font-mono">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'terminal' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Agent CLI
          </button>
          <button
            onClick={() => setActiveTab('hooks')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'hooks' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            OS Hooks
          </button>
          <button
            onClick={() => setActiveTab('playwright')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'playwright' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Playwright
          </button>
        </div>
      </div>

      {/* Tab: Terminal CLI */}
      {activeTab === 'terminal' && (
        <div className="flex-1 flex flex-col mt-4 min-h-[300px]">
          {/* Action Stream Queue */}
          {actions.length > 0 && (
            <div className="mb-3 p-3.5 rounded-xl bg-[#151922] border border-amber-500/20 space-y-2">
              <div className="text-[11px] font-mono font-bold text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Parsed LLM Action Stream ({actions.length})</span>
                </span>
                <span className="text-amber-400 text-[10px] font-semibold uppercase">Status: Executing</span>
              </div>
              <div className="space-y-1.5">
                {actions.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-amber-500/15 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-400/25 text-[10px]">
                        [{act.tag}]
                      </span>
                      <span className="text-white/90 truncate max-w-[200px] sm:max-w-xs">{act.payload}</span>
                    </div>
                    <button
                      onClick={() => onExecuteAction(act.id)}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 text-[10px] border border-amber-300/40 font-bold transition-all shadow-[0_2px_8px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer"
                    >
                      {act.status === 'completed' ? 'Re-Run' : 'Run Tag'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Console View */}
          <div className="flex-1 p-4 rounded-xl bg-[#0e1017] border border-amber-500/20 font-mono text-[11px] overflow-hidden flex flex-col min-h-[180px] shadow-inner">
            <div className="text-amber-400 mb-2 uppercase text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse"></span>
              <span>Activity Stream // Local Agent Runtime</span>
            </div>
            <div data-lenis-prevent className="space-y-1 text-slate-400 overflow-y-auto flex-1 pr-2">
              {mockTerminalLogs.map(log => (
                <div key={log.id}>
                  <span className="text-amber-500/50">[{log.time}]</span> <span className="text-amber-300 font-semibold">{log.type === 'cmd' ? 'USER' : log.type.toUpperCase()}</span>: 
                  {log.type === 'cmd' ? (
                    <span className="text-amber-300 font-bold ml-1">{log.text}</span>
                  ) : log.type === 'action' ? (
                    <span className="text-white font-medium ml-1">{log.text}</span>
                  ) : (
                    <span className="text-slate-300 ml-1">{log.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Command Shortcuts */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <button
              onClick={() => onRunCustomCommand('claude build --target=core')}
              className="px-2.5 py-1 rounded-lg bg-[#151922] hover:bg-amber-500/15 text-amber-200 border border-amber-500/20 text-[10px] font-mono transition-all cursor-pointer"
            >
              $ claude build
            </button>
            <button
              onClick={() => onRunCustomCommand('claude action --hook=calendar')}
              className="px-2.5 py-1 rounded-lg bg-[#151922] hover:bg-amber-500/15 text-amber-200 border border-amber-500/20 text-[10px] font-mono transition-all cursor-pointer"
            >
              $ hook:calendar
            </button>
            <button
              onClick={() => onRunCustomCommand('claude action --hook=mail-brief')}
              className="px-2.5 py-1 rounded-lg bg-[#151922] hover:bg-amber-500/15 text-amber-200 border border-amber-500/20 text-[10px] font-mono transition-all cursor-pointer"
            >
              $ hook:mail-brief (Read-Only)
            </button>
            <button
              onClick={() => onRunCustomCommand('playwright scrape "https://docs.rs/webrtc"')}
              className="px-2.5 py-1 rounded-lg bg-[#151922] hover:bg-amber-500/15 text-amber-200 border border-amber-500/20 text-[10px] font-mono transition-all cursor-pointer"
            >
              $ playwright scrape
            </button>
          </div>

          {/* Terminal Input */}
          <form onSubmit={handleCommandSubmit} className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-amber-400/70 font-mono text-xs font-bold">$</span>
              <input
                id="terminal-cli-input"
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type command e.g. 'claude action --build' or '[ACTION:RESEARCH]'"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#151922] border border-amber-500/25 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(245,158,11,0.35)] border border-amber-300/40 active:scale-95 cursor-pointer"
            >
              Run
            </button>
          </form>
        </div>
      )}

      {/* Tab: Native OS Hooks */}
      {activeTab === 'hooks' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>AppleScript: Apple Calendar Bridge</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/30 font-bold">
                ACTIVE • READ/WRITE
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct local IPC bridge via osascript without external OAuth tokens. Fetches daily agenda and active syllabus PDF dates.
            </p>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-amber-300 text-[10px]">
              <code>tell application "Calendar" to get events of today</code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>AppleScript: Apple Mail Executive Briefing</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/30 font-bold">
                READ-ONLY ENFORCED
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Strictly read-only by design. Synthesizes executive briefings on incoming research emails without any autonomous write/send capabilities.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Playwright Web Automation */}
      {activeTab === 'playwright' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Headless Chromium Scraper (Playwright)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/30 font-bold">
                HEADLESS ENGINE READY
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Autonomously extracts API docs, algorithmic problem statements, and academic papers to populate the local Vault.
            </p>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-amber-300 text-[10px]">
              <code>const browser = await chromium.launch(); const page = await browser.newPage();</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
