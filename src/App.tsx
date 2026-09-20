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
        translateY: [20, 0],
        translateZ: [30, 0],
        rotateX: [-30, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .6)'
      });
    }
  }, []);

  return (
    <div
      ref={nodeRef}
      className={`flex flex-col ${
        msg.sender === 'user'
          ? 'items-end'
          : msg.sender === 'system'
          ? 'items-center'
          : 'items-start'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {msg.sender === 'system' ? (
        <div className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-[11px] text-center max-w-md">
          {msg.text}
        </div>
      ) : msg.sender === 'supervisor' ? (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 font-mono text-xs max-w-lg space-y-1">
          <div className="font-bold flex items-center gap-1 text-[11px] text-amber-300">
            <Eye className="w-3.5 h-3.5" />
            <span>Screenpipe Context Observer</span>
          </div>
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      ) : (
        <div
          className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed ${
            msg.sender === 'user'
              ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
              : 'bg-slate-950/90 border border-slate-800 text-slate-100 rounded-bl-none shadow-sm font-sans'
          }`}
          style={{ transform: 'translateZ(10px)' }}
        >
          <div className="text-[10px] font-mono font-bold mb-1 opacity-75">
            {msg.sender === 'user'
              ? 'You'
              : 'JARVIS (British Butler)'}
          </div>
          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

          {/* Render Attached Action Tags */}
          {msg.actions && msg.actions.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
              {msg.actions.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-purple-300 bg-purple-950/40 p-1.5 rounded border border-purple-500/30"
                >
                  <span className="font-bold">[{act.tag}]</span>
                  <span className="truncate">{act.payload}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
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
      sender: 'jarvis',
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
        sender: 'jarvis',
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
        sender: 'jarvis',
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

    const jarvisVocalMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'jarvis',
      text: intervention.proactiveVocalPrompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, supervisorMsg, jarvisVocalMsg]);
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
        'Good morning Jarvis. Please provide my daily agenda and active syllabus objectives from the local Vault.'
      );
    }
  };

  return (
    <div 
      ref={appContainerRef}
      className="h-full flex flex-col font-sans bg-slate-950 overflow-hidden" 
      style={{ perspective: '1200px' }}
    >
      {/* Electron Custom Title Bar */}
      <TitleBar isConnected={isConnected} />

      {/* Top Header & Subsystem Telemetry Bar */}
      <header
        id="app-header-bar"
        className="flex justify-between items-end border-b border-slate-800 px-6 pb-4 pt-6 bg-slate-950 sticky top-0 z-50 origin-top"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">
            Project Aetheris // Jarvis Core
          </div>
          <h1 className="text-3xl font-light tracking-tighter text-slate-100">
            SYSTEM COMMAND INTERFACE <span className="text-slate-400">v1.0.4-stable</span>
          </h1>
        </div>
        
        <div className="flex gap-8 text-right hidden md:flex">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Local Latency</div>
            <div className="font-mono text-xl text-cyan-400">642ms</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Memory Vault</div>
            <div className="font-mono text-xl text-slate-100">1,248 MB</div>
          </div>
          <div className="w-24 h-10 bg-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-cyan-400/20"></div>
            <div className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-500">CPU_LOAD</div>
            <div className="absolute bottom-1 right-1.5 text-xs font-mono text-cyan-400">24%</div>
          </div>
        </div>

        {/* Phase Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <button
            id="tab-cockpit-btn"
            onClick={() => setActiveTab('cockpit')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'cockpit'
                ? 'bg-cyan-600 text-white font-bold border-cyan-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cockpit & Voice</span>
          </button>

          <button
            id="tab-vault-btn"
            onClick={() => setActiveTab('vault')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'vault'
                ? 'bg-cyan-600 text-white font-bold border-cyan-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Phase 1: Memory Vault</span>
          </button>

          <button
            id="tab-actions-btn"
            onClick={() => setActiveTab('actions')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'actions'
                ? 'bg-purple-600 text-white font-bold border-purple-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Phase 2: Action Router</span>
          </button>

          <button
            id="tab-observer-btn"
            onClick={() => setActiveTab('observer')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'observer'
                ? 'bg-amber-600 text-white font-bold border-amber-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Phase 3: Screenpipe Observer</span>
          </button>

          <button
            id="tab-voice-btn"
            onClick={() => setActiveTab('voice')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'voice'
                ? 'bg-sky-600 text-white font-bold border-sky-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Phase 4: Latency & Barge-In</span>
          </button>

          <button
            id="tab-socratic-btn"
            onClick={() => setActiveTab('socratic')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'socratic'
                ? 'bg-violet-600 text-white font-bold border-violet-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Phase 5: Socratic Cognition</span>
          </button>

          <button
            id="tab-voyager-btn"
            onClick={() => setActiveTab('voyager')}
            className={`tab-btn-anim px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap origin-bottom ${
              activeTab === 'voyager'
                ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Phase 5: Voyager Skills</span>
          </button>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 flex flex-col min-h-0 overflow-y-auto bg-slate-950 gap-6 main-panel-anim" style={{ transformStyle: 'preserve-3d' }}>
        {/* Quick Scenario Preset Launcher */}
        <QuickScenarioLauncher onLaunchScenario={handleLaunchScenario} />

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
            <div 
              ref={chatPanelRef}
              onMouseMove={handleChatMouseMove}
              onMouseLeave={handleChatMouseLeave}
              className="lg:col-span-7 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-xl min-h-[560px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100">
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
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                    voiceModeBrevity
                      ? 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {voiceModeBrevity ? 'VOICE CONSTRAINED' : 'UNCONSTRAINED'}
                </button>
              </div>

              {/* Chat Timeline */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 max-h-[380px]"
              >
                {messages.map((msg) => (
                  <AnimatedMessage key={msg.id} msg={msg} />
                ))}

                {isLoadingResponse && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>JARVIS deliberating and formulating Socratic inquiry...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(chatInput);
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-800"
              >
                <input
                  id="chat-user-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Speak or type to your partner e.g. 'I think greedy works for DP'..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isLoadingResponse}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoadingResponse ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
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
  );
}
