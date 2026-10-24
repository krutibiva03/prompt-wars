import React, { useState } from 'react';
import {
  User,
  Zap,
  Award,
  RotateCcw,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  Shield,
  Edit2,
  Check,
  Trophy,
  History,
  Clock,
  Database,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRankTitle, ACHIEVEMENTS_LIST } from '../utils/storage';
import { ResetConfirmModal } from '../components/ResetConfirmModal';
import { sound } from '../utils/audio';

export const DashboardPage: React.FC = () => {
  const {
    playerProfile,
    updateNickname,
    missions,
    startMission,
    resetAllProgress,
    leaderboard,
    gameHistory,
    refreshLeaderboard,
    refreshGameHistory,
    isLoading,
    dbConnected,
    errorMessage,
  } = useGame();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerProfile.nickname);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSaveName = async () => {
    await updateNickname(nameInput);
    setIsEditingName(false);
    sound.playClick();
  };

  const handleManualRefresh = async () => {
    sound.playClick();
    setIsRefreshing(true);
    await Promise.all([refreshLeaderboard(), refreshGameHistory()]);
    setIsRefreshing(false);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'Medium':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      case 'Medium-hard':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'Hard':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'Expert':
        return 'text-red-400 bg-red-950/60 border-red-800';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  // Find next uncompleted mission to resume
  const nextMissionId = missions.find((m) => !playerProfile.completedMissions.includes(m.id))?.id || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Error alert banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs font-mono flex items-center justify-between">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 border border-cyber-border relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Avatar and Nickname */}
          <div className="md:col-span-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-purple-600 p-0.5 shadow-neon-cyan flex-shrink-0">
              <div className="w-full h-full bg-cyber-bg rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-2 py-1 text-sm bg-slate-900 border border-cyan-500 rounded text-white font-mono focus:outline-none"
                      maxLength={25}
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-black transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {playerProfile.nickname}
                    </h2>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsEditingName(true);
                      }}
                      className="text-slate-400 hover:text-cyan-400 p-1"
                      title="Edit player callsign (persisted in MongoDB)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800">
                  {getRankTitle(playerProfile.level)}
                </span>
                <span className="text-xs font-mono text-slate-400">Level {playerProfile.level}</span>
                <span className="text-[10px] font-mono text-slate-500">ID: {playerProfile.userId.slice(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Quick Stats and Action Buttons */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-3">
            <div className="cyber-glass px-4 py-2 rounded-xl border border-cyber-border text-center">
              <div className="text-[10px] font-mono text-slate-400">TOTAL SCORE</div>
              <div className="text-lg font-bold font-mono text-cyan-400 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{playerProfile.xp} XP</span>
              </div>
            </div>

            <div className="cyber-glass px-4 py-2 rounded-xl border border-cyber-border text-center">
              <div className="text-[10px] font-mono text-slate-400">ATTACKS BLOCKED</div>
              <div className="text-lg font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{playerProfile.stats?.attacksBlocked || 0}</span>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-3 rounded-xl cyber-glass border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh MongoDB Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => startMission(nextMissionId)}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-black shadow-neon-cyan flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>RESUME GAME</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowResetModal(true);
              }}
              className="p-3 rounded-xl cyber-glass border border-red-500/30 text-red-400 hover:bg-red-950/40 transition-colors"
              title="Reset All Progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-6 pt-6 border-t border-cyber-border/70">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>EXPERIENCE PROGRESSION</span>
            <span>{playerProfile.xp} / {playerProfile.level >= 5 ? 'MAX LEVEL' : `${playerProfile.level * 250} XP`}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (playerProfile.xp / (playerProfile.level * 250)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Available Missions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>OPERATIONAL MISSIONS</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {playerProfile.completedMissions.length} of {missions.length || 5} COMPLETED
          </span>
        </div>

        {isLoading && missions.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-cyan-400 font-mono text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading missions from MongoDB...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {missions.map((mission) => {
              const isCompleted = playerProfile.completedMissions.includes(mission.id);
              const bestScore = playerProfile.bestMissionScores[mission.id] || 0;

              return (
                <div
                  key={mission.id}
                  className={`cyber-glass rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'border-emerald-500/40 hover:border-emerald-400/70'
                      : 'border-cyber-border hover:border-cyan-500/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        LEVEL 0{mission.id}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getDifficultyBadge(
                          mission.difficulty
                        )}`}
                      >
                        {mission.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-mono mb-1">{mission.title}</h4>
                    <div className="text-xs font-mono text-purple-400 mb-3">{mission.codename}</div>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                      {mission.story}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-cyber-border/70 flex items-center justify-between">
                    <div>
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Best: {bestScore} XP</span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">Uncompleted</span>
                      )}
                    </div>

                    <button
                      onClick={() => startMission(mission.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyber-panel border border-cyan-500/50 hover:bg-cyan-950/60 text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      <span>{isCompleted ? 'REPLAY' : 'ENTER'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real MongoDB Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white font-mono">GLOBAL OPERATOR LEADERBOARD</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              REAL MONGODB DATA
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {leaderboard.length} AUDITORS RANKED
          </span>
        </div>

        <div className="cyber-glass rounded-2xl border border-cyber-border overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-mono text-xs space-y-2">
              <Database className="w-6 h-6 text-slate-600 mx-auto" />
              <p>No external ranking entries yet.</p>
              <p className="text-slate-500">Complete missions in the Arena to register your callsign on MongoDB!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyber-border/70 bg-slate-900/60 text-[11px] font-mono text-slate-400">
                    <th className="py-3 px-4">RANK</th>
                    <th className="py-3 px-4">OPERATOR CALLSIGN</th>
                    <th className="py-3 px-4">LEVEL</th>
                    <th className="py-3 px-4 text-center">MISSIONS CLEARED</th>
                    <th className="py-3 px-4 text-center">ATTACKS BLOCKED</th>
                    <th className="py-3 px-4 text-right">TOTAL XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/40 text-xs font-mono">
                  {leaderboard.map((entry) => {
                    const isCurrentPlayer = entry.userId === playerProfile.userId;
                    return (
                      <tr
                        key={entry.userId}
                        className={`hover:bg-cyan-950/20 transition-colors ${
                          isCurrentPlayer ? 'bg-cyan-950/40 text-cyan-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center gap-1.5">
                          {entry.rank === 1 ? (
                            <span className="text-amber-400">🥇 #1</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-slate-300">🥈 #2</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-amber-600">🥉 #3</span>
                          ) : (
                            <span className="text-slate-500">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span>{entry.nickname}</span>
                            {isCurrentPlayer && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-purple-400 font-semibold">Lv.{entry.level}</td>
                        <td className="py-3 px-4 text-center">{entry.completedMissionsCount} / 5</td>
                        <td className="py-3 px-4 text-center text-emerald-400">{entry.attacksBlocked}</td>
                        <td className="py-3 px-4 text-right text-cyan-400 font-bold">{entry.xp} XP</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Real MongoDB Game History Section */}
      {gameHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>PERSISTED BATTLE LOGS</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">LAST {gameHistory.length} DEBRIEFS</span>
          </div>

          <div className="space-y-2.5">
            {gameHistory.map((item) => (
              <div
                key={item.resultId}
                className="cyber-glass rounded-xl p-4 border border-cyber-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Level 0{item.missionId}: {item.missionTitle}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        item.isSecretLeaked
                          ? 'bg-red-950/60 border-red-800 text-red-300'
                          : item.isDefenseBlocked
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                      }`}
                    >
                      {item.isSecretLeaked ? 'EXPLOITED' : item.isDefenseBlocked ? 'BLOCKED' : item.threatLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Attempts: {item.attemptsCount}</span>
                    <span>•</span>
                    <span>Duration: {item.timeTakenSeconds}s</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.completedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-cyan-400 font-bold text-sm">+{item.scoreAwarded} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span>HONOR BADGES & ACHIEVEMENTS</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {playerProfile.unlockedAchievements.length} of {ACHIEVEMENTS_LIST.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = playerProfile.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'cyber-glass-glow border-purple-500/40'
                    : 'bg-cyber-card/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`text-2xl p-2.5 rounded-xl border flex-shrink-0 ${
                    isUnlocked
                      ? 'bg-purple-950/80 border-purple-700'
                      : 'bg-slate-900 border-slate-800 grayscale'
                  }`}
                >
                  {isUnlocked ? ach.icon : '🔒'}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-bold text-white truncate">{ach.title}</h5>
                    <span className="text-[11px] font-mono text-purple-400">+{ach.points} XP</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={resetAllProgress}
      />
    </div>
  );
};
