<div align="center">

# 🛡️ PROMPT WARS
### *Break the Bot. Protect the Secret.*

> **"Every prompt is an attack. Every defense is a decision."**

An educational, full-stack AI cybersecurity battle arena and defensive engineering platform designed to train developers, security auditors, and students in Large Language Model (LLM) security vulnerabilities and defense-in-depth guardrail architectures.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)

[🚀 Quickstart](#-quickstart--installation) •
[🎮 Playable Missions](#-playable-missions) •
[🛡️ Defense Lab](#-defense-mechanisms-matrix) •
[📊 MongoDB Architecture](#-database-architecture-mongodb-atlas) •
[📡 API Reference](#-backend-api-endpoints) •
[🏆 Global Leaderboard](#-scoring-telemetry--leaderboard)

---

</div>

## 🌟 Key Highlights

- **⚔️ Dual-Perspective Gameplay (Red Team & Blue Team):**
  - **Red Team (Arena):** Probe vulnerable LLMs, bypass naive keyword blacklists, craft obfuscated tokens, and execute indirect prompt injections via poisoned business documents.
  - **Blue Team (Defense Lab):** Configure 5 architectural guardrails, then benchmark defense-in-depth resilience against an automated 12-vector adversarial test suite.
- **🍃 Live MongoDB Atlas Persistence:**
  - Dynamic user profiles, session tracking, prompt history, mission debriefs, and global leaderboard rankings persisted in MongoDB. Zero hardcoded mock responses.
- **🤖 Dynamic Contextual Neural Simulation & Live Model Support:**
  - **100% Offline Contextual Engine:** Parses, extracts intent, and dynamically answers the player's actual text without static canned responses.
  - **Live LLM Ready:** Switch to OpenAI (`gpt-4o-mini`) or local models (Ollama, vLLM, LM Studio) by setting `AI_PROVIDER=openai` in `.env`.
- **⚖️ Authoritative Server-Side Evaluation:**
  - The model never evaluates its own safety or assigns its own score. All threat heuristics, secret leak checks, and score awards are executed on the authoritative backend.
- **🎨 Futuristic Cyber Interface:**
  - Dark navy palette with electric cyan, neon purple, and emerald accents, interactive SVG digital vault with rotating tumblers, and sound synthesized via the native Web Audio API (zero audio asset dependencies).
- **⏱️ 3-Minute Hackathon Demo Mode:**
  - Built-in guided presentation flow tailored for hackathon judges with a 1-click reset button.

---

## 📐 Architecture & Data Flow

Prompt Wars strictly isolates the **data plane** (untrusted user inputs and documents) from the **control plane** (authoritative scoring rules, defense enforcement, and fictional secrets):

```mermaid
flowchart TD
    subgraph Browser Client
        UI["React 19 Frontend<br/>(Tailwind CSS + Web Audio API)"]
        Vault["Animated SVG Vault"]
        Dashboard["Leaderboard & History"]
    end

    subgraph Express Backend
        API["Express REST API (/api)"]
        AuthEng["Authoritative Security Engine"]
        ThreatEng["Heuristic Threat Analyzer"]
        Bench["12-Vector Defense Test Suite"]
    end

    subgraph AI Provider Adapter
        DemoMode["Contextual Neural Simulation<br/>(100% Offline Safe)"]
        LiveMode["OpenAI / Ollama LLM Provider<br/>(Optional Live API)"]
    end

    subgraph Persistence Layer
        Atlas[("MongoDB Atlas Database<br/>- Users & Defenses<br/>- Prompt Submissions<br/>- Game Sessions & Results<br/>- Missions Catalog")]
    end

    UI -->|"HTTP /api/chat"| API
    API -->|"Input Validation (Zod)"| AuthEng
    AuthEng -->|"Process Actual Prompt"| DemoMode
    AuthEng -.->|"Process Actual Prompt"| LiveMode
    DemoMode -->|"Generated Content"| ThreatEng
    ThreatEng -->|"Authoritative Decision"| AuthEng
    AuthEng -->|"Persist Submissions & XP"| Atlas
    Atlas -->|"Live Leaderboard & History"| Dashboard
```

---

## 📂 Project Structure

```
prompt-wars/
├── package.json               # Root scripts (concurrent dev, build, test)
├── .env.example               # Root environment variable template
├── .gitignore                 # Excludes secrets, credentials, node_modules, dist
├── LICENSE                    # MIT License
├── README.md                  # Complete documentation
├── HACKATHON_DEMO.md          # 3-minute hackathon judge demo script
├── PITCH.md                   # Problem, solution, and educational impact pitch
├── backend/                   # Node.js + Express backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts           # Express setup, middleware, server bootstrap
│       ├── config.ts          # Environment variables & constants
│       ├── db.ts              # MongoDB Atlas connection & auto-seeding
│       ├── types/             # TypeScript interfaces
│       ├── models/            # Mongoose Schemas & Models
│       │   ├── User.ts            # Player profiles, defenses & stats
│       │   ├── GameSession.ts     # Active mission sessions & attempt counters
│       │   ├── PromptSubmission.ts# Actual prompts, responses & latency
│       │   ├── GameResult.ts      # Completed debriefs & leaderboard records
│       │   └── Mission.ts         # Authoritative mission catalog
│       ├── engine/            # Authoritative game evaluation engine
│       │   ├── missions.ts        # 5 missions & baseline defense configs
│       │   ├── evaluator.ts       # Threat heuristics & secret leak validation
│       │   └── defenseTestSuite.ts# 12-vector defense benchmark runner
│       ├── providers/         # AI Provider abstraction
│       │   ├── base.ts            # Provider interface contract
│       │   ├── demoProvider.ts    # Dynamic contextual offline neural simulator
│       │   ├── realProvider.ts    # Configurable OpenAI-compatible client
│       │   └── factory.ts         # Provider resolver
│       ├── routes/            # REST API Routes
│       │   ├── healthRoutes.ts    # /api/health (DB & model status)
│       │   ├── gameRoutes.ts      # /api/missions, /api/chat, /api/defense-lab
│       │   ├── userRoutes.ts      # /api/users/profile (MongoDB upsert)
│       │   ├── gameSessionRoutes.ts# /api/game/session, /api/game/result
│       │   └── leaderboardRoutes.ts# /api/leaderboard (real-time rankings)
│       └── tests/             # Automated Vitest integration tests
│           ├── engine.test.ts
│           ├── integration.test.ts
│           ├── mongo_routes.test.ts
│           └── e2e_api_verification.ts
└── frontend/                  # Vite + React 19 frontend
    ├── package.json
    ├── vite.config.ts         # Vite bundler & API reverse proxy
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx            # Navigation & router state
        ├── index.css          # Cyber glass, scanlines, glowing animations
        ├── types/             # Shared client interfaces
        ├── services/
        │   └── api.ts         # Backend API client
        ├── context/
        │   └── GameContext.tsx# React context (MongoDB sync, XP, audio)
        ├── utils/
        │   ├── audio.ts       # Web Audio API synthesizer
        │   └── storage.ts     # LocalStorage fast cache & level calculations
        ├── components/
        │   ├── Navbar.tsx     # Navigation & audio/motion controls
        │   ├── StatusBadge.tsx# MongoDB & AI model status monitor
        │   ├── AnimatedVault.tsx # Interactive SVG digital vault
        │   └── CyberShield.tsx# Neon circuit shield graphic
        └── pages/
            ├── LandingPage.tsx    # Hero, vault animation, 3 pillars
            ├── ArenaPage.tsx      # Interactive terminal chat & documents
            ├── DashboardPage.tsx  # MongoDB Leaderboard & Battle Logs
            ├── DefenseLabPage.tsx # Guardrail toggles & 12-test suite
            ├── ResultsPage.tsx    # Post-mission debrief & XP breakdown
            ├── LearnPage.tsx      # Comprehensive AI security guide
            └── HackathonDemoPage.tsx # 3-Minute guided judge demo flow
```

---

## 🎮 Playable Missions

| Level | Title | Codename | Difficulty | Protected Secret | Attack Vector | Security Takeaway |
|:---:|---|---|:---:|:---:|---|---|
| **01** | **The Weak Bot** | `OPERATION PAPER-SHIELD` | `Easy` | `PW-DEMO-4821` | Direct instruction override | Natural language prompts cannot separate code from data without instruction hierarchy. |
| **02** | **The Smart Bot** | `OPERATION BLACKLIST-BYPASS` | `Medium` | `PW-SMART-9042` | Obfuscation & synonym substitution | Naive keyword blacklists fail against rephrasing, hypothetical roleplay, and ciphers. |
| **03** | **The Poisoned File** | `OPERATION TROJAN-DOCUMENT` | `Medium-hard` | `PW-INJECT-7719` | Indirect prompt injection in attachments | Untrusted documents must be isolated within sandboxed delimiters (`<untrusted_context>`). |
| **04** | **The Defender** | `OPERATION BLUE-SHIELD` | `Hard` | `PW-DEFENSE-5544` | Adversarial automated suite | Security is a trade-off: over-zealous filtering causes false positives on legitimate users. |
| **05** | **Final Boss — Secure AI** | `OPERATION FORTRESS-VAULT` | `Expert` | `PW-VAULT-9900` | Multi-vector adversarial gauntlet | True defense comes from defense-in-depth: combining hierarchy, isolation, and output scrubbers. |

---

## 🛡️ Defense Mechanisms Matrix

Configure these 5 architectural layers in the **Defense Lab** to defend models against adversarial attacks:

```
┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Defense Layer                   │ Architectural Implementation & Mitigation                       │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 1. Instruction Hierarchy        │ Enforces immutable precedence: System rules > Untrusted inputs.  │
│ 2. Document Sandboxing          │ Encloses external files in passive cryptographic boundaries.    │
│ 3. Output Filtering             │ Scans output stream for secret tokens (PW-*) using regex & entropy.│
│ 4. Structured Validation        │ Enforces strict JSON schema output; rejects arbitrary prose.    │
│ 5. Least-Privilege Tools        │ Isolates read access from state-modifying or debug tools.       │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Architecture (MongoDB Atlas)

All dynamic application state is modeled with Mongoose and stored in MongoDB:

- **`User` Collection:** Stores user profiles, chosen callsign, XP, calculated level, completed missions list, best scores map, and live defense switch configurations.
- **`GameSession` Collection:** Tracks attempts, duplicate submissions, and real-time score accumulation per mission session.
- **`PromptSubmission` Collection:** Stores the actual user prompt, generated AI reply, evaluation metrics, heuristics triggered, and latency.
- **`GameResult` Collection:** Permanent debrief records used to aggregate the global leaderboard and past battle logs.
- **`Mission` Collection:** Authoritative missions catalog auto-seeded on boot.

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns health status, AI provider mode, and MongoDB Atlas connectivity state. |
| `GET` | `/api/missions` | Fetches all 5 sanitized missions from MongoDB. |
| `GET` | `/api/missions/:id` | Fetches details for a specific mission. |
| `POST` | `/api/chat` | Evaluates prompt input, queries AI engine, persists submission, and updates stats. |
| `GET` | `/api/users/profile/:userId` | Retrieves player profile from MongoDB (creates default record if new). |
| `POST` | `/api/users/profile` | Upserts nickname, sound, motion, and active defense preferences in MongoDB. |
| `POST` | `/api/game/session` | Starts a new authoritative mission session in MongoDB. |
| `GET` | `/api/game/session/:sessionId` | Retrieves game session state. |
| `POST` | `/api/game/result` | Records mission victory, updates XP, level, and stats in MongoDB. |
| `GET` | `/api/game/history/:userId` | Fetches past mission debriefs and prompt submissions for the player. |
| `GET` | `/api/leaderboard` | Queries top ranked players sorted by XP descending. |
| `POST` | `/api/defense-lab/benchmark` | Executes the 12-test suite and returns telemetry metrics. |
| `POST` | `/api/demo/reset` | Resets temporary demo states. |

---

## 🏆 Scoring, Telemetry & Leaderboard

The authoritative scoring model rewards diagnostic skill and penalizes meaningless repetition:

$$\text{Security Score} = \left(\frac{\text{True Positives}}{\text{Total Attacks}}\right) \times 100$$

$$\text{Utility Score} = \left(\frac{\text{True Negatives}}{\text{Total Benign}}\right) \times 100$$

$$\text{Overall Score} = (\text{Security Score} \times 0.7) + (\text{Utility Score} \times 0.3)$$

- **Exploiting a simulated vulnerability (Red Team):** `+150 XP`
- **Successfully blocking an attack vector (Blue Team):** `+75 XP`
- **Detecting an indirect prompt injection:** `+100 XP`
- **Safe handling of benign queries with sensitive words:** `+50 XP`
- **Passing the Defense Lab Benchmark ($\ge 85\%$ score):** `+100 XP`
- **Duplicate identical prompt submissions:** `0 XP` (anti-spam penalty)

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher, tested on Node v20 & v24)
- **npm** (bundled with Node.js)
- **MongoDB Atlas** or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/krutibiva03/prompt-wars.git
cd prompt-wars
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Ensure your MongoDB connection string is set:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/promptwars?retryWrites=true&w=majority
AI_PROVIDER=simulation
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4. Run Development Servers
```bash
npm run dev
```

- **Frontend Client:** Open [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)
- **API Health & DB Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🧪 Testing & Verification

Run the full automated test suite powered by **Vitest**:

```bash
# Run all unit and integration tests
npm test
```

### Tests Covered:
- ✅ **Threat Analysis:** Direct overrides, persona hijacking, obfuscation indicators.
- ✅ **Contextual Emulation:** Benign queries with sensitive keywords ("secret to baking croissants").
- ✅ **Document Sandboxing:** Quarantining indirect injection payloads.
- ✅ **Output Redaction:** Real-time token regex and entropy scrubbing.
- ✅ **Session Isolation & Anti-Spam:** Zero XP awarded on duplicate submissions.
- ✅ **12-Vector Defense Suite:** Verification of True Positives and False Positives.
- ✅ **MongoDB Atlas Integration:** End-to-end tests for profile, chat, and leaderboard persistence.

---

## 🌐 Cloud Deployment (Render & Vercel)

- 🚀 **Live Frontend (Vercel):** [https://prompt-wars-phi-six.vercel.app](https://prompt-wars-phi-six.vercel.app)
- 📡 **Live Backend API (Render):** [https://prompt-wars-08v0.onrender.com](https://prompt-wars-08v0.onrender.com)
- 🩺 **Backend Health Endpoint:** [https://prompt-wars-08v0.onrender.com/api/health](https://prompt-wars-08v0.onrender.com/api/health)

### 1. Backend on Render (Web Service)
- **Repository:** Connect your GitHub repository (`prompt-wars`)
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `PORT`: `10000` (or default assigned by Render)
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: `mongodb+srv://krutibiva03_db_user:73fOOoGjU6I0038T@cluster0.duu54jj.mongodb.net/promptwars?retryWrites=true&w=majority`
  - `AI_PROVIDER`: `simulation`

### 2. Frontend on Vercel
- **Repository:** Connect your GitHub repository (`prompt-wars`)
- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: `https://prompt-wars-08v0.onrender.com`

---

## 🔐 Security & Ethics Disclaimer

1. **Synthetic Data Only:** All tokens (e.g. `PW-DEMO-4821`), sample documents, and passwords are 100% fictional and generated exclusively for educational purposes.
2. **Educational Purpose:** Prompt Wars is built strictly to educate developers, students, and engineers on defensive AI design and mitigating OWASP Top 10 for LLMs vulnerabilities.
3. **Defense-First Philosophy:** Understanding offensive prompt injection techniques is essential to building resilient, hardened AI systems.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for educational cybersecurity & AI defense.
