# Anota - Release Runbook

Everything in the app and the listing kit is ready. This is the line-by-line path to submit.

## Status / prerequisites
- Expo: logged in, project linked (@aaguasvivas/anota). Ready.
- Apple Developer Program: wait for the "enrollment complete" email before the iOS build.
- Google Play Console: wait for identity verification. Meanwhile, line up 12 testers (see Android).
- Always run from the repo with Node 20: `cd ~/Desktop/personal/anota && nvm use`.

## Assets and values (copy from here)
- Privacy policy URL: https://aaguasvivas.github.io/anota-site/privacy.html
- Landing page: https://aaguasvivas.github.io/anota-site/
- Listing copy (EN + ES): docs/store-listing.md
- Screenshots (6.7", 1290x2796): store-assets/screenshots/marketing/
- Bundle id / package: dev.anota.app
- Privacy answers: App Store = "Data Not Collected"; Play Data Safety = "No data collected or shared"
- Age rating: 4+ / Everyone. Category: Utilities (App Store) / Tools (Play). Device: iPhone only.

## iOS (run when the Apple approval email arrives)
```bash
cd ~/Desktop/personal/anota && nvm use
eas build --platform ios --profile production   # log into Apple when prompted; EAS makes the certs
eas submit --platform ios                       # uploads to App Store Connect + TestFlight
```
Then in App Store Connect (appstoreconnect.apple.com):
1. Open the app record (eas submit creates it, or create it: name "Anota: Domino Scorekeeper", bundle id dev.anota.app).
2. Paste name, subtitle, keywords, promotional text, and description from docs/store-listing.md. Add the Spanish (es-MX) localization with the ES copy.
3. Upload the screenshots from store-assets/screenshots/marketing/.
4. App Privacy: choose "Data Not Collected". Paste the privacy URL.
5. Set age rating 4+, category Utilities, availability iPhone only.
6. Install the build from TestFlight, test it, then "Add for Review" and Submit. Review is usually 1 to 3 days.

## Android (Google)
Start now, in parallel with verification: recruit at least 12 testers (friends, family, or a tester-exchange community). New personal accounts must run a closed test for 14 days before production.

When verification clears:
```bash
cd ~/Desktop/personal/anota && nvm use
eas build --platform android --profile production   # produces an .aab
```
In Play Console (play.google.com/console):
1. Create the app, then on a "Closed testing" track upload the .aab BY HAND the first time (Google requires one manual upload).
2. Add your 12+ testers (email list or a Google Group), publish the closed test, keep it live 14 consecutive days.
3. Fill Data Safety as "no data", paste the privacy URL, add the listing copy and screenshots.
4. After 14 days, apply for production access and promote the release.
5. Future updates can use `eas submit --platform android` (after a one-time Google service-account key setup).

## After launch (v1.1 ideas, not now)
- Tasteful monetization: one banner on calm screens only (winner / settings), plus a $1.99 "support / remove ads" purchase. Tools: react-native-google-mobile-ads, RevenueCat.
- Ask-for-review prompt after a few completed matches (expo-store-review).
- Reuse this app as the template for apps #2 onward.
