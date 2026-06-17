export interface Question {
  id: string;
  question: string;
  helperText: string;
  placeholder?: string;
}

export interface OptimizationProfile {
  id: 'token-saving' | 'architectural' | 'mvp-prototype' | 'comprehensive';
  name: string;
  description: string;
  icon: string;
  tokenFocus: string;
  claudeBias: string;
}

export interface PromptAnalysis {
  efficiencyScore: number;
  tokenEstimation: {
    systemPromptTokens: number;
    estimatedSavings: number;
    reductionPercentage: number;
  };
  pros: string[];
  cons: string[];
  recommendations: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  previewUrl?: string;
}

export interface GenerationState {
  appIdea: string;
  isLoadingQuestions: boolean;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  selectedProfileId: 'token-saving' | 'architectural' | 'mvp-prototype' | 'comprehensive';
  generatedPrompt: string;
  isGeneratingPrompt: boolean;
  analysis: PromptAnalysis | null;
  attachments?: Attachment[];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  appIdea: string;
  optimizedPrompt: string;
  profileId: string;
  answers: Record<string, string>;
  attachments?: Attachment[];
}

// ─── AI Prompt Forge + Context Bridge types ──────────────────────────────────

export interface AIModel {
  id: string;
  name: string;
  shortName: string;
  provider: string;
  url: string;
  // Tailwind color classes
  textClass: string;
  bgClass: string;
  borderClass: string;
  activeBgClass: string;
  badgeText: string;
  freeInfo: string;
  strengths: string[];
  bestFor: string[];
  promptingStyle: string;
  promptingTips: string[];
  systemPromptSupport: boolean;
  contextWindow: string;
  iconEmoji: string;
  accentHex: string; // For glow/border effects inline
}

export interface ForgeHistoryItem {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  userRequest: string;
  forgedPrompt: string;
}
