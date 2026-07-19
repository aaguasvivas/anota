// Persists the "Remove Ads" entitlement, mirroring ThemeProvider's pattern.
// Note this stores only the standalone purchase; the app computes effective
// ad-free as (adsRemoved || proUnlocked), since Pro includes ad removal.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const STORAGE_KEY = '@anota/ads_v1';

type Persisted = { adsRemoved: boolean };

type AdsRemovedState = {
  adsRemoved: boolean;
  setAdsRemoved: (v: boolean) => void;
  hydrated: boolean;
};

const AdsRemovedContext = createContext<AdsRemovedState | null>(null);

export function AdsRemovedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adsRemoved, setAdsRemovedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw) as Partial<Persisted>;
          if (p.adsRemoved === true) setAdsRemovedState(true);
        }
      } catch {
        // ignore, fall back to defaults
      }
      setHydrated(true);
    })();
  }, []);

  const setAdsRemoved = useCallback((v: boolean) => {
    setAdsRemovedState(v);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ adsRemoved: v })).catch(
      () => {},
    );
  }, []);

  return (
    <AdsRemovedContext.Provider value={{ adsRemoved, setAdsRemoved, hydrated }}>
      {children}
    </AdsRemovedContext.Provider>
  );
}

export function useAdsRemoved(): AdsRemovedState {
  const ctx = useContext(AdsRemovedContext);
  if (!ctx) {
    throw new Error('useAdsRemoved must be used inside <AdsRemovedProvider>');
  }
  return ctx;
}
