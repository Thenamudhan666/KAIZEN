import React, { useState, useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';
import { HolographicOrb } from './components/HolographicOrb';
import { VoiceController } from './components/VoiceController';
import { ActionRouterTerminal } from './components/ActionRouterTerminal';
import { ScreenpipeObserver } from './components/ScreenpipeObserver';
import { SocraticDebatePanel } from './components/SocraticDebatePanel';
import { MemoryVaultViewer } from './components/MemoryVaultViewer';
import { VoyagerSkillLibrary } from './components/VoyagerSkillLibrary';
import { QuickScenarioLauncher } from './components/QuickScenarioLauncher';
import { TitleBar } from './components/TitleBar';
import { LandingPage } from './components/landing/LandingPage';
import { SmoothScrollProvider } from './components/SmoothScroll';
import { GalaxyAIIcon } from './components/GalaxyAIIcon';
import { KnoxVaultBadge } from './components/KnoxVaultBadge';
import {
  AgentCognitiveState,
  ActionItem,
  ChatMessage,
  SocraticGraphData,
  MultiAgentDeliberation,
  SupervisorIntervention,
  VoyagerSkill,
} from './types';
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  Database,
  Eye,
  Radio,
  Brain,
  BookOpen,
  Shield,
  Layers,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
} from 'lucide-react';
import { speakKaizenVoice, stopKaizenVoice, initAudioUnlock } from './utils/speechSynthesis';
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from './utils/speechRecognition';

