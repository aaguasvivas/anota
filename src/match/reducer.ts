import { teamPalette } from '../constants/colors';
import { DEFAULT_TARGET } from '../constants/layout';
import type { MatchState, Round, TeamId } from '../types';
import { makeId } from '../utils/id';

export function createMatch(): MatchState {
  return {
    teams: {
      A: { id: 'A', name: '', score: 0, color: teamPalette.A.color },
      B: { id: 'B', name: '', score: 0, color: teamPalette.B.color },
    },
    targetScore: DEFAULT_TARGET,
    rounds: [],
    winnerId: null,
    winnerAcknowledged: false,
    startedAt: Date.now(),
  };
}

export function detectWinner(state: MatchState): TeamId | null {
  const { teams, targetScore } = state;
  if (teams.A.score >= targetScore && teams.A.score >= teams.B.score) return 'A';
  if (teams.B.score >= targetScore && teams.B.score >= teams.A.score) return 'B';
  return null;
}

// Recompute the winner and enforce the invariant: winnerAcknowledged can only
// be true while a winner is standing. Once nobody is at target, it resets.
function settle(state: MatchState): MatchState {
  const winnerId = detectWinner(state);
  return {
    ...state,
    winnerId,
    winnerAcknowledged: winnerId ? state.winnerAcknowledged : false,
  };
}

export function applyPoints(state: MatchState, teamId: TeamId, points: number): MatchState {
  if (!points || points <= 0) return state;
  // Block scoring only while an unacknowledged winner modal is up.
  if (state.winnerId && !state.winnerAcknowledged) return state;
  const round: Round = { id: makeId(), teamId, points, timestamp: Date.now() };
  const nextScore = state.teams[teamId].score + points;
  return settle({
    ...state,
    teams: {
      ...state.teams,
      [teamId]: { ...state.teams[teamId], score: nextScore },
    },
    rounds: [round, ...state.rounds],
  });
}

export function applyUndo(state: MatchState): MatchState {
  if (state.rounds.length === 0) return state;
  const [last, ...rest] = state.rounds;
  const team = state.teams[last.teamId];
  return settle({
    ...state,
    teams: {
      ...state.teams,
      [last.teamId]: { ...team, score: Math.max(0, team.score - last.points) },
    },
    rounds: rest,
  });
}

export function applyRemoveRound(state: MatchState, roundId: string): MatchState {
  const target = state.rounds.find((r) => r.id === roundId);
  if (!target) return state;
  const team = state.teams[target.teamId];
  return settle({
    ...state,
    teams: {
      ...state.teams,
      [target.teamId]: { ...team, score: Math.max(0, team.score - target.points) },
    },
    rounds: state.rounds.filter((r) => r.id !== roundId),
  });
}

export function applyTarget(state: MatchState, target: number): MatchState {
  const clean = Math.max(1, Math.floor(target));
  return settle({ ...state, targetScore: clean });
}

export function applyRename(state: MatchState, teamId: TeamId, name: string): MatchState {
  const trimmed = name.trim().slice(0, 24);
  return {
    ...state,
    teams: {
      ...state.teams,
      [teamId]: { ...state.teams[teamId], name: trimmed },
    },
  };
}

export function acknowledgeWinner(state: MatchState): MatchState {
  // "Keep playing": keep scores + winnerId, just silence the modal.
  return { ...state, winnerAcknowledged: true };
}

export function resetKeepingSettings(state: MatchState): MatchState {
  const fresh = createMatch();
  return {
    ...fresh,
    teams: {
      A: { ...fresh.teams.A, name: state.teams.A.name },
      B: { ...fresh.teams.B, name: state.teams.B.name },
    },
    targetScore: state.targetScore,
  };
}
