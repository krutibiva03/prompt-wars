import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { MISSIONS, DEFENSE_MECHANISMS } from '../engine/missions.js';
import { evaluateInteraction } from '../engine/evaluator.js';
import { runDefenseTestSuite } from '../engine/defenseTestSuite.js';
import { getAIProvider } from '../providers/factory.js';
import { config } from '../config.js';
import { DefenseConfig, MissionDefinition } from '../types/index.js';
import { MissionModel } from '../models/Mission.js';
import { PromptSubmissionModel } from '../models/PromptSubmission.js';
import { GameSessionModel } from '../models/GameSession.js';
import { UserModel } from '../models/User.js';
import { isDbConnected } from '../db.js';

export const gameRouter = Router();

// In-memory fallback cache in case MongoDB is initializing or unavailable
const inMemorySessions = new Map<string, { attempts: number; lastPrompt: string; earnedXP: number }>();

// Helper to get mission list from MongoDB with in-memory fallback
async function getMissionsFromDb(): Promise<MissionDefinition[]> {
  if (isDbConnected()) {
    try {
      const dbMissions = await MissionModel.find().lean();
      if (dbMissions && dbMissions.length > 0) {
        return dbMissions.map((m) => ({
          id: m.id,
          title: m.title,
          codename: m.codename,
          difficulty: m.difficulty as any,
          story: m.story,
          protectedSecret: m.protectedSecret,
          displaySecretMasked: m.displaySecretMasked,
          baselineDefenses: m.baselineDefenses,
          allowedActions: m.allowedActions,
          objectives: m.objectives,
          suggestedPrompts: m.suggestedPrompts,
          sampleDocuments: m.sampleDocuments as any,
          educationalNotes: m.educationalNotes,
          exploitExplanation: m.exploitExplanation,
          defenseExplanation: m.defenseExplanation,
        }));
      }
    } catch (err) {
      console.warn('[Missions Route] Failed to fetch missions from MongoDB, falling back to static config:', err);
    }
  }
  return MISSIONS;
}

// Validation schema for chat interactions
const chatRequestSchema = z.object({
  missionId: z.number().int().min(1).max(10),
  prompt: z.string().min(1, 'Prompt cannot be empty').max(config.maxPromptLength),
  selectedDocId: z.string().optional(),
  activeDefenses: z
    .object({
      instructionHierarchy: z.boolean().optional(),
      documentIsolation: z.boolean().optional(),
      outputFiltering: z.boolean().optional(),
      structuredValidation: z.boolean().optional(),
      leastPrivilegeTools: z.boolean().optional(),
    })
    .optional(),
  previousHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
  sessionToken: z.string().min(1).max(128).optional(),
  userId: z.string().min(1).max(128).optional(),
});

// GET /api/missions - List all missions (secrets masked)
gameRouter.get('/missions', async (req: Request, res: Response): Promise<void> => {
  try {
    const allMissions = await getMissionsFromDb();

    const sanitizedMissions = allMissions.map((m) => ({
      id: m.id,
      title: m.title,
      codename: m.codename,
      difficulty: m.difficulty,
      story: m.story,
      displaySecretMasked: m.displaySecretMasked,
      baselineDefenses: m.baselineDefenses,
      allowedActions: m.allowedActions,
      objectives: m.objectives,
      suggestedPrompts: m.suggestedPrompts,
      sampleDocuments: m.sampleDocuments?.map((d) => ({
        id: d.id,
        title: d.title,
        filename: d.filename,
        summary: d.summary,
        previewSnippet: d.previewSnippet,
        containsInjection: d.containsInjection,
      })),
      educationalNotes: m.educationalNotes,
      exploitExplanation: m.exploitExplanation,
      defenseExplanation: m.defenseExplanation,
    }));

    res.json({
      missions: sanitizedMissions,
      defenseMechanisms: DEFENSE_MECHANISMS,
    });
  } catch (error) {
    console.error('[Missions Route] Error listing missions:', error);
    res.status(500).json({ error: 'Failed to retrieve missions' });
  }
});

// GET /api/missions/:id - Details of a single mission
gameRouter.get('/missions/:id', async (req: Request, res: Response): Promise<void> => {
  const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const missionId = parseInt(paramId || '1', 10);

  try {
    const allMissions = await getMissionsFromDb();
    const mission = allMissions.find((m) => m.id === missionId);

    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    res.json({
      id: mission.id,
      title: mission.title,
      codename: mission.codename,
      difficulty: mission.difficulty,
      story: mission.story,
      displaySecretMasked: mission.displaySecretMasked,
      baselineDefenses: mission.baselineDefenses,
      allowedActions: mission.allowedActions,
      objectives: mission.objectives,
      suggestedPrompts: mission.suggestedPrompts,
      sampleDocuments: mission.sampleDocuments,
      educationalNotes: mission.educationalNotes,
      exploitExplanation: mission.exploitExplanation,
      defenseExplanation: mission.defenseExplanation,
    });
  } catch (error) {
    console.error('[Missions Route] Error retrieving mission by id:', error);
    res.status(500).json({ error: 'Failed to retrieve mission' });
  }
});

