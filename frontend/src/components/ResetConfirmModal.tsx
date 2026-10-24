import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-glass rounded-2xl max-w-md w-full p-6 border border-red-500/40 shadow-neon-red relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-400 mb-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Reset Player Progress?</h3>
            <span className="text-xs font-mono text-red-400">DESTRUCTIVE ACTION</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          This will wipe your earned XP, unlocked achievements, mission high scores, and restore all defensive configurations to default. This cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playThreatAlarm();
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30"
          >
            Yes, Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};
