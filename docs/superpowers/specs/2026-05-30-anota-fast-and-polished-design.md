# Anota - Batch 1: "Fast & Polished" - Design Spec

**Date:** 2026-05-30
**Status:** Approved (design); pending spec review
**Goal:** Make Anota feel instant and trustworthy at a real dominoes table so players reach for it instead of pen & paper. This is "app #1" of a ship-many-small-apps strategy headed for the App Store / Play Store. No backend, no auth, no online multiplayer, no payments. Preserve in-progress games across the update.

---

## 1. Score entry redesign (the hero change)

### Problem
Today the **presets are 1 tap** but the **arbitrary pip-count is ~4 taps** (tap "Other" → modal → OS keyboard → type → Add). In real Dominican play the pip-count (sum of pips left in the losers' + partner's hands, e.g. 17/43/68) is the **most common** entry every hand; the presets (25/30/50) are the *special* cases (passes, capicúa, multi-pass). The app is optimized backwards.

### Approach - Option B (hybrid)
On each team's region:
```
[ 25 ]  [ 30 ]  [ 50 ]          ← team-tinted chips · 1 tap = instant add
[        ＋  POINTS        ]     ← hero button, team-color fill · opens keypad
```
- Presets cover passes/capicúa in **1 tap** (instant `addPoints`, no modal).
- The hero **＋ POINTS** button opens a fast in-app keypad for the pip-count case.
- The redundant "+ FOR US / + PARA NOSOTROS" pad header label is removed.
- Preset set trimmed **5 → 3 (25 / 30 / 50)**. 75/100 are uncommon and just get typed on the keypad. This trim is what frees vertical breathing room.

### New component: `ScoreKeypad` (replaces `CustomScoreModal`)
A bottom-sheet, in-app numeric keypad - **no OS keyboard** (this removes ~250ms keyboard animation lag and gives big calculator-style targets; the key "feels like a scorekeeper, not a form" upgrade).

```
        Puntos para
         Nosotros          ← team color
            47              ← huge running total, team color, tabular-nums
       ───────────────
       [1] [2] [3]
       [4] [5] [6]
       [7] [8] [9]
       [⌫] [0] [Add]       ← Add = team-color fill, disabled until > 0
          Cancel
```
- **Props:** `visible: boolean`, `team: { id; name; color } | null`, `onCancel(): void`, `onSubmit(value: number): void`.
- **Behavior:** entry is a string built by digit presses; cap at **3 digits**; leading-zero suppressed (`"0"` then `"5"` → `"5"`). `⌫` removes last digit. `Add` parses to int and calls `onSubmit` only when `> 0`. Entry resets to empty each time the sheet opens.
- **Layout:** bottom sheet (Modal `animationType="slide"`, anchored bottom for thumb reach), dark felt surface, team-colored accent border. Big keys (min height ≈ 64). `Add` dimmed/disabled when entry is empty/0. Backdrop press = cancel.
- **a11y:** each digit key labeled with its digit; `Add` labeled `t.chrome.add`; backspace labeled `t.chrome.delete` (new key).
- Delete `src/components/CustomScoreModal.tsx`; update `App.tsx` import/usage.

### `ScorePad.tsx` changes
- Remove the header label row entirely.
- Render 3 preset chips from `QUICK_SCORES` (now `[25,30,50]`) as instant-add, team-tinted (subdued) buttons.
- Render the hero **＋ POINTS** button (team-color fill) → calls `onCustom(teamId)` to open the keypad.
- Drop `PRIMARY_QUICK_SCORES` usage (no longer needed - the hero button carries the emphasis).

---

## 2. Fix the "Keep Playing" re-trigger bug

### Problem
After "Keep Playing," scores are already past target; the very next point re-runs winner detection and the modal pops again. "Keep playing" effectively lasts one tap.

### Approach
Add `winnerAcknowledged: boolean` to `MatchState`.

**Single invariant applied after every state mutation** (`addPoints`, `undoLast`, `removeRound`, `setTargetScore`, `resetMatch`):
1. Recompute `winnerId = detectWinner(next)`.
2. If `winnerId == null`, force `winnerAcknowledged = false`.
3. `winnerAcknowledged` is set **true only** by `dismissWinner()` ("Keep playing").

**Derived:** the winner modal is visible when `winnerId != null && !winnerAcknowledged`.

**Scoring guard:** `addPoints` is blocked only while `winnerId && !winnerAcknowledged` (i.e. while the modal is up). Once acknowledged, scoring past the line is allowed and does **not** re-show the modal.

