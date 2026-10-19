import { useCallback, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAdsRemoved } from '../ads/AdsRemovedProvider';
import { useT } from '../i18n';
import { useThemeControls } from '../theme/ThemeProvider';
import { PRO_PRODUCT_ID, REMOVE_ADS_PRODUCT_ID, restoreOwned } from './purchases';

export type RestoreStatus = 'idle' | 'pending' | 'restored' | 'notFound' | 'failed';

// Restore purchases from the store. Shared by the Pro sheet and Settings so a
// returning buyer who still sees ads can restore from either place. Like the
// launch restore, it only ever grants entitlements, never revokes them.
export function useRestore() {
  const { t } = useT();
  const { setProUnlocked } = useThemeControls();
  const { setAdsRemoved } = useAdsRemoved();
  const [status, setStatus] = useState<RestoreStatus>('idle');

  const restore = useCallback(async () => {
    setStatus('pending');
    let next: RestoreStatus;
    try {
      const owned = await restoreOwned();
      if (owned.includes(PRO_PRODUCT_ID)) setProUnlocked(true);
      if (owned.includes(REMOVE_ADS_PRODUCT_ID)) setAdsRemoved(true);
      next = owned.length > 0 ? 'restored' : 'notFound';
    } catch {
      // The store could not answer: say so, never "nothing to restore".
      next = 'failed';
    }
    setStatus(next);
    AccessibilityInfo.announceForAccessibility(
      next === 'restored' ? t.pro.restored : next === 'notFound' ? t.pro.notFound : t.pro.restoreFailed,
    );
  }, [setProUnlocked, setAdsRemoved, t]);

  const reset = useCallback(() => setStatus('idle'), []);

  const message =
    status === 'restored'
      ? t.pro.restored
      : status === 'notFound'
        ? t.pro.notFound
        : status === 'failed'
          ? t.pro.restoreFailed
          : null;

  return { status, message, restore, reset };
}
