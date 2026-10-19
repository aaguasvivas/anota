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
  dividerPadV: number; // vertical padding around the round strip
};

// Usable height = window height minus safe-area insets minus the ad banner
// once it has loaded. One screen that never scrolls has to fit every tier.
// Measured usable heights: iPhone SE 647 (588 with the banner), 13 mini 728
// (about 669 with the banner), iPhone 16 759 (about 702 with the banner),
// 17 Pro Max 860 (about 792 with the banner).

// Below this, squeeze: the SE with the banner.
export const SQUEEZE_HEIGHT_THRESHOLD = 640;
// Below this, compact: the SE without the banner, and mid-size phones with it.
export const COMPACT_HEIGHT_THRESHOLD = 726;
// From this up, tall: the Pro Max class, where extra height goes to the
// digits the table reads instead of empty space around the round strip.
export const TALL_HEIGHT_THRESHOLD = 784;

export function computeLayoutMetrics(usableHeight: number): LayoutMetrics {
  if (usableHeight < SQUEEZE_HEIGHT_THRESHOLD) {
    return {
      compact: true,
      scoreFontSize: 42,
      scoreLineHeight: 46,
      tileSize: 15,
      chipHeight: 44,
      heroHeight: 44,
      progressHeight: 3,
      regionGap: 3,
      cardPadV: 4,
      dividerPadV: 4,
    };
  }
  if (usableHeight < COMPACT_HEIGHT_THRESHOLD) {
    return {
      compact: true,
      scoreFontSize: 48,
      scoreLineHeight: 52,
      tileSize: 18,
      chipHeight: 46,
      heroHeight: 46,
      progressHeight: 4,
      regionGap: 4,
      cardPadV: 6,
      dividerPadV: 8,
    };
  }
  if (usableHeight < TALL_HEIGHT_THRESHOLD) {
    return {
      compact: false,
      scoreFontSize: 60,
      scoreLineHeight: 64,
      tileSize: 22,
      chipHeight: 54,
      heroHeight: 52,
      progressHeight: 5,
      regionGap: 8,
      cardPadV: 8,
      dividerPadV: 8,
    };
  }
  return {
    compact: false,
    scoreFontSize: 72,
    scoreLineHeight: 76,
    tileSize: 24,
    chipHeight: 58,
    heroHeight: 56,
    progressHeight: 6,
    regionGap: 8,
    cardPadV: 10,
    dividerPadV: 8,
  };
}
