export type Page = 'landing' | 'dashboard' | 'arena' | 'defense-lab' | 'results' | 'learn' | 'demo';

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
  protectedSecret?: string;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  evaluation?: EvaluationResult;
  isThreat?: boolean;
  isBlocked?: boolean;
  isLeak?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  points: number;
}

export interface PlayerStats {
  threatsIdentified: number;
  attacksBlocked: number;
  indirectInjectionsFound: number;
  perfectDefenses: number;
  totalSubmissions: number;
}

export interface PlayerProfile {
  userId: string;
  nickname: string;
  xp: number;
  level: number;
  completedMissions: number[];
  bestMissionScores: Record<number, number>;
  unlockedAchievements: string[];
  activeDefenses: DefenseConfig;
  stats: PlayerStats;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface DefenseTestRunResult {
  testId: string;
  name: string;
  category: string;
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

export interface ProviderStatus {
  mode: 'simulation' | 'live';
  providerName: string;
  model: string;
  latencyMs?: number;
  databaseConnected?: boolean;
  databaseName?: string;
}

export interface LastMissionResult {
  missionId: number;
  missionTitle: string;
  scoreAwarded: number;
  isSecretLeaked: boolean;
  isDefenseBlocked: boolean;
  attemptsCount: number;
  timeTakenSeconds: number;
  educationalTakeaway: string;
  detectedCategories: string[];
  evaluation: EvaluationResult;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  xp: number;
  level: number;
  completedMissionsCount: number;
  attacksBlocked: number;
  threatsIdentified: number;
  totalSubmissions: number;
  lastActive: string;
}

export interface GameHistoryItem {
  resultId: string;
  userId: string;
  nickname: string;
  missionId: number;
  missionTitle: string;
  scoreAwarded: number;
  attemptsCount: number;
  timeTakenSeconds: number;
  isSecretLeaked: boolean;
  isDefenseBlocked: boolean;
  threatLevel: string;
  detectedCategories: string[];
  educationalTakeaway: string;
  completedAt: string;
}
