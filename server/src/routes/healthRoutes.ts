import { Router } from 'express';
import { getAIProvider } from '../providers/factory.js';
import { config } from '../config.js';
import { isDbConnected } from '../db.js';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  const provider = getAIProvider();
  const providerStatus = provider.getProviderStatus();
  const dbConnected = isDbConnected();

  res.json({
    status: 'ok',
    game: 'Prompt Wars: Break the Bot. Protect the Secret.',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbConnected,
      status: dbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      name: mongoose.connection.name || 'promptwars',
    },
    provider: providerStatus,
    limits: {
      maxPromptLength: config.maxPromptLength,
    },
  });
});
