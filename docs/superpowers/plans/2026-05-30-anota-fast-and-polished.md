# Anota - "Fast & Polished" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Anota's score entry instant (hybrid presets + in-app keypad), fix the Keep-Playing winner bug, polish visuals (vector icons, brighter Team B, breathing room), remove dead code, and ship a code-generated app icon - without backend/auth and preserving in-progress games.

**Architecture:** Extract match logic into a pure, unit-tested reducer (`src/match/reducer.ts`) that `useMatch` wraps. The screen stays a single non-scrolling split view; the per-team pad becomes 3 instant preset chips + a hero "＋ POINTS" button that opens a new in-app `ScoreKeypad` bottom sheet (no OS keyboard). A `winnerAcknowledged` flag fixes the Keep-Playing nag. Icons are rendered from a code-defined SVG via `rsvg-convert`.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript (strict), AsyncStorage, `@expo/vector-icons` (Ionicons), Jest + ts-jest (pure-logic tests), `rsvg-convert` (icon rasterizing).

**Reference spec:** `docs/superpowers/specs/2026-05-30-anota-fast-and-polished-design.md`

---

## File Structure

**New files**
- `src/match/reducer.ts` - pure match-state functions (createMatch, applyPoints, applyUndo, applyRemoveRound, applyTarget, applyRename, acknowledgeWinner, resetKeepingSettings, detectWinner).
- `src/match/__tests__/reducer.test.ts` - unit tests for the reducer.
- `src/components/ScoreKeypad.tsx` - in-app numeric keypad bottom sheet (replaces CustomScoreModal).
- `jest.config.js` - ts-jest config for pure-logic tests.
- `scripts/gen-icons.mjs` - code-defined SVG → PNG icon generator.
- `assets/icon.svg` - generated source of truth for the icon (written by the script).

**Modified files**
- `src/types/index.ts` - add `winnerAcknowledged`, remove `Team.accent`.
- `src/hooks/useMatch.ts` - thin wrapper around the reducer.
- `src/utils/storage.ts` - lenient validation/migration (drop accent, default winnerAcknowledged).
- `src/constants/colors.ts` - Team B blue rebalance, drop `accent`/`pip` from palette.
- `src/constants/layout.ts` - `QUICK_SCORES = [25,30,50]`, remove `PRIMARY_QUICK_SCORES`.
- `src/components/ScorePad.tsx` - chips + hero button, no header label.
- `src/components/ScoreButton.tsx` - remove `small`/`labelSmall`.
- `src/components/TeamCard.tsx` - pencil icon.
- `src/components/TargetPill.tsx` - pencil icon.
- `src/components/WinnerModal.tsx` - share icon.
- `src/i18n/{types,es,en}.ts` - add `team.addPoints`, `chrome.delete`; remove dead keys.
- `App.tsx` - keypad swap, hydration gate, winner-acknowledged visibility, vector icons.
- `package.json` - deps + `test` script.

**Deleted**
- `src/components/CustomScoreModal.tsx`.

---

## Task 1: Dev dependencies + test tooling

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`

- [ ] **Step 1: Install the icon library (Expo-compatible) and test tooling**

Run:
```bash
npx expo install @expo/vector-icons
npm install -D jest@^29 ts-jest@^29 @types/jest@^29
```
Expected: installs succeed; `@expo/vector-icons` lands in `dependencies`, the rest in `devDependencies`.

- [ ] **Step 2: Add the `test` script**

In `package.json`, add to `"scripts"`:
```json
    "test": "jest --passWithNoTests"
```
(Place it alongside the existing `start`/`android`/`ios`/`web` scripts.)

- [ ] **Step 3: Create `jest.config.js`**

```js
/** Pure-logic tests only (no React Native). ts-jest compiles to CommonJS. */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', esModuleInterop: true, isolatedModules: true } },
    ],
  },
};
```

- [ ] **Step 4: Verify the harness runs**

Run: `npm test`
Expected: `No tests found, exiting with code 0` (passWithNoTests).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json jest.config.js
git commit -m "Add @expo/vector-icons + jest/ts-jest test tooling"
```

---

## Task 2: Core match logic - types, pure reducer, hook, storage (TDD)

