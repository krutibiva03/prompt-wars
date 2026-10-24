import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { gameRouter } from './routes/gameRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { leaderboardRouter } from './routes/leaderboardRoutes.js';
import { gameSessionRouter } from './routes/gameSessionRoutes.js';
import { connectDatabase } from './db.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
  })
);

app.use(express.json({ limit: '512kb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (config.nodeEnv !== 'test') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API Routes
app.use('/api', healthRouter);
app.use('/api', userRouter);
app.use('/api', leaderboardRouter);
app.use('/api', gameSessionRouter);
app.use('/api', gameRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Prompt Wars Backend API',
    description: 'Educational AI Cybersecurity Game Engine & MongoDB Persistence Backend',
    version: '1.0.0',
    endpoints: [
      'GET  /api/health',
      'GET  /api/missions',
      'GET  /api/missions/:id',
      'POST /api/chat',
      'POST /api/defense-lab/benchmark',
      'GET  /api/users/profile/:userId',
      'POST /api/users/profile',
      'POST /api/game/session',
      'GET  /api/game/session/:sessionId',
      'POST /api/game/result',
      'GET  /api/game/history/:userId',
      'GET  /api/leaderboard',
      'POST /api/demo/reset',
    ],
  });
});

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error occurred',
    message: err instanceof Error ? err.message : 'Unknown exception',
  });
});

// Start Server & Connect MongoDB
const isDirectRun = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('index.ts') ||
   process.argv[1].endsWith('index.js') ||
   process.argv[1].includes('tsx')) &&
  !process.argv[1].includes('test') &&
  !process.argv[1].includes('verification')
);

if (process.env.NODE_ENV !== 'test' && isDirectRun) {
  (async () => {
    console.log(`=======================================================`);
    console.log(`🛡️  PROMPT WARS: Break the Bot. Protect the Secret.`);
    console.log(`📡  Connecting to MongoDB Database Cluster...`);
    await connectDatabase();
    
    app.listen(config.port, config.host, () => {
      console.log(`🚀  Engine listening on: http://${config.host}:${config.port}`);
      console.log(`⚙️   Provider Mode: ${config.aiProvider}`);
      console.log(`=======================================================`);
    });
  })();
}

export default app;
