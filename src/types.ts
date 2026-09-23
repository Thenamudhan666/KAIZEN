export type AgentCognitiveState = 
  | 'idle'
  | 'listening'
  | 'debating'
  | 'reasoning'
  | 'speaking'
  | 'interrupted'
  | 'learning';

export interface VaultFile {
  path: string;
  title: string;
  category: 'system' | 'memory' | 'quests' | 'skills' | 'general';
  content: string;
  updated: string;
  isMatch?: boolean;
}

export interface ActionItem {
  id: string;
  tag: 'BUILD' | 'BROWSE' | 'RESEARCH' | 'RUN' | 'LEARN' | 'APPLESCRIPT' | 'MAIL_BRIEF';
  payload: string;
  status: 'queued' | 'executing' | 'completed' | 'failed';
  timestamp: number;
  output?: string;
  targetApp?: string;
}

export interface ScreenpipeEvent {
  id: string;
  timestamp: number;
  activeApp: string;
  windowTitle: string;
  ocrText: string;
  audioTranscript?: string;
  stagnationScore: number; // 0 to 1
  errorDetected: boolean;
  codeSnippet?: string;
}

export interface SupervisorIntervention {
  id: string;
  timestamp: number;
  isInterventionRequired: boolean;
  reason: string;
  confidence: number;
  proactiveVocalPrompt: string;
  heuristics: {
    screenActivityScore: number;
    errorFrequency: string;
    stagnationDuration: string;
    focusTarget: string;
  };
}

export interface SocraticNode {
  id: string;
  type: 'Premise' | 'Assumption' | 'Claim' | 'Hypothesis';
  text: string;
  valid: boolean;
}

export interface SocraticEdge {
  from: string;
  to: string;
  relation: 'independent_support' | 'joined_support' | 'conflicts_with';
  sound: boolean;
}

export interface SocraticGraphData {
  verdict: {
    isValid: boolean;
    flawType: string;
    flawDescription: string;
  };
  graph: {
    nodes: SocraticNode[];
    edges: SocraticEdge[];
  };
  probingQuestion: string;
  elenchusStep: string;
}

export interface MultiAgentDeliberation {
  teacher: string;
  critic: string;
  student: string;
  finalSpokenResponse: string;
}

export interface VoyagerSkill {
  id: string;
  title: string;
  domain: string;
  filePath: string;
  markdownContent: string;
  executableCode: string;
  unitTestSummary: string;
  created: string;
  invocations: number;
}

export interface VoicePipelineMetrics {
  webrtcLatencyMs: number;
  vadLatencyMs: number;
  sttLatencyMs: number;
  ttftMs: number;
  chunkerLatencyMs: number;
  ttsLatencyMs: number;
  totalRoundTripMs: number;
  bargeInActive: boolean;
  interruptionCount: number;
  lastReconciledContext?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'kaizen' | 'supervisor' | 'teacher' | 'critic' | 'system';
  text: string;
  timestamp: number;
  actions?: ActionItem[];
  socraticData?: SocraticGraphData;
  deliberation?: MultiAgentDeliberation;
  interrupted?: boolean;
  voiceSynthesized?: boolean;
}
