import {
  COMPACT_HEIGHT_THRESHOLD,
  computeLayoutMetrics,
  SQUEEZE_HEIGHT_THRESHOLD,
} from '../metrics';

test('short screens get compact sizing', () => {
  const m = computeLayoutMetrics(640);
  expect(m.compact).toBe(true);
  expect(m.scoreFontSize).toBe(48);
  expect(m.chipHeight).toBe(46);
});

test('tall screens get normal sizing', () => {
  const m = computeLayoutMetrics(780);
  expect(m.compact).toBe(false);
  expect(m.scoreFontSize).toBe(60);
  expect(m.chipHeight).toBe(54);
});

test('banner-squeezed screens get the tightest sizing', () => {
  // iPhone SE with an anchored adaptive banner loaded: ~647 - 60 usable.
  const m = computeLayoutMetrics(587);
  expect(m.compact).toBe(true);
  expect(m.scoreFontSize).toBe(40);
  expect(m.chipHeight).toBe(38);
  expect(m.regionGap).toBe(3);
});

test('the thresholds are boundaries (exclusive below)', () => {
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD).compact).toBe(false);
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD - 1).compact).toBe(true);
  expect(
    computeLayoutMetrics(SQUEEZE_HEIGHT_THRESHOLD).scoreFontSize,
  ).toBe(48);
  expect(
    computeLayoutMetrics(SQUEEZE_HEIGHT_THRESHOLD - 1).scoreFontSize,
  ).toBe(40);
});