This yields: cross target → modal; Keep playing → acknowledged, keep scoring with no nag; undo/remove back below target → `winnerId` null → acknowledged resets → a genuine re-cross celebrates again; New match → reset.

---

## 3. Remove redundant labels + tighten spacing
- Drop the per-pad header labels (done as part of §1).
- With 3 chips instead of 5 and no labels, the two team halves get real breathing room.
- **Scope guard:** this is the *quick* spacing win only. The full structural layout-robustness rework (replacing the `flex` + magic `paddingBottom: 64` approach, device testing on SE/mini) remains a **separate future batch** and is explicitly out of scope here. Do not regress current layout; modest spacing tightening is fine.

---

## 4. Vector icons
- Add `@expo/vector-icons` (Ionicons; ships with the Expo SDK - `expo install` if not already resolvable).
- Replace text glyphs:
  - Settings `⚙︎` → `settings-outline`
  - Undo `↶` → `arrow-undo-outline`
  - New match `⟲` → `reload-outline`
  - Rename `✎` (TeamCard + TargetPill) → `pencil` / `create-outline`
  - Keypad backspace → `backspace-outline`
  - Winner share → `share-outline`
- Keep the gold brand dot (decoration, not an icon). Match existing sizes/colors.

---

## 5. Gate render on `hydrated`
- In `App.tsx`, until `match.hydrated` is true, render only the gradient background (no UI) instead of flashing a 0–0 match that then snaps to the restored score.
- (Language `ready` flash is minor; not gating on it to keep this simple.)

---

## 6. Delete dead code (verified unreferenced)
- **i18n** (`types.ts` + `es.ts` + `en.ts`): remove `brand.tagline`, `chrome.ok`, `chrome.reset`, `chrome.footerTagline`, `history.emptyTitle`, and the entire `reset.*` section. Remove `customModal.placeholder` (only consumer was the deleted `CustomScoreModal`).
- **`Team.accent`**: remove from `types.ts`, `useMatch` (initial + load re-apply), `storage.ts` `isTeam` validation, and `teamPalette`.
- **`teamPalette.*.pip`**: unused - remove (touched anyway by the blue rebalance).
- **`ScoreButton`**: remove unused `small` / `labelSmall` props + `styles.small`.
- **`PRIMARY_QUICK_SCORES`** constant: remove (obsolete after §1).
- **Out of scope / leave as-is:** unused color tokens `feltEdge`, `goldDim`, `redDim`, `blueDim` - palette tokens, harmless, not on the approved list.

### i18n additions
- `team.addPoints` → ES `"Puntos"`, EN `"Points"` (rendered with a `+` prefix/icon on the hero button).
- `chrome.delete` → ES `"Borrar"`, EN `"Delete"` (keypad backspace a11y label).
- Keypad title reuses `customModal.titleFor` ("Puntos para" / "Points for") + team name. The `customModal` section is retained (sans `placeholder`) and now feeds the keypad.

---

