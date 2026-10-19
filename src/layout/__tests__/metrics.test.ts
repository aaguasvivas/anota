import {
  COMPACT_HEIGHT_THRESHOLD,
  computeLayoutMetrics,
  SQUEEZE_HEIGHT_THRESHOLD,
  TALL_HEIGHT_THRESHOLD,
} from '../metrics';

test('the iPhone SE with the banner gets the squeeze tier with 44pt targets', () => {
  const m = computeLayoutMetrics(588);
  expect(m.compact).toBe(true);
  expect(m.scoreFontSize).toBe(42);
  expect(m.chipHeight).toBe(44);
  expect(m.heroHeight).toBe(44);
  expect(m.dividerPadV).toBe(4);
});

test('the iPhone SE without the banner gets compact sizing', () => {
  const m = computeLayoutMetrics(647);
  expect(m.compact).toBe(true);
  expect(m.scoreFontSize).toBe(48);
  expect(m.chipHeight).toBe(46);
});

test('mid-size phones get normal sizing', () => {
  const m = computeLayoutMetrics(759);
  expect(m.compact).toBe(false);
  expect(m.scoreFontSize).toBe(60);
  expect(m.chipHeight).toBe(54);
});

test('Pro Max class phones get bigger scores, with or without the banner', () => {
  for (const h of [792, 860]) {
    const m = computeLayoutMetrics(h);
    expect(m.scoreFontSize).toBe(72);
    expect(m.chipHeight).toBe(58);
  }
});

test('every tier keeps chips and + Points at 44pt or more', () => {
  for (const h of [500, 588, 647, 700, 759, 792, 900]) {
    const m = computeLayoutMetrics(h);
    expect(m.chipHeight).toBeGreaterThanOrEqual(44);
    expect(m.heroHeight).toBeGreaterThanOrEqual(44);
  }
});

test('the thresholds are boundaries (exclusive below)', () => {
  expect(computeLayoutMetrics(SQUEEZE_HEIGHT_THRESHOLD - 1).scoreFontSize).toBe(42);
  expect(computeLayoutMetrics(SQUEEZE_HEIGHT_THRESHOLD).scoreFontSize).toBe(48);
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD - 1).compact).toBe(true);
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD).compact).toBe(false);
  expect(computeLayoutMetrics(TALL_HEIGHT_THRESHOLD - 1).scoreFontSize).toBe(60);
  expect(computeLayoutMetrics(TALL_HEIGHT_THRESHOLD).scoreFontSize).toBe(72);
});