This is the atomic core-logic change. It ends with whole-project `tsc` green and the reducer fully tested.

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/match/reducer.ts`
- Create: `src/match/__tests__/reducer.test.ts`
- Modify: `src/hooks/useMatch.ts`
- Modify: `src/utils/storage.ts`

- [ ] **Step 1: Write the failing reducer tests**

Create `src/match/__tests__/reducer.test.ts`:
```ts
import {
  acknowledgeWinner,
  applyPoints,
  applyRemoveRound,
  applyUndo,
  createMatch,
  detectWinner,
} from '../reducer';
import type { MatchState } from '../../types';

function base(): MatchState {
  return { ...createMatch(), targetScore: 100 };
}

test('applyPoints adds to score and records a round, most-recent-first', () => {
  let s = base();
  s = applyPoints(s, 'A', 30);
  s = applyPoints(s, 'A', 25);
  expect(s.teams.A.score).toBe(55);
  expect(s.rounds).toHaveLength(2);
  expect(s.rounds[0].points).toBe(25);
  expect(s.rounds[1].points).toBe(30);
});

test('detectWinner flags the team at or above target', () => {
  let s = base();
  s = applyPoints(s, 'B', 100);
  expect(s.winnerId).toBe('B');
  expect(detectWinner(s)).toBe('B');
});

test('applyUndo reverses the last round and clears winner state', () => {
  let s = base();
  s = applyPoints(s, 'A', 100);
  expect(s.winnerId).toBe('A');
  s = applyUndo(s);
  expect(s.teams.A.score).toBe(0);
  expect(s.winnerId).toBeNull();
  expect(s.winnerAcknowledged).toBe(false);
  expect(s.rounds).toHaveLength(0);
});

test('applyRemoveRound removes a specific round and re-derives score', () => {
  let s = base();
  s = applyPoints(s, 'A', 30);
  const firstId = s.rounds[0].id;
  s = applyPoints(s, 'A', 25);
  s = applyRemoveRound(s, firstId);
  expect(s.teams.A.score).toBe(25);
  expect(s.rounds).toHaveLength(1);
  expect(s.rounds.find((r) => r.id === firstId)).toBeUndefined();
});

test('scoring is blocked while an unacknowledged winner modal is up', () => {
  let s = base();
  s = applyPoints(s, 'A', 100); // A wins, not acknowledged
  s = applyPoints(s, 'B', 10); // ignored
  expect(s.teams.B.score).toBe(0);
});

test('keep-playing: after acknowledge, more points do not re-arm the modal', () => {
  let s = base();
  s = applyPoints(s, 'A', 100);
  s = acknowledgeWinner(s);
  expect(s.winnerAcknowledged).toBe(true);
  s = applyPoints(s, 'B', 10); // allowed now
  expect(s.teams.B.score).toBe(10);
  expect(s.winnerId).toBe('A');
  expect(s.winnerAcknowledged).toBe(true); // still acknowledged → no modal
});

