import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { GameSessionModel } from '../models/GameSession.js';
import { GameResultModel } from '../models/GameResult.js';
import { PromptSubmissionModel } from '../models/PromptSubmission.js';
import { UserModel } from '../models/User.js';
import { isDbConnected } from '../db.js';

export const gameSessionRouter = Router();

// Validation schema for creating a game session
const createSessionSchema = z.object({
  userId: z.string().min(1).max(128),
  missionId: z.number().int().min(1).max(10),
  activeDefenses: z
    .object({
      instructionHierarchy: z.boolean().optional(),
      documentIsolation: z.boolean().optional(),
      outputFiltering: z.boolean().optional(),
      structuredValidation: z.boolean().optional(),
      leastPrivilegeTools: z.boolean().optional(),
    })
    .optional(),
});

// Validation schema for recording mission completion
const recordResultSchema = z.object({
  userId: z.string().min(1).max(128),
  missionId: z.number().int().min(1).max(10),
  missionTitle: z.string().min(1).max(100),
  scoreAwarded: z.number().int().min(0),
  attemptsCount: z.number().int().min(1),
  timeTakenSeconds: z.number().int().min(0),
  isSecretLeaked: z.boolean(),
  isDefenseBlocked: z.boolean(),
  threatLevel: z.string(),
  detectedCategories: z.array(z.string()),
  educationalTakeaway: z.string(),
  sessionId: z.string().optional(),
});

// Helper to calculate level from XP
function calculateLevel(xp: number): number {
  if (xp < 150) return 1;
  if (xp < 350) return 2;
  if (xp < 650) return 3;
  if (xp < 1050) return 4;
  return 5;
}

// POST /api/game/session - Start or resume a game session
gameSessionRouter.post('/game/session', async (req: Request, res: Response): Promise<void> => {
  const parseResult = createSessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid session creation data', details: parseResult.error.errors });
    return;
  }

  if (!isDbConnected()) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }

  const { userId, missionId, activeDefenses } = parseResult.data;
  const sessionId = randomUUID();

  try {
    const session = await GameSessionModel.create({
      sessionId,
      userId,
      missionId,
      status: 'active',
      attemptsCount: 0,
      totalEarnedXP: 0,
      isSecretLeaked: false,
      isDefenseBlocked: false,
      activeDefenses: activeDefenses || {
        instructionHierarchy: false,
        documentIsolation: false,
        outputFiltering: false,
        structuredValidation: false,
        leastPrivilegeTools: false,
      },
    });

    res.json({
      sessionId: session.sessionId,
      userId: session.userId,
      missionId: session.missionId,
      status: session.status,
      attemptsCount: session.attemptsCount,
      totalEarnedXP: session.totalEarnedXP,
      startedAt: session.startedAt,
    });
  } catch (error) {
    console.error('[Session Route] Error creating session:', error);
    res.status(500).json({ error: 'Failed to create game session in database' });
  }
});

