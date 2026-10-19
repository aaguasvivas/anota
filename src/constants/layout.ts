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

// Dynamic Type caps (maxFontSizeMultiplier). The board is one screen that
// never scrolls, so its text may grow only a little before it would push the
// + Points buttons under the footer; sheets and dialogs can grow more, and the
// scrolling Settings sheet the most. Numerals already auto-shrink to fit.
export const FONT_CAP = {
  numeral: 1,
  board: 1.1,
  keypad: 1.3,
  overlay: 1.5,
  winnerLabel: 1.3,
  winnerButton: 1.15,
  scroll: 2,
  // Theme tiles sit in a three-column grid about 80pt wide inside on a 375pt
  // phone. Names stay on one line and shrink to fit ("Medianoche" needs about
  // 84pt at this cap), so a long word never breaks in the middle.
  themeTile: 1.2,
} as const;
