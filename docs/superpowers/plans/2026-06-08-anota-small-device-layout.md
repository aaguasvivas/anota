# Anota — Small-Device Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Anota's single, non-scrolling split layout fit and breathe on every supported phone down to iPhone SE (667pt) by replacing the fragile `flex` + magic-`paddingBottom: 64` approach with proper flex structure plus one height-driven responsive size tier.

**Architecture:** A pure, unit-tested `computeLayoutMetrics(usableHeight)` returns a size set (score font, tile, button heights, progress, gaps) with a `compact` flag below a height threshold. A `useLayoutMetrics()` hook feeds it live window height minus safe-area insets. `TeamCard`, `ScorePad`, and `App` consume the hook directly (no prop-drilling, no context). The body drops the magic bottom padding; the `flex:1` RoundStrip divider absorbs slack on tall phones, while compact sizing guarantees fit on short ones. No scrolling, no state/behavior changes.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript strict, `react-native-safe-area-context` (already a dep), Jest + ts-jest.

**Reference spec:** `docs/superpowers/specs/2026-06-08-anota-small-device-layout-design.md`

---

## File Structure
- **New:** `src/layout/metrics.ts` (pure helper + types + threshold), `src/layout/__tests__/metrics.test.ts`, `src/hooks/useLayoutMetrics.ts` (RN hook).
- **Modified:** `src/components/ScoreButton.tsx` (widen `style` prop type to accept arrays), `src/components/TeamCard.tsx` (score/tile/progress/cardPad), `src/components/ScorePad.tsx` (chip/hero heights), `App.tsx` (body padding + region gaps).

---

## Task 1: Pure layout metrics + tests (TDD)

**Files:**
- Create: `src/layout/metrics.ts`
- Create: `src/layout/__tests__/metrics.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/layout/__tests__/metrics.test.ts`:
```ts
import { COMPACT_HEIGHT_THRESHOLD, computeLayoutMetrics } from '../metrics';

test('short screens get compact sizing', () => {
  const m = computeLayoutMetrics(640);
  expect(m.compact).toBe(true);
  expect(m.scoreFontSize).toBe(48);
  expect(m.chipHeight).toBe(46);
});

test('tall screens get normal sizing', () => {
  const m = computeLayoutMetrics(780);
  expect(m.compact).toBe(false);
  expect(m.scoreFontSize).toBe(60);
  expect(m.chipHeight).toBe(54);
});

test('the threshold is the boundary (exclusive below)', () => {
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD).compact).toBe(false);
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD - 1).compact).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../metrics'`.

- [ ] **Step 3: Create the pure helper**

Create `src/layout/metrics.ts`:
```ts
export type LayoutMetrics = {
  compact: boolean;
  scoreFontSize: number;
  scoreLineHeight: number;
  tileSize: number;
  chipHeight: number;
  heroHeight: number;
  progressHeight: number;
  regionGap: number; // gap between a team card and its score pad
  cardPadV: number; // TeamCard vertical padding
};

// Below this usable height (window height minus safe-area insets) we switch to
// compact sizing so the single, non-scrolling layout still fits. Tuned so
// iPhone SE (~647 usable) -> compact and iPhone 13 mini and larger -> normal.
export const COMPACT_HEIGHT_THRESHOLD = 700;

export function computeLayoutMetrics(usableHeight: number): LayoutMetrics {
  const compact = usableHeight < COMPACT_HEIGHT_THRESHOLD;
  return compact
    ? {
        compact: true,
        scoreFontSize: 48,
        scoreLineHeight: 52,
        tileSize: 18,
        chipHeight: 46,
        heroHeight: 46,
        progressHeight: 4,
        regionGap: 4,
        cardPadV: 6,
      }
    : {
        compact: false,
        scoreFontSize: 60,
        scoreLineHeight: 64,
        tileSize: 22,
        chipHeight: 54,
        heroHeight: 52,
        progressHeight: 5,
        regionGap: 8,
        cardPadV: 8,
      };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 13 tests total (10 reducer + 3 metrics).

- [ ] **Step 5: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/layout/metrics.ts src/layout/__tests__/metrics.test.ts
git commit -m "Add pure computeLayoutMetrics helper + tests (responsive size tier)"
```

---

## Task 2: useLayoutMetrics hook

**Files:**
- Create: `src/hooks/useLayoutMetrics.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useLayoutMetrics.ts`:
```ts
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { computeLayoutMetrics, type LayoutMetrics } from '../layout/metrics';

// Responsive sizing for the single-screen layout. Reactive to window size and
// safe-area insets, so it adapts across devices (and rotation / split view).
export function useLayoutMetrics(): LayoutMetrics {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usable = height - insets.top - insets.bottom;
  return useMemo(() => computeLayoutMetrics(usable), [usable]);
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0. (The hook isn't consumed yet — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLayoutMetrics.ts
git commit -m "Add useLayoutMetrics hook (window height + safe-area driven)"
```

---

## Task 3: ScoreButton — accept composed styles

