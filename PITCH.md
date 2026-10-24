# PROMPT WARS — Hackathon Pitch Summary

## 🎯 The Hook
Every enterprise is deploying AI assistants. Yet, the **#1 vulnerability** on the OWASP Top 10 for Large Language Models is **Prompt Injection (LLM01)**. Millions of developers mistakenly believe that putting *"Do not share internal secrets"* in their system prompt is security.

**Prompt Wars** changes that by transforming abstract AI safety concepts into an interactive, gamified cybersecurity battleground.

---

## 💡 The Solution
**PROMPT WARS: Break the Bot. Protect the Secret.**
*Tagline: "Every prompt is an attack. Every defense is a decision."*

An educational full-stack web application that lets students, developers, and security auditors:
1. **Red Team (Attack):** Test prompt injection vectors across 5 progressively hardened mission levels.
2. **Blue Team (Defend):** Configure architectural guardrails (Instruction Hierarchy, Document Sandboxing, Output Token Scrubbing, Schema Validation, Least-Privilege Tools).
3. **Benchmark:** Run an automated 12-vector test suite measuring both **Security Score** (blocking attacks) and **Utility Score** (avoiding false positive blocks on legitimate user requests).

---

## 🏆 Key Differentiators
- **100% Hackathon-Ready & Offline First:** Works out-of-the-box with zero API keys or internet connection through our deterministic neural evaluation engine, while also offering plug-and-play compatibility with live OpenAI/Ollama models.
- **Authoritative Server-Side State:** Unlike naive prototypes where the LLM decides if you won, Prompt Wars uses an authoritative backend engine with regex entropy scrubbers, token state checks, and heuristic classifiers.
- **Synthetic Fictional Secrets:** 100% safe educational tokens (`PW-DEMO-4821`, `PW-SMART-9042`, `PW-INJECT-7719`, etc.) — zero risk of credential exposure.
- **Arcade Aesthetic:** Dark navy, glowing electric cyan and neon purple accents, interactive SVG digital vault with tumblers, synthesized Web Audio sound effects (no external audio assets required), and glassmorphism styling.
- **Measurable Security Telemetry:** Computes True Positives, True Negatives, False Positives, False Negatives, and percentage improvements over baseline.

---

## 🚀 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
- **Audio Engine:** Native Web Audio API synthesizer for zero-latency, cross-platform cyber beeps, alarms, and fanfares.
- **Backend:** Node.js, Express, TypeScript, Zod schema validation.
- **Testing:** Vitest automated test suite covering evaluators, defense matrices, and provider fallbacks.
- **Storage:** LocalStorage for guest player profiles, XP, and unlockable achievements.
