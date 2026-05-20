import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team, TeamId } from '../types';

type Props = {
  visible: boolean;
  teamId: TeamId | null;
  team: Team | null;
  onCancel: () => void;
  onSubmit: (value: number) => void;
};

export function CustomScoreModal({ visible, team, onCancel, onSubmit }: Props) {
  const { t } = useT();
  const [value, setValue] = useState('');
  const color = team?.color ?? colors.gold;
  const name = team ? teamDisplayName(team, t) : '';

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  function commit() {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      onSubmit(parsed);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.card, { borderColor: `${color}66` }]}>
          <Text style={styles.title}>{t.customModal.titleFor}</Text>
          <Text style={[styles.team, { color }]}>{name}</Text>
          <TextInput
            value={value}
            onChangeText={(txt) => setValue(txt.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            placeholder={t.customModal.placeholder}
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { color, borderColor: `${color}99` }]}
            onSubmitEditing={commit}
            returnKeyType="done"
          />
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.cancel, pressed && { opacity: 0.6 }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{t.chrome.cancel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: color },
                pressed && { opacity: 0.85 },
              ]}
              onPress={commit}
            >
              <Text style={styles.addText}>{t.chrome.add}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: spacing.xl,
  },
  title: {
    color: colors.textDim,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  team: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  input: {
    fontSize: 56,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    borderBottomWidth: 2,
    paddingVertical: 12,
    fontVariant: ['tabular-nums'],
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
    fontSize: 15,
  },
  addText: {
    color: colors.tileInk,
    fontWeight: '800',
    fontSize: 15,
  },
});
