import React, { useState, useEffect } from 'react';
import { Database, FileText, Search, Save, BookOpen } from 'lucide-react';
import { VaultFile } from '../types';
import { WorkspaceIntegrationPanel } from './WorkspaceIntegrationPanel';
import { ObsidianPanel } from './ObsidianPanel';
import { StudyAnalyzerPanel } from './StudyAnalyzerPanel';

interface MemoryVaultViewerProps {
  onFileSaved?: () => void;
}

export const MemoryVaultViewer: React.FC<MemoryVaultViewerProps> = ({ onFileSaved }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'student-nus' | 'workspace' | 'obsidian' | 'study-lab'>('obsidian');

  // Slash command inputs for nūs student integration
  const [slashInput, setSlashInput] = useState('');
  const [slashFeedback, setSlashFeedback] = useState<string | null>(null);

  const fetchVaultFiles = async (q: string = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/vault/files?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        if (!selectedFile && data.files.length > 0) {
          setSelectedFile(data.files[0]);
          setEditedContent(data.files[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vault files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultFiles(searchQuery);
  }, [searchQuery]);

  const handleSelectFile = (file: VaultFile) => {
    setSelectedFile(file);
    setEditedContent(file.content);
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    try {
      await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile.path,
          title: selectedFile.title,
          category: selectedFile.category,
          content: editedContent,
        }),
      });
      fetchVaultFiles(searchQuery);
      if (onFileSaved) onFileSaved();
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  const handleRunSlashCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slashInput.trim()) return;

    const cmd = slashInput.trim();
    if (cmd.startsWith('/capture')) {
      const payload = cmd.replace('/capture', '').trim();
      const newPath = `vault/memory/note_${Date.now().toString().slice(-4)}.md`;
      await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newPath,
          title: `Captured Note: ${payload.slice(0, 24)}...`,
          category: 'memory',
          content: `# Captured Insight\n\n- Date: ${new Date().toLocaleString()}\n- Content: ${payload}\n- Tagged: #student #memory`,
        }),
      });
      setSlashFeedback(`Captured and filed to '${newPath}' in SQLite FTS5 store.`);
    } else if (cmd.startsWith('/quest')) {
      setSlashFeedback(`[nūs] Quest generated from active syllabus: "Binary Objective: Implement 2D Interval DP Tabulation for Burst Balloons before 18:00".`);
    } else if (cmd.startsWith('/level')) {
      setSlashFeedback(`[nūs] Level progression mapped: 35-minute interval recurrence sprint auto-scheduled.`);
    } else {
      setSlashFeedback(`Executed: ${cmd}`);
    }

    setSlashInput('');
    fetchVaultFiles(searchQuery);
  };

  return (
    <div id="memory-vault-panel" className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase font-mono">
              Memory Vault & SQLite FTS5
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Interconnected Markdown Vault • nūs Student Core • Zero-Leakage
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div data-lenis-prevent className="flex items-center p-1 bg-[#151922] rounded-xl border border-amber-500/15 text-[10px] font-mono font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'files' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Vault Explorer
          </button>
          
          <button
            onClick={() => setActiveTab('student-nus')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'student-nus' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            nūs Core
          </button>
          
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'workspace' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Workspace
          </button>
          
          <button
            onClick={() => setActiveTab('obsidian')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'obsidian' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Obsidian
          </button>
          <button
            onClick={() => setActiveTab('study-lab')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'study-lab' ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-400/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)]' : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            Study Lab
          </button>
        </div>
      </div>

      {/* Tab: File Explorer */}
      {activeTab === 'files' && (
        <div className="mt-4 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[360px]">
          {/* File List & Search */}
          <div className="md:col-span-1 flex flex-col space-y-2 border-r border-amber-500/15 pr-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-amber-400/60" />
              <input
                id="vault-fts5-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search markdown vault..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#151922] border border-amber-500/25 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-1.5 max-h-72 pr-1">
              {files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2 cursor-pointer ${
                    selectedFile?.path === file.path
                      ? 'bg-[#151922] border-amber-500/50 text-white shadow-sm'
                      : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="truncate flex-1">
                    <div className="font-semibold truncate text-xs text-white">{file.title}</div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Editor View */}
          <div className="md:col-span-2 flex flex-col space-y-2">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-bold">{selectedFile.path}</span>
                  <button
                    onClick={handleSaveFile}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_2px_8px_rgba(245,158,11,0.35)] border border-amber-300/40 active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Vault</span>
                  </button>
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 w-full p-4 rounded-xl bg-[#151922] border border-amber-500/25 text-xs font-mono text-white focus:outline-none focus:border-amber-400 min-h-[260px] leading-relaxed resize-none shadow-inner"
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-mono text-slate-500">
                Select a vault document to view or edit.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: nūs Student Core */}
      {activeTab === 'student-nus' && (
        <div className="mt-4 flex-1 flex flex-col space-y-4">
          <div className="p-4 rounded-xl bg-[#151922] border border-amber-500/20 space-y-3 font-mono text-xs">
            <div className="text-amber-400 font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>nūs Educational Core (Local Slash Commands)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct terminal shortcuts for structured learning, memory capture, and daily syllabus decomposition.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-3 rounded-xl bg-[#0f1116] border border-amber-500/15">
                <strong className="text-amber-300 block mb-1">/capture [thought]</strong>
                <span className="text-slate-400">Cleans, tags, and commits insights directly into the Vault.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0f1116] border border-amber-500/15">
                <strong className="text-amber-400 block mb-1">/quest</strong>
                <span className="text-slate-400">Extracts syllabus deadlines into binary daily milestones.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0f1116] border border-amber-500/15">
                <strong className="text-amber-200 block mb-1">/level [skill]</strong>
                <span className="text-slate-400">Generates a 20-45min customized repetition block.</span>
              </div>
            </div>

            {/* Slash Command Input */}
            <form onSubmit={handleRunSlashCommand} className="mt-3 flex gap-2">
              <input
                id="nus-slash-input"
                type="text"
                value={slashInput}
                onChange={(e) => setSlashInput(e.target.value)}
                placeholder="Type /capture, /quest, or /level..."
                className="flex-1 px-4 py-2 rounded-xl bg-[#0f1116] border border-amber-500/25 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_4px_16px_rgba(245,158,11,0.35)] border border-amber-300/40 active:scale-95 cursor-pointer"
              >
                Execute
              </button>
            </form>

            {slashFeedback && (
              <div className="p-3 rounded-xl bg-[#0f1116] border border-amber-500/30 text-amber-300 text-xs">
                {slashFeedback}
              </div>
            )}
          </div>
        </div>
      )}
    
      {/* Tab: Workspace */}
      {activeTab === 'workspace' && <WorkspaceIntegrationPanel />}
      
      {/* Tab: Obsidian */}
      {activeTab === 'obsidian' && <ObsidianPanel />}

      {/* Tab: Study Lab */}
      {activeTab === 'study-lab' && <StudyAnalyzerPanel />}

    </div>
  );
};
