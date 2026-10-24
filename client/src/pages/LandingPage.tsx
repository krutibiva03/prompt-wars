import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Sliders,
  HelpCircle,
  ArrowRight,
  Terminal,
  Play,
  Lock,
  Cpu,
  Award,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AnimatedVault } from '../components/AnimatedVault';
import { CyberShield } from '../components/CyberShield';
import { sound } from '../utils/audio';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, startMission, playerProfile, providerStatus } = useGame();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between cyber-grid overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>EDUCATIONAL AI CYBERSECURITY ARENA</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              BREAK THE BOT.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block mt-1">
                PROTECT THE SECRET.
              </span>
            </h1>

            {/* Subtitle & Tagline */}
            <p className="text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              <span className="text-cyan-300 font-semibold italic">
                "Every prompt is an attack. Every defense is a decision."
              </span>{' '}
              Master real-world AI cybersecurity concepts: prompt injection, instruction hierarchy,
              secret exfiltration, and indirect injection through 5 interactive battle arenas.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  startMission(1);
                }}
                className="px-7 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 transition-all shadow-neon-cyan flex items-center gap-2 group"
              >
                <span>ENTER THE ARENA</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentPage('learn');
                }}
                className="px-6 py-3.5 rounded-xl font-medium text-base text-slate-200 cyber-glass hover:bg-slate-800/80 border border-cyber-border hover:border-cyan-500/50 transition-all flex items-center gap-2"
              >
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>HOW IT WORKS</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentPage('demo');
                }}
                className="px-5 py-3.5 rounded-xl font-mono text-sm text-purple-300 bg-purple-950/60 border border-purple-800/80 hover:bg-purple-900/50 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-purple-400" />
                <span>HACKATHON DEMO (3-MIN)</span>
              </button>
            </div>

            {/* Quick Live Stats bar */}
            <div className="pt-6 border-t border-cyber-border/70 grid grid-cols-3 gap-4 max-w-lg">
              <div className="cyber-glass p-3 rounded-lg">
                <div className="text-xs font-mono text-slate-400">XP EARNED</div>
                <div className="text-xl font-mono font-bold text-cyan-400">{playerProfile.xp}</div>
              </div>
              <div className="cyber-glass p-3 rounded-lg">
                <div className="text-xs font-mono text-slate-400">MISSIONS CLEARED</div>
                <div className="text-xl font-mono font-bold text-purple-400">
                  {playerProfile.completedMissions.length} / 5
                </div>
              </div>
              <div className="cyber-glass p-3 rounded-lg">
                <div className="text-xs font-mono text-slate-400">RANK</div>
                <div className="text-xl font-mono font-bold text-emerald-400">Lv.{playerProfile.level}</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Digital Vault Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative"
          >
            <div className="cyber-glass-glow rounded-3xl p-8 border border-cyan-500/30 flex flex-col items-center text-center relative overflow-hidden w-full max-w-md">
              <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>STAGING TOKEN VAULT</span>
              </div>

              {/* Animated Interactive Vault */}
              <div className="my-4">
                <AnimatedVault
                  size={190}
                  isLocked={playerProfile.completedMissions.length === 0}
                  isBreached={playerProfile.completedMissions.length > 0}
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-mono">
                  TARGET SECRET: <span className="text-cyan-400">PW-••••-4821</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Protected by standard customer service directives. Can your prompt crack the perimeter?
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  startMission(1);
                }}
                className="mt-6 w-full py-2.5 rounded-lg bg-cyber-panel border border-cyan-500/40 hover:bg-cyan-950/40 text-cyan-300 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>START LEVEL 1: THE WEAK BOT</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Pillars: Attack, Detect, Defend */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            THE THREE PILLARS OF AI SECURITY
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-mono">
            Explore both sides of LLM red teaming and blue team defense engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Attack */}
          <div className="cyber-glass rounded-2xl p-6 border border-cyber-border hover:border-red-500/50 transition-all group">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 inline-block mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>01. ATTACK</span>
              <span className="text-xs font-mono text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-800">
                Red Team
              </span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Test real exploit techniques including direct system overrides, roleplay framing, obfuscated tokens, and indirect injection smuggled via business documents.
            </p>
          </div>

          {/* Card 2: Detect */}
          <div className="cyber-glass rounded-2xl p-6 border border-cyber-border hover:border-cyan-500/50 transition-all group">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 inline-block mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>02. DETECT</span>
              <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                Heuristics
              </span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analyze real-time threat signals: detect delimiter tampering, entropy spikes, sensitive credential patterns, and witness why naive string blacklists fail.
            </p>
          </div>

          {/* Card 3: Defend */}
          <div className="cyber-glass rounded-2xl p-6 border border-cyber-border hover:border-purple-500/50 transition-all group">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 inline-block mb-4 group-hover:scale-110 transition-transform">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>03. DEFEND</span>
              <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">
                Blue Team
              </span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Configure 5 defense layers in the Defense Lab. Run the 12-vector adversarial test suite to benchmark security score vs false positive utility trade-offs.
            </p>
          </div>
        </div>
      </section>

      {/* Educational Primer Accordion / Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="cyber-glass rounded-2xl p-6 sm:p-8 border border-cyber-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hidden sm:block">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-white">Why Are Language Models Vulnerable?</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                In classical computing, software maintains a strict architectural barrier between code (instructions) and data (user inputs). In Large Language Models, however, system instructions and user inputs are concatenated into a single stream of textual tokens. Without defense-in-depth guardrails, the model cannot distinguish between instructions provided by developers and instructions provided by an attacker.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentPage('learn');
                  }}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4 flex items-center gap-1"
                >
                  <span>Explore the complete interactive AI Security Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
