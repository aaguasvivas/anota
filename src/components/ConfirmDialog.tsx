import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';

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
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive,
  onConfirm,
  onCancel,
}: Props) {
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
              style={({ pressed }) => [
                styles.btn,
                styles.cancel,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.destructive : styles.primary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text
                style={destructive ? styles.destructiveText : styles.primaryText}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.felt,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  message: {
    color: colors.textDim,
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
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  cancelText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 14,
  },
  primary: {
    backgroundColor: colors.gold,
  },
  primaryText: {
    color: colors.tileInk,
    fontWeight: '800',
    fontSize: 14,
  },
  destructive: {
    backgroundColor: colors.danger,
  },
  destructiveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