`ScorePad` needs to pass `[styles.cell, { minHeight }]` arrays; widen the prop type.

**Files:**
- Modify: `src/components/ScoreButton.tsx`

- [ ] **Step 1: Widen the `style` prop type**

In `src/components/ScoreButton.tsx`, change the react-native import:
```tsx
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
```
to:
```tsx
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
```
And in the `Props` type, change:
```tsx
  style?: ViewStyle;
```
to:
```tsx
  style?: StyleProp<ViewStyle>;
```
(No other change — the component already spreads `style` as the last element of its internal style array, which accepts a `StyleProp`.)

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScoreButton.tsx
git commit -m "ScoreButton: accept composed StyleProp for responsive heights"
```

---

## Task 4: TeamCard — responsive score / tile / progress / padding

**Files:**
- Modify: `src/components/TeamCard.tsx`

- [ ] **Step 1: Import the hook**

In `src/components/TeamCard.tsx`, add to the imports (after the `ProgressBar` import line):
```tsx
import { useLayoutMetrics } from '../hooks/useLayoutMetrics';
```

- [ ] **Step 2: Call the hook**

Immediately after `const { t } = useT();`, add:
```tsx
  const m = useLayoutMetrics();
```

- [ ] **Step 3: Drive the domino tile size**

Change:
```tsx
            <DominoTile top={topFace} bottom={bottomFace} pipColor={team.color} size={22} />
```
to:
```tsx
            <DominoTile top={topFace} bottom={bottomFace} pipColor={team.color} size={m.tileSize} />
```

- [ ] **Step 4: Drive the card vertical padding**

Change the LinearGradient style object:
```tsx
        style={[
          styles.card,
          {
            borderColor: isLeader ? team.color : colors.hairline,
            shadowColor: isLeader ? team.color : '#000',
            shadowOpacity: isLeader ? 0.35 : 0.25,
          },
        ]}
```
to:
```tsx
        style={[
          styles.card,
          {
            borderColor: isLeader ? team.color : colors.hairline,
            shadowColor: isLeader ? team.color : '#000',
            shadowOpacity: isLeader ? 0.35 : 0.25,
            paddingVertical: m.cardPadV,
          },
        ]}
```

- [ ] **Step 5: Drive the score font size + line height**

Change:
```tsx
          <AnimatedScore
            value={team.score}
            style={{ ...styles.score, color: colors.text }}
            glowColor={glowColor}
          />
```
to:
```tsx
          <AnimatedScore
            value={team.score}
            style={{
              ...styles.score,
              color: colors.text,
              fontSize: m.scoreFontSize,
              lineHeight: m.scoreLineHeight,
            }}
            glowColor={glowColor}
          />
```

- [ ] **Step 6: Drive the progress bar height**

Change:
```tsx
        <ProgressBar
          progress={progress}
          color={team.color}
          glowColor={glowColor}
          height={5}
        />
```
to:
```tsx
        <ProgressBar
          progress={progress}
          color={team.color}
          glowColor={glowColor}
          height={m.progressHeight}
        />
```

- [ ] **Step 7: Verify type-check + tests**

Run: `npx tsc --noEmit && npm test`
Expected: tsc exit 0; 13 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/TeamCard.tsx
git commit -m "TeamCard: responsive score/tile/progress/padding via useLayoutMetrics"
```

---

## Task 5: ScorePad — responsive chip / hero heights

**Files:**
- Modify: `src/components/ScorePad.tsx`

- [ ] **Step 1: Import + call the hook**

In `src/components/ScorePad.tsx`, add the import after the `ScoreButton` import line:
```tsx
import { useLayoutMetrics } from '../hooks/useLayoutMetrics';
```
Immediately after `const { t } = useT();`, add:
```tsx
  const m = useLayoutMetrics();
```

- [ ] **Step 2: Drive the preset chip heights**

Change the preset `ScoreButton`'s style prop:
```tsx
            style={styles.cell}
```
to:
```tsx
            style={[styles.cell, { minHeight: m.chipHeight }]}
```

- [ ] **Step 3: Drive the hero button height**

Change the hero `ScoreButton`'s style prop:
```tsx
        style={styles.hero}
```
to:
```tsx
        style={[styles.hero, { minHeight: m.heroHeight }]}
```

- [ ] **Step 4: Remove the now-stale hardcoded hero minHeight**

In the `StyleSheet`, change:
```tsx
  hero: {
    marginTop: spacing.sm,
    minHeight: 52,
  },
```
to:
```tsx
  hero: {
    marginTop: spacing.sm,
  },
```

- [ ] **Step 5: Verify type-check + tests**

Run: `npx tsc --noEmit && npm test`
Expected: tsc exit 0; 13 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ScorePad.tsx
git commit -m "ScorePad: responsive chip/hero heights via useLayoutMetrics"
```

---

## Task 6: App — structural fix (drop magic padding, responsive region gap)

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import + call the hook**

In `App.tsx`, add to the imports (near the `useMatch` import):
```tsx
import { useLayoutMetrics } from './src/hooks/useLayoutMetrics';
```
Immediately after the existing `const showWinner = ...` line (just below `const match = useMatch();`), add:
```tsx
  const m = useLayoutMetrics();
