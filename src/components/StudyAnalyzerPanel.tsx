import React, { useState, useRef } from 'react';
import { UploadCloud, BookOpen, Brain, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const StudyAnalyzerPanel: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    summary?: string;
    keyConcepts?: string[];
    socraticQuestions?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFileContent(ev.target.result as string);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFileContent(ev.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const analyzeDocument = async () => {
    if (!fileContent) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/study-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName, content: fileContent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mt-4 flex-1 flex flex-col h-full overflow-hidden">
      {/* Header section */}
      <div className="p-4 bg-[#151922] border border-amber-500/20 rounded-2xl flex flex-col shrink-0 mb-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-amber-400 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              Socratic Study Lab
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Upload local notes, code, or research papers for KAIZEN to dissect and probe Socratically.
            </p>
          </div>
          {fileContent && (
            <button
              onClick={analyzeDocument}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 border border-amber-300/40 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 rounded-xl shadow-[0_2px_10px_rgba(245,158,11,0.35)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isAnalyzing ? 'Analyzing...' : 'Generate Study Guide'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-[#151922] border border-amber-600/40 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-amber-400 text-xs font-mono">{error}</p>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
        {/* Upload / Content Area */}
        <div className="flex flex-col border border-amber-500/20 bg-[#151922] rounded-2xl overflow-hidden shadow-inner">
          {!fileContent ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-amber-500/30 m-3 rounded-xl hover:border-amber-400/70 hover:bg-amber-500/10 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-8 h-8 text-amber-400 mb-3" />
              <p className="text-white font-mono text-xs font-bold uppercase tracking-wider mb-1">
                Drag & Drop Document
              </p>
              <p className="text-slate-400 font-mono text-[10px]">
                Supports .md, .txt, .csv, .json, .ts, .py
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".md,.txt,.csv,.json,.ts,.js,.py"
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-amber-500/15 bg-[#0f1116] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  {fileName}
                </div>
                <button 
                  onClick={() => { setFileContent(''); setFileName(''); setAnalysis(null); }}
                  className="text-slate-400 hover:text-amber-400 font-mono text-[10px] uppercase transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <textarea 
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="flex-1 w-full p-4 bg-transparent text-white font-mono text-xs leading-relaxed resize-none focus:outline-none"
                placeholder="Document content..."
              />
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="flex flex-col border border-amber-500/20 bg-[#151922] rounded-2xl overflow-y-auto p-4 space-y-5 shadow-inner">
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-amber-400 space-y-3">
              <Brain className="w-10 h-10 animate-pulse text-amber-400" />
              <p className="font-mono text-xs uppercase tracking-wider text-center text-slate-400">
                Deconstructing structural logic...<br/>Formulating Socratic inquiries...
              </p>
            </div>
          ) : analysis ? (
            <div className="animate-fadeIn space-y-5">
              <div>
                <h4 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2 pb-1 border-b border-amber-500/20">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Core Summary
                </h4>
                <p className="text-white/90 font-sans text-xs leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 mb-2 pb-1 border-b border-amber-400/20">
                  <FileText className="w-3.5 h-3.5 text-amber-300" /> Key Concepts
                </h4>
                <ul className="space-y-2">
                  {analysis.keyConcepts?.map((concept, i) => (
                    <li key={i} className="text-white/90 font-sans text-xs leading-relaxed flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2 pb-1 border-b border-amber-500/20">
                  <Brain className="w-3.5 h-3.5 text-amber-400" /> Socratic Evaluation
                </h4>
                <div className="space-y-2.5">
                  {analysis.socraticQuestions?.map((q, i) => (
                    <div key={i} className="p-3 bg-[#0f1116] border border-amber-500/20 rounded-xl text-amber-100 font-mono text-xs leading-relaxed">
                      <span className="font-bold text-amber-400 mr-2">Q{i+1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-[10px] uppercase tracking-wider text-center px-4">
              Upload a document and initiate analysis to generate a study guide.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
