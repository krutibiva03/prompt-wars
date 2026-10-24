import {
  MissionDefinition,
  DefenseConfig,
  DefenseMechanismInfo,
  DefenseSuiteReport,
  EvaluationResult,
  LeaderboardEntry,
  GameHistoryItem,
  PlayerProfile,
} from '../types';

const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
const cleanBase = envApiUrl.replace(/\/$/, '');
const API_BASE = cleanBase ? (cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`) : '/api';

export interface ChatApiParams {
  missionId: number;
  prompt: string;
  selectedDocId?: string;
  activeDefenses?: DefenseConfig;
  previousHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionToken?: string;
  userId?: string;
}

export interface ChatApiResponse {
  reply: string;
  evaluation: EvaluationResult;
  providerStatus: {
    mode: 'simulation' | 'live';
    providerName: string;
    model: string;
    latencyMs: number;
  };
  missionCompleted: boolean;
  sessionStats: {
    attemptsCount: number;
    scoreDelta: number;
    totalEarnedXP: number;
  };
}

export interface ServerHealthResponse {
  mode: 'simulation' | 'live';
  model: string;
  online: boolean;
  databaseConnected: boolean;
  databaseName?: string;
}

// 1. Fetch Missions from MongoDB Backend
export async function fetchMissions(): Promise<{ missions: MissionDefinition[]; defenseMechanisms: DefenseMechanismInfo[] }> {
  const res = await fetch(`${API_BASE}/missions`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch missions (HTTP ${res.status})`);
  }
  return await res.json();
}

// 2. Submit prompt for evaluation & response
export async function sendChatMessage(params: ChatApiParams): Promise<ChatApiResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.details?.[0]?.message || errBody.error || `Server returned HTTP ${res.status}`;
    throw new Error(message);
  }

  return await res.json();
}

// 3. User Profile API: Fetch from MongoDB
export async function fetchUserProfile(userId: string): Promise<PlayerProfile> {
  const res = await fetch(`${API_BASE}/users/profile/${encodeURIComponent(userId)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// 4. User Profile API: Save/Upsert in MongoDB
export async function saveUserProfileApi(profile: {
  userId: string;
  nickname?: string;
  soundEnabled?: boolean;
  reducedMotion?: boolean;
  activeDefenses?: DefenseConfig;
}): Promise<PlayerProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.profile;
}

// 5. Game Session API: Create session in MongoDB
export async function createGameSession(params: {
  userId: string;
  missionId: number;
  activeDefenses?: DefenseConfig;
}): Promise<{ sessionId: string }> {
  const res = await fetch(`${API_BASE}/game/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// 6. Game Result API: Record mission completion in MongoDB
export async function recordGameResult(result: {
  userId: string;
  missionId: number;
  missionTitle: string;
  scoreAwarded: number;
  attemptsCount: number;
  timeTakenSeconds: number;
  isSecretLeaked: boolean;
  isDefenseBlocked: boolean;
  threatLevel: string;
  detectedCategories: string[];
  educationalTakeaway: string;
  sessionId?: string;
}): Promise<{ success: boolean; updatedProfile: PlayerProfile }> {
  const res = await fetch(`${API_BASE}/game/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// 7. Leaderboard API: Fetch real player rankings from MongoDB
export async function fetchLeaderboard(limit = 10): Promise<{
  leaderboard: LeaderboardEntry[];
  metadata: { totalPlayers: number; totalMissionsCompleted: number };
}> {
  const res = await fetch(`${API_BASE}/leaderboard?limit=${limit}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// 8. Game History API: Fetch user's previous game runs from MongoDB
export async function fetchGameHistory(userId: string, limit = 10): Promise<{
  history: GameHistoryItem[];
  recentSubmissions: any[];
}> {
  const res = await fetch(`${API_BASE}/game/history/${encodeURIComponent(userId)}?limit=${limit}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// 9. Benchmark API: Execute 12-test suite in Defense Lab
export async function runDefenseBenchmark(
  defenses: DefenseConfig,
  userId?: string
): Promise<DefenseSuiteReport> {
  const res = await fetch(`${API_BASE}/defense-lab/benchmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...defenses, userId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// 10. Health & Diagnostics API: Inspect MongoDB and AI Provider
export async function checkServerHealth(): Promise<ServerHealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      const data = await res.json();
      return {
        mode: data.provider?.mode || 'simulation',
        model: data.provider?.model || 'Simulated-CyberLLM-8B',
        online: true,
        databaseConnected: Boolean(data.database?.connected),
        databaseName: data.database?.name,
      };
    }
  } catch {
    // server unreachable
  }
  return {
    mode: 'simulation',
    model: 'Offline',
    online: false,
    databaseConnected: false,
  };
}

// 11. Reset demo sessions
export async function resetDemoSession(): Promise<void> {
  try {
    await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  } catch {
    // ignore
  }
}
