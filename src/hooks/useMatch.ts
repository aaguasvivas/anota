import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { teamPalette } from '../constants/colors';
import { DEFAULT_TARGET } from '../constants/layout';
import type { MatchState, Round, TeamId } from '../types';
import { makeId } from '../utils/id';
import { clearMatch, loadMatch, saveMatch } from '../utils/storage';

function initialMatch(): MatchState {
  // Team names default to '' — the UI fills in the localized default
  // (e.g. "Nosotros" / "Us") so it follows the active language until the
  // user explicitly renames.
  return {
    teams: {
      A: {
        id: 'A',
        name: '',
        score: 0,
        color: teamPalette.A.color,
        accent: teamPalette.A.accent,
      },
      B: {
        id: 'B',
        name: '',
        score: 0,
        color: teamPalette.B.color,
        accent: teamPalette.B.accent,
      },
    },
    targetScore: DEFAULT_TARGET,
    rounds: [],
    winnerId: null,
    startedAt: Date.now(),
  };
}

function detectWinner(state: MatchState): TeamId | null {
  const { teams, targetScore } = state;
  // Two ties are possible only if the increment crosses target exactly equally; we still pick the first that reached it.
  if (teams.A.score >= targetScore && teams.A.score >= teams.B.score) return 'A';
  if (teams.B.score >= targetScore && teams.B.score >= teams.A.score) return 'B';
  return null;
}

export function useMatch() {
  const [state, setState] = useState<MatchState>(initialMatch);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // Restore persisted match on first mount.
  useEffect(() => {
    (async () => {
      const stored = await loadMatch();
      if (stored) {
        // Re-apply palette in case constants have changed.
        stored.teams.A.color = teamPalette.A.color;
        stored.teams.A.accent = teamPalette.A.accent;
        stored.teams.B.color = teamPalette.B.color;
        stored.teams.B.accent = teamPalette.B.accent;
        setState(stored);
      }
      hydratedRef.current = true;
      setHydrated(true);
    })();
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveMatch(state);
  }, [state]);

  const addPoints = useCallback((teamId: TeamId, points: number) => {
    if (!points || points <= 0) return;
    setState((prev) => {
      if (prev.winnerId) return prev;
      const round: Round = {
        id: makeId(),
        teamId,
        points,
        timestamp: Date.now(),
      };
      const nextScore = prev.teams[teamId].score + points;
      const next: MatchState = {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: { ...prev.teams[teamId], score: nextScore },
        },
        rounds: [round, ...prev.rounds],
      };
      next.winnerId = detectWinner(next);
      return next;
    });
  }, []);

  const undoLast = useCallback(() => {
    setState((prev) => {
      if (prev.rounds.length === 0) return prev;
      const [last, ...rest] = prev.rounds;
      const team = prev.teams[last.teamId];
      const next: MatchState = {
        ...prev,
        teams: {
          ...prev.teams,
          [last.teamId]: {
            ...team,
            score: Math.max(0, team.score - last.points),
          },
        },
        rounds: rest,
        winnerId: null,
      };
      return next;
    });
  }, []);

  const renameTeam = useCallback((teamId: TeamId, name: string) => {
    // Empty trimmed name resets the team to its localized default
    // (the UI fills it in via teamDisplayName()).
    const trimmed = name.trim().slice(0, 24);
    setState((prev) => ({
      ...prev,
      teams: {
        ...prev.teams,
        [teamId]: { ...prev.teams[teamId], name: trimmed },
      },
    }));
  }, []);

  const setTargetScore = useCallback((target: number) => {
    const clean = Math.max(1, Math.floor(target));
    setState((prev) => ({
      ...prev,
      targetScore: clean,
      winnerId: detectWinner({ ...prev, targetScore: clean }),
    }));
  }, []);

  const resetMatch = useCallback(() => {
    setState((prev) => ({
      ...initialMatch(),
      // Keep team names + target between matches — that's how real games go.
      teams: {
        A: { ...initialMatch().teams.A, name: prev.teams.A.name },
        B: { ...initialMatch().teams.B, name: prev.teams.B.name },
      },
      targetScore: prev.targetScore,
    }));
  }, []);

  const dismissWinner = useCallback(() => {
    // "Keep Playing": clear winner flag but keep scores.
    setState((prev) => ({ ...prev, winnerId: null }));
  }, []);

  const hardReset = useCallback(async () => {
    await clearMatch();
    setState(initialMatch());
  }, []);

  const derived = useMemo(() => {
    const { teams, targetScore } = state;
    return {
      progressA: Math.min(1, teams.A.score / targetScore),
      progressB: Math.min(1, teams.B.score / targetScore),
      leader:
        teams.A.score === teams.B.score
          ? null
          : ((teams.A.score > teams.B.score ? 'A' : 'B') as TeamId),
    };
  }, [state]);

  return {
    state,
    hydrated,
    addPoints,
    undoLast,
    renameTeam,
    setTargetScore,
    resetMatch,
    dismissWinner,
    hardReset,
    ...derived,
  };
}