## 7. Rebalance Team B blue
- `colors.blue`: `#2B6CB0` → **`#3B82F6`** (brighter, vivid; reads equal in weight to A's `#E63946` red on green felt).
- `teamPalette.B.color` → `#3B82F6`; `teamPalette.B.glow` → `rgba(59,130,246,0.35)`.
- On match load, the existing color re-apply (kept; accent re-apply removed) updates in-progress games to the new blue automatically.

---

## 8. Persistence / migration safety
- Keep the storage key at `@anota:match:v1` so **in-progress games survive the update**.
- `storage.ts`:
  - `isTeam`: drop the `accent` check (tolerate old data that still has `accent`; ignore it).
  - On load, normalize `winnerAcknowledged` to `false` when missing (old data won't have it). Validation must not reject states missing the new field.
- `useMatch` load: keep team `color` re-apply (so the rebalanced blue + any palette change propagates), remove the `accent` re-apply lines.

---

## 9. Tests (included - minimal)
Extract the pure match logic so it is unit-testable and the winner-acknowledged rule is covered.

- **New module** `src/match/reducer.ts` (RN-free - imports only pure constants/types): `createMatch()`, `applyPoints(state, teamId, points)`, `applyUndo(state)`, `applyRemoveRound(state, id)`, `applyTarget(state, target)`, `resetKeepingSettings(state)`, `detectWinner(state)`. `useMatch` becomes a thin `useState` + `setState(reducerFn)` wrapper around these.
- **Tooling (lightweight):** the tested code is RN-free, so use `ts-jest` (not the heavier `jest-expo`). Add devDeps `jest`, `ts-jest`, `@types/jest`; a `jest.config.js` (ts-jest preset, `testMatch` under `src/**`); npm script `"test": "jest"`.
- **Tests** (`src/match/__tests__/reducer.test.ts`, ~6):
  1. `applyPoints` adds to score and records a round (most-recent-first).
  2. `detectWinner` flags the team at/above target.
  3. `applyUndo` reverses the last round and clears `winnerId` / `winnerAcknowledged`.
  4. `applyRemoveRound` removes a specific round and re-derives state.
  5. Keep-playing: with `winnerAcknowledged=true`, `applyPoints` is allowed and does **not** make the modal condition true again (`winnerId` set, acknowledged stays true).
  6. Undo below target resets `winnerAcknowledged` (`winnerId` null ⇒ acknowledged false).

---

## 10. App icon + splash (programmatic)

### Decision
Render the launch icon **in code** (SVG → PNG via `rsvg-convert`, confirmed available). This is the *real* launch icon, not a throwaway: the subject is geometric (a domino tile), so code renders it crisply at every size; it's free, version-controlled, and re-renders in seconds. A commissioned/AI icon is reserved for *after* the app shows traction.

### Concept
- A single **ivory domino tile**, vertical, filling most of the canvas, on a **dark-green felt** radial/linear gradient with a subtle **gold hairline rim + vignette** (matches the in-app palette → cohesive brand).
- **Face: the double-six** (the most recognizable domino). **Top half pips red `#E63946`, bottom half pips blue `#3B82F6`** - quietly encodes "dominoes" + "two sides keeping score," and the ivory/red/blue trio organically evokes the Dominican flag without literal flag iconography (keeps it clean and universally appealing).
- **No flag/map/star.** Cultural flavor lives in the in-app voice and store listing, not the icon.

### Legibility caveat
12 two-tone pips can get busy at ~60px. After rendering, inspect at small size; if muddy, **fallback to single-color gold pips `#E6B449`** (max contrast, still premium). Pick whichever stays crisp.

### Deliverables
- Author `assets/icon.svg` (source of truth, committed).
- A small reproducible generator `scripts/gen-icons.mjs` (or shell) that rasterizes via `rsvg-convert` to:
  - `assets/icon.png` - 1024×1024, **opaque**, full-bleed felt bg (iOS requires no alpha).
  - `assets/adaptive-icon.png` - 1024×1024, **transparent** bg, tile within Android safe zone (~66% centered).
  - `assets/splash-icon.png` - 1024×1024, tile mark, transparent (Expo `contain` on `#070D0A`).
  - `assets/favicon.png` - small web icon (regenerated).
- `app.json` already references these paths + `#070D0A` splash bg; no config change required. (iOS `buildNumber` / release plumbing is a later batch.)

---

## Out of scope (explicitly deferred)
- Full structural layout-robustness rework + small-device testing (batch 2).
- EAS build config (`eas.json`), build numbers, iPad decision, store metadata (batch 3 / release).
- Inline stepper, match history/stats, landscape, opponent-facing view.

## Files touched (summary)
- **New:** `src/components/ScoreKeypad.tsx`, `src/match/reducer.ts`, `src/match/__tests__/reducer.test.ts`, `jest.config.js`, `assets/icon.svg`, `scripts/gen-icons.mjs`.
- **Modified:** `App.tsx`, `src/components/ScorePad.tsx`, `src/components/ScoreButton.tsx`, `src/components/TeamCard.tsx`, `src/components/TargetPill.tsx`, `src/hooks/useMatch.ts`, `src/types/index.ts`, `src/constants/colors.ts`, `src/constants/layout.ts`, `src/utils/storage.ts`, `src/i18n/{types,es,en}.ts`, `package.json`, regenerated `assets/*.png`.
- **Deleted:** `src/components/CustomScoreModal.tsx`.

## Success criteria
- Entering an arbitrary pip count takes ≤3 taps on big, lag-free keys; a pass/capicúa preset is 1 tap.
- "Keep Playing" lets you keep scoring with no repeat winner modal; a true re-cross still celebrates.
- No 0–0 flash on launch; in-progress games restore intact.
- All glyphs are vector icons; Team B blue reads equal to Team A red.
- `npx tsc --noEmit` clean; `npm test` green.
- App icon renders crisply at small sizes (two-tone or gold fallback).