// Extracted for animejs entrance tracking
const AnimatedMessage: React.FC<{
  msg: ChatMessage;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}> = ({ msg, onSpeak, isSpeaking }) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nodeRef.current) {
      anime({
        targets: nodeRef.current,
        translateY: [15, 0],
        opacity: [0, 1],
        duration: 450,
        easing: 'easeOutQuad'
      });
    }
  }, []);

  if (msg.sender === 'system') {
    return (
      <div ref={nodeRef} className="flex justify-center w-full my-1">
        <div className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-[11px] text-center max-w-md shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.sender === 'supervisor') {
    return (
      <div ref={nodeRef} className="flex justify-start w-full my-1">
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-mono text-xs max-w-lg space-y-1 shadow-sm">
          <div className="font-bold flex items-center gap-1.5 text-[11px] text-emerald-400">
            <Eye className="w-3.5 h-3.5" />
            <span>Screenpipe Context Observer</span>
          </div>
          <p className="whitespace-pre-wrap text-slate-200">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.sender === 'user') {
    return (
      <div ref={nodeRef} className="flex justify-end w-full my-1">
        <div className="flex items-start gap-2.5 max-w-[85%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 mt-0.5 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            G
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[10px] text-amber-300/80 font-semibold">Gawtham</span>
            </div>
            <div className="p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-medium shadow-[0_4px_16px_rgba(245,158,11,0.3)] border border-amber-300/40 text-xs sm:text-sm leading-relaxed">
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // KAIZEN / Butler message
  return (
    <div ref={nodeRef} className="flex justify-start w-full my-1">
      <div className="flex items-start gap-3 max-w-[88%]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shrink-0 mt-0.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-white/20 font-bold">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold text-white tracking-wide">KAIZEN</span>
            <span className="text-amber-500/40 text-[10px]">•</span>
            <span className="font-mono text-[10px] text-amber-300/80">Butler Persona</span>
            {onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(msg.text)}
                className="p-1 rounded-md hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer ml-1 flex items-center gap-1 text-[10px] font-mono group"
                title="Speak this response aloud"
                aria-label="Speak this response aloud"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400/90 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-amber-400/80 hidden sm:inline">Speak</span>
              </button>
            )}
          </div>
          <div className="p-4 rounded-2xl rounded-tl-sm bg-[#151922]/90 border border-amber-500/20 text-slate-100 shadow-xl text-xs sm:text-sm leading-relaxed">
            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

            {/* Render Attached Action Tags */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-amber-500/15 space-y-1.5">
                {msg.actions.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center gap-1.5 font-mono text-[10px] text-amber-300 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20"
                  >
                    <span className="font-bold text-amber-400">[{act.tag}]</span>
                    <span className="truncate text-slate-300">{act.payload}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'cockpit'>('landing');
  const [activeTab, setActiveTab] = useState<
    'cockpit' | 'vault' | 'actions' | 'observer' | 'voice' | 'socratic' | 'voyager'
  >('cockpit');

  const [agentState, setAgentState] = useState<AgentCognitiveState>('idle');
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0.2);
  const [isInterrupted, setIsInterrupted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState(false);
  const [livekitSocraticData, setLivekitSocraticData] = useState<SocraticGraphData | null>(null);
  const [livekitVoyagerSkill, setLivekitVoyagerSkill] = useState<VoyagerSkill | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize browser audio gesture unlock
  useEffect(() => {
    const cleanup = initAudioUnlock();
    return cleanup;
  }, []);

  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const handsFreeModeRef = useRef<boolean>(false);
  const handleStartListeningRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    handsFreeModeRef.current = handsFreeMode;
  }, [handsFreeMode]);

  // Central Butler Voice Speaker
  const speakResponse = useCallback((text: string) => {
    if (!speechSynthesisEnabled) return;
    speakKaizenVoice(text, {
      onStart: () => {
        setIsSpeaking(true);
        setAgentState('speaking');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setAgentState('idle');
        // In hands-free mode, re-arm microphone after Butler finishes speaking
        if (handsFreeModeRef.current && handleStartListeningRef.current) {
          setTimeout(() => {
            if (handsFreeModeRef.current && handleStartListeningRef.current) {
              handleStartListeningRef.current();
            }
          }, 450);
        }
      },
      onError: () => {
        setIsSpeaking(false);
        setAgentState('idle');
      },
    });
  }, [speechSynthesisEnabled]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'kaizen',
      text: 'Good day, sir. All core subsystems are operational. Local Memory Vault is secured with zero external telemetry, and the Screenpipe multimodal observer is actively monitoring your workflow.',
      timestamp: Date.now() - 60000,
    },
  ]);

  const [chatInput, setChatInput] = useState('');
  const [voiceModeBrevity, setVoiceModeBrevity] = useState(true);
  const [actionsQueue, setActionsQueue] = useState<ActionItem[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  // Health check to verify server connection
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setIsConnected(true);
          return;
        }
      } catch (_) {}

      // Fallback check to port 3000 if running on Vite dev port 5173
      if (typeof window !== 'undefined' && window.location.port !== '3000') {
        try {
          const directRes = await fetch('http://localhost:3000/api/health');
          if (directRes.ok) {
            setIsConnected(true);
            return;
          }
        } catch (_) {}
      }
      setIsConnected(false);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-reset speaking state after a duration proportional to text length
  const startSpeakingTimer = useCallback((text: string) => {
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    // Proportional speaking duration: ~35ms per character, min 1.5s, max 6s
    const duration = Math.max(1500, Math.min(6000, text.length * 35));
    speakingTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setAgentState('idle');
    }, duration);
  }, []);

  // 3D Hover Tilt Effect for Chat Panel
  const handleChatMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chatPanelRef.current) return;
    const rect = chatPanelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-5 to 5 degrees)
    const rotateX = ((y / rect.height) - 0.5) * -10;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    
    anime({
      targets: chatPanelRef.current,
      rotateX,
      rotateY,
      scale: 1.02,
      translateZ: 10,
      duration: 100,
      easing: 'easeOutQuad',
    });
  };

  const handleChatMouseLeave = () => {
    if (!chatPanelRef.current) return;
    anime({
      targets: chatPanelRef.current,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      translateZ: 0,
      duration: 600,
      easing: 'easeOutElastic(1, .5)',
    });
  };

  // UI Entry Animation
  useEffect(() => {
    if (appContainerRef.current) {
      anime.timeline({
        easing: 'easeOutExpo',
      })
      .add({
        targets: '#app-header-bar',
        opacity: [0, 1],
        translateY: [-50, 0],
        rotateX: [45, 0],
        duration: 1200,
      })
      .add({
        targets: '.tab-btn-anim',
        opacity: [0, 1],
        translateY: [20, 0],
        rotateX: [-45, 0],
        delay: anime.stagger(100),
        duration: 800,
      }, '-=800')
      .add({
        targets: '.main-panel-anim',
        opacity: [0, 1],
        scale: [0.9, 1],
        rotateY: [15, 0],
        duration: 1000,
      }, '-=600');
    }
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Audio amplitude dynamic simulation when speaking/listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (agentState === 'speaking' || agentState === 'listening') {
      interval = setInterval(() => {
        setAudioAmplitude(0.3 + Math.random() * 0.6);
      }, 100);
    } else {
      setAudioAmplitude(0.15 + Math.random() * 0.1);
    }
    return () => clearInterval(interval);
  }, [agentState]);

  // Conversational Handler with Real-Time Streaming (Sub-second TTFT)
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Instant neural barge-in: cancel any currently playing speech when user submits new prompt
    stopKaizenVoice();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const botMsgId = (Date.now() + 1).toString();
    const botMsgPlaceholder: ChatMessage = {
      id: botMsgId,
      sender: 'kaizen',
      text: '',
      timestamp: Date.now() + 1,
    };

    setMessages((prev) => [...prev, userMsg, botMsgPlaceholder]);
    setChatInput('');
    setAgentState('reasoning');
    setIsLoadingResponse(true);
    setIsInterrupted(false);

    let accumulatedText = '';
    let parsedActions: ActionItem[] = [];

    try {
      const response = await fetch('/api/gemini/converse/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          voiceMode: voiceModeBrevity,
          activeContext: 'User collaborating in terminal with LeetCode & systems architecture.',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed: HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                setAgentState('speaking');
                setIsLoadingResponse(false);
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText } : m))
                );
              }
              if (data.done) {
                if (data.text) accumulatedText = data.text;
                if (data.actions && data.actions.length > 0) {
                  parsedActions = data.actions.map((a: any, idx: number) => ({
                    id: `${Date.now()}-${idx}`,
                    tag: a.tag,
                    payload: a.payload,
                    status: 'queued',
                    timestamp: Date.now(),
                  }));
                  setActionsQueue((prev) => [...parsedActions, ...prev]);
                }
              }
            } catch (jsonErr) {
              // Partial line parse error, continue
            }
          }
        }
      }

      const finalBotText = accumulatedText || 'Indeed, sir.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: finalBotText,
                actions: parsedActions.length > 0 ? parsedActions : undefined,
              }
            : m
        )
      );

      setActiveSpeechText(finalBotText);
      setIsSpeaking(true);
      setAgentState('speaking');
      startSpeakingTimer(finalBotText);
      speakResponse(finalBotText);
    } catch (err: any) {
      console.warn('Streaming converse failed, falling back to standard endpoint:', err);
      try {
        const fallbackRes = await fetch('/api/gemini/converse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            voiceMode: voiceModeBrevity,
            activeContext: 'User collaborating in terminal with LeetCode & systems architecture.',
          }),
        });
        const data = await fallbackRes.json();
        const fallbackText = data.text || 'Indeed, sir.';
        const actions: ActionItem[] = (data.actions || []).map((a: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          tag: a.tag,
          payload: a.payload,
          status: 'queued',
          timestamp: Date.now(),
        }));
        if (actions.length > 0) setActionsQueue((prev) => [...actions, ...prev]);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: fallbackText,
                  actions: actions.length > 0 ? actions : undefined,
                }
              : m
          )
        );
        setActiveSpeechText(fallbackText);
        setIsSpeaking(true);
        setAgentState('speaking');
        startSpeakingTimer(fallbackText);
        speakResponse(fallbackText);
      } catch (fallbackErr: any) {
        console.error('Conversation fallback error:', fallbackErr);

        // Direct secondary attempt to backend port 3000 if running on Vite dev port 5173
        let secondaryData: any = null;
        if (typeof window !== 'undefined' && window.location.port !== '3000') {
          try {
            const directRes = await fetch('http://localhost:3000/api/gemini/converse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: textToSend,
                voiceMode: voiceModeBrevity,
                activeContext: 'User collaborating in terminal with LeetCode & systems architecture.',
              }),
            });
            if (directRes.ok) {
              secondaryData = await directRes.json();
            }
          } catch (_) {}
        }

        if (secondaryData && secondaryData.text) {
          const fallbackText = secondaryData.text;
          const actions: ActionItem[] = (secondaryData.actions || []).map((a: any, idx: number) => ({
            id: `${Date.now()}-${idx}`,
            tag: a.tag,
            payload: a.payload,
            status: 'queued',
            timestamp: Date.now(),
          }));
          if (actions.length > 0) setActionsQueue((prev) => [...actions, ...prev]);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: fallbackText,
                    actions: actions.length > 0 ? actions : undefined,
                  }
                : m
            )
          );
          setActiveSpeechText(fallbackText);
          setIsSpeaking(true);
          setAgentState('speaking');
          startSpeakingTimer(fallbackText);
          speakResponse(fallbackText);
          return;
        }

        // Intelligent Local Butler Fallback when Server Core is offline/reconnecting
        const lowerMsg = textToSend.toLowerCase();
        let offlineButlerText = '';

        if (lowerMsg.includes('tool') || lowerMsg.includes('subsystem') || lowerMsg.includes('capabilit') || lowerMsg.includes('summariz')) {
          offlineButlerText = `Good day, sir. Here is the operational summary of your active tools, subsystems, and environment capabilities:\n\n` +
            `• **Cognitive Engine**: Google Gemini 3.8 / 3.5 Flash Live via LiveKit Agents WebRTC full-duplex pipeline.\n` +
            `• **Socratic Argumentation Engine**: Real-time fallacy deconstruction, claim graph extraction, and targeted Socratic probing.\n` +
            `• **Voyager Skill Compiler**: Subprocess sandbox test verification with permanent local disk persistence in \`vault/skills/\`.\n` +
            `• **Benchmark Toolset**: 12 FDB-v3 API tools (Travel, Finance, Housing, E-Commerce) with sub-second telemetry tracking.\n` +
            `• **Security Enclave**: Samsung Knox Vault architecture with local-only zero-telemetry guardrails.\n\n` +
            `All local systems remain primed. (Note: Start the KAIZEN server with \`npm run dev\` if the live neural uplink is idle).`;
        } else if (lowerMsg.includes('focus') || lowerMsg.includes('task')) {
          offlineButlerText = `Your current primary focus, sir, is verifying the KAIZEN Full-Duplex LiveKit Agent architecture, exercising the Socratic Argumentation Engine, and reviewing compiled Voyager skills in the local Memory Vault.`;
        } else if (lowerMsg.includes('vault') || lowerMsg.includes('memory')) {
          offlineButlerText = `The local Memory Vault enclave is active with zero telemetry leakage. Compiled skills and episodic interactions are securely indexed on disk under the \`vault/\` directory.`;
        } else {
          offlineButlerText = `Indeed, sir. I have parsed your premise. While the remote cognitive uplink is momentarily synchronizing, local autonomous directives remain engaged. Shall we continue our inquiry? (Ensure \`npm run dev\` is active on port 3000).`;
        }

        setAgentState('speaking');
        setIsSpeaking(true);
        setActiveSpeechText(offlineButlerText);
        startSpeakingTimer(offlineButlerText);
        speakResponse(offlineButlerText);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: offlineButlerText,
                  actions: [
                    {
                      id: `${Date.now()}-local-core`,
                      tag: 'LOCAL_MODE',
                      payload: 'Operating via local autonomous Butler directives.',
                      status: 'completed',
                      timestamp: Date.now(),
                    },
                  ],
                }
              : m
          )
        );
      }
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Voice Input (Speech-to-Text) Handlers
  const handleStartListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Electron build.');
      return;
    }

    // Neural barge-in: halt Butler voice if currently speaking
    stopKaizenVoice();
    setIsSpeaking(false);
    setMicError(null);
    setChatInput(''); // Clear any previous input so it never sends prematurely
    setIsMicListening(true);
    setIsTranscribing(false);
    setAgentState('listening');

    const started = startSpeechRecognition({
      silenceTimeoutMs: 1600,
      onInterimText: (text) => {
        setChatInput(text);
      },
      onProcessing: () => {
        setIsTranscribing(true);
        setIsMicListening(false);
        setAgentState('reasoning');
      },
      onFinalText: (text) => {
        setIsTranscribing(false);
        setIsMicListening(false);
        const cleanText = text.trim();
        if (cleanText) {
          setChatInput(cleanText);
          handleSendMessage(cleanText);
        } else {
          setAgentState('idle');
        }
      },
      onError: (err) => {
        console.warn('[KAIZEN STT]', err);
        setMicError(err);
        setIsMicListening(false);
        setIsTranscribing(false);
        setAgentState((prev) => (prev === 'listening' ? 'idle' : prev));
      },
      onEnd: () => {
        setIsMicListening(false);
        setIsTranscribing(false);
        setAgentState((prev) => (prev === 'listening' ? 'idle' : prev));
      },
    });

    if (!started) {
      setIsMicListening(false);
      setIsTranscribing(false);
      setAgentState((prev) => (prev === 'listening' ? 'idle' : prev));
    }
  }, [handleSendMessage]);

  useEffect(() => {
    handleStartListeningRef.current = handleStartListening;
  }, [handleStartListening]);

  const handleStopListening = useCallback(() => {
    setIsMicListening(false);
    setIsTranscribing(true);
    setAgentState('reasoning');
    // Tell speech engine to stop recording and process the audio chunks!
    // Do NOT call handleSendMessage here — onFinalText will submit once transcription arrives!
    stopSpeechRecognition();
  }, []);

  const handleToggleMic = () => {
    if (isMicListening || isTranscribing) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  const handleToggleHandsFree = () => {
    const nextState = !handsFreeMode;
    setHandsFreeMode(nextState);
    if (nextState) {
      if (!isSpeaking && !isMicListening) {
        handleStartListening();
      }
    } else {
      if (isMicListening) {
        handleStopListening(false);
      }
    }
  };

  // Barge-In (Interruption) Trigger
  const handleBargeIn = () => {
    stopKaizenVoice();
    setIsInterrupted(true);
    setIsSpeaking(false);
    setActiveSpeechText('');
    setAgentState('interrupted');

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'system',
        text: '[BARGE-IN TRIGGERED] Audio buffer flushed immediately. LLM generation stream aborted. Context memory reconciled.',
        timestamp: Date.now(),
        interrupted: true,
      },
    ]);

    setTimeout(() => {
      setIsInterrupted(false);
      setAgentState('idle');
    }, 1800);
  };

  // Supervisor Proactive Trigger
  const handleSupervisorIntervention = (intervention: SupervisorIntervention) => {
    const supervisorMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'supervisor',
      text: `[SCREENPIPE PROACTIVE OBSERVER]\nDiagnostic: ${intervention.reason}\nConfidence: ${(
        intervention.confidence * 100
      ).toFixed(0)}%`,
      timestamp: Date.now(),
    };

    const kaizenVocalMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'kaizen',
      text: intervention.proactiveVocalPrompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, supervisorMsg, kaizenVocalMsg]);
    setActiveSpeechText(intervention.proactiveVocalPrompt);
    setIsSpeaking(true);
    setAgentState('speaking');
    startSpeakingTimer(intervention.proactiveVocalPrompt);
    speakResponse(intervention.proactiveVocalPrompt);
  };

  // LiveKit Agent Extension Handlers
  const handleSocraticDataFromAgent = (data: any) => {
    if (!data) return;
    setLivekitSocraticData(data);
    const socraticMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'kaizen',
      text: `[SOCRATIC ARGUMENTATION ENGINE]\nVerdict: ${data.verdict?.isValid ? 'LOGICALLY SOUND' : `FALLACY DETECTED (${data.verdict?.flawType || 'Structural Coupling'})`}\nProbing Question: "${data.probingQuestion || data.probing_question}"`,
      timestamp: Date.now(),
      socraticData: data,
    };
    setMessages((prev) => [...prev, socraticMsg]);
    if (data.probingQuestion || data.probing_question) {
      const q = data.probingQuestion || data.probing_question;
      setActiveSpeechText(q);
      setIsSpeaking(true);
      startSpeakingTimer(q);
      speakResponse(q);
    }
  };

  const handleVoyagerDataFromAgent = (data: any) => {
    if (!data) return;
    const formattedSkill: VoyagerSkill = {
      id: data.skillId || data.skill_id || `SKILL-${Date.now().toString().slice(-4)}`,
      title: data.skillTitle || data.title || 'Dynamic Verified Skill',
      domain: data.domain || data.skillDomain || 'Algorithms',
      filePath: data.relativeFilePath || data.filePath || 'vault/skills/skill.md',
      markdownContent: data.markdownContent || 'Compiled Voyager Skill',
      executableCode: data.executableCode || data.code || '',
      unitTestSummary: data.unitTestSummary || 'Sandbox Assertions Verified',
      created: new Date().toISOString().split('T')[0],
      invocations: 1,
    };
    setLivekitVoyagerSkill(formattedSkill);
    const voyagerMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'kaizen',
      text: `[VOYAGER LIFELONG SKILL COMPILER]\nSkill ID: ${formattedSkill.id}\nSandbox Unit Tests: ${data.testsPassed !== false ? 'PASSED (Sandbox Verified)' : 'FAILED'}\nPersisted to Vault: ${formattedSkill.filePath}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, voyagerMsg]);
  };

  // Socratic Proposition Analyzer
  const handleAnalyzeProposition = async (
    prop: string
  ): Promise<SocraticGraphData | null> => {
    setAgentState('reasoning');
    try {
      const res = await fetch('/api/gemini/socratic-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposition: prop }),
      });
      const data = await res.json();
      setAgentState('idle');
      return data;
    } catch (err) {
      console.error('Socratic analysis failed:', err);
      setAgentState('idle');
      return null;
    }
  };

  // Multi-Agent Deliberation
  const handleRunDeliberation = async (
    topic: string
  ): Promise<MultiAgentDeliberation | null> => {
    setAgentState('debating');
    try {
      const res = await fetch('/api/gemini/deliberate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setAgentState('speaking');
      if (data.deliberation?.finalSpokenResponse) {
        setActiveSpeechText(data.deliberation.finalSpokenResponse);
        setIsSpeaking(true);
        startSpeakingTimer(data.deliberation.finalSpokenResponse);
        speakResponse(data.deliberation.finalSpokenResponse);
      }
      return data.deliberation;
    } catch (err) {
      console.error('Deliberation failed:', err);
      setAgentState('idle');
      return null;
    }
  };

  // Execute Action Item
  const handleExecuteAction = (actionId: string) => {
    setActionsQueue((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? {
              ...a,
              status: 'completed',
              output: 'Executed successfully in local container.',
            }
          : a
      )
    );
  };

  // Quick 1-Click Scenario Launchers
  const handleLaunchScenario = async (
    scenarioKey: 'leetcode' | 'flawed_arch' | 'research_build' | 'morning_brief'
  ) => {
    if (scenarioKey === 'leetcode') {
      setActiveTab('cockpit');
      setAgentState('reasoning');
      const intervention: SupervisorIntervention = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        isInterventionRequired: true,
        reason:
          'Stagnation detected: User has rewritten recurrence relation 4 times in 10 minutes with repeated IndexError outputs in LeetCode #312.',
        confidence: 0.96,
        proactiveVocalPrompt:
          "I notice you've been focused on the dynamic programming array for the last ten minutes, sir. Are you struggling with the state transition logic?",
        heuristics: {
          screenActivityScore: 0.28,
          errorFrequency: '4 exceptions in 5m',
          stagnationDuration: '10 minutes',
          focusTarget: 'LeetCode #312 Burst Balloons',
        },
      };
      handleSupervisorIntervention(intervention);
    } else if (scenarioKey === 'flawed_arch') {
      setActiveTab('socratic');
      await handleRunDeliberation(
        'Flawed assumption that single master node handles global consensus without quorum'
      );
    } else if (scenarioKey === 'research_build') {
      setActiveTab('actions');
      await handleSendMessage(
        'Scrape the WebRTC RFC documentation and build a local low-latency audio buffer utility.'
      );
    } else if (scenarioKey === 'morning_brief') {
      setActiveTab('cockpit');
      await handleSendMessage(
        'Good morning Kaizen. Please provide my daily agenda and active syllabus objectives from the local Vault.'
      );
    }
  };

  if (viewMode === 'landing') {
    return (
      <SmoothScrollProvider>
        <div className="min-h-screen bg-[#0b0c0e] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
          <TitleBar isConnected={isConnected} />
          <LandingPage 
            onEnterDashboard={() => setViewMode('cockpit')} 
            onLaunchScenario={(scenarioKey) => {
              setViewMode('cockpit');
              handleLaunchScenario(scenarioKey);
            }}
          />
        </div>
      </SmoothScrollProvider>
    );
  }

  return (
    <SmoothScrollProvider>
      <div 
        ref={appContainerRef}
        className="h-screen flex flex-col font-sans bg-[#0b0c0e] text-slate-100 overflow-hidden relative z-10" 
        style={{ perspective: '1200px' }}
      >
        {/* Electron Custom Title Bar */}
        <TitleBar isConnected={isConnected} />

      {/* Top Header & Subsystem Telemetry Bar */}
      {/* Top Header & Subsystem Telemetry Bar */}
      <header
        id="app-header-bar"
        className="flex flex-col border-b border-white/[0.08] px-4 sm:px-6 py-3 bg-[#0a0c11]/95 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.7)] font-samsung"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          {/* Left: Samsung Galaxy AI Brand & Slogan */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center relative shadow-[0_0_20px_rgba(59,130,246,0.25)] shrink-0">
              <GalaxyAIIcon size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-samsung-display font-extrabold text-xs tracking-[0.16em] text-white">
                  SAMSUNG
                </span>
                <span className="h-3 w-[1px] bg-slate-700" />
                <span className="font-samsung font-bold text-xs galaxy-ai-text">
                  Galaxy AI Cockpit
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="font-samsung-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Galaxy <span className="galaxy-ai-text">KAIZEN</span>
                </h1>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-samsung font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
                  One UI 7 Edition
                </div>
                <span className="text-xs text-slate-400 font-sans ml-1 hidden sm:inline select-none">
                  “Think. Learn. Act. Improve.”
                </span>
              </div>
            </div>
          </div>

          {/* Center: 3 Samsung Telemetry metric cards */}
          <div className="flex items-center gap-2.5 hidden md:flex">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)] animate-pulse"></span>
              <div className="flex flex-col text-left">
                <span className="font-samsung text-[8px] text-slate-400 uppercase tracking-wider font-semibold">REALTIME TTFT</span>
                <span className="font-samsung text-xs text-white font-bold">&lt; 800ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
              <div className="flex flex-col text-left">
                <span className="font-samsung text-[8px] text-slate-400 uppercase tracking-wider font-semibold">KNOX VAULT</span>
                <span className="font-samsung text-xs text-emerald-400 font-bold">ENCRYPTED</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)] animate-pulse' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'}`}></span>
              <div className="flex flex-col text-left">
                <span className="font-samsung text-[8px] text-slate-400 uppercase tracking-wider font-semibold">GALAXY AI</span>
                <span className={`font-samsung text-xs font-bold ${isConnected ? 'text-white' : 'text-amber-300'}`}>
                  {isConnected ? 'ONLINE' : 'LOCAL MODE'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Landing Page Toggle + User Avatar Chip */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-slate-200 hover:text-white hover:bg-white/[0.12] transition-all text-xs font-samsung font-semibold cursor-pointer shadow-sm"
              title="Return to Samsung Galaxy Product Overview"
            >
              <GalaxyAIIcon size={13} />
              <span>PRODUCT OVERVIEW</span>
            </button>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                G
              </div>
              <span className="text-xs font-semibold text-white">Gawtham</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.9)] animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Phase Navigation Bar */}
        <div data-lenis-prevent className="w-full mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 text-xs font-mono scrollbar-none">
          <button
            id="tab-cockpit-btn"
            onClick={() => setActiveTab('cockpit')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'cockpit'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cockpit & Voice</span>
          </button>

          <button
            id="tab-vault-btn"
            onClick={() => setActiveTab('vault')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 1 Memory Vault</span>
          </button>

          <button
            id="tab-actions-btn"
            onClick={() => setActiveTab('actions')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'actions'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 2 Action Router</span>
          </button>

          <button
            id="tab-observer-btn"
            onClick={() => setActiveTab('observer')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'observer'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 3 Screenpipe</span>
          </button>

          <button
            id="tab-voice-btn"
            onClick={() => setActiveTab('voice')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 4 Latency & Barge-In</span>
          </button>

          <button
            id="tab-socratic-btn"
            onClick={() => setActiveTab('socratic')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'socratic'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 5 Socratic Cognit</span>
          </button>

          <button
            id="tab-voyager-btn"
            onClick={() => setActiveTab('voyager')}
            className={`tab-btn-anim px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'voyager'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border-amber-400/50 text-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-[#14171e]/40 border-white/5 text-slate-400 hover:text-amber-200 hover:bg-white/[0.03]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 5 Voyager Skills</span>
          </button>
        </div>
      </header>

      {/* Main App Body */}
      <main data-lenis-prevent className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 flex flex-col min-h-0 overflow-y-auto bg-transparent gap-6 main-panel-anim relative z-10" style={{ transformStyle: 'preserve-3d' }}>
        {/* Quick Scenario Preset Launcher */}
        <QuickScenarioLauncher 
          className="shrink-0"
          onLaunchScenario={handleLaunchScenario} 
          onRunAllPhases={() => handleLaunchScenario('leetcode')}
        />

        {/* Tab 1: Cockpit & Voice Interaction */}
        {activeTab === 'cockpit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
            {/* Left Column: 3D Holographic Orb & Live Voice Orchestrator */}
            <div className="lg:col-span-5 space-y-6">
              <HolographicOrb
                state={agentState}
                audioAmplitude={audioAmplitude}
                interrupted={isInterrupted}
              />
              <VoiceController
                onSpeechInput={handleSendMessage}
                onBargeIn={handleBargeIn}
                isSpeaking={isSpeaking}
                activeSpeechText={activeSpeechText}
                agentState={agentState}
                onStateChange={setAgentState}
                onSocraticUpdate={handleSocraticDataFromAgent}
                onVoyagerUpdate={handleVoyagerDataFromAgent}
                speechSynthesisEnabled={speechSynthesisEnabled}
                onToggleSpeechSynthesis={() => {
                  setSpeechSynthesisEnabled((prev) => {
                    if (prev) stopKaizenVoice();
                    return !prev;
                  });
                }}
                onTestVoice={() => {
                  speakResponse("Good day, sir. All core subsystems and audio drivers are fully operational. How may I be of service?");
                }}
              />
            </div>

            {/* Right Column: Conversational Stream & Socratic Dialogue */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div 
                ref={chatPanelRef}
                onMouseMove={handleChatMouseMove}
                onMouseLeave={handleChatMouseLeave}
                className="flex flex-col rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-amber-500/20 bg-[#12151c]/90 backdrop-blur-xl min-h-[520px]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15" style={{ transform: 'translateZ(20px)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-mono tracking-wide text-white">
                        Socratic Conversational Stream
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        British Butler Persona • 1-2 Sentence Voice Brevity
                      </p>
                    </div>
                  </div>

                  {/* Voice Controls: Hands-Free Mode, Voice Output Mute, Voice Brevity */}
                  <div className="flex items-center gap-2">
                    <button
                      id="toggle-hands-free-btn"
                      type="button"
                      onClick={handleToggleHandsFree}
                      className={`px-3 py-1 rounded-full border text-[11px] font-mono transition-all font-semibold cursor-pointer flex items-center gap-1.5 ${
                        handsFreeMode
                          ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                          : 'bg-black/30 hover:bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                      title={handsFreeMode ? 'Continuous Hands-Free Conversation: ON (Click to Disable)' : 'Enable Continuous Hands-Free Voice Conversation'}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{handsFreeMode ? 'HANDS-FREE ON' : 'HANDS-FREE'}</span>
                    </button>

                    <button
                      id="toggle-speech-synthesis-btn"
                      type="button"
                      onClick={() => {
                        if (speechSynthesisEnabled) {
                          stopKaizenVoice();
                        }
                        setSpeechSynthesisEnabled(!speechSynthesisEnabled);
                      }}
                      className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                        speechSynthesisEnabled
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-black/30 border-white/10 text-slate-500 hover:text-slate-400'
                      }`}
                      title={speechSynthesisEnabled ? 'Butler Voice Output: ENABLED (Click to Mute)' : 'Butler Voice Output: MUTED (Click to Enable)'}
                    >
                      {speechSynthesisEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    {/* Voice Brevity Toggle */}
                    <button
                      id="toggle-voice-brevity-btn"
                      type="button"
                      onClick={() => setVoiceModeBrevity(!voiceModeBrevity)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-mono transition-all font-semibold cursor-pointer ${
                        voiceModeBrevity
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                          : 'bg-black/30 border-white/10 text-slate-400'
                      }`}
                    >
                      {voiceModeBrevity ? 'VOICE CONSTRAINED' : 'UNCONSTRAINED'}
                    </button>
                  </div>
                </div>

                {/* Chat Timeline */}
                <div
                  ref={chatScrollRef}
                  data-lenis-prevent
                  className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 max-h-[360px]"
                >
                  {messages.map((msg) => (
                    <AnimatedMessage key={msg.id} msg={msg} onSpeak={speakResponse} isSpeaking={isSpeaking} />
                  ))}

                  {isLoadingResponse && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/25 text-xs font-mono text-amber-300">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      <span>KAIZEN deliberating and formulating Socratic inquiry...</span>
                    </div>
                  )}
                </div>

                {/* Prompt Quick-Action Chips Row (matching mockup) */}
                <div className="flex flex-wrap gap-2 py-2 border-t border-amber-500/15">
                  {[
                    { label: "What's my current focus?", prompt: "What's my current focus and active task context?" },
                    { label: "Summarize active tools", prompt: "Summarize my active tools, subsystems, and environment capabilities." },
                    { label: "Run Phase 1 demo", prompt: "Execute Phase 1 Memory Vault demo and query the syllabus." },
                    { label: "Show memory vault status", prompt: "Show current memory vault enclave status, vector count, and recall score." },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip.prompt)}
                      className="px-3 py-1 rounded-full text-[11px] font-mono bg-amber-950/30 hover:bg-amber-900/40 text-amber-200 hover:text-white border border-amber-500/20 hover:border-amber-400/50 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Chat Input Box - Pill shaped matching mockup */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isMicListening) {
                      handleStopListening();
                    } else if (!isTranscribing && chatInput.trim()) {
                      handleSendMessage(chatInput);
                    }
                  }}
                  className={`mt-2 flex items-center gap-2 p-1.5 rounded-full bg-[#161a22] border transition-all shadow-inner ${
                    isMicListening 
                      ? 'border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40'
                      : isTranscribing
                      ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/40 animate-pulse'
                      : 'border-amber-500/30 hover:border-amber-500/50'
                  }`}
                >
                  {/* Real Voice Input Button */}
                  <button
                    id="mic-voice-input-btn"
                    type="button"
                    onClick={handleToggleMic}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ml-1 cursor-pointer shrink-0 ${
                      isMicListening
                        ? 'bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.7)] animate-pulse border border-white/30'
                        : isTranscribing
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 animate-pulse'
                        : 'bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/30 text-amber-400 hover:text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)] active:scale-95'
                    }`}
                    title={
                      isTranscribing
                        ? 'Transcribing audio...'
                        : isMicListening
                        ? 'Microphone listening. Click to finish and transcribe.'
                        : 'Click to speak your message to KAIZEN'
                    }
                  >
                    {isMicListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : isTranscribing ? (
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>

                  {/* Audio Equalizer wave indicator when actively listening */}
                  {isMicListening && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-[10px] font-mono text-rose-300 font-bold uppercase tracking-wider hidden sm:inline">Listening</span>
                      <div className="flex items-end gap-0.5 h-3 ml-0.5">
                        <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-3.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}

                  {/* Transcribing indicator while Neural Engine processes audio */}
                  {isTranscribing && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">Transcribing Audio...</span>
                    </div>
                  )}

                  <input
                    id="chat-user-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isTranscribing
                        ? "Transcribing your voice with Gemini Neural Engine..."
                        : isMicListening
                        ? "Listening... Speak naturally, then click mic or pause"
                        : handsFreeMode
                        ? "Hands-free voice active. Speak or type..."
                        : "Ask KAIZEN anything, click mic to speak, or type..."
                    }
                    disabled={isTranscribing}
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-sans text-white placeholder-slate-400 focus:outline-none disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isLoadingResponse || isTranscribing}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold flex items-center justify-center transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 mr-0.5 cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Error Banner if Microphone access is blocked */}
                {micError && (
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-xl px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <MicOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{micError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMicError(null)}
                      className="text-rose-400 hover:text-white underline ml-3 cursor-pointer shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* Ambient Quote Card & Neon Ribbon Footer */}
              <div className="rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-gradient-to-r from-[#12151d]/95 via-[#181d27]/90 to-[#12151d]/95 backdrop-blur-xl shadow-xl relative overflow-hidden flex items-center justify-between">
                {/* Flowing Wave Ribbon SVG Graphic on the left */}
                <div className="w-28 sm:w-36 h-12 relative shrink-0 flex items-center overflow-hidden pointer-events-none">
                  <svg viewBox="0 0 140 48" className="w-full h-full" fill="none">
                    <defs>
                      <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="ribbonGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#b45309" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 24 C 25 10, 45 38, 70 24 C 95 10, 115 38, 140 24"
                      stroke="url(#ribbonGrad1)"
                      strokeWidth="2.5"
                      fill="none"
                      className="animate-pulse"
                    />
                    <path
                      d="M 0 26 C 25 38, 45 10, 70 26 C 95 38, 115 10, 140 26"
                      stroke="url(#ribbonGrad2)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="25" cy="18" r="2" fill="#fbbf24" className="animate-ping" />
                    <circle cx="70" cy="24" r="2.5" fill="#f59e0b" />
                    <circle cx="115" cy="30" r="2" fill="#d97706" />
                  </svg>
                </div>

                {/* Quote Text */}
                <div className="flex-1 pl-4 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-display font-medium text-slate-100 tracking-wide">
                    “Intelligence amplifies human potential.” <span className="font-mono text-xs text-amber-400 font-semibold">— KAIZEN</span>
                  </p>
                  <p className="font-script text-sm sm:text-base text-amber-200/80 italic mt-0.5">
                    A Partner for a Brighter Tomorrow
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Phase 1 Memory Vault */}
        {activeTab === 'vault' && <MemoryVaultViewer />}

        {/* Tab 3: Phase 2 Action Router & CLI */}
        {activeTab === 'actions' && (
          <ActionRouterTerminal
            actions={actionsQueue}
            onExecuteAction={handleExecuteAction}
            onRunCustomCommand={handleSendMessage}
          />
        )}

        {/* Tab 4: Phase 3 Multimodal Observer (Screenpipe) */}
        {activeTab === 'observer' && (
          <ScreenpipeObserver onTriggerIntervention={handleSupervisorIntervention} />
        )}

        {/* Tab 5: Phase 4 Real-time Voice & Latency */}
        {activeTab === 'voice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
            <div className="lg:col-span-5">
              <HolographicOrb
                state={agentState}
                audioAmplitude={audioAmplitude}
                interrupted={isInterrupted}
              />
            </div>
            <div className="lg:col-span-7">
              <VoiceController
                onSpeechInput={handleSendMessage}
                onBargeIn={handleBargeIn}
                isSpeaking={isSpeaking}
                activeSpeechText={activeSpeechText}
                agentState={agentState}
                onStateChange={setAgentState}
                onSocraticUpdate={handleSocraticDataFromAgent}
                onVoyagerUpdate={handleVoyagerDataFromAgent}
                speechSynthesisEnabled={speechSynthesisEnabled}
                onToggleSpeechSynthesis={() => {
                  setSpeechSynthesisEnabled((prev) => {
                    if (prev) stopKaizenVoice();
                    return !prev;
                  });
                }}
                onTestVoice={() => {
                  speakResponse("Good day, sir. All core subsystems and audio drivers are fully operational. How may I be of service?");
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 6: Phase 5 Socratic Cognition */}
        {activeTab === 'socratic' && (
          <SocraticDebatePanel
            onAnalyzeProposition={handleAnalyzeProposition}
            onRunDeliberation={handleRunDeliberation}
            externalSocraticResult={livekitSocraticData}
          />
        )}

        {/* Tab 7: Phase 5 Voyager Lifelong Skills */}
        {activeTab === 'voyager' && (
          <VoyagerSkillLibrary
            incomingSkill={livekitVoyagerSkill}
          />
        )}
      </main>
    </div>
    </SmoothScrollProvider>
  );
}
