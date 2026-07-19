// Google Mobile Ads bootstrap: gather consent (UMP handles the EEA form and
// the ATT alert when one is configured in AdMob), then start the SDK. Follows
// the same philosophy as the IAP layer: ads can fail forever and the app stays
// fully usable.
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

let startedPromise: Promise<boolean> | null = null;

async function start(): Promise<boolean> {
  let consentErrored = false;
  try {
    await AdsConsent.gatherConsent();
  } catch {
    // Consent info can be unavailable (offline, or no UMP message configured
    // yet). Outside the EEA ads may still serve, so fall through and let the
    // canRequestAds check decide.
    consentErrored = true;
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
