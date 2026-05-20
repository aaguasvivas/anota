import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MatchState } from '../types';

const KEY = '@anota:match:v1';

export async function loadMatch(): Promise<MatchState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MatchState;
  } catch {
    return null;
  }
}

export async function saveMatch(state: MatchState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Persistence failures are non-fatal — the match continues in memory.
  }
}

export async function clearMatch(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
