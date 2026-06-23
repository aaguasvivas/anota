import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing } from '../constants/layout';
import { useT } from '../i18n';
import { useTheme } from '../theme/ThemeProvider';
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
  const confirm = confirmLabel ?? t.chrome.confirm;
  const cancel = cancelLabel ?? t.chrome.cancel;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
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
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  backdrop: {
    flex: 1,
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
