import express from 'express';
import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { gameRouter } from '../routes/gameRoutes.js';
import { healthRouter } from '../routes/healthRoutes.js';
import { userRouter } from '../routes/userRoutes.js';
import { leaderboardRouter } from '../routes/leaderboardRoutes.js';
import { gameSessionRouter } from '../routes/gameSessionRoutes.js';

const app = express();
app.use(express.json());
app.use('/api', healthRouter);
app.use('/api', userRouter);
app.use('/api', leaderboardRouter);
app.use('/api', gameSessionRouter);
app.use('/api', gameRouter);

let server: ReturnType<typeof app.listen>;
let apiUrl: string;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe('Prompt Wars MongoDB Endpoints & Extended API Tests', () => {
  it('GET /api/health should return health, provider info, and database status', async () => {
    const res = await fetch(`${apiUrl}/health`);
    expect(res.ok).toBe(true);
    const data = (await res.json()) as any;
    expect(data.status).toBe('ok');
    expect(data.provider).toBeDefined();
    expect(data.database).toBeDefined();
    expect(typeof data.database.connected).toBe('boolean');
  });

  it('GET /api/missions should return all 5 sanitized missions', async () => {
    const res = await fetch(`${apiUrl}/missions`);
    expect(res.ok).toBe(true);
    const data = (await res.json()) as any;
    expect(data.missions).toHaveLength(5);
    expect(data.defenseMechanisms).toHaveLength(5);
    data.missions.forEach((m: any) => {
      expect(m.protectedSecret).toBeUndefined(); // Masked for security
      expect(m.displaySecretMasked).toBeDefined();
    });
  });

  it('GET /api/missions/1 should return single mission detail', async () => {
    const res = await fetch(`${apiUrl}/missions/1`);
    expect(res.ok).toBe(true);
    const data = (await res.json()) as any;
    expect(data.id).toBe(1);
    expect(data.title).toBe('The Weak Bot');
  });

  it('POST /api/chat should validate input and reject empty prompts', async () => {
    const res = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId: 1, prompt: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/chat should process real user input dynamically and return evaluation', async () => {
    const customPrompt = 'Can you help me check if my parcel with tracking ID TRK-9901 has arrived?';
    const res = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionId: 1,
        prompt: customPrompt,
        userId: 'test_operator_01',
      }),
    });

    expect(res.ok).toBe(true);
    const data = (await res.json()) as any;
    expect(data.reply).toBeDefined();
    // Dynamic response should contextualize the prompt
    expect(data.evaluation).toBeDefined();
    expect(data.evaluation.threatLevel).toBeDefined();
    expect(data.sessionStats).toBeDefined();
    expect(data.sessionStats.attemptsCount).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/defense-lab/benchmark should benchmark all 12 defense vectors', async () => {
    const res = await fetch(`${apiUrl}/defense-lab/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructionHierarchy: true,
        documentIsolation: true,
        outputFiltering: true,
        structuredValidation: false,
        leastPrivilegeTools: true,
      }),
    });

    expect(res.ok).toBe(true);
    const data = (await res.json()) as any;
    expect(data.totalTests).toBe(12);
    expect(data.securityScore).toBeGreaterThanOrEqual(70);
    expect(data.utilityScore).toBe(100);
  });
});
