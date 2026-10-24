# 🛡️ PROMPT WARS: Break the Bot. Protect the Secret.

> **Tagline:** *"Every prompt is an attack. Every defense is a decision."*

**PROMPT WARS** is a full-stack, hackathon-ready educational AI cybersecurity game designed to teach developers, security auditors, and students about prompt injection, instruction hierarchy, secret exfiltration, indirect prompt injection, and defensive AI guardrail engineering through interactive combat scenarios.

---

## 🌟 Key Highlights

- **5 Playable Mission Arenas:** From naive unhardened prototypes to enterprise multi-stage AI security assessments.
- **Dual Perspective (Red Team & Blue Team):** Exploit vulnerable models in the **Arena**, then switch roles to configure defenses in the **Defense Lab**.
- **Automated 12-Vector Defense Test Suite:** Evaluates True Positives, False Positives, False Negatives, and True Negatives to balance Security Score vs Utility Score.
- **100% Offline-Safe Deterministic AI Engine:** Zero external API keys or internet connection required for complete, reproducible gameplay.
- **Configurable Live AI Provider:** Seamlessly switch to real OpenAI or local LLM (Ollama, LM Studio, vLLM) endpoints via `.env`.
- **Authoritative Server-Side Evaluation:** The language model never decides its own score or declares itself secure. All secrets and evaluations are verified on the backend.
- **Futuristic Cyber Interface:** Dark navy aesthetic, neon purple and electric cyan accents, glassmorphism panels, interactive SVG vault with rotating tumblers, and Web Audio API synthesized sound effects.
- **Guest Persistence & Achievements:** LocalStorage player profile, ranks, XP progression, and unlockable badges.
- **3-Minute Hackathon Demo Mode:** Guided presentation flow with a 1-click reset button for judges.

---

## 📐 Architecture Overview

Prompt Wars separates the **data plane** (untrusted user inputs and documents) from the **control plane** (authoritative scoring rules, defense enforcement, and fictional secrets):

