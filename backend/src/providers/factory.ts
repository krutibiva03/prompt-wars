import { AIProvider } from './base.js';
import { DeterministicDemoProvider } from './demoProvider.js';
import { OpenAICompatibleProvider } from './realProvider.js';
import { config } from '../config.js';

let activeProviderInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  if (config.aiProvider === 'openai' && config.openaiApiKey) {
    try {
      activeProviderInstance = new OpenAICompatibleProvider();
      return activeProviderInstance;
    } catch (e) {
      console.warn('[AI Factory] Failed to initialize OpenAI provider, falling back to deterministic demo provider.', e);
      activeProviderInstance = new DeterministicDemoProvider();
      return activeProviderInstance;
    }
  }

  activeProviderInstance = new DeterministicDemoProvider();
  return activeProviderInstance;
}
