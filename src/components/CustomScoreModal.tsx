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

type Props = {
  visible: boolean;
  teamName: string;
  teamColor: string;
  onCancel: () => void;
  onSubmit: (value: number) => void;
};

export function CustomScoreModal({ visible, teamName, teamColor, onCancel, onSubmit }: Props) {
  const [value, setValue] = useState('');

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
        <View style={[styles.card, { borderColor: `${teamColor}66` }]}>
          <Text style={styles.title}>Custom para</Text>
          <Text style={[styles.team, { color: teamColor }]}>{teamName}</Text>
          <TextInput
            value={value}
            onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            placeholder="0"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { color: teamColor, borderColor: `${teamColor}99` }]}
            onSubmitEditing={commit}
            returnKeyType="done"
          />
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.cancel, pressed && { opacity: 0.6 }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: teamColor },
                pressed && { opacity: 0.85 },
              ]}
              onPress={commit}
            >
              <Text style={styles.addText}>Añadir</Text>
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
