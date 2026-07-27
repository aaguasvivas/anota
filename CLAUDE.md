# ANOTA

Anotador de dominó / domino scorekeeper. Expo app, App Store target. Bundle id: dev.anota.app.

## Stack
Expo (app.json name "Anota", slug "anota"), TypeScript.

## Commands
- Dev: `npm start` (then i or a for simulator)
- iOS: `npm run ios` | Android: `npm run android` | Web: `npm run web`
- Test: `npm test`

## Languages
Spanish-first, bilingual ES/EN. TS dictionaries in src/i18n/es.ts and en.ts; keep keys in parity (check: `node ~/.claude/scripts/i18n-parity.mjs .`).

## Rules
- No em dashes in user-facing text.
- Layout must survive iPhone SE size; test in simulator before calling anything done.
