import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongodbUri: process.env.MONGODB_URI || '',

  // Model Provider Settings
  aiProvider: process.env.AI_PROVIDER || 'simulation', // 'simulation' | 'openai' | 'local_llm'
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  
  // Rate Limiting and Input Constraints
  maxPromptLength: parseInt(process.env.MAX_PROMPT_LENGTH || '1000', 10),
  rateLimitWindowMs: 60 * 1000,
  rateLimitMaxRequests: 60,
  
  // Game Defaults
  simulationModeLabel: 'DETERMINISTIC DEFENSE SIMULATION v2.4 (OFFLINE SAFE)',
};
