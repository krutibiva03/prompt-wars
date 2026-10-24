import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { GameResultModel } from '../models/GameResult.js';
import { isDbConnected } from '../db.js';

export const leaderboardRouter = Router();

// GET /api/leaderboard - Real leaderboard rankings from MongoDB
leaderboardRouter.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  if (!isDbConnected()) {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'MongoDB connection is not established.',
    });
    return;
  }

  try {
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    // Fetch top users sorted by XP descending
    const topUsers = await UserModel.find(
      {},
      {
        userId: 1,
        nickname: 1,
        xp: 1,
        level: 1,
        completedMissions: 1,
        stats: 1,
        updatedAt: 1,
      }
    )
      .sort({ xp: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    const formattedLeaderboard = topUsers.map((u, idx) => ({
      rank: idx + 1,
      userId: u.userId,
      nickname: u.nickname || 'Guest Auditor',
      xp: u.xp || 0,
      level: u.level || 1,
      completedMissionsCount: u.completedMissions?.length || 0,
      attacksBlocked: u.stats?.attacksBlocked || 0,
      threatsIdentified: u.stats?.threatsIdentified || 0,
      totalSubmissions: u.stats?.totalSubmissions || 0,
      lastActive: u.updatedAt,
    }));

    // Aggregate overall game stats from MongoDB
    const totalUsersCount = await UserModel.countDocuments();
    const totalResultsCount = await GameResultModel.countDocuments();

    res.json({
      leaderboard: formattedLeaderboard,
      metadata: {
        totalPlayers: totalUsersCount,
        totalMissionsCompleted: totalResultsCount,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Leaderboard Route] Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard from database',
      message: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});
