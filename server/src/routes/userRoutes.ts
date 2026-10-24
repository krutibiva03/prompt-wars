import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UserModel } from '../models/User.js';
import { isDbConnected } from '../db.js';

export const userRouter = Router();

// Validation schema for updating user profile
const updateProfileSchema = z.object({
  userId: z.string().min(1).max(128),
  nickname: z.string().min(1).max(50).optional(),
  soundEnabled: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
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

// GET /api/users/profile/:userId - Retrieve user profile from MongoDB
userRouter.get('/users/profile/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'Valid userId parameter is required' });
    return;
  }

  if (!isDbConnected()) {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'MongoDB connection is not currently established.',
    });
    return;
  }

  try {
    let user = await UserModel.findOne({ userId });

    if (!user) {
      // Auto-create initial profile in MongoDB
      user = await UserModel.create({
        userId,
        nickname: 'Guest Auditor',
        xp: 0,
        level: 1,
        completedMissions: [],
        bestMissionScores: {},
        unlockedAchievements: [],
        activeDefenses: {
          instructionHierarchy: false,
          documentIsolation: false,
          outputFiltering: false,
          structuredValidation: false,
          leastPrivilegeTools: false,
        },
        stats: {
          threatsIdentified: 0,
          attacksBlocked: 0,
          indirectInjectionsFound: 0,
          perfectDefenses: 0,
          totalSubmissions: 0,
        },
        soundEnabled: true,
        reducedMotion: false,
      });
    }

    res.json({
      userId: user.userId,
      nickname: user.nickname,
      xp: user.xp,
      level: user.level,
      completedMissions: user.completedMissions,
      bestMissionScores: user.bestMissionScores instanceof Map ? Object.fromEntries(user.bestMissionScores) : user.bestMissionScores,
      unlockedAchievements: user.unlockedAchievements,
      activeDefenses: user.activeDefenses,
      stats: user.stats,
      soundEnabled: user.soundEnabled,
      reducedMotion: user.reducedMotion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('[User Route] Error fetching profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile from database',
      message: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});

// POST /api/users/profile - Upsert user profile in MongoDB
userRouter.post('/users/profile', async (req: Request, res: Response): Promise<void> => {
  const parseResult = updateProfileSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid profile data',
      details: parseResult.error.errors,
    });
    return;
  }

  if (!isDbConnected()) {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'MongoDB connection is not currently established.',
    });
    return;
  }

  const { userId, nickname, soundEnabled, reducedMotion, activeDefenses } = parseResult.data;

  try {
    const updateData: Record<string, any> = {};
    if (nickname !== undefined) updateData.nickname = nickname.trim();
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled;
    if (reducedMotion !== undefined) updateData.reducedMotion = reducedMotion;
    if (activeDefenses !== undefined) {
      updateData.activeDefenses = activeDefenses;
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      profile: {
        userId: updatedUser.userId,
        nickname: updatedUser.nickname,
        xp: updatedUser.xp,
        level: updatedUser.level,
        completedMissions: updatedUser.completedMissions,
        bestMissionScores: updatedUser.bestMissionScores instanceof Map ? Object.fromEntries(updatedUser.bestMissionScores) : updatedUser.bestMissionScores,
        unlockedAchievements: updatedUser.unlockedAchievements,
        activeDefenses: updatedUser.activeDefenses,
        stats: updatedUser.stats,
        soundEnabled: updatedUser.soundEnabled,
        reducedMotion: updatedUser.reducedMotion,
      },
    });
  } catch (error) {
    console.error('[User Route] Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update user profile in database',
      message: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});
