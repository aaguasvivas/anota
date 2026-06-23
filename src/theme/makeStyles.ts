// src/theme/makeStyles.ts
import { useMemo } from 'react';
import { Theme } from './themes';
import { useTheme } from './ThemeProvider';

// Build a StyleSheet from the active theme, memoized on theme identity.
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme]);
}
