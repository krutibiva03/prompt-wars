import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const AchievementModal: React.FC = () => {
  const { activeAchievementAlert, dismissAchievementAlert } = useGame();

  if (!activeAchievementAlert) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="cyber-glass-glow rounded-xl p-4 border border-purple-500/40 shadow-neon-purple relative overflow-hidden"
        >
          {/* Neon accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400" />

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/20 text-2xl border border-purple-500/40 flex-shrink-0">
              {activeAchievementAlert.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                Achievement Unlocked!
              </div>
              <h4 className="text-base font-bold text-white mt-0.5 truncate">
                {activeAchievementAlert.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeAchievementAlert.description}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                +{activeAchievementAlert.points} XP
              </div>
            </div>

            <button
              onClick={dismissAchievementAlert}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
