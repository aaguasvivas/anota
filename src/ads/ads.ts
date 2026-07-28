// Google Mobile Ads bootstrap: gather consent (UMP handles the EEA form),
// request App Tracking Transparency explicitly, then start the SDK. Follows
// the same philosophy as the IAP layer: ads can fail forever and the app stays
// fully usable.
import { AppState, Platform } from 'react-native';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

let startedPromise: Promise<boolean> | null = null;

// iOS pre-warms apps into a background state, and an ATT request made before
// the app is active is silently swallowed, losing the prompt. Hold the whole
// consent flow until the app is genuinely foreground.
function whenActive(): Promise<void> {
  if (AppState.currentState === 'active') return Promise.resolve();
  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

async function start(): Promise<boolean> {
  await whenActive();
  let consentErrored = false;
  try {
    await AdsConsent.gatherConsent();
  } catch {
    // Consent info can be unavailable (offline, or no UMP message configured
    // yet). Outside the EEA ads may still serve, so fall through and let the
    // canRequestAds check decide.
    consentErrored = true;
  }
  // Apple requires the ATT prompt BEFORE any data that could track the user
  // is collected, and App Review verifies it appears. The UMP flow above only
  // triggers ATT when the AdMob console decides to (it showed nothing on US
  // devices, which is exactly what got 1.2.0 build 6 rejected), so ask
  // explicitly here. If UMP already asked, the status is no longer
  // "undetermined" and this is a no-op.
  if (Platform.OS === 'ios') {
    try {
      // Re-check foreground right before the one-shot request: the UMP step
      // above can take seconds, and a request made while inactive is lost.
      await whenActive();
      const { status } = await getTrackingPermissionsAsync();
      if (status === 'undetermined') {
        await requestTrackingPermissionsAsync();
      }
    } catch {
      // ATT unavailable; ads proceed non-personalized.
    }
  }
  try {
    const info = await AdsConsent.getConsentInfo();
    // Respect an explicit "no": if the consent flow completed and says ads
    // cannot be requested, stay dark. Only fail open when the flow itself
    // errored before producing an answer.
    if (!info.canRequestAds && !consentErrored) return false;
    await mobileAds().initialize();
    return true;
  } catch {
    return false;
  }
}

// Idempotent: the first caller triggers the flow, everyone else awaits it.
export function initAds(): Promise<boolean> {
  if (!startedPromise) startedPromise = start();
  return startedPromise;
}