test('undo below target re-arms celebration (acknowledged resets)', () => {
  let s = base();
  s = applyPoints(s, 'A', 100);
  s = acknowledgeWinner(s);
  s = applyUndo(s);
  expect(s.winnerId).toBeNull();
  expect(s.winnerAcknowledged).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL - `Cannot find module '../reducer'`.

- [ ] **Step 3: Update the types**

Replace the entire contents of `src/types/index.ts`:
```ts
export type TeamId = 'A' | 'B';

export type Round = {
  id: string;
  teamId: TeamId;
  points: number;
  timestamp: number;
};

export type Team = {
  id: TeamId;
  name: string;
  score: number;
  color: string;
};

export type MatchState = {
  teams: Record<TeamId, Team>;
  targetScore: number;
  rounds: Round[];
  winnerId: TeamId | null;
  winnerAcknowledged: boolean;
  startedAt: number;
};
```

- [ ] **Step 4: Create the pure reducer**

Create `src/match/reducer.ts`:
```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (7 tests).

- [ ] **Step 6: Rewire `useMatch` to wrap the reducer**

Replace the entire contents of `src/hooks/useMatch.ts`:
```ts
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
```

- [ ] **Step 7: Make storage lenient (drop accent, default the new flag)**

In `src/utils/storage.ts`, replace `loadMatch`, `isMatchState`, and `isTeam`:
```ts
export async function loadMatch(): Promise<MatchState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isMatchState(parsed)) return null;
    // Default the acknowledged flag for matches saved before it existed.
    return { ...parsed, winnerAcknowledged: parsed.winnerAcknowledged ?? false };
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
```
(Leave `saveMatch` and `isRound` unchanged.)

- [ ] **Step 8: Verify whole project type-checks and tests pass**

Run: `npx tsc --noEmit && npm test`
Expected: tsc prints nothing (exit 0); jest passes 7 tests.

- [ ] **Step 9: Commit**

```bash
git add src/types/index.ts src/match/ src/hooks/useMatch.ts src/utils/storage.ts
git commit -m "Extract pure match reducer + winnerAcknowledged; lenient storage migration"
```

---

## Task 3: Team B blue rebalance + palette cleanup

**Files:**
- Modify: `src/constants/colors.ts`

- [ ] **Step 1: Brighten blue and trim the palette**

In `src/constants/colors.ts`, change the blue value:
```ts
  blue: '#3B82F6',
```
Then replace the `teamPalette` export (drops unused `accent` and `pip`, updates B glow):
```ts
export const teamPalette = {
  A: {
    color: colors.red,
    glow: 'rgba(230, 57, 70, 0.35)',
  },
  B: {
    color: colors.blue,
    glow: 'rgba(59, 130, 246, 0.35)',
  },
} as const;
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0, no output. (Only `teamPalette.A.color`/`B.color`/`.glow` are referenced anywhere.)

- [ ] **Step 3: Commit**

```bash
git add src/constants/colors.ts
git commit -m "Rebalance Team B to a brighter blue; drop unused palette fields"
```

---

## Task 4: i18n additions (new strings)

Add the two new strings first; removals come after their consumers are gone (Task 8).

**Files:**
- Modify: `src/i18n/types.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`

- [ ] **Step 1: Add keys to the dictionary type**

In `src/i18n/types.ts`, inside `chrome`, add after `done: string;`:
```ts
    delete: string;
```
Inside `team`, add after `customForA11y: (name: string) => string;`:
```ts
    addPoints: string;
```

- [ ] **Step 2: Add Spanish strings**

In `src/i18n/es.ts`, inside `chrome`, after `done: 'Listo',` add:
```ts
    delete: 'Borrar',
```
Inside `team`, after the `customForA11y` line add:
```ts
    addPoints: 'Puntos',
```

- [ ] **Step 3: Add English strings**

In `src/i18n/en.ts`, inside `chrome`, after `done: 'Done',` add:
```ts
    delete: 'Delete',
```
Inside `team`, after the `customForA11y` line add:
```ts
    addPoints: 'Points',
```

- [ ] **Step 4: Verify type-check (dictionary parity is enforced)**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/types.ts src/i18n/es.ts src/i18n/en.ts
git commit -m "i18n: add team.addPoints and chrome.delete"
```

---

## Task 5: ScoreKeypad component (in-app keypad) + remove CustomScoreModal

**Files:**
- Create: `src/components/ScoreKeypad.tsx`
- Delete: `src/components/CustomScoreModal.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Create the keypad**

Create `src/components/ScoreKeypad.tsx`:
```tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team } from '../types';

type Props = {
  visible: boolean;
  team: Team | null;
  onCancel: () => void;
  onSubmit: (value: number) => void;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function ScoreKeypad({ visible, team, onCancel, onSubmit }: Props) {
  const { t } = useT();
  const [entry, setEntry] = useState('');
  const color = team?.color ?? colors.gold;
  const name = team ? teamDisplayName(team, t) : '';
  const canAdd = parseInt(entry, 10) > 0;

  useEffect(() => {
    if (visible) setEntry('');
  }, [visible]);

  function pressDigit(d: string) {
    setEntry((prev) => (prev + d).replace(/^0+/, '').slice(0, 3));
  }
  function backspace() {
    setEntry((prev) => prev.slice(0, -1));
  }
  function commit() {
    const parsed = parseInt(entry, 10);
    if (Number.isFinite(parsed) && parsed > 0) onSubmit(parsed);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t.chrome.cancel}
        />
        <View style={[styles.sheet, { borderColor: `${color}66` }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t.customModal.titleFor}</Text>
          <Text style={[styles.team, { color }]} numberOfLines={1}>
            {name}
          </Text>

          <Text style={[styles.entry, { color }]} numberOfLines={1}>
            {entry || '0'}
          </Text>
          <View style={[styles.rule, { backgroundColor: `${color}55` }]} />

          <View style={styles.grid}>
            {DIGITS.map((d) => (
              <Pressable
                key={d}
                onPress={() => pressDigit(d)}
                accessibilityRole="button"
                accessibilityLabel={d}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
              >
                <Text style={styles.keyText}>{d}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={backspace}
              accessibilityRole="button"
              accessibilityLabel={t.chrome.delete}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            >
              <Ionicons name="backspace-outline" size={26} color={colors.textDim} />
            </Pressable>
            <Pressable
              onPress={() => pressDigit('0')}
              accessibilityRole="button"
              accessibilityLabel="0"
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>
            <Pressable
              onPress={commit}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel={t.chrome.add}
              accessibilityState={{ disabled: !canAdd }}
              style={({ pressed }) => [
                styles.key,
                { backgroundColor: canAdd ? color : `${color}40` },
                pressed && canAdd && styles.keyPressed,
              ]}
            >
              <Text style={[styles.addText, { color: canAdd ? colors.tileInk : colors.textFaint }]}>
                {t.chrome.add}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onCancel}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.cancel}
            style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.cancelText}>{t.chrome.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.felt,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 12,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textDim,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  team: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  entry: {
    fontSize: 60,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.sm,
  },
  rule: {
    height: 2,
    borderRadius: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  key: {
    width: '31%',
    minHeight: 62,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  keyPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  keyText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  addText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cancel: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
```

- [ ] **Step 2: Delete the old modal**

Run: `git rm src/components/CustomScoreModal.tsx`

- [ ] **Step 3: Swap the import + usage in `App.tsx`**

In `App.tsx`, change the import line:
```tsx
import { CustomScoreModal } from './src/components/CustomScoreModal';
```
to:
```tsx
import { ScoreKeypad } from './src/components/ScoreKeypad';
```
Then replace the `<CustomScoreModal ... />` block:
```tsx
      <CustomScoreModal
        visible={customFor !== null}
        teamId={customFor}
        team={customFor ? match.state.teams[customFor] : null}
        onCancel={() => setCustomFor(null)}
        onSubmit={(value) => {
          if (customFor) {
            handleAdd(customFor, value);
          }
          setCustomFor(null);
        }}
      />
```
with:
```tsx
      <ScoreKeypad
        visible={customFor !== null}
        team={customFor ? match.state.teams[customFor] : null}
        onCancel={() => setCustomFor(null)}
        onSubmit={(value) => {
          if (customFor) {
            handleAdd(customFor, value);
          }
          setCustomFor(null);
        }}
      />
```

- [ ] **Step 4: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add App.tsx src/components/ScoreKeypad.tsx src/components/CustomScoreModal.tsx
git commit -m "Add in-app ScoreKeypad bottom sheet; remove CustomScoreModal"
```

---

## Task 6: ScorePad redesign (chips + hero button) + preset trim

**Files:**
- Modify: `src/constants/layout.ts`
- Modify: `src/components/ScorePad.tsx`

- [ ] **Step 1: Trim presets and remove the obsolete constant**

In `src/constants/layout.ts`, replace:
```ts
export const QUICK_SCORES = [25, 30, 50, 75, 100] as const;

// Hands that are most frequent at a Dominican table get visual weight.
// 30 (a "treinta") and 50 are by far the most-tapped values.
export const PRIMARY_QUICK_SCORES = [30, 50] as const;
```
with:
```ts
// Fixed-score events at a Dominican table: passes / capicúa / multi-pass.
// Arbitrary pip counts are entered on the keypad instead.
export const QUICK_SCORES = [25, 30, 50] as const;
```

- [ ] **Step 2: Rewrite ScorePad**

Replace the entire contents of `src/components/ScorePad.tsx`:
```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { QUICK_SCORES, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team, TeamId } from '../types';
import { ScoreButton } from './ScoreButton';

type Props = {
  team: Team;
  teamId: TeamId;
  onAdd: (teamId: TeamId, points: number) => void;
  onCustom: (teamId: TeamId) => void;
};

export function ScorePad({ team, teamId, onAdd, onCustom }: Props) {
  const { t } = useT();
  const displayName = teamDisplayName(team, t);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {QUICK_SCORES.map((pts) => (
          <ScoreButton
            key={pts}
            label={`+${pts}`}
            color={team.color}
            subdued
            onPress={() => onAdd(teamId, pts)}
            accessibilityLabel={t.team.plusForA11y(displayName, pts)}
            style={styles.cell}
          />
        ))}
      </View>
      <ScoreButton
        label={`+ ${t.team.addPoints}`}
        color={team.color}
        onPress={() => onCustom(teamId)}
        accessibilityLabel={t.team.customForA11y(displayName)}
        style={styles.hero}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  hero: {
    marginTop: spacing.sm,
    minHeight: 52,
  },
});
```

- [ ] **Step 3: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0. (ScorePad no longer references `t.team.plusFor`, `t.chrome.customAdd`, or `PRIMARY_QUICK_SCORES`.)

- [ ] **Step 4: Commit**

```bash
git add src/constants/layout.ts src/components/ScorePad.tsx
git commit -m "Redesign ScorePad: 3 instant preset chips + hero keypad button"
```

---

## Task 7: ScoreButton cleanup (remove unused small variant)

**Files:**
- Modify: `src/components/ScoreButton.tsx`

- [ ] **Step 1: Remove `small`/`labelSmall`**

Replace the entire contents of `src/components/ScoreButton.tsx`:
```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { radii } from '../constants/layout';

