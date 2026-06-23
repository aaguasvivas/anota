// src/theme/__tests__/entitlement.test.ts
import { isThemeLocked, resolveActiveThemeId } from '../entitlement';
import { getTheme } from '../themes';

test('free theme is never locked', () => {
  expect(isThemeLocked(getTheme('classic'), false)).toBe(false);
  expect(isThemeLocked(getTheme('classic'), true)).toBe(false);
});

test('pro theme is locked only when not unlocked', () => {
  expect(isThemeLocked(getTheme('midnight'), false)).toBe(true);
  expect(isThemeLocked(getTheme('midnight'), true)).toBe(false);
});

test('resolveActiveThemeId keeps a pro choice only when unlocked', () => {
  expect(resolveActiveThemeId('midnight', true)).toBe('midnight');
  expect(resolveActiveThemeId('midnight', false)).toBe('classic');
});

test('resolveActiveThemeId always allows the free theme and unknown falls back', () => {
  expect(resolveActiveThemeId('classic', false)).toBe('classic');
  expect(resolveActiveThemeId('nonsense', true)).toBe('classic');
});
