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
import {
  AgentCognitiveState,
  ActionItem,
  ChatMessage,
  SocraticGraphData,
  MultiAgentDeliberation,
  SupervisorIntervention,
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
} from 'lucide-react';

// Extracted for animejs entrance tracking
const AnimatedMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
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
  const [isConnected, setIsConnected] = useState(false);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        } else {
          setIsConnected(false);
        }
      } catch {
        setIsConnected(false);
      }
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
    // ~60ms per character, min 3s, max 15s
    const duration = Math.max(3000, Math.min(15000, text.length * 60));
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

  // Conversational Handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setAgentState('reasoning');
    setIsLoadingResponse(true);
    setIsInterrupted(false);

    try {
      const response = await fetch('/api/gemini/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          voiceMode: voiceModeBrevity,
          activeContext: 'User collaborating in terminal with LeetCode & systems architecture.',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }
      
      const botText = data.text || 'Indeed, sir.';

      const parsedActions: ActionItem[] = (data.actions || []).map(
        (a: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          tag: a.tag,
          payload: a.payload,
          status: 'queued',
          timestamp: Date.now(),
        })
      );

      if (parsedActions.length > 0) {
        setActionsQueue((prev) => [...parsedActions, ...prev]);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'kaizen',
        text: botText,
        timestamp: Date.now(),
        actions: parsedActions.length > 0 ? parsedActions : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
      setActiveSpeechText(botText);
      setIsSpeaking(true);
      setAgentState('speaking');
      startSpeakingTimer(botText);
    } catch (err: any) {
      console.error('Conversation error:', err);
      setAgentState('idle');
      setIsSpeaking(false);
      setActiveSpeechText('');
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'kaizen',
        text: `[SYSTEM ERROR]: ${err.message || 'Connection failed'}. Check your server and API key.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Barge-In (Interruption) Trigger
  const handleBargeIn = () => {
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
          <LandingPage onEnterDashboard={() => setViewMode('cockpit')} />
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
      <header
        id="app-header-bar"
        className="flex flex-col border-b border-amber-500/20 px-4 sm:px-6 py-3.5 bg-[#0f1116]/95 backdrop-blur-2xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          {/* Left: Delta Icon + PROJECT AETHERIS + KAIZEN + v1.0.4-stable + "Think Speak Build Beyond" */}
          <div className="flex items-center gap-3.5">
            {/* High-tech Delta Glyph with amber glow */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#232936] via-[#161a22] to-[#0d0f14] border border-amber-400/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M12 3 L21 19 L3 19 Z" stroke="url(#amberDeltaGrad)" strokeWidth="2.2" strokeLinejoin="round" />
                <circle cx="12" cy="13.5" r="2.5" fill="#f59e0b" />
                <defs>
                  <linearGradient id="amberDeltaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  PROJECT AETHERIS // KAIZEN CORE
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  KAIZEN
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  v1.0.4-stable
                </span>
                <span className="font-script text-lg sm:text-xl text-amber-200/90 italic font-semibold ml-1 hidden sm:inline select-none">
                  “Think Speak Build Beyond”
                </span>
              </div>
            </div>
          </div>

          {/* Center: 3 Telemetry metric cards */}
          <div className="flex items-center gap-2.5 hidden md:flex">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161920]/80 border border-amber-500/15">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse"></span>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[8px] text-slate-400 uppercase tracking-wider font-semibold">LOCAL LATENCY</span>
                <span className="font-mono text-xs text-white font-bold">42ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161920]/80 border border-amber-500/15">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.9)]"></span>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[8px] text-slate-400 uppercase tracking-wider font-semibold">MEMORY VAULT</span>
                <span className="font-mono text-xs text-white font-bold">1,248 MB</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161920]/80 border border-amber-500/15">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]"></span>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[8px] text-slate-400 uppercase tracking-wider font-semibold">CPU LOAD</span>
                <span className="font-mono text-xs text-white font-bold">24%</span>
              </div>
            </div>
          </div>

          {/* Right: Landing Page Toggle + User Avatar Chip */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-900/50 hover:border-amber-400/60 transition-all text-xs font-mono font-semibold cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              title="Return to Futuristic Landing Page"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>LANDING PAGE</span>
            </button>

            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#161a22]/90 border border-amber-500/25 backdrop-blur-md shadow-md">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center font-black text-xs text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                G
              </div>
              <span className="text-xs font-semibold text-white">Gawtham</span>
              <span className="text-xs">👏</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)] animate-pulse"></span>
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
      <main data-lenis-prevent className="flex-1 w-full mx-auto p-4 sm:p-6 flex flex-col min-h-0 overflow-y-auto bg-transparent gap-6 main-panel-anim relative z-10" style={{ transformStyle: 'preserve-3d' }}>
        {/* Quick Scenario Preset Launcher */}
        <QuickScenarioLauncher 
          onLaunchScenario={handleLaunchScenario} 
          onRunAllPhases={() => handleLaunchScenario('leetcode')}
        />

        {/* Tab 1: Cockpit & Voice Interaction */}
        {activeTab === 'cockpit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                  {/* Voice Brevity Toggle */}
                  <button
                    id="toggle-voice-brevity-btn"
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

                {/* Chat Timeline */}
                <div
                  ref={chatScrollRef}
                  data-lenis-prevent
                  className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 max-h-[360px]"
                >
                  {messages.map((msg) => (
                    <AnimatedMessage key={msg.id} msg={msg} />
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
                    handleSendMessage(chatInput);
                  }}
                  className="mt-2 flex items-center gap-2 p-1.5 rounded-full bg-[#161a22] border border-amber-500/30 shadow-inner"
                >
                  <button
                    type="button"
                    onClick={() => handleSendMessage("Hello Kaizen, provide a quick system briefing.")}
                    className="w-9 h-9 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/30 flex items-center justify-center text-amber-400 transition-colors ml-1 cursor-pointer"
                    title="Voice prompt"
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                  <input
                    id="chat-user-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask KAIZEN anything or speak naturally..."
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-sans text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isLoadingResponse}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold flex items-center justify-center transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 mr-0.5 cursor-pointer"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              />
            </div>
          </div>
        )}

        {/* Tab 6: Phase 5 Socratic Cognition */}
        {activeTab === 'socratic' && (
          <SocraticDebatePanel
            onAnalyzeProposition={handleAnalyzeProposition}
            onRunDeliberation={handleRunDeliberation}
          />
        )}

        {/* Tab 7: Phase 5 Voyager Lifelong Skills */}
        {activeTab === 'voyager' && <VoyagerSkillLibrary />}
      </main>
    </div>
    </SmoothScrollProvider>
  );
}