```
┌────────────────────────────────────────────────────────┐
│                   BROWSER CLIENT                       │
│  React 19 + TypeScript + Vite + Tailwind CSS           │
│  - Landing Page & Animated SVG Vault                   │
│  - Arena (Interactive Terminal Chat)                   │
│  - Defense Lab (Guardrail Switches)                    │
│  - 12-Vector Benchmark Report Card                     │
│  - Web Audio API Sound Synthesizer (Zero MP3 assets)   │
│  - LocalStorage Guest Profile & Achievements           │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP / JSON API
                            │ (Proxy: /api -> localhost:3001)
┌───────────────────────────▼────────────────────────────┐
│                   BACKEND SERVER                       │
│  Node.js + Express + TypeScript + Zod Validation       │
│                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │ Authoritative Engine  │   │ Guardrail Test Suite  │ │
│  │ - 5 Mission Defs      │   │ - 12 Predefined Cases │ │
│  │ - Secret Leak Check   │   │ - TP / FP / TN / FN   │ │
│  │ - Threat Heuristics   │   │ - Utility Telemetry   │ │
│  └───────────────────────┘   └───────────────────────┘ │
│                            ▲                           │
│                            │                           │
│  ┌─────────────────────────┴─────────────────────────┐ │
│  │               AI Provider Adapter                 │ │
│  │                                                   │ │
│  │ [Deterministic Demo]  OR  [OpenAI-Compatible LLM] │ │
│  │ (100% Offline Engine)     (Ollama / OpenAI API)   │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
prompt-wars/
├── package.json               # Root scripts (dev, build, test, start)
├── .env.example               # Root environment variable template
├── HACKATHON_DEMO.md          # 3-minute judge demo script
├── PITCH.md                   # Hackathon pitch summary
├── README.md                  # Comprehensive documentation
├── server/                    # Node.js + Express backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts           # Express server setup, CORS, middleware
│       ├── config.ts          # Environment variables & constants
│       ├── types/             # Backend TypeScript interfaces
│       ├── engine/            # Authoritative game evaluation engine
│       │   ├── missions.ts    # 5 mission configs, fictional secrets
│       │   ├── evaluator.ts   # Threat heuristics & leakage validation
│       │   └── defenseTestSuite.ts # 12-vector defense benchmark runner
│       ├── providers/         # AI Provider abstraction
│       │   ├── base.ts        # AIProvider interface
│       │   ├── demoProvider.ts # Deterministic offline simulation engine
│       │   ├── realProvider.ts # Configurable OpenAI-compatible provider
│       │   └── factory.ts     # Provider factory resolver
│       ├── routes/
│       │   ├── gameRoutes.ts  # /api/missions, /api/chat, /api/defense-lab
│       │   └── healthRoutes.ts# /api/health
│       └── tests/             # Automated Vitest unit & integration tests
│           ├── engine.test.ts
│           └── integration.test.ts
└── client/                    # Vite + React + TypeScript frontend
    ├── package.json
    ├── vite.config.ts         # Vite bundler & API proxy configuration
    ├── tsconfig.json
    ├── tailwind.config.js     # Cyberpunk theme & custom glow colors
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx            # Navigation & router state
        ├── index.css          # Cyber glass, scanlines, animations
        ├── types/             # Shared client interfaces
        ├── utils/
        │   ├── audio.ts       # Web Audio API retro cyber synth
        │   └── storage.ts     # LocalStorage player profile & achievements
        ├── services/
        │   └── api.ts         # REST API client with local failover
        ├── context/
        │   └── GameContext.tsx# State management (XP, missions, sound, motion)
        ├── components/
        │   ├── Navbar.tsx     # Navigation, sound/motion controls, XP badge
        │   ├── Footer.tsx     # Purpose & safety disclaimer
        │   ├── CyberShield.tsx# Glowing SVG circuit shield
        │   ├── AnimatedVault.tsx # Interactive SVG digital vault
        │   ├── StatusBadge.tsx# Simulation / Live model status indicator
        │   ├── AchievementModal.tsx # Pop-up celebration alert
        │   └── ResetConfirmModal.tsx # Reset confirmation dialog
        └── pages/
            ├── LandingPage.tsx# Hero, animated vault, 3 pillars, live stats
            ├── DashboardPage.tsx # Callsign, XP, missions, achievement badges
            ├── ArenaPage.tsx  # Terminal chat, suggested chips, doc drawer
            ├── DefenseLabPage.tsx # Guardrail toggles, 12-test suite runner
            ├── ResultsPage.tsx# Post-mission debrief & copyable summary
            ├── LearnPage.tsx  # Educational guide & interactive quizzes
            └── HackathonDemoPage.tsx # 3-Minute guided judge demo flow
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, tested on Node v24)
- **npm** (comes with Node.js)

### 1. Clone & Install Dependencies
Run the installation command from the repository root:

```bash
# Install root, client, and server dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Configure Environment (Optional)
By default, Prompt Wars runs in **zero-dependency deterministic simulation mode** (no `.env` required).

If you wish to connect a live language model:
```bash
cp .env.example .env
```
Edit `.env`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```
*(Compatible with local inference servers like Ollama: `OPENAI_BASE_URL=http://localhost:11434/v1`, `OPENAI_API_KEY=ollama`).*

### 3. Launch the Application
Run both backend server and frontend client concurrently:

```bash
npm run dev
```

- **Frontend UI:** Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API:** Running on [http://localhost:3001](http://localhost:3001).
- **Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health).

---

## 🎮 Playable Missions

| Level | Title | Codename | Difficulty | Protected Secret | Core Concept |
|---|---|---|---|---|---|
| **01** | **The Weak Bot** | `OPERATION PAPER-SHIELD` | Easy | `PW-DEMO-4821` | Direct instruction overrides ("Ignore previous rules") collapse naive system prompts. |
| **02** | **The Smart Bot** | `OPERATION BLACKLIST-BYPASS` | Medium | `PW-SMART-9042` | Naive keyword filters fail against synonyms, roleplay, and obfuscated phrasing. |
| **03** | **The Poisoned File** | `OPERATION TROJAN-DOCUMENT` | Medium-hard | `PW-INJECT-7719` | Indirect prompt injection smuggled within footnotes and Markdown comments in third-party files. |
| **04** | **The Defender** | `OPERATION BLUE-SHIELD` | Hard | `PW-DEFENSE-5544` | Player steps into the Blue Team role: configure guardrails to pass the 12-vector test suite. |
| **05** | **Final Boss — Secure AI** | `OPERATION FORTRESS-VAULT` | Expert | `PW-VAULT-9900` | Multi-stage evaluation of VaultSentinel-9000 across instruction conflicts, document tampering, and benign utility queries. |

