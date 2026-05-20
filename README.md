# Capi Scorekeeper

A polished Dominican-style dominoes scorekeeper for iPhone. Two teams, big legible scores, quick-add buttons, custom point input, round history, undo, target score, and a celebratory winner moment. Local-only, no accounts, no backend.

Built with Expo + React Native + TypeScript.

---

## Run it on your iPhone (Expo Go)

1. **Install Expo Go** on your iPhone from the App Store.
2. From this folder, start the dev server:

   ```bash
   cd CapiScorekeeper
   npm install        # only the first time
   npx expo start --tunnel
   ```

   `--tunnel` works on any network (even if your phone and laptop aren't on the same Wi-Fi). If you *are* on the same Wi-Fi, plain `npx expo start` is faster.

3. **Scan the QR code** that appears in the terminal using your iPhone's Camera app, then tap the banner to open it in Expo Go. The app loads in a few seconds.

> Node note: the Expo dev server prints engine warnings on Node 18. The project runs fine, but if anything looks off, upgrade to Node 20+ (`nvm install 20 && nvm use 20`).

---

## Type-check

```bash
npx tsc --noEmit
```

Should report nothing — the project is fully typed under `"strict": true`.

To re-validate the Expo configuration:

```bash
npx expo-doctor
```

---

## What's inside

```
CapiScorekeeper/
├── App.tsx                       # main screen — composes everything
├── app.json                      # Expo config (dark theme, bundle id, splash)
└── src/
    ├── components/
    │   ├── AnimatedScore.tsx     # animated number with glow on change
    │   ├── ConfirmDialog.tsx     # reusable confirm modal
    │   ├── CustomScoreModal.tsx  # custom-point input modal
    │   ├── DominoTile.tsx        # SVG-free domino tile (pips on a 3x3 grid)
    │   ├── ProgressBar.tsx       # animated progress toward target
    │   ├── RoundHistory.tsx      # horizontal chip-style history
    │   ├── ScoreButton.tsx       # quick-add button
    │   ├── ScorePad.tsx          # +5/+10/+15/+20/+25/+50 grid per team
    │   ├── SettingsModal.tsx     # rename teams + change target + reset
    │   ├── TeamCard.tsx          # large team card with score, tile, progress
    │   └── WinnerModal.tsx       # celebratory winner moment
    ├── constants/
    │   ├── colors.ts             # palette (dark felt + ivory tiles)
    │   ├── copy.ts               # Spanish/Dominican flavor strings
    │   └── layout.ts             # spacing, radii, quick-score presets
    ├── hooks/
    │   └── useMatch.ts           # match state, persistence, derived values
    ├── types/
    │   └── index.ts              # Team, Round, MatchState, TeamId
    └── utils/
        ├── haptics.ts            # tap / success / warning helpers
        ├── id.ts                 # round id generator
        └── storage.ts            # AsyncStorage persistence wrapper
```

---

## Notes for extending

- All match logic lives in `useMatch`. Add new behaviors (e.g. "double points", more than two teams) by extending its returned API; the screen reads from it.
- Colors and spacing are centralized in `src/constants/` — change the palette in one place to re-skin.
- The state schema is keyed under `@capi-scorekeeper:match:v1` in AsyncStorage. Bump the key suffix when introducing a breaking schema change.
