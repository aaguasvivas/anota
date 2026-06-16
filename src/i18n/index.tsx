import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { en } from './en';
import { es } from './es';
import type { Dictionary, LanguageCode } from './types';

const STORAGE_KEY = '@anota:lang:v1';

const dictionaries: Record<LanguageCode, Dictionary> = { es, en };

function detectDeviceLanguage(): LanguageCode {
  try {
    const locales = Localization.getLocales();
    const primary = locales[0]?.languageCode?.toLowerCase();
    return primary === 'es' ? 'es' : 'en';
  } catch {
    return 'es';
  }
}

type LanguageContextValue = {
  lang: LanguageCode;
  t: Dictionary;
  setLang: (next: LanguageCode) => void;
  pick: <T>(arr: readonly T[]) => T;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(detectDeviceLanguage);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'es' || stored === 'en') {
          setLangState(stored);
        }
      } catch {
        // fall back to device detection
      }
    })();
  }, []);

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Persistence failures are non-fatal — language stays in memory.
    });
  }, []);

  const pick = useCallback(<T,>(arr: readonly T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, t: dictionaries[lang], setLang, pick }),
    [lang, setLang, pick],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useT must be used inside <LanguageProvider>');
  }
  return ctx;
}

// Display name for a team: user-set name if present, otherwise the localized default.
export function teamDisplayName(
  team: { id: 'A' | 'B'; name: string },
  t: Dictionary,
): string {
  if (team.name.trim()) return team.name;
  return team.id === 'A' ? t.team.defaultA : t.team.defaultB;
}

export type { Dictionary, LanguageCode };
