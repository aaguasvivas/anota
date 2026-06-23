// src/theme/entitlement.ts
// Pure gating logic. No React Native imports.
import { getTheme, FREE_THEME_ID, Theme, ThemeId } from './themes';

export function isThemeLocked(theme: Theme, proUnlocked: boolean): boolean {
  return theme.tier === 'pro' && !proUnlocked;
}

export function resolveActiveThemeId(requestedId: string, proUnlocked: boolean): ThemeId {
  const theme = getTheme(requestedId);
  return isThemeLocked(theme, proUnlocked) ? FREE_THEME_ID : theme.id;
}