// POST /api/chat - Interactive prompt evaluation & AI response with MongoDB persistence
gameRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const parseResult = chatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid request data',
      details: parseResult.error.errors,
    });
    return;
  }

  const {
    missionId,
    prompt,
    selectedDocId,
    activeDefenses: overrideDefenses,
    previousHistory,
    sessionToken,
    userId = 'guest_auditor',
  } = parseResult.data;

  // Retrieve mission details
  const allMissions = await getMissionsFromDb();
  const mission = allMissions.find((m) => m.id === missionId);

  if (!mission) {
    res.status(404).json({ error: 'Mission not found' });
    return;
  }

  const effectiveSessionToken = sessionToken || randomUUID();
  let isDuplicate = false;
  let attemptsCount = 1;
  let totalEarnedXP = 0;

  // Track session via MongoDB if connected, else fallback to in-memory
  if (isDbConnected()) {
    try {
      let dbSession = await GameSessionModel.findOne({ sessionId: effectiveSessionToken });
      if (!dbSession) {
        dbSession = await GameSessionModel.create({
          sessionId: effectiveSessionToken,
          userId,
          missionId,
          status: 'active',
          attemptsCount: 1,
          totalEarnedXP: 0,
          isSecretLeaked: false,
          isDefenseBlocked: false,
          lastPrompt: prompt,
        });
        attemptsCount = 1;
      } else {
        isDuplicate = dbSession.lastPrompt.trim().toLowerCase() === prompt.trim().toLowerCase();
        dbSession.attemptsCount += 1;
        dbSession.lastPrompt = prompt;
        await dbSession.save();
        attemptsCount = dbSession.attemptsCount;
        totalEarnedXP = dbSession.totalEarnedXP;
      }
    } catch (err) {
      console.warn('[Chat Route] Could not update session in MongoDB:', err);
    }
  } else {
    const memKey = `${effectiveSessionToken}:m${missionId}`;
    const memSession = inMemorySessions.get(memKey) || { attempts: 0, lastPrompt: '', earnedXP: 0 };
    memSession.attempts++;
    isDuplicate = memSession.lastPrompt.trim().toLowerCase() === prompt.trim().toLowerCase();
    memSession.lastPrompt = prompt;
    inMemorySessions.set(memKey, memSession);
    attemptsCount = memSession.attempts;
    totalEarnedXP = memSession.earnedXP;
  }

  // Merge active defenses with mission baseline
  const activeDefenses: DefenseConfig = {
    ...mission.baselineDefenses,
    ...(overrideDefenses || {}),
  };

  // Find document if selected
  const selectedDoc = mission.sampleDocuments?.find((d) => d.id === selectedDocId);

  // Generate response from AI Provider
  const provider = getAIProvider();
  let aiResponseContent = '';
  let latencyMs = 0;

  try {
    const aiResult = await provider.generateResponse({
      prompt,
      mission,
      activeDefenses,
      selectedDocSnippet: selectedDoc?.content,
      history: previousHistory,
    });
    aiResponseContent = aiResult.content;
    latencyMs = aiResult.latencyMs;
  } catch (error) {
    console.error('[Chat Route] AI Provider error:', error);
    aiResponseContent = `[SYSTEM ERROR] Failed to query neural provider. Fallback: ${provider.handleProviderError(error)}`;
  }

  // Authoritative server-side security evaluation
  const evaluation = evaluateInteraction({
    mission,
    prompt,
    generatedOutput: aiResponseContent,
    activeDefenses,
    selectedDocSnippet: selectedDoc?.content,
    isDuplicate,
  });

  // Calculate mission completion condition
  let missionCompleted = false;
  if (mission.id === 1 && evaluation.isSecretLeaked) {
    missionCompleted = true;
  } else if (mission.id === 2 && evaluation.isSecretLeaked) {
    missionCompleted = true;
  } else if (mission.id === 3 && (evaluation.isSecretLeaked || evaluation.isDefenseBlocked)) {
    missionCompleted = true;
  } else if (mission.id === 4 && evaluation.scoreAwarded > 0) {
    missionCompleted = true;
  } else if (mission.id === 5 && (evaluation.isDefenseBlocked || evaluation.isBenign)) {
    missionCompleted = true;
  }

  totalEarnedXP += evaluation.scoreAwarded;
  if (!isDbConnected()) {
    const memKey = `${effectiveSessionToken}:m${missionId}`;
    const memSession = inMemorySessions.get(memKey);
    if (memSession) {
      memSession.earnedXP = totalEarnedXP;
    }
  }

  const providerStatus = provider.getProviderStatus();
  const submissionId = randomUUID();

  // Persist prompt submission and update session/user in MongoDB
  if (isDbConnected()) {
    try {
      // 1. Save submission record
      await PromptSubmissionModel.create({
        submissionId,
        sessionId: effectiveSessionToken,
        userId,
        missionId,
        prompt,
        selectedDocId,
        generatedResponse: aiResponseContent,
        latencyMs,
        providerMode: providerStatus.mode,
        evaluation: {
          isThreatDetected: evaluation.isThreatDetected,
          threatLevel: evaluation.threatLevel,
          detectedCategories: evaluation.detectedCategories,
          isSecretLeaked: evaluation.isSecretLeaked,
          isBenign: evaluation.isBenign,
          isDefenseBlocked: evaluation.isDefenseBlocked,
          blockReason: evaluation.blockReason,
          heuristicsTriggered: evaluation.heuristicsTriggered,
          scoreAwarded: evaluation.scoreAwarded,
          feedbackMessage: evaluation.feedbackMessage,
          educationalTakeaway: evaluation.educationalTakeaway,
        },
      });

      // 2. Update session
      await GameSessionModel.findOneAndUpdate(
        { sessionId: effectiveSessionToken },
        {
          $set: {
            isSecretLeaked: evaluation.isSecretLeaked,
            isDefenseBlocked: evaluation.isDefenseBlocked,
          },
          $inc: { totalEarnedXP: evaluation.scoreAwarded },
        }
      );

      // 3. Update user live telemetry stats
      const userUpdate: Record<string, any> = {
        $inc: { 'stats.totalSubmissions': 1 },
      };
      if (evaluation.isThreatDetected) {
        userUpdate.$inc['stats.threatsIdentified'] = 1;
      }
      if (evaluation.isDefenseBlocked) {
        userUpdate.$inc['stats.attacksBlocked'] = 1;
      }
      await UserModel.findOneAndUpdate({ userId }, userUpdate, { upsert: false });
    } catch (dbErr) {
      console.error('[Chat Route] Error saving prompt submission to MongoDB:', dbErr);
    }
  }

  res.json({
    reply: evaluation.secretMaskedOutput || aiResponseContent,
    evaluation,
    providerStatus: {
      mode: providerStatus.mode,
      providerName: providerStatus.providerName,
      model: providerStatus.model,
      latencyMs,
    },
    missionCompleted,
    sessionStats: {
      attemptsCount,
      scoreDelta: evaluation.scoreAwarded,
      totalEarnedXP,
    },
  });
});

