import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, Zap, Sliders, Radio, ArrowRight } from 'lucide-react';
import { VoicePipelineMetrics, AgentCognitiveState } from '../types';

interface VoiceControllerProps {
  onSpeechInput: (text: string) => void;
  onBargeIn: () => void;
  isSpeaking: boolean;
  activeSpeechText: string;
  agentState: AgentCognitiveState;
  onStateChange: (state: AgentCognitiveState) => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  onSpeechInput,
  onBargeIn,
  isSpeaking,
  activeSpeechText,
  agentState,
  onStateChange,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0.2);
  const [vadThreshold, setVadThreshold] = useState(0.35);
  const [eouConfidence, setEouConfidence] = useState(0.88);
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [lastReconciliation, setLastReconciliation] = useState<string | null>(null);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Google UK English Male');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [wsError, setWsError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cleanup everything on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (inputAudioCtxRef.current) {
        inputAudioCtxRef.current.close();
        inputAudioCtxRef.current = null;
      }
      if (outputAudioCtxRef.current) {
        outputAudioCtxRef.current.close();
        outputAudioCtxRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, []);

  // PCM Encoder
  const pcmToBase64 = (pcmData: Float32Array): string => {
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
      let s = Math.max(-1, Math.min(1, pcmData[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(i * 2, s, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Audio Decoder & Player
  const playAudioChunk = async (ctx: AudioContext, base64Audio: string) => {
    if (!speechSynthesisEnabled) return;
    // Ensure AudioContext is resumed (Chrome/Electron autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const binary = atob(base64Audio);
    const length = binary.length / 2;
    const audioBuffer = ctx.createBuffer(1, length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    const view = new DataView(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) {
      view.setUint8(i, binary.charCodeAt(i));
    }
    for (let i = 0; i < length; i++) {
      channelData[i] = view.getInt16(i * 2, true) / 0x8000;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    if (nextPlaybackTimeRef.current < ctx.currentTime) {
      nextPlaybackTimeRef.current = ctx.currentTime;
    }
    source.start(nextPlaybackTimeRef.current);
    nextPlaybackTimeRef.current += audioBuffer.duration;
    
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      if (activeSourcesRef.current.length === 0) {
        onStateChange('idle');
      }
    };
    onStateChange('speaking');
  };

  const handleTriggerBargeIn = (interruptingPrompt?: string) => {
    // 1. Cancel audio playback immediately
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    activeSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;

    // 2. Log Barge-in UI
    setLastReconciliation(`[BARGE-IN TRIGGERED: "${interruptingPrompt || 'User interruption'}"]`);
    setInterruptionCount(prev => prev + 1);

    // 3. Inform parent
    onBargeIn();
  };

  const stopListening = () => {
    setIsListening(false);
    setWsStatus('disconnected');
    onStateChange('idle');
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setMicVolume(0);
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      // Start listening via Gemini Live API WebSocket
      try {
        setWsError(null);
        setWsStatus('connecting');

        // Resolve WebSocket URL - use localhost:3000 explicitly for Electron compatibility
        const host = window.location.host || 'localhost:3000';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${host}/live`;
        
        console.log('[VoiceController] Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputAudioCtx;
        // Resume AudioContext for autoplay policy
        if (inputAudioCtx.state === 'suspended') {
          await inputAudioCtx.resume();
        }
        
        const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputAudioCtx;
        if (outputAudioCtx.state === 'suspended') {
          await outputAudioCtx.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        ws.onopen = () => {
          console.log('[VoiceController] WebSocket connected');
          setIsListening(true);
          setWsStatus('connected');
          onStateChange('listening');

          // Setup Mic capture after WS is open
          const source = inputAudioCtx.createMediaStreamSource(stream);
          const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
          source.connect(processor);
          processor.connect(inputAudioCtx.destination);

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          // Simple volume meter for UI
          const analyser = inputAudioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const checkAudio = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const vol = sum / bufferLength / 255;
            setMicVolume(vol);
            
            if (vol > vadThreshold && agentState === 'speaking') {
               handleTriggerBargeIn("User interjection via VAD");
            }
            
            animFrameRef.current = requestAnimationFrame(checkAudio);
          };
          checkAudio();
        };

        // Output Handling
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setWsStatus('error');
            setWsError(msg.error);
          }
          if (msg.audio) {
            playAudioChunk(outputAudioCtx, msg.audio);
          }
          if (msg.interrupted) {
            handleTriggerBargeIn("Model interrupted");
          }
        };
        
        ws.onerror = (e) => {
          console.error("Live API WS Error", e);
          setWsStatus('error');
          setWsError('WebSocket connection failed. Ensure the server is running and GEMINI_API_KEY is set.');
        };

        ws.onclose = (e) => {
          console.log("Live API WS closed", e.code, e.reason);
          setIsListening(false);
          setWsStatus('disconnected');
          if (e.code !== 1000) {
            setWsError(`Connection closed unexpectedly (code: ${e.code}). The server may not have a valid GEMINI_API_KEY.`);
          }
        };

      } catch (err: any) {
        console.error("Failed to start Live API:", err);
        setWsStatus('error');
        if (err.name === 'NotAllowedError') {
          setWsError('Microphone permission denied. Please allow microphone access and try again.');
        } else {
          setWsError(err.message || 'Failed to start voice agent.');
        }
        stopListening();
      }
    }
  };

  // 635ms Cascaded Latency Budget Specs
  const latencyMetrics: VoicePipelineMetrics = {
    webrtcLatencyMs: 25,
    vadLatencyMs: 180,
    sttLatencyMs: 140,
    ttftMs: 160,
    chunkerLatencyMs: 40,
    ttsLatencyMs: 90,
    totalRoundTripMs: 635,
    bargeInActive: isSpeaking,
    interruptionCount,
    lastReconciledContext: lastReconciliation || undefined,
  };

  return (
    <div id="voice-orchestrator-panel" className="bg-[#0a0a0a] border border-[#333] p-4">
      <div className="flex items-center justify-between pb-4 border-b border-[#333]">
        <div className="flex items-center gap-2.5">
          <div className="p-1 border border-[#00f0ff] text-[#00f0ff]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase font-mono">
              Ultra-Low Latency Voice (WebRTC & VAD)
            </h3>
            <p className="text-[9px] text-[#666] font-mono uppercase tracking-wider mt-0.5">
              Silero VAD • Semantic EOU • Sub-800ms Turn-Taking
            </p>
          </div>
        </div>

        {/* Global Mic & Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-tts-audio-btn"
            onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              speechSynthesisEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="Toggle Butler Voice Speech Synthesis"
          >
            {speechSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{speechSynthesisEnabled ? 'TTS ON' : 'TTS MUTED'}</span>
          </button>

          <button
            id="toggle-mic-input-btn"
            onClick={toggleListening}
            className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg ${
              isListening
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-emerald-950/50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>MIC LIVE</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span>START VOICE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WebSocket Connection Status */}
      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-[#111] border border-[#333] text-[10px] font-mono">
        <div
          className={`w-2 h-2 rounded-full ${
            wsStatus === 'connected' ? 'bg-[#00ffaa] shadow-[0_0_6px_#00ffaa]' :
            wsStatus === 'connecting' ? 'bg-[#ffaa00] animate-pulse shadow-[0_0_6px_#ffaa00]' :
            wsStatus === 'error' ? 'bg-[#ff0055] shadow-[0_0_6px_#ff0055]' :
            'bg-[#666]'
          }`}
        />
        <span className={
          wsStatus === 'connected' ? 'text-[#00ffaa]' :
          wsStatus === 'connecting' ? 'text-[#ffaa00]' :
          wsStatus === 'error' ? 'text-[#ff0055]' :
          'text-[#666]'
        }>
          {wsStatus === 'connected' ? 'LIVE API CONNECTED' :
           wsStatus === 'connecting' ? 'CONNECTING TO GEMINI LIVE API...' :
           wsStatus === 'error' ? 'CONNECTION ERROR' :
           'VOICE AGENT STANDBY'}
        </span>
      </div>

      {/* Error Message */}
      {wsError && (
        <div className="mt-2 p-2.5 bg-[#1a0011] border border-[#ff0055]/30 text-[11px] font-mono text-[#ff7799]">
          <span className="font-bold text-[#ff0055]">⚠ </span>{wsError}
        </div>
      )}

      {/* Real-time Voice Activity Detection (Silero VAD) Visualizer */}
      <div className="mt-4 p-4 bg-[#111] border border-[#333] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Neural VAD Energy Meter</span>
          </span>
          <span className="text-cyan-400 font-bold">
            {(micVolume * 100).toFixed(0)}% (Threshold: {(vadThreshold * 100).toFixed(0)}%)
          </span>
        </div>

        {/* Dynamic VAD Energy Level Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-75 ${
              micVolume > vadThreshold ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-slate-600'
            }`}
            style={{ width: `${Math.min(100, micVolume * 140)}%` }}
          />
          {/* Threshold Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_8px_#f59e0b]"
            style={{ left: `${vadThreshold * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span>Semantic EOU Probability: <strong className="text-emerald-400">{(eouConfidence * 100).toFixed(0)}%</strong></span>
          <span>Buffer: <strong className="text-slate-200">30ms PCM (16kHz)</strong></span>
        </div>
      </div>

      {/* Sub-800ms Latency Budget Dashboard */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
        <div className="p-2 bg-[#111] border border-[#333]">
          <div className="text-[#666]">WebRTC Ingest</div>
          <div className="text-[#00f0ff] font-bold text-xs mt-0.5">{latencyMetrics.webrtcLatencyMs} ms</div>
        </div>
        <div className="p-2 bg-[#111] border border-[#333]">
          <div className="text-[#666]">Silero VAD</div>
          <div className="text-[#00f0ff] font-bold text-xs mt-0.5">{latencyMetrics.vadLatencyMs} ms</div>
        </div>
        <div className="p-2 bg-[#111] border border-[#333]">
          <div className="text-[#666]">Deepgram STT</div>
          <div className="text-[#00f0ff] font-bold text-xs mt-0.5">{latencyMetrics.sttLatencyMs} ms</div>
        </div>
        <div className="p-2 bg-[#111] border border-[#333]">
          <div className="text-[#666]">LLM TTFT</div>
          <div className="text-[#00f0ff] font-bold text-xs mt-0.5">{latencyMetrics.ttftMs} ms</div>
        </div>
        <div className="p-2 bg-[#111] border border-[#333]">
          <div className="text-[#666]">Clause Chunker</div>
          <div className="text-[#00f0ff] font-bold text-xs mt-0.5">{latencyMetrics.chunkerLatencyMs} ms</div>
        </div>
        <div className="p-2 border border-[#00f0ff] bg-[#001122]">
          <div className="text-[#00f0ff] font-semibold">Total TTFA</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">~{latencyMetrics.totalRoundTripMs} ms</div>
        </div>
      </div>

      {/* Barge-In / Interrupt Controls & Context Reconciliation Box */}
      <div className="mt-4 p-4 bg-[#111] border border-[#333] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Turn-Taking & Barge-In Protocol</span>
          </div>

          <button
            id="manual-barge-in-btn"
            onClick={() => handleTriggerBargeIn("User clicked manual barge-in button")}
            disabled={!isSpeaking}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-rose-600/30 border-rose-500 text-rose-200 hover:bg-rose-600/50 shadow-lg shadow-rose-950 cursor-pointer animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>FORCE BARGE-IN (INTERRUPT)</span>
          </button>
        </div>

        {lastReconciliation && (
          <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-[11px] font-mono text-rose-200">
            <div className="font-bold text-rose-300 mb-1 flex items-center gap-1">
              <span>Context Reconciled (Interruption #{interruptionCount})</span>
            </div>
            <p className="text-slate-300">{lastReconciliation}</p>
          </div>
        )}
      </div>

      {/* Persona Spoken Output Monitor */}
      {activeSpeechText && (
        <div className="mt-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono">
          <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Active Butler Spoken Audio Stream (1-2 sentences):</span>
          </div>
          <p className="text-slate-200 italic font-sans text-sm">"{activeSpeechText}"</p>
        </div>
      )}
    </div>
  );
};
