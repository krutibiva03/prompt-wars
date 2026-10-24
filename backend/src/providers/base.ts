import { MissionDefinition, DefenseConfig } from '../types/index.js';

export interface ProviderGenerateParams {
  prompt: string;
  mission: MissionDefinition;
  activeDefenses: DefenseConfig;
  selectedDocSnippet?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ProviderResponse {
  content: string;
  latencyMs: number;
  tokensEstimated?: number;
}

export interface ProviderStatus {
  mode: 'simulation' | 'live';
  providerName: string;
  model: string;
  isAvailable: boolean;
  message?: string;
}

export interface AIProvider {
  name: string;
  isSimulation: boolean;
  generateResponse(params: ProviderGenerateParams): Promise<ProviderResponse>;
  getProviderStatus(): ProviderStatus;
  handleProviderError(error: unknown): string;
}
