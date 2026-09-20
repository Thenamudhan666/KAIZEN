import React, { useState, useEffect } from 'react';
import { Hexagon, RefreshCw, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ObsidianPanel: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  const fetchObsidian = async () => {
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('http://127.0.0.1:8765/api/obsidian/files');
      if (!res.ok) throw new Error('Bridge not found');
      const data = await res.json();
      setFiles(data.files || []);
      setStatus('connected');
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-[#111] border border-[#333] rounded-xl flex items-center justify-between shrink-0 mb-4">
        <div>
          <h3 className="text-[#a855f7] font-bold font-mono text-[11px] uppercase tracking-widest flex items-center gap-2">
            <Hexagon className="w-4 h-4" />
            Obsidian Local Bridge
          </h3>
          <p className="text-[#666] text-[10px] mt-1 uppercase tracking-wider">
            Connects to local Python PyQt6 Wrapper (Port 8765)
          </p>
        </div>
        <button
          onClick={fetchObsidian}
          className="px-4 py-2 border border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7] hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Connecting...' : 'Sync Vault'}
        </button>
      </div>

      {status === 'error' && (
        <div className="p-3 mb-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <h4 className="text-red-400 font-bold text-xs">Connection Failed</h4>
            <p className="text-red-300/70 text-[10px] mt-1">
              Could not reach the local Python bridge on http://127.0.0.1:8765. Ensure the PyQt6 desktop app is running on your machine.
            </p>
          </div>
        </div>
      )}

      {status === 'connected' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
          {/* File List */}
          <div className="md:col-span-1 border-r border-[#333] pr-2 flex flex-col space-y-2">
            <div className="text-[10px] text-[#666] uppercase tracking-widest font-bold pb-2 border-b border-[#333] flex justify-between">
              <span>Local Markdown Files</span>
              <span className="text-[#a855f7]">{files.length} Notes</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedNote(file)}
                  className={`w-full text-left p-2.5 border text-[11px] font-mono transition-all flex items-start gap-2 ${
                    selectedNote?.path === file.path
                      ? 'bg-[#111] border-[#a855f7] text-[#a855f7]'
                      : 'bg-transparent border-transparent text-[#666] hover:bg-[#111] hover:text-[#a855f7]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div className="truncate flex-1">
                    <div className="font-bold truncate text-[11px]">{file.name.replace('.md', '')}</div>
                    <div className="text-[9px] text-slate-500 truncate">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div className="md:col-span-2 flex flex-col">
            {selectedNote ? (
              <div className="flex flex-col h-full">
                <div className="text-[11px] text-[#a855f7] font-mono font-bold mb-2 pb-2 border-b border-[#333]">
                  {selectedNote.path}
                </div>
                <div className="flex-1 bg-[#0a0a0a] border border-[#333] p-4 rounded-lg overflow-y-auto font-mono text-[11px] text-[#e0e0e0] whitespace-pre-wrap leading-relaxed">
                  {selectedNote.content}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Select a note to preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
