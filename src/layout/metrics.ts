export type LayoutMetrics = {
  compact: boolean;
  scoreFontSize: number;
  scoreLineHeight: number;
  tileSize: number;
  chipHeight: number;
  heroHeight: number;
  progressHeight: number;
  regionGap: number; // gap between a team card and its score pad
  cardPadV: number; // TeamCard vertical padding
};

// Below this usable height (window height minus safe-area insets) we switch to
// compact sizing so the single, non-scrolling layout still fits. Tuned so
// iPhone SE (~647 usable) -> compact and iPhone 13 mini and larger -> normal.
export const COMPACT_HEIGHT_THRESHOLD = 700;

// Below this we squeeze further: an SE with the ad banner loaded has roughly
// 587 usable points, and the compact profile alone no longer fits.
export const SQUEEZE_HEIGHT_THRESHOLD = 620;

export function computeLayoutMetrics(usableHeight: number): LayoutMetrics {
  if (usableHeight < SQUEEZE_HEIGHT_THRESHOLD) {
    return {
      compact: true,
      scoreFontSize: 40,
      scoreLineHeight: 44,
      tileSize: 15,
      chipHeight: 38,
      heroHeight: 38,
      progressHeight: 3,
      regionGap: 3,
      cardPadV: 4,
    };
  }
  const compact = usableHeight < COMPACT_HEIGHT_THRESHOLD;
  return compact
    ? {
        compact: true,
        scoreFontSize: 48,
        scoreLineHeight: 52,
        tileSize: 18,
        chipHeight: 46,
        heroHeight: 46,
        progressHeight: 4,
        regionGap: 4,
        cardPadV: 6,
      }
    : {
        compact: false,
        scoreFontSize: 60,
        scoreLineHeight: 64,
        tileSize: 22,
        chipHeight: 54,
        heroHeight: 52,
        progressHeight: 5,
        regionGap: 8,
        cardPadV: 8,
      };
}
