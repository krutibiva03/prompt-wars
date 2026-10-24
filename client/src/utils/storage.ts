import { PlayerProfile, Achievement } from '../types';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Complete your first mission in the Prompt Wars arena.',
    icon: '⚔️',
    points: 100,
  },
  {
    id: 'secret_sentinel',
    title: 'Secret Sentinel',
    description: 'Prevent the AI assistant from leaking protected staging secrets.',
    icon: '🛡️',
    points: 125,
  },
  {
    id: 'injection_hunter',
    title: 'Injection Hunter',
    description: 'Pinpoint an indirect prompt injection payload concealed inside an external document.',
    icon: '🎯',
    points: 150,
  },
  {
    id: 'blue_team_hero',
    title: 'Blue Team Hero',
    description: 'Configure active defenses to pass the automated adversarial test suite.',
    icon: '🏰',
    points: 150,
  },
  {
    id: 'flawless_defense',
    title: 'Flawless Bastion',
    description: 'Attain 100% Security Score with 0 false negatives in the Defense Lab.',
    icon: '💎',
    points: 200,
  },
  {
    id: 'final_boss_conqueror',
    title: 'Final Boss Conqueror',
    description: 'Successfully complete all five Prompt Wars training missions.',
    icon: '👑',
    points: 300,
  },
];

const STORAGE_KEY = 'prompt_wars_guest_profile_v2';
const USER_ID_KEY = 'prompt_wars_user_id_v2';

export function getOrInitUserId(): string {
  if (typeof window === 'undefined') return 'guest_default';
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    return 'guest_default';
  }
}

export const DEFAULT_PROFILE: PlayerProfile = {
  userId: 'guest_default',
  nickname: 'Guest Auditor',
  xp: 0,
  level: 1,
  completedMissions: [],
  bestMissionScores: {},
  unlockedAchievements: [],
  activeDefenses: {
    instructionHierarchy: false,
    documentIsolation: false,
    outputFiltering: false,
    structuredValidation: false,
    leastPrivilegeTools: false,
  },
  stats: {
    threatsIdentified: 0,
    attacksBlocked: 0,
    indirectInjectionsFound: 0,
    perfectDefenses: 0,
    totalSubmissions: 0,
  },
  soundEnabled: true,
  reducedMotion: false,
};

export function calculateLevel(xp: number): number {
  if (xp < 150) return 1;
  if (xp < 350) return 2;
  if (xp < 650) return 3;
  if (xp < 1050) return 4;
  return 5;
}

export function getRankTitle(level: number): string {
  switch (level) {
    case 1: return 'Novice Auditor';
    case 2: return 'Junior Red Teamer';
    case 3: return 'AI Security Analyst';
    case 4: return 'Senior Guardrail Engineer';
    case 5: return 'Principal Prompt Defense Master';
    default: return 'Security Researcher';
  }
}

export function loadPlayerProfile(): PlayerProfile {
  const currentUserId = getOrInitUserId();
  if (typeof window === 'undefined') return { ...DEFAULT_PROFILE, userId: currentUserId };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE, userId: currentUserId };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      userId: parsed.userId || currentUserId,
      activeDefenses: {
        ...DEFAULT_PROFILE.activeDefenses,
        ...(parsed.activeDefenses || {}),
      },
      stats: {
        ...DEFAULT_PROFILE.stats,
        ...(parsed.stats || {}),
      },
    };
  } catch {
    return { ...DEFAULT_PROFILE, userId: currentUserId };
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function resetPlayerProfile(): PlayerProfile {
  const currentUserId = getOrInitUserId();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { ...DEFAULT_PROFILE, userId: currentUserId };
}
