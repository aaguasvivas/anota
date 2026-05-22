import AsyncStorage from '@react-native-async-storage/async-storage';

// Tiny module-level preferences store. The values are read synchronously by
// utilities (e.g. haptics) and updated via the Settings UI. Hydrated once at
// app start so the haptics helpers don't need to await on every tap.

const KEY = '@anota:prefs:v1';

type Prefs = {
  hapticsMuted: boolean;
};

let current: Prefs = { hapticsMuted: false };
const listeners = new Set<(p: Prefs) => void>();

export async function hydratePrefs(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      const p = parsed as Partial<Prefs>;
      if (typeof p.hapticsMuted === 'boolean') {
        current = { ...current, hapticsMuted: p.hapticsMuted };
      }
    }
  } catch {
    // Persistence failures are non-fatal.
  }
}

export function getPrefs(): Prefs {
  return current;
}

export function isHapticsMuted(): boolean {
  return current.hapticsMuted;
}

export function setHapticsMuted(v: boolean): void {
  current = { ...current, hapticsMuted: v };
  listeners.forEach((l) => l(current));
  AsyncStorage.setItem(KEY, JSON.stringify(current)).catch(() => {});
}

export function subscribePrefs(listener: (p: Prefs) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