type Props = {
  label: string;
  onPress: () => void;
  color: string;
  style?: ViewStyle;
  outline?: boolean;
  // Lower visual weight; team-color tint instead of full fill.
  subdued?: boolean;
  accessibilityLabel?: string;
};

export function ScoreButton({
  label,
  onPress,
  color,
  style,
  outline,
  subdued,
  accessibilityLabel,
}: Props) {
  const bg = outline ? undefined : subdued ? `${color}26` : color;
  const labelColor = outline || subdued ? color : colors.tile;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        outline && { borderColor: color, borderWidth: 1.5 },
        subdued && { borderColor: `${color}66`, borderWidth: 1 },
        bg ? { backgroundColor: bg } : null,
        pressed && styles.pressed,
        style,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
    >
      <View pointerEvents="none">
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  label: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScoreButton.tsx
git commit -m "ScoreButton: drop unused small/labelSmall variant"
```

---

## Task 8: Delete dead i18n keys

All consumers are now gone (CustomScoreModal deleted, ScorePad header removed).

**Files:**
- Modify: `src/i18n/types.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`

- [ ] **Step 1: Remove dead keys from the type**

In `src/i18n/types.ts`, delete these lines:
- In `brand`: `tagline: string;`
- In `chrome`: `reset: string;`, `ok: string;`, `customAdd: string;`, `footerTagline: string;`
- In `team`: `plusFor: (name: string) => string;`
- In `customModal`: `placeholder: string;`
- In `history`: `emptyTitle: string;`
- The entire `reset` block:
  ```ts
    reset: {
      title: string;
      message: string;
      confirm: string;
    };
  ```

- [ ] **Step 2: Remove the same keys from Spanish**

In `src/i18n/es.ts`, delete:
- `tagline: 'Anotador de dominó',`
- `reset: 'Reiniciar',`
- `ok: 'OK',`
- `customAdd: 'Otro',`
- `footerTagline: 'Hecho pa’ la mesa dominicana · dominó, capicúa y café',`
- `plusFor: (name) => \`+ para ${name}\`,`
- `placeholder: '0',`
- `emptyTitle: 'Todavía no se ha jugao’',`
- the whole `reset: { title: ..., message: ..., confirm: 'Reiniciar' },` block

- [ ] **Step 3: Remove the same keys from English**

In `src/i18n/en.ts`, delete:
- `tagline: 'Domino Scorekeeper',`
- `reset: 'Reset',`
- `ok: 'OK',`
- `customAdd: 'Other',`
- `footerTagline: 'Made for the table · tiles, capicúa, café',`
- `plusFor: (name) => \`+ for ${name}\`,`
- `placeholder: '0',`
- `emptyTitle: 'No rounds yet',`
- the whole `reset: { title: ..., message: ..., confirm: 'Reset' },` block

- [ ] **Step 4: Verify type-check (parity + no stale references)**

Run: `npx tsc --noEmit`
Expected: exit 0. If tsc reports a key still in use, that reference was missed - re-check before deleting.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/types.ts src/i18n/es.ts src/i18n/en.ts
git commit -m "i18n: remove dead keys (tagline, reset.*, ok, customAdd, footerTagline, plusFor, placeholder, emptyTitle)"
```

---

## Task 9: Vector icons across remaining chrome

**Files:**
- Modify: `App.tsx`, `src/components/TeamCard.tsx`, `src/components/TargetPill.tsx`, `src/components/WinnerModal.tsx`

- [ ] **Step 1: App header + footer icons**

In `App.tsx`, add the import near the top (with the other component imports):
```tsx
import { Ionicons } from '@expo/vector-icons';
```
Replace the settings gear glyph:
```tsx
            <Text style={styles.iconBtnText}>⚙︎</Text>
```
with:
```tsx
            <Ionicons name="settings-outline" size={18} color={colors.textDim} />
```
Replace the undo button label:
```tsx
            <Text style={styles.footerBtnText}>↶ {t.chrome.undo}</Text>
```
with:
```tsx
            <View style={styles.footerBtnInner}>
              <Ionicons name="arrow-undo-outline" size={16} color={colors.textDim} />
              <Text style={styles.footerBtnText}>{t.chrome.undo}</Text>
            </View>
```
Replace the new-match button label:
```tsx
            <Text style={styles.footerBtnText}>⟲ {t.chrome.newMatch}</Text>
```
with:
```tsx
            <View style={styles.footerBtnInner}>
              <Ionicons name="reload-outline" size={16} color={colors.textDim} />
              <Text style={styles.footerBtnText}>{t.chrome.newMatch}</Text>
            </View>
```
Add a `footerBtnInner` style to the `StyleSheet.create({ ... })` block in `App.tsx`:
```tsx
  footerBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
```

- [ ] **Step 2: TeamCard pencil**

In `src/components/TeamCard.tsx`, add the import:
```tsx
import { Ionicons } from '@expo/vector-icons';
```
Replace the edit glyph:
```tsx
            <Text style={[styles.editIcon, { color: team.color }]}>✎</Text>
```
with:
```tsx
            <Ionicons name="pencil" size={13} color={team.color} style={styles.editIcon} />
```
Then in the `StyleSheet`, simplify the `editIcon` style (drop text-only props):
```tsx
  editIcon: {
    opacity: 0.55,
  },
```

- [ ] **Step 3: TargetPill pencil**

In `src/components/TargetPill.tsx`, add the import:
```tsx
import { Ionicons } from '@expo/vector-icons';
```
Replace BOTH occurrences of the hint glyph (one in the editing branch is absent - only the non-editing branch has it):
```tsx
      <Text style={styles.hint}>✎</Text>
```
with:
```tsx
      <Ionicons name="pencil" size={11} color={colors.gold} style={styles.hint} />
```
Then simplify the `hint` style:
```tsx
  hint: {
    opacity: 0.7,
  },
```

- [ ] **Step 4: WinnerModal share icon**

In `src/components/WinnerModal.tsx`, add the import:
```tsx
import { Ionicons } from '@expo/vector-icons';
```
Replace the share button's inner content:
```tsx
            <Text style={styles.shareText}>{t.winner.share}</Text>
```
with:
```tsx
            <View style={styles.shareInner}>
              <Ionicons name="share-outline" size={15} color={colors.gold} />
              <Text style={styles.shareText}>{t.winner.share}</Text>
            </View>
```
Add a `shareInner` style to the `StyleSheet`:
```tsx
  shareInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
```

- [ ] **Step 5: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add App.tsx src/components/TeamCard.tsx src/components/TargetPill.tsx src/components/WinnerModal.tsx
git commit -m "Swap text glyphs for Ionicons across chrome"
```

---

## Task 10: Hydration gate (no 0–0 flash)

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Early-return the gradient background until hydrated**

In `App.tsx`, immediately **before** the main `return (` of the `Scorekeeper` component (after all hooks are declared), insert:
```tsx
  if (!match.hydrated) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.bg, colors.felt, colors.bgDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <StatusBar style="light" />
      </View>
    );
  }
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Manual check (when running the app)**

Run: `npx expo start`, open in Expo Go. Add some points, fully close and reopen the app. Expected: it restores directly to the saved scores with no visible 0–0 flash.

- [ ] **Step 4: Commit**

```bash
git add App.tsx
git commit -m "Gate render on hydration to remove 0-0 launch flash"
```

---

## Task 11: Winner-acknowledged wiring (the Keep-Playing fix, in the UI)

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Derive `showWinner` and use it for the modal + celebration**

In `App.tsx`, just after `const match = useMatch();`, add:
```tsx
  const showWinner = !!match.state.winnerId && !match.state.winnerAcknowledged;
```
Replace the celebration effect:
```tsx
  // Celebrate when a winner is detected.
  useEffect(() => {
    if (match.state.winnerId) {
      notifySuccess();
    }
  }, [match.state.winnerId]);
```
with:
```tsx
  // Celebrate when an (unacknowledged) winner appears.
  useEffect(() => {
    if (showWinner) {
      notifySuccess();
    }
  }, [showWinner]);
```
Replace the WinnerModal `visible` prop:
```tsx
        visible={!!match.state.winnerId}
```
with:
```tsx
        visible={showWinner}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Manual check (the headline bug)**

Run the app. Set target low (e.g. 100), score a team to ≥100 → winner modal appears → tap **Keep playing**. Add more points to either team. Expected: the modal does **not** pop again; scores keep accumulating. Then **Undo** back below target and re-cross → the modal celebrates again.

- [ ] **Step 4: Commit**

```bash
git add App.tsx
git commit -m "Fix Keep-Playing: gate winner modal on winnerAcknowledged"
```

---

## Task 12: Programmatic app icon + splash

**Files:**
- Create: `scripts/gen-icons.mjs`
- Regenerate: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`, `assets/favicon.png`
- Create (by script): `assets/icon.svg`

- [ ] **Step 1: Confirm the rasterizer is available**

Run: `which rsvg-convert`
Expected: a path (e.g. `/usr/local/bin/rsvg-convert`). If missing: `brew install librsvg`.

- [ ] **Step 2: Create the generator**

Create `scripts/gen-icons.mjs`:
```js
// Generates Anota's app icon / adaptive / splash / favicon from a
// code-defined domino-tile SVG. Requires `rsvg-convert` (brew install librsvg).
//
//   node scripts/gen-icons.mjs            # two-tone pips (red top / blue bottom)
//   ANOTA_PIPS=gold node scripts/gen-icons.mjs   # gold pips fallback
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));

