import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONT_CAP, radii, spacing } from '../constants/layout';
import { useT } from '../i18n';
import { useTheme } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { inkOn, Theme } from '../theme/themes';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// A plain overlay, not a react-native Modal, so it can appear in the same
// commit that dismisses the Settings modal (reset-from-settings) without
// stacking UIKit presentations; see no-stacked-rn-modals in ProSheet.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  const titleRef = useRef<Text>(null);
  const confirm = confirmLabel ?? t.chrome.confirm;
  const cancel = cancelLabel ?? t.chrome.cancel;
  const confirmFill = destructive ? theme.danger : theme.gold;

  useEffect(() => {
    if (!visible) {
      // Reset while hidden so the next open never paints at full opacity.
      opacity.setValue(0);
      return;
    }
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
    // VoiceOver starts on the question, not on whatever was behind it.
    const id = setTimeout(() => {
      if (titleRef.current) AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
    }, 350);
    return () => clearTimeout(id);
  }, [visible, opacity]);

  // The Modal used to handle Android's back button; the overlay does it here.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.backdrop, { opacity }]}
      accessibilityViewIsModal
      onAccessibilityEscape={onCancel}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessible={false} />
      <View style={styles.card}>
        <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={FONT_CAP.overlay}>
          {title}
        </Text>
        {message ? (
          <Text style={styles.message} maxFontSizeMultiplier={FONT_CAP.overlay}>
            {message}
          </Text>
        ) : null}
        <View style={styles.row}>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancel}
            style={({ pressed }) => [
              styles.btn,
              styles.cancel,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.cancelText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} maxFontSizeMultiplier={FONT_CAP.overlay}>
              {cancel}
            </Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirm}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: confirmFill },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[styles.confirmText, { color: inkOn(confirmFill, theme) }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              maxFontSizeMultiplier={FONT_CAP.overlay}
            >
              {confirm}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.felt,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: theme.hairline,
    padding: spacing.xl,
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  message: {
    color: theme.textDim,
    fontSize: 14,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: theme.bgDeep,
    borderWidth: 1,
    borderColor: theme.hairline,
  },
  cancelText: {
    color: theme.textDim,
    fontWeight: '700',
    fontSize: 14,
  },
  confirmText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
