# Anota 1.3 design pass: ship audit (2026-10-19)

## Build state

- Live: 1.2.1 on the App Store (built from a4e4466).
- HEAD: branch `design-pass-2026-10`, commits 0e95ce6 (Xcode 27 build fix, capture harness) and 7b53089 (design pass). The verification fixes in this report sit on top as the next commit.
- Measured build: a Release simulator build of the working tree with `EXPO_PUBLIC_CAPTURE=1` (the flag-gated capture harness). The store build must be made without that flag; see "What's left for you".
- Raw evidence (screenshots, logs, review JSON) is outside this public repo, in `~/Desktop/personal/anota-design-review/`.

## 1. Verdict

Ready to ship after the store build passes the checks in "What's left for you". No open defect is above low severity.

## 2. Fix list

Every item below was found by review, fixed in the working tree, and checked in a Release simulator build on an iPhone SE (375x667 pt) and an iPhone 17 Pro Max (440x956 pt), in English and Spanish, unless the line says otherwise.

### Shipped defects in 1.2.1 that this release fixes

1. **fix, verified (simulator)**: On a 375 pt phone with the ad banner, the round chips sat under team B's card and the leads pill touched + Points. Cause: the cards and score pads read layout metrics without the banner height. One metrics object now reaches every board part. After: chips end 10 pt above team B's card, Undo ends 8 pt above the ad (02-mid, all languages).
2. **fix, verified**: 28 text/fill pairs failed WCAG contrast. All 84 pairs the app draws (14 per theme, 6 themes) now pass; the table is generated from the theme source (`contrast-after.txt`) and `src/theme/__tests__/contrast.test.ts` guards it, including the tinted surfaces (leads pill, UP badge, target pill). Each new assertion was run once against the old color to show it fails.
3. **fix, verified**: Casino Red's two teams were nearly the same color (CIELAB distance 15.5). Team B is now blue (#86B8F2), distance above 70.
4. **fix, verified**: Spanish board copy now agrees with any team name: "Nosotros arriba por 28", "faltan 125" / "falta 1", "ARRIBA", "Sumar".

### Design pass items (PLAN.md ranks 1 to 23), verified by an independent review

5. **fix, verified**: Pro Max scores grow to 72 pt (tall tier) with and without the banner; 4-digit scores and 24-character names fit.
6. **fix, verified**: The target pill has a Done bar ("Listo"/"Done") above the number pad, present before the first keystroke (15-target-edit). The first version used autoFocus and would have shown the bar only after a digit; focus now runs after mount.
7. **fix, verified**: Undo names the entry: "Undo +17" / "Deshacer +17" with the team's color dot.
8. **fix, verified**: The keypad shows "Total 75" before digits and "Total 75 → 112" after (EN and ES), with a spoken label "Total 75, 112 after adding".
9. **fix, verified (code review of the app and of React Native's hit-testing source; a timed tap test needs your phone)**: The winner card ignores taps for 620 ms. A transparent full-alpha layer now blocks the board during the 320 ms entrance delay; before this fix, taps in that window reached Undo, + Points and Settings under the invisible card.
10. **fix, verified**: Every round shows in the strip, the newest as a solid chip; the strip runs edge to edge with a taller touch area.
11. **fix, verified**: Settings: Done pinned in the header, every close path commits names and target once, names first, Purchases section with Remove ads and Restore.
12. **fix, verified (code review)**: Restore purchases now reports three outcomes: restored, nothing to restore, or "The App Store could not restore purchases" (before, a store failure said "No purchase found"). A Pro restore from Settings keeps the result line visible, VoiceOver announces it, and a restore from a locked theme tile applies that theme.
13. **fix, verified**: Dynamic Type caps keep the one-screen board inside the SE with the banner at the largest accessibility size; sheets scale further.
14. **fix, verified (code review)**: Reduce Motion is honored (score pop, progress bar, sheet slide, winner entrance). VoiceOver: modal overlays, grouped score per team, score announcements after each change, a remove action on round chips.
15. **fix, verified**: Typing a name in Settings and then tapping a target preset no longer restores the old name (this existed in 1.2.1).

### Text fit fixes (slot, budget at 375 pt, before, after)

16. **fix, verified**: Spanish empty-round hint. Slot: one line, 343 pt, 12 pt, cap 1.1. Before: "Las rondas salen aquí. Mantén una presionada para borrarla." measured 356 pt at 1.0 (rendered shrunk to about 11.4 pt; about 390 pt at the cap). After: "Rondas aquí. Mantén una presionada para borrarla." 299 pt at 1.0, 329 pt at the cap. Captured on one line at default and at the largest size. Grep: the old string is absent from the built bundle (Hermes stores it as UTF-16).
17. **fix, verified**: Theme tile names. Slot: one line, about 80 pt inside a tile on a 375 pt phone, 12 pt, cap 1.2. Before: two lines, so "Medianoche" broke as "Medianoch / e" from xxLarge text. After: one line that shrinks to fit (about 0.95 at the cap), captured on one line at default, xxLarge and the largest accessibility size in Spanish and English. The lock tag uses the same cap, so it no longer outgrows the name.
18. **fix, verified**: Undo and New match labels can shrink; before, "Deshacer +100" could pass the button border at large text.

### Owner decisions (open, defaults applied)

19. **owner decision**: Classic Felt + Points labels stay ivory (3.56:1 on red, 3.15:1 on blue, which pass 3:1 for the 19 pt bold label). The newest round chip on the same fill uses dark ink at 13 pt (4.68:1). Alternative: dark ink on + Points too.
20. **owner decision**: Casino Red team B changes from orange to blue, which changes the look for existing buyers.
21. **owner decision**: The winner phrase "¡Capicúa!" stays, although the app does not record how a hand ended.
22. **owner decision**: Spanish "pa' ganar" became "faltan N" (labels avoid slang).
23. **owner decision**: A free SE with the banner gets 42 pt scores with 44 pt chips (the alternative was 48 pt scores with 38 pt chips).

### Known low items, not fixed

24. On the new architecture, iOS ignores `minimumFontScale`; auto-shrinking labels have no floor. No label renders below 12 pt today.
25. If the user changes the text size while Settings is open, the name placeholders keep their old size until the sheet reopens.

## 3. What's left for you

1. Free disk space. The Mac had under 1 GB free during this audit and the build stopped once on its disk guard. A store build needs several GB.
2. Pick the release path: an App Store release 1.3.0 (review, visible release notes) or an over-the-air update to 1.2.1 through the production channel. The changes are JavaScript only.
3. For the App Store path: make the store build without `EXPO_PUBLIC_CAPTURE`, then confirm in it that `localhost:8099` is absent from the bundle, the AdMob unit is the production one, and Info.plist matches 1.2.1 (ATT string, GADApplicationIdentifier, SKAdNetwork).
4. On your phone, with the new build: restore purchases from Settings (Pro and Remove ads), a win then a fast second tap on Undo, and the target Done bar with the real number pad.
5. Paste the 1.3 release notes from `docs/store-listing.md` into App Store Connect (English and Spanish).