const IVORY = '#F3EDDC';
const IVORY_EDGE = '#C9C0A8';
const RED = '#E63946';
const BLUE = '#3B82F6';
const GOLD = '#E6B449';

// Face "6": two columns × three rows.
function sixPips(colL, colR, ys, r, fill) {
  let out = '';
  for (const y of ys) for (const x of [colL, colR]) {
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"/>`;
  }
  return out;
}

// A double-six domino tile centered on a 1024 canvas.
// scale = fraction of canvas height the tile occupies.
function tile({ scale, twoTone }) {
  const C = 1024, cx = C / 2, cy = C / 2;
  const H = C * scale;
  const W = H * 0.56;
  const x = cx - W / 2, y = cy - H / 2;
  const rad = W * 0.2;
  const half = H / 2;
  const colL = x + W * 0.3, colR = x + W * 0.7;
  const r = W * 0.085;
  const topYs = [y + half * 0.24, y + half * 0.5, y + half * 0.76];
  const botYs = topYs.map((v) => v + half);
  const topFill = twoTone ? RED : GOLD;
  const botFill = twoTone ? BLUE : GOLD;
  return `
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}"
      rx="${rad.toFixed(1)}" ry="${rad.toFixed(1)}" fill="${IVORY}"
      stroke="${IVORY_EDGE}" stroke-width="${(W * 0.018).toFixed(1)}"/>
    <line x1="${(x + W * 0.12).toFixed(1)}" y1="${cy}" x2="${(x + W * 0.88).toFixed(1)}" y2="${cy}"
      stroke="${IVORY_EDGE}" stroke-width="${(W * 0.022).toFixed(1)}" stroke-linecap="round"/>
    ${sixPips(colL, colR, topYs, r, topFill)}
    ${sixPips(colL, colR, botYs, r, botFill)}`;
}

