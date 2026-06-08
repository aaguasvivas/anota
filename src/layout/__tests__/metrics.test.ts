import { COMPACT_HEIGHT_THRESHOLD, computeLayoutMetrics } from '../metrics';

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

test('the threshold is the boundary (exclusive below)', () => {
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD).compact).toBe(false);
  expect(computeLayoutMetrics(COMPACT_HEIGHT_THRESHOLD - 1).compact).toBe(true);
});