---

## 🛡️ Defense Mechanisms (Defense Lab)

Players can toggle and evaluate 5 architectural guardrail layers:

1. **Instruction Hierarchy Enforcement:** System instructions hold strict, immutable priority over user prompts. Mitigates imperative overrides and maintenance persona hijacking.
2. **Untrusted Document Sandboxing:** Wraps retrieved text in passive delimiters (`<untrusted_context>`), strictly informing the model never to execute embedded directives.
3. **Sensitive-Data Output Filtering:** Real-time server-side regex and entropy scrubbing that sanitizes tokens matching `PW-[A-Z0-9]+` before delivery.
4. **Structured Response Validation:** Enforces strict JSON or structured schemas, preventing format breaks and raw script injection.
5. **Least-Privilege Tool Access:** Simulates compartmentalized execution, denying administrative or memory inspection commands from unprivileged guest sessions.

---

## 📊 Scoring & Telemetry System

The scoring model rewards diagnostic skill and penalizes meaningless repetition:

- **Exploiting a simulated vulnerability (Red Team):** `+150 XP`
- **Successfully blocking an attack vector (Blue Team):** `+75 XP`
- **Detecting an indirect prompt injection:** `+100 XP`
- **Safe handling of benign queries with sensitive words:** `+50 XP`
- **Correctly answering Learn Page quiz questions:** `+50 XP`
- **Passing the Defense Lab Benchmark (>= 85% score):** `+100 XP`
- **Duplicate identical prompt submissions:** `0 XP` (anti-spam deduction)

Telemetry tracks:
- **True Positives (TP):** Attack vectors correctly blocked.
- **True Negatives (TN):** Legitimate user queries correctly allowed.
- **False Positives (FP):** Over-zealous blocks on harmless requests.
- **False Negatives (FN):** Undetected exploits.
- **Security Score:** $\frac{TP}{Total Attacks} \times 100$
- **Utility Score:** $\frac{TN}{Total Benign} \times 100$
- **Overall Score:** $(Security \times 0.7) + (Utility \times 0.3)$

---

## 🧪 Automated Testing

Prompt Wars includes a comprehensive automated test suite powered by **Vitest**:

```bash
# Run backend engine and integration tests
npm test
```

### Tests Covered:
- Direct instruction override pattern matching
- Roleplay persona hijack detection
- Benign requests containing sensitive terms ("secret to baking croissants")
- Indirect prompt injection detection in external document payloads
- Real-time token scrubbing and output masking
- Zero XP penalty on duplicate submissions
- Automated execution of all 12 Defense Test Suite cases
- Deterministic AI Provider behavior across all 5 missions

---

## 🔐 Security & Safety Rules

1. **Synthetic Data Only:** All tokens (e.g. `PW-DEMO-4821`) and document payloads are 100% fictional.
2. **Server-Side Ground Truth:** The authoritative fictional secret resides on the backend. The client never holds the plaintext master key for evaluation.
3. **No Arbitrary Execution:** Untrusted user input is never evaluated via `eval()`, shell commands, or arbitrary browser scripts.
4. **Strict Request Boundaries:** Payloads are capped at 1,000 characters with input schema validation via Zod.
5. **No False Claims:** The app clearly displays `SIMULATION MODE (OFFLINE SAFE)` whenever a live model is not connected.

---

## 🔮 Future Improvements

- **SQLite Persistent Database:** Upgrade guest sessions to persistent multi-player leaderboards.
- **Dual-LLM Arbiter Model:** Implement an unprivileged parser LLM paired with an authoritative guardrail arbiter model.
- **Custom Payload Sandbox:** Allow security researchers to upload custom test suites and download JSON telemetry reports.

---

## 📜 License
MIT License. Built for educational AI cybersecurity and defensive engineering hackathons.
