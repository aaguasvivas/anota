// Dark, premium "domino table" palette.
// Background mimics felt; cards mimic ivory tiles.

export const colors = {
  // Surfaces
  bg: '#0B1410',
  bgDeep: '#070D0A',
  felt: '#0F1F18',
  feltEdge: '#1A2E25',
  hairline: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.12)',

  // Ivory tile
  tile: '#F3EDDC',
  tileShadow: '#C9C0A8',
  tileInk: '#10130E',

  // Text
  text: '#F4EFE2',
  textDim: 'rgba(244, 239, 226, 0.62)',
  textFaint: 'rgba(244, 239, 226, 0.38)',

  // Accents (Dominican-flavored)
  gold: '#E6B449',
  goldDim: '#7A5E22',
  red: '#E63946',
  redDim: '#4A1318',
  blue: '#3B82F6',
  blueDim: '#13243B',

  // Status
  danger: '#E5484D',
} as const;

export const teamPalette = {
  A: {
    color: colors.red,
    glow: 'rgba(230, 57, 70, 0.35)',
  },
  B: {
    color: colors.blue,
    glow: 'rgba(59, 130, 246, 0.35)',
  },
} as const;
