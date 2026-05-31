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

// Fixed-score events at a Dominican table: passes / capicúa / multi-pass.
// Arbitrary pip counts are entered on the keypad instead.
export const QUICK_SCORES = [25, 30, 50] as const;

export const TARGET_PRESETS = [100, 150, 200] as const;

export const DEFAULT_TARGET = 200;
