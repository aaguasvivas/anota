# Anota — and the App-Factory Playbook

> The durable context + checklist for shipping Anota and the apps after it.
> If you're an AI assistant picking this up cold: read this file first.

---

## The vision

Build a **collection of ~20 small, genuinely useful apps** — each one **does one thing on essentially one screen**, looks and feels premium, and solves a real problem. Ship them to the **Apple App Store** and **Google Play**. Earn **passive income** via ads and/or a cheap one-time purchase. **Never sacrifice quality** — these should feel like an "app of choice," not throwaway utilities.

**Strategy** (à la the "ship many small apps, let the market pick winners" playbook): find an underserved need, build the simplest *beautiful* version that solves it, ship it, learn, repeat. A portfolio aggregates: a few apps carry the rest, so volume + quality compounds.

**Anota is app #1.** Its real job isn't just to be a great dominoes scorekeeper — it's to **establish the repeatable pipeline** (design → build → polish → store) so apps #2–20 take days, not weeks.

### Principles
1. **Quality is non-negotiable.** Tasteful UI, real haptics, no jank, no broken layouts on any device.
2. **One screen, one job.** Ruthless YAGNI. Depth through polish, not feature count.
3. **No backend, no auth, no accounts** unless a specific app truly needs it. Local-first.
4. **Monetize without wrecking the feel.** No mid-task interstitials. Banner only on calm surfaces; cheap "remove ads" IAP.
5. **Every app feeds the factory.** Reusable pieces get extracted into the starter template.

---

## Tech stack baseline (the factory defaults)

- **Expo (SDK 54+) + React Native + TypeScript (strict).**
- **EAS Build / Submit** for store binaries (no manual Xcode signing).
- **AsyncStorage** for local persistence (with a schema guard + lenient migration).
- **Bilingual i18n** (ES/EN) via a small `LanguageProvider` + typed dictionaries (parity enforced by TS).
- **expo-haptics** (with a mute pref), **expo-keep-awake** where relevant, **expo-linear-gradient**, **@expo/vector-icons** (Ionicons).
- **Jest + ts-jest** for pure-logic unit tests (keep core logic RN-free so tests stay light).
- **Code-generated app icon** from an SVG via `rsvg-convert` (`scripts/gen-icons.mjs`) — version-controlled, re-renders in seconds.

> Node 20+ is required for SDK 54 tooling. The repo pins it in `.nvmrc`; always `nvm use` before `npx expo ...`.

---

## Reusable starter pieces to extract (from Anota → template)

When Anota ships, extract these into a `app-starter` template so app #2 is a fork:
- `src/i18n/` — provider + typed dictionary pattern.
- `src/utils/storage.ts` — AsyncStorage wrapper with `isX` validation + migration.
- `src/utils/preferences.ts` + `src/utils/haptics.ts` — sync pref store + haptics helpers.
- `src/constants/{colors,layout}.ts` — theme tokens (spacing/radii/palette).
- `src/components/` — `ConfirmDialog`, a bottom-sheet pattern, `ScoreButton`/pressable patterns.
- `scripts/gen-icons.mjs` — icon generator (swap the SVG per app).
- `jest.config.js`, `tsconfig.json`, `eas.json`, `app.json` skeleton.
- This `PLAYBOOK.md` + the release checklist below.

---

## Monetization plan

**v1 (first release of any app): FREE, no ads, no IAP.**
Rationale: simplest possible store submission — no ad SDK, no iOS App Tracking Transparency prompt, and the privacy story is literally "collects no data." Learn the full pipeline on easy mode.

**v1.1+ (after the pipeline works):**
- **Banner ad** on calm surfaces only (e.g. settings or the post-game/winner screen) — never mid-task. Tool: `react-native-google-mobile-ads` (AdMob). Requires an EAS dev build (not Expo Go).
- **One-time "Remove ads / tip" IAP** (~$1.99). Tool: **RevenueCat** (wraps StoreKit/Play Billing; handles receipts + restore — easiest for solo devs).
- Adding ads means you now collect ad identifiers → you must add a **privacy policy**, the iOS **ATT** prompt, and Play **Data Safety** disclosures. Factor that in.

**Web:** not a product target for these phone-at-the-table apps. Optional later: a tiny static **landing/demo page** for discovery. Don't split focus building a web app.

---

## Per-app store release checklist

### Accounts & costs (one-time setup, reused for all apps)
- [ ] **Apple Developer Program** — $99/year. (developer.apple.com)
- [ ] **Google Play Developer** — $25 one-time. (play.google.com/console)
- [ ] **Expo account** for EAS (free tier covers low build volume).

### Per app — config
- [ ] Unique `bundleIdentifier` (iOS) + `package` (Android), reverse-domain (e.g. `dev.anota.app`).
- [ ] `app.json`: name, slug, version, `ios.buildNumber`, `android.versionCode`, icon, splash, `userInterfaceStyle`.
- [ ] **iPad decision** — for phone-tuned apps set `ios.supportsTablet: false` for v1 unless designed for iPad.
- [ ] `eas.json` with `development` / `preview` / `production` profiles.
- [ ] App icon is 1024×1024, **opaque** (no alpha) for the iOS marketing icon.

### Per app — build & test
- [ ] `eas build -p ios` and `eas build -p android` (or `--platform all`).
- [ ] Internal test: iOS **TestFlight**, Android **internal testing track**.
- [ ] Verify on a **small device** (iPhone SE) and a large one — layout must not overflow.

### Per app — store listings
- [ ] **Screenshots** (generate from the simulator; both stores need several sizes).
- [ ] Title, subtitle, description, **keywords** (ASO — find underserved search terms).
- [ ] Category, age rating / content rating questionnaire.
- [ ] **Privacy:** App Store privacy "nutrition label" + Play **Data Safety** form. If no ads/data → "collects no data." A privacy-policy URL is required by both (a static page is fine).

### Per app — submit & review
- [ ] iOS: `eas submit -p ios` → App Store Connect → submit for review (~1–3 days). Watch guideline **4.2 (minimum functionality)** — keep the one screen genuinely useful + polished.
- [ ] Android: `eas submit -p android`. ⚠️ **New personal Play accounts require closed testing with ~12 testers for 14 days before production.** Start this clock early.

---

## Anota — current status (app #1)

**Done (Batch 1 "Fast & Polished", on `main`):**
fast in-app score keypad + instant preset chips, Keep-Playing bug fixed, vector icons, hydration gate (no launch flash), Team-B color rebalance, dead-code cleanup, pure tested reducer, code-generated domino-tile icon. tsc clean · 10 unit tests · Metro bundles.

**Remaining before store submission:**
1. **Small-device layout batch** — make the split-screen fit/breathe on SE/mini; remove the `flex` + magic-`paddingBottom` fragility. (Quality gate.)
2. **Release plumbing** — `eas.json`, build/version numbers, `supportsTablet: false`, screenshots, listing copy, privacy page, accounts.
3. Submit to TestFlight + Play closed testing → production.
4. **Extract the starter template** from the result → app #2 begins as a fork.

---

## Process notes (how we work)

- Brainstorm/design → write spec → write plan → implement task-by-task with review → verify (tsc + tests + real bundle) → merge to `main` → push. (Specs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.)
- Solo dev: everything lands on `main` and pushes to GitHub.
- Keep core logic pure + unit-tested; UI verified by building the real Metro bundle, not just `tsc`.
