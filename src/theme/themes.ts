// src/theme/themes.ts
// Pure theme registry. No React Native imports so it is unit-testable in node.
import { colors, teamPalette } from '../constants/colors';

export type ThemeId = 'classic' | 'midnight' | 'mahogany' | 'casino' | 'bone' | 'carbon';
export type ThemeTier = 'free' | 'pro';

export interface TeamColors {
  color: string;
  glow: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  tier: ThemeTier;
  isLight: boolean;
  bg: string;
  bgDeep: string;
  felt: string;
  hairline: string;
  divider: string;
  tile: string;
  tileShadow: string;
  tileInk: string;
  text: string;
  textDim: string;
  textFaint: string;
  gold: string;
  danger: string;
  teams: { A: TeamColors; B: TeamColors };
  iconName?: string; // reserved for v1.2 alternate app icons; unused in v1.1
}

const DARK_HAIRLINE = 'rgba(255, 255, 255, 0.08)';
const DARK_DIVIDER = 'rgba(255, 255, 255, 0.12)';
const IVORY_TILE = colors.tile;
const IVORY_TILE_SHADOW = colors.tileShadow;
const IVORY_TILE_INK = colors.tileInk;

const classic: Theme = {
  id: 'classic',
  name: 'Classic Felt',
  tier: 'free',
  isLight: false,
  bg: colors.bg,
  bgDeep: colors.bgDeep,
  felt: colors.felt,
  hairline: colors.hairline,
  divider: colors.divider,
  tile: colors.tile,
  tileShadow: colors.tileShadow,
  tileInk: colors.tileInk,
  text: colors.text,
  textDim: colors.textDim,
  textFaint: colors.textFaint,
  gold: colors.gold,
  danger: colors.danger,
  teams: {
    A: { color: teamPalette.A.color, glow: teamPalette.A.glow },
    B: { color: teamPalette.B.color, glow: teamPalette.B.glow },
  },
};

const midnight: Theme = {
  id: 'midnight',
  name: 'Midnight',
  tier: 'pro',
  isLight: false,
  bg: '#0A1020',
  bgDeep: '#060B14',
  felt: '#0B1322',
  hairline: DARK_HAIRLINE,
  divider: DARK_DIVIDER,
  tile: IVORY_TILE,
  tileShadow: IVORY_TILE_SHADOW,
  tileInk: IVORY_TILE_INK,
  text: '#EAF1FB',
  textDim: 'rgba(234, 241, 251, 0.62)',
  textFaint: 'rgba(234, 241, 251, 0.38)',
  gold: '#6FA8FF',
  danger: '#E5484D',
  teams: {
    A: { color: '#FF7A6B', glow: 'rgba(255, 122, 107, 0.35)' },
    B: { color: '#57C8D6', glow: 'rgba(87, 200, 214, 0.35)' },
  },
};

const mahogany: Theme = {
  id: 'mahogany',
  name: 'Mahogany',
  tier: 'pro',
  isLight: false,
  bg: '#241409',
  bgDeep: '#1A0F07',
  felt: '#2B1A12',
  hairline: DARK_HAIRLINE,
  divider: DARK_DIVIDER,
  tile: IVORY_TILE,
  tileShadow: IVORY_TILE_SHADOW,
  tileInk: IVORY_TILE_INK,
  text: '#F2E6D6',
  textDim: 'rgba(242, 230, 214, 0.62)',
  textFaint: 'rgba(242, 230, 214, 0.38)',
  gold: '#D9A05B',
  danger: '#E5484D',
  teams: {
    A: { color: '#E0734A', glow: 'rgba(224, 115, 74, 0.35)' },
    B: { color: '#7FB0C4', glow: 'rgba(127, 176, 196, 0.35)' },
  },
};

const casino: Theme = {
  id: 'casino',
  name: 'Casino Red',
  tier: 'pro',
  isLight: false,
  bg: '#220A0A',
  bgDeep: '#180606',
  felt: '#2A0C0C',
  hairline: DARK_HAIRLINE,
  divider: DARK_DIVIDER,
  tile: IVORY_TILE,
  tileShadow: IVORY_TILE_SHADOW,
  tileInk: IVORY_TILE_INK,
  text: '#F6E9DC',
  textDim: 'rgba(246, 233, 220, 0.62)',
  textFaint: 'rgba(246, 233, 220, 0.38)',
  gold: '#E8C36B',
  danger: '#E5484D',
  teams: {
    A: { color: '#EF9B5E', glow: 'rgba(239, 155, 94, 0.35)' },
    B: { color: '#E89B7A', glow: 'rgba(232, 155, 122, 0.35)' },
  },
};

const bone: Theme = {
  id: 'bone',
  name: 'Bone',
  tier: 'pro',
  isLight: true,
  bg: '#EDE6D6',
  bgDeep: '#E2D9C5',
  felt: '#EDE6D6',
  hairline: 'rgba(0, 0, 0, 0.10)',
  divider: 'rgba(0, 0, 0, 0.14)',
  tile: '#FBF6EA',
  tileShadow: '#D8CDB4',
  tileInk: '#2A2117',
  text: '#2A2117',
  textDim: 'rgba(42, 33, 23, 0.62)',
  textFaint: 'rgba(42, 33, 23, 0.40)',
  gold: '#B8862F',
  danger: '#C0392B',
  teams: {
    A: { color: '#C0432B', glow: 'rgba(192, 67, 43, 0.28)' },
    B: { color: '#2F6DA8', glow: 'rgba(47, 109, 168, 0.28)' },
  },
};

const carbon: Theme = {
  id: 'carbon',
  name: 'Carbon',
  tier: 'pro',
  isLight: false,
  bg: '#161616',
  bgDeep: '#0E0E0E',
  felt: '#141414',
  hairline: DARK_HAIRLINE,
  divider: DARK_DIVIDER,
  tile: IVORY_TILE,
  tileShadow: IVORY_TILE_SHADOW,
  tileInk: IVORY_TILE_INK,
  text: '#F2F2F2',
  textDim: 'rgba(242, 242, 242, 0.62)',
  textFaint: 'rgba(242, 242, 242, 0.38)',
  gold: '#E6B449',
  danger: '#E5484D',
  teams: {
    A: { color: '#FF6B5E', glow: 'rgba(255, 107, 94, 0.35)' },
    B: { color: '#5EA6FF', glow: 'rgba(94, 166, 255, 0.35)' },
  },
};

export const THEMES: readonly Theme[] = [classic, midnight, mahogany, casino, bone, carbon];
export const THEME_IDS: readonly ThemeId[] = THEMES.map((t) => t.id);
export const FREE_THEME_ID: ThemeId = 'classic';

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? classic;
}
