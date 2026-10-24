export type MissionDifficulty = 'Easy' | 'Medium' | 'Medium-hard' | 'Hard' | 'Expert';

export interface DefenseConfig {
  instructionHierarchy: boolean;
  documentIsolation: boolean;
  outputFiltering: boolean;
  structuredValidation: boolean;
  leastPrivilegeTools: boolean;
}

export interface DefenseMechanismInfo {
  id: keyof DefenseConfig;
  name: string;
  tagline: string;
  description: string;
  mitigates: string[];
  tradeOff: string;
  recommended: boolean;
}

export interface MissionObjective {
  id: string;
  description: string;
  points: number;
  completed?: boolean;
}

export interface SampleDocument {
  id: string;
  title: string;
  filename: string;
  summary: string;
  content: string;
  containsInjection: boolean;
  injectionDetails?: string;
  previewSnippet: string;
}

export interface MissionDefinition {
  id: number;
  title: string;
  codename: string;
  difficulty: MissionDifficulty;
  story: string;
  protectedSecret: string;
  displaySecretMasked: string;
  baselineDefenses: DefenseConfig;
  allowedActions: string[];
  objectives: MissionObjective[];
  suggestedPrompts: string[];
  sampleDocuments?: SampleDocument[];
  educationalNotes: string[];
  exploitExplanation: string;
  defenseExplanation: string;
}

export interface EvaluationResult {
  isThreatDetected: boolean;
  threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL' | 'BLOCKED';
  detectedCategories: string[];
  isSecretLeaked: boolean;
  isBenign: boolean;
  isDefenseBlocked: boolean;
  blockReason?: string;
  heuristicsTriggered: string[];
  scoreAwarded: number;
  feedbackMessage: string;
  educationalTakeaway: string;
  secretMaskedOutput?: string;
}

export interface ChatInteractionRequest {
  missionId: number;
  prompt: string;
  selectedDocId?: string;
  activeDefenses?: Partial<DefenseConfig>;
  previousHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionToken?: string;
}

export interface ChatInteractionResponse {
  reply: string;
  evaluation: EvaluationResult;
  providerStatus: {
    mode: 'simulation' | 'live';
    providerName: string;
    model: string;
    latencyMs: number;
  };
  missionCompleted: boolean;
  sessionStats: {
    attemptsCount: number;
    scoreDelta: number;
    totalEarnedXP: number;
  };
}

export type DefenseTestCategory =
  | 'direct_override'
  | 'roleplay_conflict'
  | 'data_exfiltration'
  | 'obfuscation'
  | 'indirect_injection'
  | 'benign_request'
  | 'benign_with_sensitive_words'
  | 'output_evasion'
  | 'conflicting_untrusted_data'
  | 'broad_privilege'
  | 'invalid_structure'
  | 'duplicate_submission';

export interface DefenseTestCase {
  id: string;
  name: string;
  category: DefenseTestCategory;
  prompt: string;
  documentSnippet?: string;
  isAttack: boolean;
  targetDefense: keyof DefenseConfig;
  expectedOutcome: 'BLOCK' | 'ALLOW';
  explanation: string;
  mitigation: string;
}

export interface DefenseTestRunResult {
  testId: string;
  name: string;
  category: DefenseTestCategory;
  isAttack: boolean;
  expectedOutcome: 'BLOCK' | 'ALLOW';
  actualOutcome: 'BLOCK' | 'ALLOW';
  passed: boolean;
  blockedBy: string | null;
  explanation: string;
  mitigation: string;
}

export interface DefenseSuiteReport {
  totalTests: number;
  passed: number;
  failed: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  securityScore: number;
  utilityScore: number;
  overallScore: number;
  testResults: DefenseTestRunResult[];
  benchmarkComparison: {
    baselinePassed: number;
    playerPassed: number;
    improvementPercent: number;
  };
}

export interface PlayerProgress {
  nickname: string;
  xp: number;
  level: number;
  completedMissions: number[];
  missionScores: Record<number, number>;
  unlockedAchievements: string[];
  activeDefenses: DefenseConfig;
  historyLength: number;
  stats: {
    threatsIdentified: number;
    attacksBlocked: number;
    indirectInjectionsFound: number;
    perfectDefenses: number;
  };
}
