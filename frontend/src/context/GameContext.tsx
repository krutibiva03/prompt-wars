import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Page,
  PlayerProfile,
  MissionDefinition,
  DefenseMechanismInfo,
  DefenseConfig,
  Achievement,
  LastMissionResult,
  ProviderStatus,
  LeaderboardEntry,
  GameHistoryItem,
} from '../types';
import {
  loadPlayerProfile,
  savePlayerProfile,
  resetPlayerProfile as clearStorageProfile,
  calculateLevel,
  ACHIEVEMENTS_LIST,
  getOrInitUserId,
} from '../utils/storage';
import { sound } from '../utils/audio';
import { DEFAULT_MISSIONS, DEFAULT_DEFENSE_MECHANISMS } from '../utils/defaultMissions';
import {
  fetchMissions,
  checkServerHealth,
  resetDemoSession,
  fetchUserProfile,
  saveUserProfileApi,
  recordGameResult,
  fetchLeaderboard,
  fetchGameHistory,
} from '../services/api';
import confetti from 'canvas-confetti';

interface GameContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentMissionId: number;
  setCurrentMissionId: (id: number) => void;
  missions: MissionDefinition[];
  defenseMechanisms: DefenseMechanismInfo[];
  playerProfile: PlayerProfile;
  updateNickname: (name: string) => Promise<void>;
  addXP: (amount: number, reason?: string) => void;
  completeMission: (missionId: number, score: number, resultData: LastMissionResult) => Promise<void>;
  unlockAchievement: (achievementId: string) => void;
  updateDefenses: (defenses: DefenseConfig) => Promise<void>;
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  resetAllProgress: () => void;
  lastResult: LastMissionResult | null;
  activeAchievementAlert: Achievement | null;
  dismissAchievementAlert: () => void;
  providerStatus: ProviderStatus;
  refreshServerStatus: () => Promise<void>;
  startMission: (id: number) => void;
  leaderboard: LeaderboardEntry[];
  gameHistory: GameHistoryItem[];
  refreshLeaderboard: () => Promise<void>;
  refreshGameHistory: () => Promise<void>;
  isLoading: boolean;
  dbConnected: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [currentMissionId, setCurrentMissionId] = useState<number>(1);
  const [missions, setMissions] = useState<MissionDefinition[]>(DEFAULT_MISSIONS);
  const [defenseMechanisms, setDefenseMechanisms] = useState<DefenseMechanismInfo[]>(DEFAULT_DEFENSE_MECHANISMS);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadPlayerProfile);
  const [lastResult, setLastResult] = useState<LastMissionResult | null>(null);
  const [activeAchievementAlert, setActiveAchievementAlert] = useState<Achievement | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    mode: 'simulation',
    providerName: 'Deterministic Neural Engine',
    model: 'Simulated-CyberLLM-8B',
    databaseConnected: false,
  });

  const clearError = () => setErrorMessage(null);

  // Sync sound setting
  useEffect(() => {
    sound.enabled = playerProfile.soundEnabled;
  }, [playerProfile.soundEnabled]);

  // Sync reduced motion
  useEffect(() => {
    if (playerProfile.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [playerProfile.reducedMotion]);

  // Fetch Leaderboard from MongoDB
  const refreshLeaderboard = useCallback(async () => {
    try {
      const data = await fetchLeaderboard(10);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.warn('[Leaderboard] Notice:', err instanceof Error ? err.message : err);
    }
  }, []);

  // Fetch Game History from MongoDB
  const refreshGameHistory = useCallback(async () => {
    try {
      const userId = playerProfile.userId || getOrInitUserId();
      const data = await fetchGameHistory(userId, 10);
      setGameHistory(data.history || []);
    } catch (err) {
      console.warn('[GameHistory] Notice:', err instanceof Error ? err.message : err);
    }
  }, [playerProfile.userId]);

  // Check health and server status
  const refreshServerStatus = useCallback(async () => {
    const health = await checkServerHealth();
    setDbConnected(health.databaseConnected);
    setProviderStatus({
      mode: health.mode,
      providerName: health.online ? 'PromptWars Authoritative Server Engine' : 'Client Simulation Mode',
      model: health.model,
      databaseConnected: health.databaseConnected,
      databaseName: health.databaseName,
    });
  }, []);

  // Initialize application data on mount from MongoDB backend
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const userId = getOrInitUserId();

      try {
        // 1. Health check & DB status
        const health = await checkServerHealth();
        setDbConnected(health.databaseConnected);
        setProviderStatus({
          mode: health.mode,
          providerName: health.online ? 'PromptWars Authoritative Server Engine' : 'Client Simulation Mode',
          model: health.model,
          databaseConnected: health.databaseConnected,
          databaseName: health.databaseName,
        });

        // 2. Fetch missions from MongoDB
        try {
          const { missions: mList, defenseMechanisms: dList } = await fetchMissions();
          if (mList && mList.length > 0) setMissions(mList);
          if (dList && dList.length > 0) setDefenseMechanisms(dList);
        } catch (mErr) {
          console.warn('[Init] Missions fetch warning:', mErr);
        }

        // 3. Fetch or sync player profile from MongoDB
        if (health.databaseConnected) {
          try {
            const remoteProfile = await fetchUserProfile(userId);
            if (remoteProfile) {
              setPlayerProfile((prev) => {
                const merged = {
                  ...prev,
                  ...remoteProfile,
                  userId,
                  bestMissionScores: remoteProfile.bestMissionScores || prev.bestMissionScores || {},
                };
                savePlayerProfile(merged);
                return merged;
              });
            }
          } catch (pErr) {
            console.warn('[Init] User profile fetch warning:', pErr);
          }
        }

        // 4. Fetch initial leaderboard and game history
        if (health.databaseConnected) {
          const lbData = await fetchLeaderboard(10).catch(() => null);
          if (lbData?.leaderboard) setLeaderboard(lbData.leaderboard);

          const histData = await fetchGameHistory(userId, 10).catch(() => null);
          if (histData?.history) setGameHistory(histData.history);
        }
      } catch (err) {
        console.error('[Init] Error initializing application data:', err);
        setErrorMessage('Failed to connect to backend server. Running in offline mode.');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Save profile changes to localStorage as fast client cache
  useEffect(() => {
    savePlayerProfile(playerProfile);
  }, [playerProfile]);

  // Update Nickname with MongoDB persistence
  const updateNickname = async (name: string) => {
    const trimmed = name.trim() || 'Guest Auditor';
    setPlayerProfile((prev) => ({
      ...prev,
      nickname: trimmed,
    }));

    if (dbConnected) {
      try {
        await saveUserProfileApi({
          userId: playerProfile.userId,
          nickname: trimmed,
        });
        await refreshLeaderboard();
      } catch (err) {
        console.error('[Profile] Failed to sync nickname with MongoDB:', err);
      }
    }
  };

  // Unlock achievement
  const unlockAchievement = (achievementId: string) => {
    setPlayerProfile((prev) => {
      if (prev.unlockedAchievements.includes(achievementId)) return prev;
      const achievement = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
      if (!achievement) return prev;

      sound.playVictoryFanfare();
      setActiveAchievementAlert(achievement);

      if (!prev.reducedMotion) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#06B6D4', '#A855F7', '#10B981'],
        });
      }

      const updatedAchievements = [...prev.unlockedAchievements, achievementId];
      const newXp = prev.xp + achievement.points;
      const newProfile = {
        ...prev,
        xp: newXp,
        level: calculateLevel(newXp),
        unlockedAchievements: updatedAchievements,
      };

      return newProfile;
    });
  };

  const addXP = (amount: number) => {
    setPlayerProfile((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = calculateLevel(newXp);
      if (newLevel > prev.level) {
        sound.playVaultUnlock();
      }
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  // Complete Mission with MongoDB persistence
  const completeMission = async (
    missionId: number,
    score: number,
    resultData: LastMissionResult
  ) => {
    setLastResult(resultData);

    // Optimistically update local profile
    setPlayerProfile((prev) => {
      const completed = Array.from(new Set([...prev.completedMissions, missionId]));
      const bestScores = {
        ...prev.bestMissionScores,
        [missionId]: Math.max(prev.bestMissionScores[missionId] || 0, score),
      };

      return {
        ...prev,
        completedMissions: completed,
        bestMissionScores: bestScores,
        xp: prev.xp + score,
        level: calculateLevel(prev.xp + score),
      };
    });

    // Check achievement triggers
    unlockAchievement('first_blood');
    if (resultData.isDefenseBlocked) {
      unlockAchievement('secret_sentinel');
    }
    if (resultData.detectedCategories.includes('indirect_injection')) {
      unlockAchievement('injection_hunter');
    }
    if (missionId === 4 && resultData.scoreAwarded > 0) {
      unlockAchievement('blue_team_hero');
    }
    if (playerProfile.completedMissions.length >= 4) {
      unlockAchievement('final_boss_conqueror');
    }

    // Persist completed game result to MongoDB
    if (dbConnected) {
      try {
        const response = await recordGameResult({
          userId: playerProfile.userId,
          missionId,
          missionTitle: resultData.missionTitle,
          scoreAwarded: score,
          attemptsCount: resultData.attemptsCount,
          timeTakenSeconds: resultData.timeTakenSeconds,
          isSecretLeaked: resultData.isSecretLeaked,
          isDefenseBlocked: resultData.isDefenseBlocked,
          threatLevel: resultData.evaluation.threatLevel,
          detectedCategories: resultData.detectedCategories,
          educationalTakeaway: resultData.educationalTakeaway,
        });

        if (response.updatedProfile) {
          setPlayerProfile((prev) => ({
            ...prev,
            xp: response.updatedProfile.xp,
            level: response.updatedProfile.level,
            completedMissions: response.updatedProfile.completedMissions,
            bestMissionScores: response.updatedProfile.bestMissionScores,
            stats: response.updatedProfile.stats || prev.stats,
          }));
        }

        // Refresh real leaderboard and history from MongoDB
        await refreshLeaderboard();
        await refreshGameHistory();
      } catch (err) {
        console.error('[Mission] Failed to persist game result to MongoDB:', err);
      }
    }

    if (!playerProfile.reducedMotion) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#A855F7', '#F59E0B'],
      });
    }

    setCurrentPage('results');
  };

  // Update defenses with MongoDB persistence
  const updateDefenses = async (defenses: DefenseConfig) => {
    setPlayerProfile((prev) => ({
      ...prev,
      activeDefenses: defenses,
    }));

    if (dbConnected) {
      try {
        await saveUserProfileApi({
          userId: playerProfile.userId,
          activeDefenses: defenses,
        });
      } catch (err) {
        console.warn('[Defenses] Warning: Could not sync defenses to MongoDB:', err);
      }
    }
  };

  const toggleSound = () => {
    setPlayerProfile((prev) => {
      const next = !prev.soundEnabled;
      sound.enabled = next;
      if (next) sound.playClick();
      return { ...prev, soundEnabled: next };
    });
  };

  const toggleReducedMotion = () => {
    setPlayerProfile((prev) => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
    }));
  };

  const resetAllProgress = () => {
    clearStorageProfile();
    resetDemoSession();
    setPlayerProfile(loadPlayerProfile());
    setLastResult(null);
    setCurrentMissionId(1);
    setCurrentPage('landing');
  };

  const dismissAchievementAlert = () => {
    setActiveAchievementAlert(null);
  };

  const startMission = (id: number) => {
    sound.playClick();
    setCurrentMissionId(id);
    setCurrentPage('arena');
  };

  return (
    <GameContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentMissionId,
        setCurrentMissionId,
        missions,
        defenseMechanisms,
        playerProfile,
        updateNickname,
        addXP,
        completeMission,
        unlockAchievement,
        updateDefenses,
        toggleSound,
        toggleReducedMotion,
        resetAllProgress,
        lastResult,
        activeAchievementAlert,
        dismissAchievementAlert,
        providerStatus,
        refreshServerStatus,
        startMission,
        leaderboard,
        gameHistory,
        refreshLeaderboard,
        refreshGameHistory,
        isLoading,
        dbConnected,
        errorMessage,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