function svg({ bg, scale, twoTone }) {
  const C = 1024;
  const defs = `
    <radialGradient id="felt" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#14271D"/>
      <stop offset="100%" stop-color="#070D0A"/>
    </radialGradient>`;
  const background = bg
    ? `<rect width="${C}" height="${C}" fill="url(#felt)"/>
       <rect x="44" y="44" width="${C - 88}" height="${C - 88}" rx="180" fill="none"
         stroke="${GOLD}" stroke-opacity="0.45" stroke-width="6"/>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${C}" height="${C}" viewBox="0 0 ${C} ${C}">
  <defs>${defs}</defs>
  ${background}
  ${tile({ scale, twoTone })}
</svg>`;
}

function render(svgStr, outName, size, bgColor) {
  const dir = mkdtempSync(join(tmpdir(), 'anota-icon-'));
  const inFile = join(dir, 'in.svg');
  writeFileSync(inFile, svgStr);
  const args = ['-w', String(size), '-h', String(size)];
  if (bgColor) args.push('-b', bgColor); // flatten → opaque pixels
  args.push(inFile, '-o', join(ASSETS, outName));
  execFileSync('rsvg-convert', args);
  rmSync(dir, { recursive: true, force: true });
  console.log('wrote', outName, `${size}px`);
}