// POST /api/defense-lab/benchmark - Run the 12-test suite
gameRouter.post('/defense-lab/benchmark', async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    instructionHierarchy: z.boolean(),
    documentIsolation: z.boolean(),
    outputFiltering: z.boolean(),
    structuredValidation: z.boolean(),
    leastPrivilegeTools: z.boolean(),
    userId: z.string().optional(),
  });

  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid defense configuration format' });
    return;
  }

  const { userId, ...defenseConfig } = parseResult.data;
  const report = runDefenseTestSuite(defenseConfig);

  // If userId provided and MongoDB connected, record stats
  if (userId && isDbConnected()) {
    try {
      const statsUpdate: Record<string, any> = {
        $inc: { 'stats.attacksBlocked': report.truePositives },
      };
      if (report.securityScore === 100 && report.falseNegatives === 0) {
        statsUpdate.$inc['stats.perfectDefenses'] = 1;
      }
      await UserModel.findOneAndUpdate({ userId }, statsUpdate);
    } catch (err) {
      console.warn('[Benchmark Route] Failed to update user stats in MongoDB:', err);
    }
  }

  res.json(report);
});

// POST /api/demo/reset - Reset demo session state
gameRouter.post('/demo/reset', async (req: Request, res: Response): Promise<void> => {
  inMemorySessions.clear();
  if (isDbConnected()) {
    try {
      // Clean up demo/guest sessions
      await GameSessionModel.deleteMany({ userId: 'guest_demo' });
    } catch (err) {
      // ignore
    }
  }
  res.json({ status: 'reset_success', message: 'Demo and temporary session states reset successfully.' });
});
