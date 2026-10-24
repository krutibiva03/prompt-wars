import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Copy,
  Check,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

export const ResultsPage: React.FC = () => {
  const { lastResult, setCurrentPage, startMission, currentMissionId } = useGame();
  const [copied, setCopied] = useState(false);

  if (!lastResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-mono">No Recent Mission Session</h2>
        <p className="text-sm text-slate-400">
          Enter an operational mission in the arena to generate an assessment debrief.
        </p>
        <button
          onClick={() => {
            sound.playClick();
            startMission(1);
          }}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold font-mono text-sm"
        >
          START LEVEL 1
        </button>
      </div>
    );
  }

  const isSuccess = lastResult.scoreAwarded > 0;
  const isExploit = lastResult.isSecretLeaked;
  const isDefended = lastResult.isDefenseBlocked;

  const handleCopySummary = async () => {
    sound.playClick();
    const summaryText = `🛡️ [PROMPT WARS BATTLE REPORT]
Mission: Level 0${lastResult.missionId} — ${lastResult.missionTitle}
Result: ${isExploit ? 'EXPLOIT CONFIRMED' : isDefended ? 'DEFENSE SECURED' : 'EVALUATION COMPLETE'}
Score Earned: +${lastResult.scoreAwarded} XP
Attempts: ${lastResult.attemptsCount}
Time: ${lastResult.timeTakenSeconds}s
Status: ${lastResult.evaluation.threatLevel}
Takeaway: ${lastResult.educationalTakeaway}
Play Prompt Wars: Educational AI Cybersecurity Game`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard fallback
    }
  };

  const nextId = Math.min(5, currentMissionId + 1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Victory / Debrief Card */}
      <div className="cyber-glass-glow rounded-3xl p-8 border border-cyan-500/40 shadow-neon-cyan space-y-6 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>MISSION DEBRIEF RECORD</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            {isExploit
              ? 'VULNERABILITY CONFIRMED'
              : isDefended
              ? 'PERIMETER DEFENSE HELD'
              : 'SECURITY ASSESSMENT COMPLETE'}
          </h1>
          <p className="text-sm text-cyan-300 font-mono">
            Level 0{lastResult.missionId}: {lastResult.missionTitle}
          </p>
        </div>

        {/* Score and Stats Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
          <div className="cyber-glass p-3 rounded-xl border border-cyber-border">
            <div className="text-[10px] font-mono text-slate-400">SCORE EARNED</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>+{lastResult.scoreAwarded} XP</span>
            </div>
          </div>

          <div className="cyber-glass p-3 rounded-xl border border-cyber-border">
            <div className="text-[10px] font-mono text-slate-400">ATTEMPTS</div>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {lastResult.attemptsCount}
            </div>
          </div>

          <div className="cyber-glass p-3 rounded-xl border border-cyber-border">
            <div className="text-[10px] font-mono text-slate-400">TIME ELAPSED</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{lastResult.timeTakenSeconds}s</span>
            </div>
          </div>

          <div className="cyber-glass p-3 rounded-xl border border-cyber-border">
            <div className="text-[10px] font-mono text-slate-400">THREAT STATUS</div>
            <div
              className={`text-lg font-bold font-mono mt-1 ${
                lastResult.isSecretLeaked
                  ? 'text-red-400'
                  : lastResult.isDefenseBlocked
                  ? 'text-emerald-400'
                  : 'text-cyan-400'
              }`}
            >
              {lastResult.evaluation.threatLevel}
            </div>
          </div>
        </div>

        {/* Lessons Learned Box */}
        <div className="cyber-glass rounded-2xl p-5 border border-cyber-border text-left space-y-2 mt-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>CRITICAL LESSON LEARNED</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {lastResult.educationalTakeaway}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              sound.playClick();
              startMission(lastResult.missionId);
            }}
            className="px-5 py-3 rounded-xl cyber-glass border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY MISSION</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-5 py-3 rounded-xl cyber-glass border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SUMMARY COPIED!' : 'COPY RESULT SUMMARY'}</span>
          </button>

          {currentMissionId < 5 ? (
            <button
              onClick={() => {
                sound.playClick();
                startMission(nextId);
              }}
              className="px-6 py-3 rounded-xl font-mono font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shadow-neon-cyan flex items-center gap-2 transition-all"
            >
              <span>CONTINUE TO LEVEL 0{nextId}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                setCurrentPage('defense-lab');
              }}
              className="px-6 py-3 rounded-xl font-mono font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-neon-purple flex items-center gap-2 transition-all"
            >
              <span>ENTER DEFENSE LAB</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
