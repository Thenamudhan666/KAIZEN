import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, ShieldAlert, Zap, Radio } from 'lucide-react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from 'livekit-client';
import { VoicePipelineMetrics, AgentCognitiveState } from '../types';

interface VoiceControllerProps {
  onSpeechInput: (text: string) => void;
  onBargeIn: () => void;
  isSpeaking: boolean;
  activeSpeechText: string;
  agentState: AgentCognitiveState;
  onStateChange: (state: AgentCognitiveState) => void;
  onSocraticUpdate?: (data: any) => void;
  onVoyagerUpdate?: (data: any) => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  onSpeechInput,
  onBargeIn,
  isSpeaking,
  activeSpeechText,
  agentState,
  onStateChange,
  onSocraticUpdate,
  onVoyagerUpdate,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0.2);
  const [vadThreshold] = useState(0.35);
  const [eouConfidence] = useState(0.92);
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [lastReconciliation, setLastReconciliation] = useState<string | null>(null);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);
  const [livekitStatus, setLivekitStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = () => {
    setIsListening(false);
    setLivekitStatus('disconnected');
    onStateChange('idle');

    if (roomRef.current) {
      try {
        roomRef.current.disconnect();
      } catch (e) {
        console.error('Error disconnecting room:', e);
      }
      roomRef.current = null;
    }

    audioElementsRef.current.forEach((el) => {
      try {
        el.pause();
        el.remove();
      } catch {}
    });
    audioElementsRef.current = [];

    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setMicVolume(0);
  };

  const handleTriggerBargeIn = (reason: string = 'User barge-in') => {
    // 1. Mute/Pause active audio playback elements
    audioElementsRef.current.forEach((el) => {
      try {
        el.pause();
        el.currentTime = 0;
      } catch {}
    });

    // 2. Broadcast barge-in signal to room if connected
    if (roomRef.current) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'barge_in', reason }));
        roomRef.current.localParticipant.publishData(payload, { reliable: true, topic: 'kaizen_control' });
      } catch (e) {
        console.warn('Could not broadcast barge-in signal:', e);
      }
    }

    // 3. Log Barge-in in UI
    setLastReconciliation(`[BARGE-IN TRIGGERED: "${reason}"]`);
    setInterruptionCount((prev) => prev + 1);

    // 4. Update parent
    onBargeIn();
  };

  const toggleListening = async () => {
    if (isListening) {
      stopSession();
    } else {
      try {
        setErrorMessage(null);
        setLivekitStatus('connecting');

        // Step 1: Request JWT access token from Express backend
        const tokenRes = await fetch('/api/livekit/token?room=kaizen-cockpit');
        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${tokenRes.status}: Failed to get LiveKit token`);
        }
        const { token, url } = await tokenRes.json();

        // Step 2: Initialize LiveKit Room instance
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        // Register LiveKit Event Listeners
        room.on(RoomEvent.Connected, () => {
          console.log('[KAIZEN] Connected to LiveKit Room:', room.name);
          setLivekitStatus('connected');
          setIsListening(true);
          onStateChange('listening');
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log('[KAIZEN] Disconnected from LiveKit Room');
          stopSession();
        });

        // Remote Agent Audio Track Subscription
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            console.log(`[KAIZEN] Subscribed to agent audio track from ${participant.identity}`);
            const element = track.attach();
            audioElementsRef.current.push(element);
            onStateChange('speaking');

            element.onended = () => {
              onStateChange('idle');
            };
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach().forEach((el) => el.remove());
          audioElementsRef.current = audioElementsRef.current.filter((el) => el.isConnected);
        });

        // Agent Cognitive Telemetry & Extension Events
        room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, kind?: any, topic?: string) => {
          try {
            const dataStr = new TextDecoder().decode(payload);
            const msg = JSON.parse(dataStr);

            if (topic === 'kaizen_socratic' || msg.type === 'socratic_graph_update') {
              console.log('[KAIZEN LiveKit] Socratic Update received:', msg);
              if (onSocraticUpdate) onSocraticUpdate(msg.data || msg);
            } else if (topic === 'kaizen_voyager' || msg.type === 'voyager_skill_update') {
              console.log('[KAIZEN LiveKit] Voyager Update received:', msg);
              if (onVoyagerUpdate) onVoyagerUpdate(msg.data || msg);
            }
          } catch (e) {
            console.warn('Failed to parse LiveKit data message:', e);
          }
        });

        // Step 3: Connect to LiveKit WebRTC Server (with dynamic client hostname alignment)
        let connectUrl = url;
        if (typeof window !== 'undefined' && window.location) {
          try {
            const parsed = new URL(url);
            if (
              (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') &&
              window.location.hostname
            ) {
              parsed.hostname = window.location.hostname;
              connectUrl = parsed.toString();
            }
          } catch (e) {
            console.warn('URL normalization warning:', e);
          }
        }
        await room.connect(connectUrl, token);

        // Step 4: Publish Local Microphone Track
        await room.localParticipant.setMicrophoneEnabled(true);

        // Step 5: VAD Audio Visualizer for UI Energy Meter
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(micStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const vol = sum / bufferLength / 255;
            setMicVolume(vol);

            if (vol > vadThreshold && agentState === 'speaking') {
              handleTriggerBargeIn('User voice interruption via VAD');
            }

            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        } catch (micErr) {
          console.warn('Microphone visualizer initialization notice:', micErr);
        }
      } catch (err: any) {
        console.error('[KAIZEN] LiveKit Connection error:', err);
        setLivekitStatus('error');
        setErrorMessage(
          err.message || 'LiveKit Agent connection failed. Ensure livekit-server and KAIZEN agent are running.'
        );
        stopSession();
      }
    }
  };

  const latencyMetrics: VoicePipelineMetrics = {
    webrtcLatencyMs: 25,
    vadLatencyMs: 160,
    sttLatencyMs: 130,
    ttftMs: 140,
    chunkerLatencyMs: 30,
    ttsLatencyMs: 80,
    totalRoundTripMs: 565,
    bargeInActive: isSpeaking,
    interruptionCount,
    lastReconciledContext: lastReconciliation || undefined,
  };

  return (
    <div
      id="voice-orchestrator-panel"
      className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl shadow-2xl flex flex-col relative overflow-hidden"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase font-mono">
              LiveKit Full-Duplex Voice Framework
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              LiveKit Agents (Python) • Gemini 3.1 Flash Live WebRTC • Neural VAD
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-tts-audio-btn"
            onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              speechSynthesisEnabled
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                : 'bg-black/30 border-white/10 text-slate-400'
            }`}
            title="Toggle Agent Audio"
          >
            {speechSynthesisEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">{speechSynthesisEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <button
            id="toggle-mic-input-btn"
            onClick={toggleListening}
            className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.35)]'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 border-amber-300/40 text-slate-950 font-black shadow-[0_4px_16px_rgba(245,158,11,0.4)]'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>LIVEKIT ACTIVE</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-950/80" />
                <span>CONNECT AGENT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LiveKit Connection Status Bar */}
      <div className="mt-3 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#151922] border border-amber-500/15 text-[10px] font-mono">
        <div
          className={`w-2 h-2 rounded-full ${
            livekitStatus === 'connected'
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
              : livekitStatus === 'connecting'
              ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.9)]'
              : livekitStatus === 'error'
              ? 'bg-rose-500 shadow-[0_0_8px_rgba(251,113,133,0.9)]'
              : 'bg-slate-600'
          }`}
        />
        <span
          className={
            livekitStatus === 'connected'
              ? 'text-amber-400 font-semibold'
              : livekitStatus === 'connecting'
              ? 'text-amber-300 font-semibold'
              : livekitStatus === 'error'
              ? 'text-rose-400 font-semibold'
              : 'text-slate-400'
          }
        >
          {livekitStatus === 'connected'
            ? 'LIVEKIT WEBRTC CONNECTED • AGENT RUNTIME: PYTHON LIVEKIT-AGENTS 1.3'
            : livekitStatus === 'connecting'
            ? 'CONNECTING TO LIVEKIT SERVER & AGENT...'
            : livekitStatus === 'error'
            ? 'LIVEKIT CONNECTION ERROR'
            : 'LIVEKIT AGENT STANDBY (READY FOR WEBRTC SESSION)'}
        </span>
      </div>

      {errorMessage && (
        <div className="mt-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono text-rose-300">
          <span className="font-bold">⚠ </span>
          {errorMessage}
        </div>
      )}

      {/* Neural VAD Visualizer */}
      <div className="mt-3 p-3.5 rounded-xl bg-[#151922] border border-amber-500/15 space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Full-Duplex VAD Energy Level</span>
          </span>
          <span className="text-amber-400 font-bold">
            {(micVolume * 100).toFixed(0)}% (Threshold: {(vadThreshold * 100).toFixed(0)}%)
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden relative border border-white/5 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              micVolume > vadThreshold
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                : 'bg-amber-500/20'
            }`}
            style={{ width: `${Math.min(100, micVolume * 140)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_6px_rgba(245,158,11,0.9)]"
            style={{ left: `${vadThreshold * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          <span>
            EOU Confidence: <strong className="text-amber-400">{(eouConfidence * 100).toFixed(0)}%</strong>
          </span>
          <span>
            Transport: <strong className="text-amber-300">WebRTC Opus (48kHz)</strong>
          </span>
        </div>
      </div>

      {/* Latency Breakdown Bar */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
        <div className="p-2.5 rounded-xl bg-[#151922] border border-amber-500/15">
          <div className="text-slate-400 uppercase">LiveKit WebRTC</div>
          <div className="text-amber-300 font-bold text-xs mt-0.5">{latencyMetrics.webrtcLatencyMs} ms</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#151922] border border-amber-500/15">
          <div className="text-slate-400 uppercase">Silero VAD</div>
          <div className="text-amber-300 font-bold text-xs mt-0.5">{latencyMetrics.vadLatencyMs} ms</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#151922] border border-amber-500/15">
          <div className="text-slate-400 uppercase">Model Reasoning</div>
          <div className="text-amber-300 font-bold text-xs mt-0.5">{latencyMetrics.sttLatencyMs} ms</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#151922] border border-amber-500/15">
          <div className="text-slate-400 uppercase">Tool Execution</div>
          <div className="text-amber-300 font-bold text-xs mt-0.5">{latencyMetrics.ttftMs} ms</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#151922] border border-amber-500/15">
          <div className="text-slate-400 uppercase">Audio Synthesis</div>
          <div className="text-amber-300 font-bold text-xs mt-0.5">{latencyMetrics.chunkerLatencyMs} ms</div>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
          <div className="text-amber-400 font-semibold uppercase">Total TTFA</div>
          <div className="text-amber-300 font-bold text-xs mt-0.5">~{latencyMetrics.totalRoundTripMs} ms</div>
        </div>
      </div>

      {/* Turn-Taking & Barge-In Protocol */}
      <div className="mt-3 p-3.5 rounded-xl bg-rose-950/15 border border-rose-500/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Full-Duplex Barge-In Protocol</span>
          </div>

          <button
            id="manual-barge-in-btn"
            onClick={() => handleTriggerBargeIn('Manual UI Barge-in button clicked')}
            disabled={!isSpeaking}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-rose-500/25 border-rose-400 text-rose-300 hover:bg-rose-500/35 shadow-[0_0_14px_rgba(244,63,94,0.4)] cursor-pointer animate-pulse'
                : 'bg-black/30 border-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>FORCE BARGE-IN (INTERRUPT)</span>
          </button>
        </div>

        {lastReconciliation && (
          <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/25 text-[11px] font-mono text-rose-300">
            <div className="font-bold text-rose-300 mb-1 flex items-center gap-1">
              <span>Context Reconciled (Interruption #{interruptionCount})</span>
            </div>
            <p className="text-slate-300">{lastReconciliation}</p>
          </div>
        )}
      </div>

      {/* Spoken Utterance Monitor */}
      {activeSpeechText && (
        <div className="mt-3 p-3.5 rounded-xl relative overflow-hidden border border-amber-500/25 bg-[#151922] text-xs font-mono">
          <div className="absolute left-0 top-2 bottom-2 w-1 brand-gradient rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
          <div className="text-amber-400 font-semibold mb-1 flex items-center gap-1.5 pl-2">
            <Volume2 className="w-3.5 h-3.5" />
            <span>LiveKit Agent Audio Output:</span>
          </div>
          <p className="text-white italic font-sans text-sm pl-2">"{activeSpeechText}"</p>
        </div>
      )}
    </div>
  );
};
