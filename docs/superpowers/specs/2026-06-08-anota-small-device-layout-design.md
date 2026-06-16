# Anota - Small-Device Layout Batch - Design Spec

**Date:** 2026-06-08
**Status:** Approved (design); pending spec review
**Goal:** Make the single-screen split layout fit and breathe on **every supported phone down to iPhone SE (667pt)** with **no scrolling, both teams always visible** - replacing the fragile `flex` + magic-`paddingBottom: 64` approach. Purely presentational/responsive; no state, reducer, or behavior changes.

**Reference:** follows the audit finding that the body mixes a flex container with fixed-pixel content (60pt score, 54pt buttons, fixed margins) and hides overflow behind `paddingBottom: 64` ([App.tsx](../../../App.tsx) body style). On short screens the content exceeds the body box and spills onto the footer.

---

## Approach (chosen: B - structural flex fix + one responsive size tier)

Pure flexbox can't fix this alone: flex distributes space but can't shrink text or button heights, so a short screen still clips. Fully-fluid scaling is overengineered and risks awkward sizes. **B** fixes the structure so content can never overflow the footer, and adds a single `compact` size tier (triggered by usable screen height) that scales the big fixed elements down on short phones. The score stays the hero; only spacing, the domino tile, button heights, and the score font flex down on short screens.

---

## 1. Structural fix (removes the fragility)

The screen stays a flex column inside `SafeAreaView`: `header` (auto) / `body` (`flex:1`) / `footer` (auto). The footer is already a sibling of the body, so it always reserves its height.

- **Remove the magic `paddingBottom: 64`** from the `body` style in `App.tsx`. The footer's own `paddingTop` provides separation; add a small `paddingBottom: spacing.sm` to the body for breathing room above the footer.
- Inside `body`: Team A region (content-sized) / RoundStrip divider (`flex:1`, absorbs slack) / Team B region (content-sized). On tall phones the divider grows → generous spacing; on short phones it shrinks to its minimum, and the compact sizes (below) guarantee the two regions + the divider's minimum fit within the body box.
- The `teamRegion` gap (card → pad spacing) becomes responsive (`metrics.regionGap`).

**Invariant this must preserve:** on the smallest supported device (iPhone SE, usable height ≈ 647pt), `regionA + regionB + dividerMin ≤ body height`. The compact tier is tuned to satisfy this. (Verified on-device in §4.)

---

## 2. Responsive size tier

### Pure helper (unit-tested) - `src/layout/metrics.ts`
RN-free so it can be tested with ts-jest (mirrors the `match/reducer.ts` pattern).

```ts
export type LayoutMetrics = {
  compact: boolean;
  scoreFontSize: number;
  scoreLineHeight: number;
  tileSize: number;
  chipHeight: number;
  heroHeight: number;
  progressHeight: number;
  regionGap: number;   // gap between team card and its pad
  cardPadV: number;    // TeamCard vertical padding
};

// Below this usable height we switch to compact sizing (tuned so iPhone SE
// → compact, iPhone 13 mini and larger → normal). Tunable in §4.
export const COMPACT_HEIGHT_THRESHOLD = 700;

export function computeLayoutMetrics(usableHeight: number): LayoutMetrics {
  const compact = usableHeight < COMPACT_HEIGHT_THRESHOLD;
  return compact
    ? { compact: true,  scoreFontSize: 48, scoreLineHeight: 52, tileSize: 18, chipHeight: 46, heroHeight: 46, progressHeight: 4, regionGap: 4, cardPadV: 6 }
    : { compact: false, scoreFontSize: 60, scoreLineHeight: 64, tileSize: 22, chipHeight: 54, heroHeight: 52, progressHeight: 5, regionGap: 8, cardPadV: 8 };
}
```

### Hook - `src/hooks/useLayoutMetrics.ts`
Wraps the pure helper with live dimensions + safe-area insets (both already available: `react-native` + `react-native-safe-area-context`).

