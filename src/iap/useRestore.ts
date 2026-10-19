import { useCallback, useState } from 'react';
import { useAdsRemoved } from '../ads/AdsRemovedProvider';
import { useThemeControls } from '../theme/ThemeProvider';
import { PRO_PRODUCT_ID, REMOVE_ADS_PRODUCT_ID, restoreOwned } from './purchases';

export type RestoreStatus = 'idle' | 'pending' | 'restored' | 'notFound';

// Restore purchases from the store. Shared by the Pro sheet and Settings so a
// returning buyer who still sees ads can restore from either place. Like the
// launch restore, it only ever grants entitlements, never revokes them.
export function useRestore() {
  const { setProUnlocked } = useThemeControls();
  const { setAdsRemoved } = useAdsRemoved();
  const [status, setStatus] = useState<RestoreStatus>('idle');

  const restore = useCallback(async () => {
    setStatus('pending');
    try {
      const owned = await restoreOwned();
      if (owned.includes(PRO_PRODUCT_ID)) setProUnlocked(true);
      if (owned.includes(REMOVE_ADS_PRODUCT_ID)) setAdsRemoved(true);
      setStatus(owned.length > 0 ? 'restored' : 'notFound');
    } catch {
      setStatus('notFound');
    }
  }, [setProUnlocked, setAdsRemoved]);

  const reset = useCallback(() => setStatus('idle'), []);

  return { status, restore, reset };
}
