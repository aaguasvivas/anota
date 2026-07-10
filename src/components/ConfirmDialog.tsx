import React, { useEffect, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radii, spacing } from '../constants/layout';
import { useT } from '../i18n';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';

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
  const styles = useThemedStyles(makeStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  const confirm = confirmLabel ?? t.chrome.confirm;
  const cancel = cancelLabel ?? t.chrome.cancel;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    }
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
    <Animated.View style={[styles.backdrop, { opacity }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
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
            <Text style={styles.cancelText}>{cancel}</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirm}
            style={({ pressed }) => [
              styles.btn,
              destructive ? styles.destructive : styles.primary,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={destructive ? styles.destructiveText : styles.primaryText}
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
  primary: {
    backgroundColor: theme.gold,
  },
  primaryText: {
    color: theme.tileInk,
    fontWeight: '800',
    fontSize: 14,
  },
  destructive: {
    backgroundColor: theme.danger,
  },
  destructiveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
