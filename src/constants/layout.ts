export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const QUICK_SCORES = [25, 30, 50, 75, 100] as const;

// Hands that are most frequent at a Dominican table get visual weight.
// 30 (a "treinta") and 50 are by far the most-tapped values.
export const PRIMARY_QUICK_SCORES = [30, 50] as const;

export const TARGET_PRESETS = [100, 150, 200] as const;

export const DEFAULT_TARGET = 200;