const twoTone = process.env.ANOTA_PIPS !== 'gold';

// Opaque, full-bleed felt:
const iconSvg = svg({ bg: true, scale: 0.8, twoTone });
render(iconSvg, 'icon.png', 1024, '#070D0A');
render(iconSvg, 'favicon.png', 64, '#070D0A');

// Transparent, tile within Android safe zone / Expo splash:
render(svg({ bg: false, scale: 0.6, twoTone }), 'adaptive-icon.png', 1024);
render(svg({ bg: false, scale: 0.62, twoTone }), 'splash-icon.png', 1024);

// Save the icon source for reference/version control.
writeFileSync(join(ASSETS, 'icon.svg'), iconSvg);
```

- [ ] **Step 3: Generate the icons**

Run: `node scripts/gen-icons.mjs`
Expected: prints `wrote icon.png 1024px`, `wrote favicon.png 64px`, `wrote adaptive-icon.png 1024px`, `wrote splash-icon.png 1024px`.

- [ ] **Step 4: Inspect legibility at small size**

Run: `sips -g pixelWidth -g pixelHeight assets/icon.png assets/adaptive-icon.png`
Expected: each reports 1024×1024.
Then open `assets/icon.png` (e.g. `open assets/icon.png`) and view it small. Decision: if the 12 two-tone pips look muddy/busy at small size, regenerate with the gold fallback:
```bash
ANOTA_PIPS=gold node scripts/gen-icons.mjs
```
Pick whichever (two-tone or gold) stays crisp; that's the keeper.

- [ ] **Step 5: Manual check (when running the app)**

Run `npx expo start` and confirm the splash + app icon render the domino tile on dark felt (Expo Go shows its own icon, but the splash uses `splash-icon.png`).

- [ ] **Step 6: Commit**

```bash
git add scripts/gen-icons.mjs assets/icon.png assets/adaptive-icon.png assets/splash-icon.png assets/favicon.png assets/icon.svg
git commit -m "Generate code-defined domino-tile app icon, splash, favicon"
```

---

## Task 13: Final verification + doc touch-up

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the README quick-scores description**

In `README.md`, find the line describing quick-add buttons:
```
Dominican-friendly quick-add buttons (25 / 30 / 50 / 75 / 100 + custom)
```
Replace with:
```
Dominican-friendly preset chips (25 / 30 / 50 for passes & capicúa) plus a fast in-app keypad for arbitrary pip counts
```

- [ ] **Step 2: Full type-check + tests**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean (exit 0); jest passes all reducer tests.

- [ ] **Step 3: Manual smoke test (the whole batch)**

Run: `npx expo start`, open in Expo Go, and verify:
- Tapping a preset chip (25/30/50) adds instantly with haptic.
- `＋ POINTS` opens the keypad; typing e.g. `47` + **Add** adds 47; backspace + cancel work; no OS keyboard appears.
- All icons render as vector icons (gear, undo, new match, pencils, share, keypad backspace).
- Team B reads as a vivid blue equal in weight to Team A red.
- Keep-Playing no longer re-pops; undo-below-target re-celebrates.
- Reopening the app restores the match with no 0–0 flash.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Docs: update quick-score description for keypad redesign"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** §1 score entry → Tasks 5,6; §2 Keep-Playing → Tasks 2,11; §3 tighten/labels → Task 6; §4 vector icons → Tasks 1,5,9; §5 hydration gate → Task 10; §6 dead code → Tasks 3,6,7,8; §7 Team B blue → Task 3; §8 persistence/migration → Task 2; §9 tests → Tasks 1,2; §10 icon → Task 12. All covered.

**Type consistency:** Reducer exports (`createMatch`, `applyPoints`, `applyUndo`, `applyRemoveRound`, `applyTarget`, `applyRename`, `acknowledgeWinner`, `resetKeepingSettings`, `detectWinner`) match the hook imports and test imports. `MatchState.winnerAcknowledged` defined in Task 2 and consumed consistently in storage (Task 2) and App (Task 11). `team.addPoints` / `chrome.delete` added (Task 4) before use (Tasks 5,6) and the removed keys (Task 8) are confirmed to have no remaining consumers.

**Ordering safety:** Each task ends with `tsc --noEmit` green; i18n additions precede use, removals follow consumer deletion; the only intermediate where whole-project tsc is deferred does not occur (Task 2 leaves i18n/components untouched, so it stays green).

**No placeholders:** every code step contains complete code; commands include expected output.
