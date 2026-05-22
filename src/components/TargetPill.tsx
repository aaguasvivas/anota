import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii } from '../constants/layout';
import { useT } from '../i18n';

type Props = {
  value: number;
  onChange: (next: number) => void;
  onPressLong?: () => void;
};

// Compact target indicator. Tap to edit inline — pill becomes a number
// input. Blur or submit commits; tap outside the pill or hit return ends
// the edit.
export function TargetPill({ value, onChange, onPressLong }: Props) {
  const { t } = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<TextInput | null>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  function startEdit() {
    setDraft(String(value));
    setEditing(true);
    // autoFocus on the TextInput handles the keyboard.
  }

  function commit() {
    const parsed = parseInt(draft, 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== value) {
      onChange(parsed);
    } else {
      setDraft(String(value));
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <View style={[styles.pill, styles.pillEditing]}>
        <Text style={styles.label}>{t.chrome.target.toUpperCase()}</Text>
        <TextInput
          ref={ref}
          value={draft}
          onChangeText={(txt) => setDraft(txt.replace(/[^0-9]/g, '').slice(0, 4))}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
          selectTextOnFocus
          onSubmitEditing={commit}
          onBlur={commit}
          returnKeyType="done"
          style={styles.input}
          accessibilityLabel={t.chrome.target}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={startEdit}
      onLongPress={onPressLong}
      accessibilityRole="button"
      accessibilityLabel={`${t.chrome.target} ${value}`}
      accessibilityHint={t.chrome.targetChange}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.label}>{t.chrome.target.toUpperCase()}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.hint}>✎</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 180, 73, 0.1)',
    borderColor: 'rgba(230, 180, 73, 0.4)',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 7,
  },
  pillEditing: {
    backgroundColor: 'rgba(230, 180, 73, 0.18)',
    borderColor: colors.gold,
  },
  label: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  hint: {
    color: colors.gold,
    fontSize: 11,
    opacity: 0.7,
    fontWeight: '700',
  },
  input: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    minWidth: 38,
    padding: 0,
    textAlign: 'left',
  },
});
