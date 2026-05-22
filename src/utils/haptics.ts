import * as Haptics from 'expo-haptics';
import { isHapticsMuted } from './preferences';

export function tapLight() {
  if (isHapticsMuted()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function tapMedium() {
  if (isHapticsMuted()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function notifySuccess() {
  if (isHapticsMuted()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function notifyWarning() {
  if (isHapticsMuted()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
