import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FONT_CAP, radii } from '../constants/layout';
import { useT } from '../i18n';
import { useTheme } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { inkOn, Theme } from '../theme/themes';

type Props = {
  value: number;
  onChange: (next: number) => void;
  onPressLong?: () => void;
};

const ACCESSORY_ID = 'targetPillBar';

// Compact target indicator. Tap to edit inline: the pill becomes a number
// input. The iOS number pad has no return key, so a Done bar above it ends
// the edit; dismissing the keyboard blurs the input, and blur commits.
export function TargetPill({ value, onChange, onPressLong }: Props) {
  const { t } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
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
        <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={FONT_CAP.numeral}>
          {t.chrome.target.toUpperCase()}
        </Text>
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
          inputAccessoryViewID={ACCESSORY_ID}
          style={styles.input}
          maxFontSizeMultiplier={FONT_CAP.numeral}
          accessibilityLabel={t.chrome.target}
        />
        {Platform.OS === 'ios' ? (
          <InputAccessoryView nativeID={ACCESSORY_ID}>
            <View style={styles.bar}>
              <Pressable
                onPress={() => Keyboard.dismiss()}
                accessibilityRole="button"
                accessibilityLabel={t.chrome.done}
                style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={[styles.doneText, { color: inkOn(theme.gold, theme) }]} maxFontSizeMultiplier={FONT_CAP.keypad}>
                  {t.chrome.done}
                </Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        ) : null}
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
      <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={FONT_CAP.numeral}>
        {t.chrome.target.toUpperCase()}
      </Text>
      <Text style={styles.value} maxFontSizeMultiplier={FONT_CAP.numeral}>
        {value}
      </Text>
      <Ionicons name="pencil" size={11} color={theme.gold} style={styles.hint} />
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.gold}1A`,
      borderColor: `${theme.gold}66`,
      borderWidth: 1,
      borderRadius: radii.pill,
      paddingVertical: 5,
      paddingHorizontal: 12,
      gap: 7,
    },
    pillEditing: {
      backgroundColor: `${theme.gold}2E`,
      borderColor: theme.gold,
    },
    label: {
      color: theme.gold,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    value: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
    },
    hint: {
      opacity: 0.7,
    },
    input: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
      minWidth: 38,
      padding: 0,
      textAlign: 'left',
    },
    bar: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      backgroundColor: theme.bg,
      borderTopWidth: 1,
      borderTopColor: theme.hairline,
    },
    doneBtn: {
      minHeight: 36,
      paddingHorizontal: 16,
      borderRadius: radii.pill,
      backgroundColor: theme.gold,
      justifyContent: 'center',
    },
    doneText: {
      fontSize: 15,
      fontWeight: '800',
    },
  });
