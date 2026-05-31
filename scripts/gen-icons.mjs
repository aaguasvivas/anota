// Generates Anota's app icon / adaptive / splash / favicon from a
// code-defined domino-tile SVG. Requires `rsvg-convert` (brew install librsvg).
//
//   node scripts/gen-icons.mjs            # two-tone pips (red top / blue bottom)
//   ANOTA_PIPS=gold node scripts/gen-icons.mjs   # gold pips fallback
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));

const IVORY = '#F3EDDC';
const IVORY_EDGE = '#C9C0A8';
const RED = '#E63946';
const BLUE = '#3B82F6';
const GOLD = '#E6B449';

// Face "6": two columns × three rows.
function sixPips(colL, colR, ys, r, fill) {
  let out = '';
  for (const y of ys) for (const x of [colL, colR]) {
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"/>`;
  }
  return out;
}

// A double-six domino tile centered on a 1024 canvas.
// scale = fraction of canvas height the tile occupies.
function tile({ scale, twoTone }) {
  const C = 1024, cx = C / 2, cy = C / 2;
  const H = C * scale;
  const W = H * 0.56;
  const x = cx - W / 2, y = cy - H / 2;
  const rad = W * 0.2;
  const half = H / 2;
  const colL = x + W * 0.3, colR = x + W * 0.7;
  const r = W * 0.085;
  const topYs = [y + half * 0.24, y + half * 0.5, y + half * 0.76];
  const botYs = topYs.map((v) => v + half);
  const topFill = twoTone ? RED : GOLD;
  const botFill = twoTone ? BLUE : GOLD;
  return `
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}"
      rx="${rad.toFixed(1)}" ry="${rad.toFixed(1)}" fill="${IVORY}"
      stroke="${IVORY_EDGE}" stroke-width="${(W * 0.018).toFixed(1)}"/>
    <line x1="${(x + W * 0.12).toFixed(1)}" y1="${cy}" x2="${(x + W * 0.88).toFixed(1)}" y2="${cy}"
      stroke="${IVORY_EDGE}" stroke-width="${(W * 0.022).toFixed(1)}" stroke-linecap="round"/>
    ${sixPips(colL, colR, topYs, r, topFill)}
    ${sixPips(colL, colR, botYs, r, botFill)}`;
}

function svg({ bg, scale, twoTone }) {
  const C = 1024;
  const defs = `
    <radialGradient id="felt" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#14271D"/>
      <stop offset="100%" stop-color="#070D0A"/>
    </radialGradient>`;
  const background = bg
    ? `<rect width="${C}" height="${C}" fill="url(#felt)"/>
       <rect x="44" y="44" width="${C - 88}" height="${C - 88}" rx="180" fill="none"
         stroke="${GOLD}" stroke-opacity="0.45" stroke-width="6"/>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${C}" height="${C}" viewBox="0 0 ${C} ${C}">
  <defs>${defs}</defs>
  ${background}
  ${tile({ scale, twoTone })}
</svg>`;
}

function render(svgStr, outName, size, bgColor) {
  const dir = mkdtempSync(join(tmpdir(), 'anota-icon-'));
  const inFile = join(dir, 'in.svg');
  writeFileSync(inFile, svgStr);
  const args = ['-w', String(size), '-h', String(size)];
  if (bgColor) args.push('-b', bgColor); // flatten → opaque pixels
  args.push(inFile, '-o', join(ASSETS, outName));
  execFileSync('rsvg-convert', args);
  rmSync(dir, { recursive: true, force: true });
  console.log('wrote', outName, `${size}px`);
}

const twoTone = process.env.ANOTA_PIPS !== 'gold';

// Opaque, full-bleed felt:
const iconSvg = svg({ bg: true, scale: 0.8, twoTone });
render(iconSvg, 'icon.png', 1024, '#070D0A');
render(iconSvg, 'favicon.png', 64, '#070D0A');

// Transparent, tile within Android safe zone / Expo splash:
render(svg({ bg: false, scale: 0.6, twoTone }), 'adaptive-icon.png', 1024);
render(svg({ bg: false, scale: 0.62, twoTone }), 'splash-icon.png', 1024);

// Save the icon source for reference/version control.
writeFileSync(join(ASSETS, 'icon.svg'), iconSvg);
