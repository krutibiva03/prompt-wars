import React from 'react';
import { ShieldCheck, Cpu, Database } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const StatusBadge: React.FC = () => {
  const { providerStatus, dbConnected } = useGame();
  const isLive = providerStatus.mode === 'live';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Database Connection Badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
          dbConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}
        title={dbConnected ? 'MongoDB Atlas cluster connected and syncing' : 'Running in local fallback mode'}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              dbConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              dbConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>
        <Database className="w-3.5 h-3.5" />
        <span>{dbConnected ? 'MONGODB: CONNECTED' : 'MONGODB: OFFLINE'}</span>
      </div>

      {/* AI Model Badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
          isLive
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        }`}
      >
        {isLive ? (
          <>
            <Cpu className="w-3.5 h-3.5" />
            <span>LIVE: {providerStatus.model}</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI: CONTEXTUAL SIMULATION</span>
          </>
        )}
      </div>
    </div>
  );
};
