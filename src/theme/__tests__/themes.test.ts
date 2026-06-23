// src/theme/__tests__/themes.test.ts
import { THEMES, THEME_IDS, FREE_THEME_ID, getTheme } from '../themes';

test('there are six themes, exactly one free', () => {
  expect(THEME_IDS).toHaveLength(6);
  const free = THEMES.filter((t) => t.tier === 'free');
  expect(free).toHaveLength(1);
  expect(free[0].id).toBe(FREE_THEME_ID);
});

test('classic is the free theme and matches the live palette', () => {
  const classic = getTheme('classic');
  expect(classic.tier).toBe('free');
  expect(classic.felt).toBe('#0F1F18');
  expect(classic.gold).toBe('#E6B449');
  expect(classic.teams.A.color).toBe('#E63946');
  expect(classic.teams.B.color).toBe('#3B82F6');
});

test('getTheme falls back to the free theme for unknown ids', () => {
  expect(getTheme('nope').id).toBe(FREE_THEME_ID);
});

test('every theme defines every token (no undefined)', () => {
  for (const t of THEMES) {
    for (const key of ['bg','bgDeep','felt','hairline','divider','tile','tileShadow','tileInk','text','textDim','textFaint','gold','danger'] as const) {
      expect(typeof t[key]).toBe('string');
    }
    expect(typeof t.teams.A.color).toBe('string');
    expect(typeof t.teams.A.glow).toBe('string');
    expect(typeof t.teams.B.color).toBe('string');
    expect(typeof t.teams.B.glow).toBe('string');
    expect(typeof t.isLight).toBe('boolean');
  }
});
