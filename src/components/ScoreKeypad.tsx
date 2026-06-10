import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team } from '../types';
import { tapLight } from '../utils/haptics';

type Props = {
  visible: boolean;
  team: Team | null;
  onCancel: () => void;
  onSubmit: (value: number) => void;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function ScoreKeypad({ visible, team, onCancel, onSubmit }: Props) {
  const { t } = useT();
  const [entry, setEntry] = useState('');
  const color = team?.color ?? colors.gold;
  const name = team ? teamDisplayName(team, t) : '';
  const canAdd = parseInt(entry, 10) > 0;

  useEffect(() => {
    if (visible) setEntry('');
  }, [visible]);

  function pressDigit(d: string) {
    tapLight();
    setEntry((prev) => (prev + d).replace(/^0+/, '').slice(0, 3));
  }
  function backspace() {
    tapLight();
    setEntry((prev) => prev.slice(0, -1));
  }
  function commit() {
    const parsed = parseInt(entry, 10);
    if (Number.isFinite(parsed) && parsed > 0) onSubmit(parsed);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t.chrome.cancel}
        />
        <View style={[styles.sheet, { borderColor: `${color}66` }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t.customModal.titleFor}</Text>
          <Text style={[styles.team, { color }]} numberOfLines={1}>
            {name}
          </Text>

          <Text style={[styles.entry, { color }]} numberOfLines={1}>
            {entry || '0'}
          </Text>
          <View style={[styles.rule, { backgroundColor: `${color}55` }]} />

          <View style={styles.grid}>
            {DIGITS.map((d) => (
              <Pressable
                key={d}
                onPress={() => pressDigit(d)}
                accessibilityRole="button"
                accessibilityLabel={d}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
              >
                <Text style={styles.keyText}>{d}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={backspace}
              accessibilityRole="button"
              accessibilityLabel={t.chrome.delete}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            >
              <Ionicons name="backspace-outline" size={26} color={colors.textDim} />
            </Pressable>
            <Pressable
              onPress={() => pressDigit('0')}
              accessibilityRole="button"
              accessibilityLabel="0"
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>
            <Pressable
              onPress={commit}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel={t.chrome.add}
              accessibilityState={{ disabled: !canAdd }}
              style={({ pressed }) => [
                styles.key,
                { backgroundColor: canAdd ? color : `${color}40` },
                pressed && canAdd && styles.keyPressed,
              ]}
            >
              <Text style={[styles.addText, { color: canAdd ? colors.tileInk : colors.textFaint }]}>
                {t.chrome.add}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onCancel}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.cancel}
            style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.cancelText}>{t.chrome.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.felt,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 12,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textDim,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  team: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  entry: {
    fontSize: 60,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.sm,
  },
  rule: {
    height: 2,
    borderRadius: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  key: {
    width: '31%',
    minHeight: 62,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  keyPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  keyText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  addText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cancel: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
