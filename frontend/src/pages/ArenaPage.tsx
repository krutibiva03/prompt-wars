import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
  ArrowRight,
  Terminal,
  Zap,
  Lock,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sendChatMessage } from '../services/api';
import { ChatMessage, EvaluationResult, MissionDefinition } from '../types';
import { sound } from '../utils/audio';
import { AnimatedVault } from '../components/AnimatedVault';

export const ArenaPage: React.FC = () => {
  const {
    currentMissionId,
    setCurrentMissionId,
    missions,
    completeMission,
    setCurrentPage,
    playerProfile,
  } = useGame();

  const currentMission: MissionDefinition =
    missions.find((m) => m.id === currentMissionId) || missions[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(
    currentMission.sampleDocuments?.[0]?.id
  );
  const [showDocInspector, setShowDocInspector] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());
  const [latestEval, setLatestEval] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize mission welcome message
  useEffect(() => {
    if (!currentMission) return;
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Target Initialized: ${currentMission.title} (${currentMission.codename}).\nProtected Staging Secret: ${currentMission.displaySecretMasked}\nStatus: System waiting for input prompt.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setInputPrompt('');
    setAttempts(0);
    setLatestEval(null);
    setShowHint(false);
    if (currentMission.sampleDocuments && currentMission.sampleDocuments.length > 0) {
      setSelectedDocId(currentMission.sampleDocuments[0].id);
    } else {
      setSelectedDocId(undefined);
    }
  }, [currentMissionId, currentMission]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setAttempts((prev) => prev + 1);

    try {
      const response = await sendChatMessage({
        missionId: currentMission.id,
        prompt: text,
        selectedDocId,
        activeDefenses: playerProfile.activeDefenses,
        sessionToken,
        userId: playerProfile.userId,
        previousHistory: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      });

      const evalRes = response.evaluation;
      setLatestEval(evalRes);
      setSessionXP((prev) => prev + evalRes.scoreAwarded);

      // Audio cues based on result
      if (evalRes.isSecretLeaked) {
        sound.playSecretLeak();
      } else if (evalRes.isDefenseBlocked) {
        sound.playShieldBlock();
      } else if (evalRes.isThreatDetected) {
        sound.playThreatAlarm();
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString(),
        evaluation: evalRes,
        isThreat: evalRes.isThreatDetected,
        isBlocked: evalRes.isDefenseBlocked,
        isLeak: evalRes.isSecretLeaked,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Check if mission reached completion
      if (response.missionCompleted) {
        const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        setTimeout(() => {
          completeMission(currentMission.id, response.sessionStats.totalEarnedXP, {
            missionId: currentMission.id,
            missionTitle: currentMission.title,
            scoreAwarded: response.sessionStats.totalEarnedXP,
            isSecretLeaked: evalRes.isSecretLeaked,
            isDefenseBlocked: evalRes.isDefenseBlocked,
            attemptsCount: attempts + 1,
            timeTakenSeconds,
            educationalTakeaway: evalRes.educationalTakeaway,
            detectedCategories: evalRes.detectedCategories,
            evaluation: evalRes,
          });
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Engine communication error';
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'system',
          content: `[ENGINE COMMUNICATION ERROR]: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Target Initialized: ${currentMission.title}.\nStatus: Reset complete. Ready for new prompt vector.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setAttempts(0);
    setSessionXP(0);
    setSessionToken(crypto.randomUUID());
    setLatestEval(null);
  };

  const selectedDoc = currentMission.sampleDocuments?.find((d) => d.id === selectedDocId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header: Mission Switcher & Objective Brief */}
      <div className="cyber-glass rounded-2xl p-5 border border-cyber-border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Level Switcher Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {missions.map((m) => {
            const isActive = m.id === currentMission.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  sound.playClick();
                  setCurrentMissionId(m.id);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-neon-cyan'
                    : 'bg-cyber-panel text-slate-300 border border-cyber-border hover:border-cyan-500/50'
                }`}
              >
                LEVEL 0{m.id}
              </button>
            );
          })}
        </div>

        {/* Mission Stats Badge */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>ATTEMPTS:</span>
            <span className="font-bold text-white">{attempts}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>SESSION SCORE:</span>
            <span className="font-bold text-cyan-400">+{sessionXP} XP</span>
          </div>
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg cyber-glass border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
            title="Restart Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mission Intel, Vault & Sample Documents */}
        <div className="lg:col-span-4 space-y-5">
          {/* Target Intel Card */}
          <div className="cyber-glass-glow rounded-2xl p-5 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800">
                {currentMission.codename}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border text-purple-300 bg-purple-950/60 border-purple-800">
                {currentMission.difficulty}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-mono">{currentMission.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{currentMission.story}</p>
            </div>

            {/* Protected Secret Display */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">TARGET TOKEN:</span>
                <span className="font-bold text-cyan-300">{currentMission.displaySecretMasked}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">PROTECTED</span>
            </div>

            {/* Animated Vault Mini Display */}
            <div className="flex justify-center py-1">
              <AnimatedVault
                size={120}
                isLocked={!latestEval?.isSecretLeaked}
                isBreached={Boolean(latestEval?.isSecretLeaked)}
              />
            </div>
          </div>

          {/* Objectives Checklist */}
          <div className="cyber-glass rounded-2xl p-5 border border-cyber-border space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>MISSION OBJECTIVES</span>
            </h3>

            <div className="space-y-2">
              {currentMission.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="p-2.5 rounded-lg bg-cyber-panel/60 border border-cyber-border/70 flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 leading-snug">
                    <span>{obj.description}</span>
                    <span className="block text-[10px] font-mono text-cyan-400 mt-0.5">
                      +{obj.points} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Documents (For Level 3 and Level 5) */}
          {currentMission.sampleDocuments && currentMission.sampleDocuments.length > 0 && (
            <div className="cyber-glass rounded-2xl p-5 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>DOCUMENT ATTACHMENT</span>
                </h3>
                <button
                  onClick={() => setShowDocInspector(!showDocInspector)}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  {showDocInspector ? 'Hide Raw' : 'Inspect Raw'}
                </button>
              </div>

              <div className="space-y-2">
                {currentMission.sampleDocuments.map((doc) => {
                  const isDocActive = selectedDocId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedDocId(doc.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-mono border transition-all flex items-center justify-between ${
                        isDocActive
                          ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                          : 'bg-cyber-panel border-cyber-border text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                      {doc.containsInjection && (
                        <span className="text-[10px] text-red-400 px-1.5 py-0.2 rounded bg-red-950/80 border border-red-800">
                          CONTAINS PAYLOAD
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Raw Document Inspection Accordion */}
              {showDocInspector && selectedDoc && (
                <div className="mt-3 p-3 rounded-lg bg-black/90 border border-amber-500/30 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.content}
                </div>
              )}
            </div>
          )}

          {/* Hint Accordion */}
          <div className="cyber-glass rounded-xl p-4 border border-cyber-border">
            <button
              onClick={() => {
                sound.playClick();
                setShowHint(!showHint);
              }}
              className="w-full flex items-center justify-between text-xs font-mono text-purple-300 hover:text-purple-200"
            >
              <span className="flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span>NEED A HINT?</span>
              </span>
              <span>{showHint ? 'Collapse' : 'Reveal'}</span>
            </button>

            {showHint && (
              <div className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-cyber-border/60 pt-2 font-sans">
                {currentMission.educationalNotes[0]}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Terminal Chat Interface & Interactive Inputs */}
        <div className="lg:col-span-8 space-y-4">
          {/* Terminal Container */}
          <div className="cyber-glass-glow rounded-3xl border border-cyber-border flex flex-col h-[560px] overflow-hidden shadow-2xl">
            {/* Terminal Top Window Bar */}
            <div className="px-4 py-3 border-b border-cyber-border bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  ARENA_TERMINAL // TARGET_0{currentMission.id}
                </span>
              </div>

              {/* Status Indicator */}
              {latestEval && (
                <div
                  className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    latestEval.threatLevel === 'BLOCKED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : latestEval.threatLevel === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : latestEval.threatLevel === 'SUSPICIOUS'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  }`}
                >
                  {latestEval.threatLevel === 'BLOCKED' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {latestEval.threatLevel === 'CRITICAL' && <ShieldAlert className="w-3.5 h-3.5" />}
                  {latestEval.threatLevel === 'SUSPICIOUS' && <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{latestEval.threatLevel}</span>
                </div>
              )}
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 cyber-scanlines">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-1 px-1">
                    <span>{msg.role === 'user' ? 'OPERATOR' : 'TARGET_BOT'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-600/20 border border-cyan-500/40 text-slate-100 rounded-tr-none'
                        : msg.isLeak
                        ? 'bg-red-950/60 border border-red-500 text-red-200 rounded-tl-none shadow-neon-red'
                        : msg.isBlocked
                        ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-200 rounded-tl-none'
                        : 'bg-cyber-panel/80 border border-cyber-border text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    {/* Threat Heuristic Feedback Pill if applicable */}
                    {msg.evaluation && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60 text-xs font-mono space-y-1">
                        <div className="text-[11px] text-cyan-400">
                          {msg.evaluation.feedbackMessage}
                        </div>
                        {msg.evaluation.detectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.evaluation.detectedCategories.map((c) => (
                              <span
                                key={c}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-purple-300 border border-purple-800"
                              >
                                #{c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
                  <Terminal className="w-4 h-4 animate-spin" />
                  <span>Processing prompt vector through neural model...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="px-4 py-2 border-t border-cyber-border/70 bg-slate-900/60 overflow-x-auto flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex-shrink-0">
                SUGGESTED VECTORS:
              </span>
              {currentMission.suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setInputPrompt(p);
                  }}
                  className="px-2.5 py-1 rounded-md bg-cyber-panel border border-cyber-border hover:border-cyan-500/60 text-[11px] font-mono text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                >
                  {p.length > 38 ? `${p.slice(0, 38)}...` : p}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-cyber-border bg-slate-900/90 flex items-center gap-2">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter prompt vector... (Enter to send, Shift+Enter for newline)"
                rows={2}
                maxLength={1000}
                className="flex-1 bg-cyber-bg border border-cyber-border rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 font-mono resize-none focus:outline-none focus:border-cyan-500 transition-colors"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isLoading}
                className="h-full px-5 py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black shadow-neon-cyan transition-all flex items-center justify-center"
                aria-label="Send prompt"
              >
                <Send className="w-4 h-4 fill-black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
