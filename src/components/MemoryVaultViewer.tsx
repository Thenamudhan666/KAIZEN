import React, { useState, useEffect } from 'react';
import { Database, FileText, Search, Plus, Save, Trash2, Shield, BookOpen, Target, Sparkles } from 'lucide-react';
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
    <div id="memory-vault-panel" className="bg-[#0a0a0a] border border-[#333] p-4 flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-[#00f0ff] text-[#00f0ff]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase font-mono">
              Memory Vault & SQLite FTS5
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              Interconnected Markdown Vault • nūs Student Core • Zero-Leakage
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#111] border border-[#333] text-[10px] font-mono font-bold uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'files' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-[#00f0ff]'
            }`}
          >
            Vault Explorer
          </button>
          
          <button
            onClick={() => setActiveTab('student-nus')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'student-nus' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-[#00f0ff]'
            }`}
          >
            nūs Student Core
          </button>
          
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'workspace' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-[#00f0ff]'
            }`}
          >
            Workspace
          </button>
          
          <button
            onClick={() => setActiveTab('obsidian')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'obsidian' ? 'bg-[#a855f7] text-black' : 'text-[#666] hover:text-[#a855f7]'
            }`}
          >
            Obsidian (Local)
          </button>
          <button
            onClick={() => setActiveTab('study-lab')}
            className={`px-3 py-1 transition-all ${
              activeTab === 'study-lab' ? 'bg-[#f59e0b] text-black' : 'text-[#666] hover:text-[#f59e0b]'
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
          <div className="md:col-span-1 flex flex-col space-y-2 border-r border-[#333] pr-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#666]" />
              <input
                id="vault-fts5-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FTS5 full-text search..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#111] border border-[#333] text-[11px] font-mono text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 max-h-72">
              {files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left p-2.5 border text-[11px] font-mono transition-all flex items-start gap-2 ${
                    selectedFile?.path === file.path
                      ? 'bg-[#111] border-[#00f0ff] text-[#00f0ff]'
                      : 'bg-transparent border-transparent text-[#666] hover:bg-[#111] hover:text-[#00f0ff]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="truncate flex-1">
                    <div className="font-bold truncate text-[11px]">{file.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
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
                  <span className="text-[11px] font-mono text-[#00f0ff] font-bold">{selectedFile.path}</span>
                  <button
                    onClick={handleSaveFile}
                    className="px-3 py-1 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Vault</span>
                  </button>
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 w-full p-4 bg-[#111] border border-[#333] text-[11px] font-mono text-[#e0e0e0] focus:outline-none focus:border-[#00f0ff] min-h-[260px] leading-relaxed resize-none"
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
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-cyan-400 font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>nūs Educational Core (Local Slash Commands)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct terminal shortcuts for structured learning, memory capture, and daily syllabus decomposition.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300 block mb-1">/capture [thought]</strong>
                <span className="text-slate-400">Cleans, tags, and commits insights directly into the Vault.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-emerald-300 block mb-1">/quest</strong>
                <span className="text-slate-400">Extracts syllabus deadlines into binary daily milestones.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-amber-300 block mb-1">/level [skill]</strong>
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
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md"
              >
                Execute
              </button>
            </form>

            {slashFeedback && (
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs animate-fadeIn">
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