```ts
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { computeLayoutMetrics, type LayoutMetrics } from '../layout/metrics';

export function useLayoutMetrics(): LayoutMetrics {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usable = height - insets.top - insets.bottom;
  return useMemo(() => computeLayoutMetrics(usable), [usable]);
}
```

### Consumption (each consumer calls the hook directly - no prop-drilling, no new context)
- **`App.tsx`** - `const m = useLayoutMetrics();` apply `m.regionGap` to the `teamRegion` gap (inline style); remove the magic bottom padding (§1).
- **`TeamCard.tsx`** - `const m = useLayoutMetrics();` drive the score style `fontSize: m.scoreFontSize`, `lineHeight: m.scoreLineHeight`; the `DominoTile size={m.tileSize}`; the `ProgressBar height={m.progressHeight}`; the card `paddingVertical: m.cardPadV`.
- **`ScorePad.tsx`** - `const m = useLayoutMetrics();` pass the chip height via the existing `style` prop on the preset `ScoreButton`s (`[styles.cell, { minHeight: m.chipHeight }]`) and the hero (`[styles.hero, { minHeight: m.heroHeight }]`). **No change to `ScoreButton`** - a passed `minHeight` in `style` overrides its base `minHeight` via RN style flattening (keeps the Task 7 cleanup intact).

> `useWindowDimensions` + `useSafeAreaInsets` are reactive, so rotation / split-view / device differences update live.

---

## 3. RoundStrip (minor)
The RoundStrip lives inside the `flex:1` divider and already compresses. Apply a small compact tweak only if §4 testing shows it crowding: reduce its `leadsPill` `marginBottom` to `spacing.xs` when compact (it can read `useLayoutMetrics().compact`). Not required unless testing demands it - keep scope tight.

---

## 4. Verification (the real acceptance test)
- **Unit tests** (`src/layout/__tests__/metrics.test.ts`, ts-jest): `computeLayoutMetrics(640)` → `compact: true`, `scoreFontSize: 48`; `computeLayoutMetrics(780)` → `compact: false`, `scoreFontSize: 60`; boundary at the threshold.
- **iOS Simulator screenshots** on **iPhone SE (3rd gen)**, **iPhone 13 mini**, **iPhone 15**, **iPhone 15 Pro Max**. Acceptance:
  - SE: no footer overlap; both teams + both pads + footer fully visible; nothing clipped.
  - mini/15: comfortable.
  - Pro Max: generous spacing (divider grows), not awkwardly stretched.
- If SE still overflows, tune the compact values (smaller `scoreFontSize`/heights) and/or raise the threshold; re-screenshot. The threshold + compact values are the tuning knobs.

---

## Scope guard / out of scope
- **No scrolling** anywhere. **No** state/reducer/i18n/API changes. **No** new behavior.
- No landscape-specific design (portrait-locked stays). No second "generous/tall" tier for Pro Max in v1 - the `flex:1` divider already adds breathing room on big phones; a tall tier can come later if wanted.
- Don't restructure unrelated components.

## Files
- **New:** `src/layout/metrics.ts`, `src/layout/__tests__/metrics.test.ts`, `src/hooks/useLayoutMetrics.ts`.
- **Modified:** `App.tsx` (body padding + region gap), `src/components/TeamCard.tsx` (score/tile/progress/cardPad), `src/components/ScorePad.tsx` (chip/hero heights). Possibly `src/components/RoundStrip.tsx` (compact margin, only if §4 needs it).

## Success criteria
- iPhone SE: full single-screen layout, no scroll, no footer overlap, nothing clipped.
- Large phones: unchanged generous feel.
- The magic `paddingBottom: 64` is gone; sizing flows from `computeLayoutMetrics`.
- `npx tsc --noEmit` clean; `npm test` green (incl. new metrics tests); real Metro bundle builds.
