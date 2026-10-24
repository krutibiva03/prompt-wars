import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  BarChart3,
  Award,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { runDefenseBenchmark } from '../services/api';
import { DefenseConfig, DefenseSuiteReport } from '../types';
import { sound } from '../utils/audio';

export const DefenseLabPage: React.FC = () => {
  const {
    defenseMechanisms,
    playerProfile,
    updateDefenses,
    addXP,
    unlockAchievement,
  } = useGame();

  const [activeDefenses, setActiveDefenses] = useState<DefenseConfig>(playerProfile.activeDefenses);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<DefenseSuiteReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ATTACK' | 'BENIGN' | 'FAILED'>('ALL');

  const handleToggle = (key: keyof DefenseConfig) => {
    sound.playClick();
    const updated = {
      ...activeDefenses,
      [key]: !activeDefenses[key],
    };
    setActiveDefenses(updated);
    updateDefenses(updated);
  };

  const handleRunBenchmark = async () => {
    sound.playClick();
    setIsRunning(true);
    setReport(null);

    try {
      const res = await runDefenseBenchmark(activeDefenses, playerProfile.userId);
      setReport(res);

      if (res.overallScore >= 85) {
        sound.playVictoryFanfare();
        addXP(100);
        unlockAchievement('blue_team_hero');
      } else {
        sound.playShieldBlock();
      }

      if (res.securityScore === 100 && res.falseNegatives === 0) {
        unlockAchievement('flawless_defense');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetToBaseline = () => {
    sound.playClick();
    const baseline: DefenseConfig = {
      instructionHierarchy: false,
      documentIsolation: false,
      outputFiltering: false,
      structuredValidation: false,
      leastPrivilegeTools: false,
    };
    setActiveDefenses(baseline);
    updateDefenses(baseline);
    setReport(null);
  };

  const filteredResults = report?.testResults.filter((r) => {
    if (activeFilter === 'ATTACK') return r.isAttack;
    if (activeFilter === 'BENIGN') return !r.isAttack;
    if (activeFilter === 'FAILED') return !r.passed;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800 text-purple-300 text-xs font-mono mb-2">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>BLUE TEAM GUARDRAIL MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            DEFENSE LAB & BENCHMARK SUITE
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Configure architectural defense mechanisms, deploy mitigation layers, and execute an automated 12-vector adversarial test suite to measure security resilience and utility trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToBaseline}
            className="px-4 py-2.5 rounded-xl cyber-glass border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Baseline</span>
          </button>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="px-6 py-2.5 rounded-xl font-mono font-bold text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-neon-purple flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>BENCHMARKING...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>EXECUTE 12-TEST SUITE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Defense Mechanism Switches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {defenseMechanisms.map((mech) => {
          const isEnabled = activeDefenses[mech.id];

          return (
            <div
              key={mech.id}
              className={`cyber-glass rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isEnabled
                  ? 'border-cyan-500/60 shadow-neon-cyan/20 bg-cyan-950/20'
                  : 'border-cyber-border hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {mech.recommended && (
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 mr-2">
                        RECOMMENDED
                      </span>
                    )}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(mech.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-1 font-mono">{mech.name}</h3>
                <div className="text-xs text-cyan-300/90 font-mono mb-2">{mech.tagline}</div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{mech.description}</p>
              </div>

              <div className="pt-3 border-t border-cyber-border/70 space-y-1.5 text-[11px] font-mono">
                <div className="text-emerald-400">
                  <span className="text-slate-400">Mitigates:</span> {mech.mitigates.join(', ')}
                </div>
                <div className="text-amber-400">
                  <span className="text-slate-400">Trade-off:</span> {mech.tradeOff}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benchmark Results Card */}
      {report && (
        <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-neon-purple space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cyber-border">
            <div>
              <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>BENCHMARK AUDIT REPORT</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Evaluated across 12 adversarial attack vectors & benign utility controls
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">PASS RATE:</span>
              <span className="text-2xl font-mono font-bold text-cyan-400">
                {report.passed} / {report.totalTests}
              </span>
            </div>
          </div>

          {/* Metric Score Cards: Security vs Utility vs Overall */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cyber-glass p-4 rounded-xl border border-cyber-border">
              <div className="text-xs font-mono text-slate-400">SECURITY SCORE</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {report.securityScore}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {report.truePositives} / 10 attacks blocked
              </div>
            </div>

            <div className="cyber-glass p-4 rounded-xl border border-cyber-border">
              <div className="text-xs font-mono text-slate-400">UTILITY SCORE</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {report.utilityScore}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {report.trueNegatives} / 2 benign passed
              </div>
            </div>

            <div className="cyber-glass p-4 rounded-xl border border-cyber-border">
              <div className="text-xs font-mono text-slate-400">FALSE NEGATIVES</div>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  report.falseNegatives > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {report.falseNegatives}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Missed vulnerability vectors
              </div>
            </div>

            <div className="cyber-glass p-4 rounded-xl border border-purple-500/40 bg-purple-950/20">
              <div className="text-xs font-mono text-purple-300 font-semibold">OVERALL SCORE</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {report.overallScore}%
              </div>
              <div className="text-[10px] font-mono text-purple-300 mt-1">
                +{report.benchmarkComparison.improvementPercent}% vs unhardened baseline
              </div>
            </div>
          </div>

          {/* Test Case Filter Pills */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto">
            {(['ALL', 'ATTACK', 'BENIGN', 'FAILED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  sound.playClick();
                  setActiveFilter(filter);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeFilter === filter
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-cyber-panel text-slate-400 border border-cyber-border hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Individual Test Results List */}
          <div className="space-y-3">
            {filteredResults?.map((r) => (
              <div
                key={r.testId}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                  r.passed
                    ? 'bg-cyber-panel/50 border-emerald-500/30'
                    : 'bg-red-950/20 border-red-500/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{r.testId}</span>
                    <span className="text-sm font-bold text-white font-mono">{r.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                      {r.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{r.explanation}</p>
                  {r.blockedBy && (
                    <div className="text-[11px] font-mono text-emerald-400">
                      Mitigated by: {r.blockedBy}
                    </div>
                  )}
                  {!r.passed && (
                    <div className="text-[11px] font-mono text-red-400">
                      Vulnerability: {r.mitigation}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-mono text-slate-400">
                    Expected: {r.expectedOutcome} | Actual: {r.actualOutcome}
                  </span>
                  {r.passed ? (
                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>PASS</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-red-400 px-2.5 py-1 rounded bg-red-950/60 border border-red-800">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>FAIL</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
