// Contrast floors for the text Anota draws, per theme. A color edit that
// breaks a pair fails here instead of shipping an unreadable label.
import { contrastRatio, inkOn, largeLabelInk, THEMES } from '../themes';

// Blend an "rgba(r, g, b, a)" color onto an opaque hex surface.
function flatten(color: string, surface: string): string {
  const m = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!m) return color;
  const a = parseFloat(m[4]);
  const s = surface.replace('#', '');
  const out = [1, 2, 3].map((i) => {
    const bg = parseInt(s.slice((i - 1) * 2, (i - 1) * 2 + 2), 16);
    const v = Math.round(parseInt(m[i], 10) * a + bg * (1 - a));
    return v.toString(16).padStart(2, '0');
  });
  return `#${out.join('')}`;
}

// Blend a "#RRGGBBAA" color onto an opaque hex surface.
function flattenHex(color: string, surface: string): string {
  const c = color.replace('#', '');
  const s = surface.replace('#', '');
  const a = parseInt(c.slice(6, 8), 16) / 255;
  const out = [0, 2, 4].map((i) => {
    const v = Math.round(parseInt(c.slice(i, i + 2), 16) * a + parseInt(s.slice(i, i + 2), 16) * (1 - a));
    return v.toString(16).padStart(2, '0');
  });
  return `#${out.join('')}`;
}

// CIELAB distance, to check that the two team colors read as different.
function lab(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  const lin = (i: number) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [lin(0), lin(2), lin(4)];
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

describe.each(THEMES.map((t) => [t.id, t] as const))('%s', (_id, theme) => {
  test('large + Points labels reach 3:1 on both team fills', () => {
    for (const team of ['A', 'B'] as const) {
      const fill = theme.teams[team].color;
      expect(contrastRatio(largeLabelInk(fill, theme), fill)).toBeGreaterThanOrEqual(3);
    }
  });

  test('labels on gold and danger fills reach 4.5:1', () => {
    for (const fill of [theme.gold, theme.danger]) {
      expect(contrastRatio(inkOn(fill, theme), fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('labels on solid team fills reach 4.5:1 (newest round chip, keypad Add)', () => {
    for (const team of ['A', 'B'] as const) {
      const fill = theme.teams[team].color;
      expect(contrastRatio(inkOn(fill, theme), fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('team text and dim text reach 4.5:1 on the felt', () => {
    for (const team of ['A', 'B'] as const) {
      expect(contrastRatio(theme.teams[team].text, theme.felt)).toBeGreaterThanOrEqual(4.5);
      // The leads pill draws team text on a 10% tint of the team color.
      const pill = flattenHex(`${theme.teams[team].color}1A`, theme.felt);
      expect(contrastRatio(theme.teams[team].text, pill)).toBeGreaterThanOrEqual(4.5);
      // The UP badge sits on the leading card, where the card's team-colored
      // shadow shows through its translucent fill. A 17% tint of the team
      // color matches the lightest surface pixel measured in captures: the
      // Spanish ARRIBA badge, Classic B, 4.68:1 on the SE (4.65 here).
      const badge = flattenHex(`${theme.teams[team].color}2B`, theme.felt);
      expect(contrastRatio(theme.teams[team].text, badge)).toBeGreaterThanOrEqual(4.5);
    }
    // The target pill draws the gold label on a 10% tint of gold.
    expect(contrastRatio(theme.gold, flattenHex(`${theme.gold}1A`, theme.felt))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(flatten(theme.textDim, theme.felt), theme.felt)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.text, theme.felt)).toBeGreaterThanOrEqual(7);
    // Gold is also a text color: the target pill label and the share link.
    expect(contrastRatio(theme.gold, theme.felt)).toBeGreaterThanOrEqual(4.5);
  });

  test('the two team colors are clearly different', () => {
    expect(deltaE(theme.teams.A.color, theme.teams.B.color)).toBeGreaterThan(40);
  });
});
