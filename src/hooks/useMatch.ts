import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { teamPalette } from '../constants/colors';
import {
  acknowledgeWinner,
  applyPoints,
  applyRemoveRound,
  applyRename,
  applyTarget,
  applyUndo,
  createMatch,
  resetKeepingSettings,
} from '../match/reducer';
import type { MatchState, TeamId } from '../types';
import { loadMatch, saveMatch } from '../utils/storage';

export function useMatch() {
  const [state, setState] = useState<MatchState>(createMatch);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // Restore persisted match on first mount.
  useEffect(() => {
    (async () => {
      const stored = await loadMatch();
      if (stored) {
        // Re-apply palette colors in case constants changed (e.g. Team B blue).
        stored.teams.A.color = teamPalette.A.color;
        stored.teams.B.color = teamPalette.B.color;
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
    setState((prev) => applyPoints(prev, teamId, points));
  }, []);
  const undoLast = useCallback(() => setState(applyUndo), []);
  const removeRound = useCallback((roundId: string) => {
    setState((prev) => applyRemoveRound(prev, roundId));
  }, []);
  const renameTeam = useCallback((teamId: TeamId, name: string) => {
    setState((prev) => applyRename(prev, teamId, name));
  }, []);
  const setTargetScore = useCallback((target: number) => {
    setState((prev) => applyTarget(prev, target));
  }, []);
  const resetMatch = useCallback(() => setState(resetKeepingSettings), []);
  const dismissWinner = useCallback(() => setState(acknowledgeWinner), []);

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
    removeRound,
    renameTeam,
    setTargetScore,
    resetMatch,
    dismissWinner,
    ...derived,
  };
}
