// src/theme/ThemeProvider.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, Theme, ThemeId } from './themes';
import { resolveActiveThemeId } from './entitlement';

const STORAGE_KEY = '@anota:theme:v1';

interface Persisted {
  themeId: ThemeId;
  proUnlocked: boolean;
}

interface ThemeControls {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  proUnlocked: boolean;
  setProUnlocked: (v: boolean) => void;
  hydrated: boolean;
}

const ThemeValueContext = createContext<Theme | null>(null);
const ThemeControlsContext = createContext<ThemeControls | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('classic');
  const [proUnlocked, setProUnlockedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw) as Partial<Persisted>;
          const pro = typeof p.proUnlocked === 'boolean' ? p.proUnlocked : false;
          const id = resolveActiveThemeId(String(p.themeId ?? 'classic'), pro);
          setProUnlockedState(pro);
          setThemeIdState(id);
        }
      } catch {
        // ignore, fall back to defaults
      }
      setHydrated(true);
    })();
  }, []);

  const persist = useCallback((next: Persisted) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setThemeId = useCallback(
    (id: ThemeId) => {
      const resolved = resolveActiveThemeId(id, proUnlocked);
      setThemeIdState(resolved);
      persist({ themeId: resolved, proUnlocked });
    },
    [proUnlocked, persist],
  );

  const setProUnlocked = useCallback(
    (v: boolean) => {
      setProUnlockedState(v);
      // Keep the current theme; if it was a downgrade it gets re-resolved on next select.
      persist({ themeId, proUnlocked: v });
    },
    [themeId, persist],
  );

  const theme = getTheme(themeId);

  return (
    <ThemeControlsContext.Provider
      value={{ themeId, setThemeId, proUnlocked, setProUnlocked, hydrated }}
    >
      <ThemeValueContext.Provider value={theme}>{children}</ThemeValueContext.Provider>
    </ThemeControlsContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeValueContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export function useThemeControls(): ThemeControls {
  const ctx = useContext(ThemeControlsContext);
  if (!ctx) throw new Error('useThemeControls must be used inside <ThemeProvider>');
  return ctx;
}