// GET /api/game/session/:sessionId - Retrieve game session state
gameSessionRouter.get('/game/session/:sessionId', async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required' });
    return;
  }

  if (!isDbConnected()) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }

  try {
    const session = await GameSessionModel.findOne({ sessionId });
    if (!session) {
      res.status(404).json({ error: 'Game session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('[Session Route] Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch game session from database' });
  }
});

// POST /api/game/result - Save completed mission result and update user progress in MongoDB
gameSessionRouter.post('/game/result', async (req: Request, res: Response): Promise<void> => {
  const parseResult = recordResultSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid game result payload', details: parseResult.error.errors });
    return;
  }

  if (!isDbConnected()) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }

  const {
    userId,
    missionId,
    missionTitle,
    scoreAwarded,
    attemptsCount,
    timeTakenSeconds,
    isSecretLeaked,
    isDefenseBlocked,
    threatLevel,
    detectedCategories,
    educationalTakeaway,
    sessionId,
  } = parseResult.data;

  try {
    const resultId = randomUUID();

    // 1. Get or create user profile
    let user = await UserModel.findOne({ userId });
    const nickname = user?.nickname || 'Guest Auditor';

    // 2. Save GameResult document in MongoDB
    const gameResult = await GameResultModel.create({
      resultId,
      userId,
      nickname,
      missionId,
      missionTitle,
      scoreAwarded,
      attemptsCount,
      timeTakenSeconds,
      isSecretLeaked,
      isDefenseBlocked,
      threatLevel,
      detectedCategories,
      educationalTakeaway,
      completedAt: new Date(),
    });

    // 3. Update session if sessionId provided
    if (sessionId) {
      await GameSessionModel.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            totalEarnedXP: scoreAwarded,
            isSecretLeaked,
            isDefenseBlocked,
          },
        }
      );
    }

    // 4. Update user progress, best mission scores, XP, level, and stats in MongoDB
    if (!user) {
      user = new UserModel({
        userId,
        nickname,
        xp: 0,
        level: 1,
        completedMissions: [],
        bestMissionScores: {},
        unlockedAchievements: [],
        stats: {
          threatsIdentified: 0,
          attacksBlocked: 0,
          indirectInjectionsFound: 0,
          perfectDefenses: 0,
          totalSubmissions: 0,
        },
      });
    }

    // Add completed mission if not already included
    if (!user.completedMissions.includes(missionId)) {
      user.completedMissions.push(missionId);
    }

    // Update best score for this mission
    const currentBestScores = user.bestMissionScores instanceof Map ? Object.fromEntries(user.bestMissionScores) : (user.bestMissionScores || {});
    const previousBest = currentBestScores[missionId] || 0;
    if (scoreAwarded > previousBest) {
      currentBestScores[missionId] = scoreAwarded;
      user.bestMissionScores = currentBestScores;
    }

    // Add XP
    user.xp = (user.xp || 0) + scoreAwarded;
    user.level = calculateLevel(user.xp);

    // Update stats
    if (isDefenseBlocked) {
      user.stats.attacksBlocked = (user.stats.attacksBlocked || 0) + 1;
    }
    if (detectedCategories.includes('indirect_injection')) {
      user.stats.indirectInjectionsFound = (user.stats.indirectInjectionsFound || 0) + 1;
    }

    // Update achievements
    if (!user.unlockedAchievements.includes('first_blood')) {
      user.unlockedAchievements.push('first_blood');
    }
    if (isDefenseBlocked && !user.unlockedAchievements.includes('secret_sentinel')) {
      user.unlockedAchievements.push('secret_sentinel');
    }
    if (detectedCategories.includes('indirect_injection') && !user.unlockedAchievements.includes('injection_hunter')) {
      user.unlockedAchievements.push('injection_hunter');
    }
    if (missionId === 4 && scoreAwarded > 0 && !user.unlockedAchievements.includes('blue_team_hero')) {
      user.unlockedAchievements.push('blue_team_hero');
    }
    if (user.completedMissions.length >= 5 && !user.unlockedAchievements.includes('final_boss_conqueror')) {
      user.unlockedAchievements.push('final_boss_conqueror');
    }

    await user.save();

    res.json({
      success: true,
      result: gameResult,
      updatedProfile: {
        userId: user.userId,
        nickname: user.nickname,
        xp: user.xp,
        level: user.level,
        completedMissions: user.completedMissions,
        bestMissionScores: user.bestMissionScores instanceof Map ? Object.fromEntries(user.bestMissionScores) : user.bestMissionScores,
        unlockedAchievements: user.unlockedAchievements,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('[Session Route] Error recording game result:', error);
    res.status(500).json({ error: 'Failed to record game result in database' });
  }
});

// GET /api/game/history/:userId - Fetch player's recent game history & submissions from MongoDB
gameSessionRouter.get('/game/history/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  if (!isDbConnected()) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }

  try {
    const limit = Math.min(25, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    const results = await GameResultModel.find({ userId })
      .sort({ completedAt: -1 })
      .limit(limit)
      .lean();

    const recentSubmissions = await PromptSubmissionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      userId,
      history: results,
      recentSubmissions,
    });
  } catch (error) {
    console.error('[Session Route] Error fetching game history:', error);
    res.status(500).json({ error: 'Failed to fetch game history from database' });
  }
});
