import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Zap,
  Activity,
  Menu,
  X,
  PlayCircle,
  LayoutDashboard,
  ShieldAlert,
  Sliders,
  BookOpen,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CyberShield } from './CyberShield';
import { StatusBadge } from './StatusBadge';
import { sound } from '../utils/audio';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    playerProfile,
    toggleSound,
    toggleReducedMotion,
  } = useGame();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: CyberShield },
    { id: 'arena', label: 'Arena', icon: ShieldAlert },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'defense-lab', label: 'Defense Lab', icon: Sliders },
    { id: 'learn', label: 'Learn', icon: BookOpen },
  ];

  const handleNav = (page: string) => {
    sound.playClick();
    setCurrentPage(page as any);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border/70 cyber-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <CyberShield size={34} />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg tracking-wider font-mono bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all">
              PROMPT WARS
            </span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 -mt-1 hidden sm:block">
              AI CYBERSECURITY ARENA
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="hidden lg:block">
            <StatusBadge />
          </div>

          {/* Hackathon Demo Quick Button */}
          <button
            onClick={() => handleNav('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
              currentPage === 'demo'
                ? 'bg-purple-600 text-white shadow-neon-purple'
                : 'bg-purple-950/70 text-purple-300 border border-purple-800/70 hover:bg-purple-900/60'
            }`}
            title="Launch 3-Minute Hackathon Demo"
          >
            <PlayCircle className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">3-Min Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Player XP & Level Chip */}
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-panel border border-cyber-border hover:border-cyan-500/50 transition-colors"
            title="View Player Dashboard"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white">
              {playerProfile.xp} <span className="text-slate-400 font-normal">XP</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-800">
              Lv.{playerProfile.level}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              playerProfile.soundEnabled
                ? 'bg-slate-800/60 border-slate-700 text-cyan-400 hover:bg-slate-700'
                : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={playerProfile.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            aria-label="Toggle Sound Effects"
          >
            {playerProfile.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={toggleReducedMotion}
            className={`p-2 rounded-lg border transition-colors ${
              playerProfile.reducedMotion
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={playerProfile.reducedMotion ? 'Reduced Motion Active' : 'Normal Animations Active'}
            aria-label="Toggle Reduced Motion"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cyber-border bg-cyber-panel/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2">
          <div className="pb-2">
            <StatusBadge />
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                currentPage === item.id
                  ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-800'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => handleNav('demo')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-purple-300 bg-purple-950/70 border border-purple-800 flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-purple-400" />
            <span>Launch 3-Minute Hackathon Demo</span>
          </button>
        </div>
      )}
    </header>
  );
};
