import React, { useState } from 'react';
import { Terminal, Play, Globe, Calendar, Mail, FileCode, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
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
    { id: '1', type: 'out', text: '[JARVIS Engine] Claude Code Local Agent Loop Initialized.', time: '08:00:01' },
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
        { id: (Date.now() + 1).toString(), type: 'action', text: `[ACTION:MAIL_BRIEF] Querying incoming Mail headers (READ-ONLY ENFORCED)...`, time },
        { id: (Date.now() + 2).toString(), type: 'out', text: `3 Unread Emails: [1] "SIGCOMM 2026 Paper Decision", [2] "Weekly Infra Health", [3] "LeetCode Daily Challenge" (No external write permissions allowed)`, time },
      ]);
    } else if (cmd.includes('playwright') || cmd.includes('browse') || cmd.includes('research')) {
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'action', text: `[ACTION:BROWSE] Headless Chromium launched via Playwright -> Scraping documentation...`, time },
        { id: (Date.now() + 2).toString(), type: 'out', text: `Extracted 4 markdown sections from target documentation. Written to local buffer.`, time },
      ]);
    } else {
      onRunCustomCommand(cmd);
      setMockTerminalLogs(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'out', text: `Executed: ${cmd}`, time },
      ]);
    }

    setTerminalInput('');
  };

  return (
    <div id="action-router-terminal" className="bg-[#0a0a0a] border border-[#333] p-4 flex flex-col h-full flex-1">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-[#00f0ff] text-[#00f0ff]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase font-mono">
              Action Router & System Hooks
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              Local Terminal Agent Loop • Native AppleScript • Playwright
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'terminal' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent CLI
          </button>
          <button
            onClick={() => setActiveTab('hooks')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'hooks' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OS Hooks
          </button>
          <button
            onClick={() => setActiveTab('playwright')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'playwright' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
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
            <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
              <div className="text-[11px] font-mono font-bold text-purple-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Parsed LLM Action Stream ({actions.length})</span>
                </span>
                <span className="text-slate-400">Status: Executing</span>
              </div>
              <div className="space-y-1.5">
                {actions.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-500/40 text-[10px]">
                        [{act.tag}]
                      </span>
                      <span className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{act.payload}</span>
                    </div>
                    <button
                      onClick={() => onExecuteAction(act.id)}
                      className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] border border-purple-500/40 font-bold transition-all"
                    >
                      {act.status === 'completed' ? 'Re-Run' : 'Run Tag'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terminal Console View */}
          <div className="flex-1 p-4 bg-[#0a0a0a] border border-[#333] font-mono text-[11px] overflow-hidden flex flex-col min-h-[160px]">
            <div className="text-[#00f0ff] mb-2 uppercase text-[10px] font-bold">Activity Stream</div>
            <div className="space-y-1 text-[#666] overflow-y-auto flex-1 pr-2">
              {mockTerminalLogs.map(log => (
                <div key={log.id}>
                  [{log.time}] <span className="text-white">{log.type === 'cmd' ? 'USER' : log.type.toUpperCase()}</span>: 
                  {log.type === 'cmd' ? (
                    <span className="text-[#00f0ff] font-bold ml-1">{log.text}</span>
                  ) : log.type === 'action' ? (
                    <span className="text-white ml-1">{log.text}</span>
                  ) : (
                    <span className="text-[#666] ml-1">{log.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Command Shortcuts */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <button
              onClick={() => onRunCustomCommand('claude build --target=core')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono"
            >
              $ claude build
            </button>
            <button
              onClick={() => onRunCustomCommand('claude action --hook=calendar')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono"
            >
              $ hook:calendar
            </button>
            <button
              onClick={() => onRunCustomCommand('claude action --hook=mail-brief')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono"
            >
              $ hook:mail-brief (Read-Only)
            </button>
            <button
              onClick={() => onRunCustomCommand('playwright scrape "https://docs.rs/webrtc"')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono"
            >
              $ playwright scrape
            </button>
          </div>

          {/* Terminal Input */}
          <form onSubmit={handleCommandSubmit} className="mt-2.5 flex items-center gap-2">
            <div className="relative flex-1 border border-[#333] bg-[#111]">
              <span className="absolute left-3 top-2.5 text-[#666] font-mono text-xs">$</span>
              <input
                id="terminal-cli-input"
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type command e.g. 'claude action --build' or '[ACTION:RESEARCH]'"
                className="w-full pl-7 pr-3 py-2 bg-transparent text-[11px] font-mono text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#00f0ff] border border-transparent transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Run
            </button>
          </form>
        </div>
      )}

      {/* Tab: Native OS Hooks */}
      {activeTab === 'hooks' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Calendar className="w-4 h-4" />
                <span>AppleScript: Apple Calendar Bridge</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                ACTIVE • READ/WRITE
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct local IPC bridge via osascript without external OAuth tokens. Fetches daily agenda and active syllabus PDF dates.
            </p>
            <div className="p-2 rounded bg-slate-900 text-slate-300 text-[10px]">
              <code>tell application "Calendar" to get events of today</code>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Mail className="w-4 h-4" />
                <span>AppleScript: Apple Mail Executive Briefing</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] border border-amber-800">
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
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>Headless Chromium Scraper (Playwright)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] border border-sky-800">
                HEADLESS ENGINE READY
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Autonomously extracts API docs, algorithmic problem statements, and academic papers to populate the local Vault.
            </p>
            <div className="p-2 rounded bg-slate-900 text-slate-300 text-[10px]">
              <code>const browser = await chromium.launch(); const page = await browser.newPage();</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
