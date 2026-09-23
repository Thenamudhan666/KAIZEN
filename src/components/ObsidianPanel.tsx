import React, { useState } from 'react';
import { Hexagon, RefreshCw, FileText, AlertCircle } from 'lucide-react';

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
      <div className="p-4 bg-[#151922] border border-amber-500/20 rounded-2xl flex items-center justify-between shrink-0 mb-4 shadow-md">
        <div>
          <h3 className="text-amber-400 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-amber-400" />
            Obsidian Local Bridge
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5 uppercase tracking-wider">
            Connects to local Python PyQt6 Wrapper (Port 8765)
          </p>
        </div>
        <button
          onClick={fetchObsidian}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl border border-amber-300/40 shadow-[0_2px_10px_rgba(245,158,11,0.35)] active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Connecting...' : 'Sync Vault'}
        </button>
      </div>

      {status === 'error' && (
        <div className="p-3.5 mb-4 bg-[#151922] border border-amber-600/40 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-amber-400 font-bold text-xs">Bridge Offline</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Could not reach local Python bridge on http://127.0.0.1:8765. Launch the PyQt6 desktop app to sync your local vault.
            </p>
          </div>
        </div>
      )}

      {status === 'connected' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
          {/* File List */}
          <div className="md:col-span-1 border-r border-amber-500/15 pr-3 flex flex-col space-y-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold pb-2 border-b border-amber-500/15 flex justify-between">
              <span>Local Markdown Files</span>
              <span className="text-amber-400">{files.length} Notes</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedNote(file)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2 cursor-pointer ${
                    selectedNote?.path === file.path
                      ? 'bg-[#151922] border-amber-500/50 text-white shadow-sm'
                      : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="truncate flex-1">
                    <div className="font-semibold truncate text-xs text-white">{file.name.replace('.md', '')}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div className="md:col-span-2 flex flex-col">
            {selectedNote ? (
              <div className="flex flex-col h-full">
                <div className="text-xs text-amber-400 font-mono font-bold mb-2 pb-2 border-b border-amber-500/15">
                  {selectedNote.path}
                </div>
                <div className="flex-1 bg-[#151922] border border-amber-500/20 p-4 rounded-xl overflow-y-auto font-mono text-xs text-white/90 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedNote.content}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-mono uppercase tracking-wider text-slate-500">
                Select a note to preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
