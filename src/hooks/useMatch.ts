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
  // The latest state, updated with every change before React renders it. Two
  // taps can run in one JS task, before a render, so the haptic and the
  // VoiceOver announcement read this instead of the rendered state.
  const latestRef = useRef(state);
  const update = useCallback((fn: (prev: MatchState) => MatchState) => {
    const next = fn(latestRef.current);
    latestRef.current = next;
    setState(next);
    return next;
  }, []);
  const latest = useCallback(() => latestRef.current, []);

  // Restore persisted match on first mount.
  useEffect(() => {
    (async () => {
      const stored = await loadMatch();
      if (stored) {
        // Re-apply palette colors in case constants changed (e.g. Team B blue).
        stored.teams.A.color = teamPalette.A.color;
        stored.teams.B.color = teamPalette.B.color;
        update(() => stored);
      }
      hydratedRef.current = true;
      setHydrated(true);
    })();
  }, [update]);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveMatch(state);
  }, [state]);

  const addPoints = useCallback(
    (teamId: TeamId, points: number) => update((prev) => applyPoints(prev, teamId, points)),
    [update],
  );
  const undoLast = useCallback(() => update(applyUndo), [update]);
  const removeRound = useCallback(
    (roundId: string) => update((prev) => applyRemoveRound(prev, roundId)),
    [update],
  );
  const renameTeam = useCallback(
    (teamId: TeamId, name: string) => update((prev) => applyRename(prev, teamId, name)),
    [update],
  );
  const setTargetScore = useCallback(
    (target: number) => update((prev) => applyTarget(prev, target)),
    [update],
  );
  const resetMatch = useCallback(() => update(resetKeepingSettings), [update]);
  const dismissWinner = useCallback(() => update(acknowledgeWinner), [update]);
  // DEV capture harness: put the match into an exact state for screenshots.
  const devReplace = useCallback((next: MatchState) => update(() => next), [update]);

  const derived = useMemo(() => {
    const { teams } = state;
    return {
      leader:
        teams.A.score === teams.B.score
          ? null
          : ((teams.A.score > teams.B.score ? 'A' : 'B') as TeamId),
    };
  }, [state]);

  return {
    state,
    latest,
    hydrated,
    addPoints,
    undoLast,
    removeRound,
    renameTeam,
    setTargetScore,
    resetMatch,
    dismissWinner,
    devReplace,
    ...derived,
  };
}
