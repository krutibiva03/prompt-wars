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
const allowedOrigins = [
  'https://prompt-wars-phi-six.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
    credentials: true,
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
const isTestOrVerification =
  process.env.NODE_ENV === 'test' ||
  Boolean(process.argv[1] && (process.argv[1].includes('verification') || process.argv[1].includes('test')));

if (!isTestOrVerification) {
  // Dynamically adapt to any port provided by Render ($PORT) or local config
  const rawPort = process.env.PORT || String(config.port) || '3001';
  const port = parseInt(rawPort, 10) || 3001;
  const host = '0.0.0.0';

  const server = app.listen(port, host, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  PROMPT WARS: Break the Bot. Protect the Secret.`);
    console.log(`🚀  Engine listening on: http://${host}:${port}`);
    console.log(`⚙️   Provider Mode: ${config.aiProvider}`);
    console.log(`📡  Connecting to MongoDB Database Cluster...`);
    console.log(`=======================================================`);

    connectDatabase().catch((err) => {
      console.error('[MongoDB] Connection error during boot:', err);
    });
  });

  server.on('error', (err: any) => {
    console.error(`[Server Listen Error on port ${port}]:`, err);
  });
}

export default app;