```
(It's a hook — it must sit with the other hook calls, above the `if (!match.hydrated)` early return. This placement satisfies that.)

- [ ] **Step 2: Apply the responsive region gap to both team regions**

There are two occurrences of:
```tsx
          <View style={styles.teamRegion}>
```
Change BOTH to:
```tsx
          <View style={[styles.teamRegion, { gap: m.regionGap }]}>
```

- [ ] **Step 3: Remove the magic bottom padding**

In the `StyleSheet`, change:
```tsx
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 64,
  },
```
to:
```tsx
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
```

- [ ] **Step 4: Verify type-check + tests + bundle**

Run: `npx tsc --noEmit && npm test`
Expected: tsc exit 0; 13 tests pass.
Then confirm it still bundles (catches runtime/import issues):
Run: `npx expo export --platform ios --output-dir /tmp/anota-layout-check`
Expected: `iOS Bundled ... index.ts (NNN modules)` with no error. (Requires Node 20: `nvm use` first.)

- [ ] **Step 5: Commit**

```bash
git add App.tsx
git commit -m "App: flex structure + responsive region gap; drop magic paddingBottom"
```

---

## Task 7: Device verification + tuning (controller-run)

This task needs visual judgment on real renders and is executed by the controller (not a fresh implementer subagent). Tasks 1–6 are complete and committed before this.

**Files:** none (may re-tune values in `src/layout/metrics.ts` and re-commit).

- [ ] **Step 1: Boot simulators and capture screenshots**

With Node 20 (`nvm use`), start the app and open it on each simulator (or use `xcrun simctl` + Expo). Capture a screenshot of the running app on:
- **iPhone SE (3rd generation)** — the critical case (667pt).
- **iPhone 13 mini** (812pt).
- **iPhone 15** (852pt).
- **iPhone 15 Pro Max** (932pt).

- [ ] **Step 2: Inspect against acceptance criteria**

- **SE:** both team cards + both score pads + the divider + header + footer are ALL fully visible; no element clipped; the footer is NOT overlapped; no scrolling.
- **mini / 15:** comfortable, not cramped.
- **Pro Max:** generous (the divider grows); not awkwardly stretched.

- [ ] **Step 3: Tune if needed**

If SE still overflows or any tier looks off, adjust in `src/layout/metrics.ts`:
- Raise `COMPACT_HEIGHT_THRESHOLD` (e.g. 700 → 740) to also compact the mini if needed.
- Lower compact values (`scoreFontSize`, `chipHeight`, `heroHeight`, gaps) for more headroom on SE.
Re-run `npm test` (the boundary tests still pass for any threshold ≥ the test inputs 640/780; if you move the threshold outside [641, 780], update the test inputs accordingly), then re-screenshot. Repeat until all four devices pass Step 2.

- [ ] **Step 4: Commit any tuning**

```bash
git add src/layout/metrics.ts src/layout/__tests__/metrics.test.ts
git commit -m "Tune responsive layout thresholds for SE/mini/Pro Max"
```
(Skip if no tuning was needed.)

---

## Self-Review (completed by plan author)

**1. Spec coverage:**
- §1 structural fix (remove `paddingBottom: 64`, responsive region gap, flex column) → Task 6.
- §2 pure helper `computeLayoutMetrics` + `COMPACT_HEIGHT_THRESHOLD` + `LayoutMetrics` → Task 1; `useLayoutMetrics` hook → Task 2; consumption in TeamCard → Task 4, ScorePad → Task 5 (+ ScoreButton type widening enabling it → Task 3), App → Task 6.
- §3 RoundStrip optional compact tweak → folded into Task 7 tuning if §4 testing demands it (kept out of the mainline per "keep scope tight").
- §4 verification (unit tests + simulator screenshots on SE/mini/15/Pro Max + tuning) → Task 1 (unit) + Task 7 (devices).
All spec requirements map to a task.

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code; commands have expected output.

**3. Type consistency:** `computeLayoutMetrics`/`LayoutMetrics`/`COMPACT_HEIGHT_THRESHOLD` (Task 1) match the hook import (Task 2) and the consumers (Tasks 4–6). Field names (`scoreFontSize`, `scoreLineHeight`, `tileSize`, `chipHeight`, `heroHeight`, `progressHeight`, `regionGap`, `cardPadV`, `compact`) are used identically across tasks. `StyleProp<ViewStyle>` (Task 3) is what enables the array styles passed in Tasks 4–5. Object-spread/array-merge override order (inline value wins over the registered style) holds for `score` font (object spread), `card` padding (array), `cell`/`hero` minHeight (array).

**Ordering safety:** each task ends `tsc`-green and tests-green; the hook (Task 2) is created before consumers; ScoreButton's type is widened (Task 3) before ScorePad passes arrays (Task 5).
