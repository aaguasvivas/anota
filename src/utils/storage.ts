import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MatchState, Round, Team, TeamId } from '../types';

const KEY = '@anota:match:v1';

export async function loadMatch(): Promise<MatchState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isMatchState(parsed)) return null;
    // Sanitize/migrate: clamp targetScore to >=1 (self-heal a bad blob) and
    // default the acknowledged flag for matches saved before it existed.
    return {
      ...parsed,
      targetScore: Math.max(1, Math.floor(parsed.targetScore)),
      winnerAcknowledged: parsed.winnerAcknowledged ?? false,
    };
  } catch {
    return null;
  }
}

function isMatchState(value: unknown): value is MatchState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<MatchState>;
  if (typeof v.targetScore !== 'number' || !Number.isFinite(v.targetScore)) return false;
  if (typeof v.startedAt !== 'number') return false;
  if (v.winnerId !== null && v.winnerId !== 'A' && v.winnerId !== 'B') return false;
  if (v.winnerAcknowledged !== undefined && typeof v.winnerAcknowledged !== 'boolean') return false;
  if (!Array.isArray(v.rounds) || !v.rounds.every(isRound)) return false;
  if (!v.teams || !isTeam(v.teams.A, 'A') || !isTeam(v.teams.B, 'B')) return false;
  return true;
}

function isTeam(value: unknown, id: TeamId): value is Team {
  if (!value || typeof value !== 'object') return false;
  const t = value as Partial<Team>;
  return (
    t.id === id &&
    typeof t.name === 'string' &&
    typeof t.score === 'number' &&
    Number.isFinite(t.score) &&
    typeof t.color === 'string'
  );
}

function isRound(value: unknown): value is Round {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<Round>;
  return (
    typeof r.id === 'string' &&
    (r.teamId === 'A' || r.teamId === 'B') &&
    typeof r.points === 'number' &&
    Number.isFinite(r.points) &&
    typeof r.timestamp === 'number'
  );
}

export async function saveMatch(state: MatchState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Persistence failures are non-fatal — the match continues in memory.
  }
}
