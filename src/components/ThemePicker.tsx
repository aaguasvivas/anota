// src/components/ThemePicker.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEMES } from '../theme/themes';
import { isThemeLocked } from '../theme/entitlement';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';
import { useT } from '../i18n';

export function ThemePicker({ onRequestPro }: { onRequestPro: () => void }) {
  const theme = useTheme();
  const { themeId, setThemeId, proUnlocked } = useThemeControls();
  const { t } = useT();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.grid}>
      {THEMES.map((th) => {
        const locked = isThemeLocked(th, proUnlocked);
        const active = th.id === themeId;
        return (
          <Pressable
            key={th.id}
            onPress={() => (locked ? onRequestPro() : setThemeId(th.id))}
            style={[
              styles.swatch,
              { backgroundColor: th.felt, borderColor: active ? theme.gold : th.hairline },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.settings.themeNames[th.id]}
          >
            <View style={styles.dotsRow}>
              <View style={[styles.dot, { backgroundColor: th.teams.A.color }]} />
              <View style={[styles.dot, { backgroundColor: th.teams.B.color }]} />
            </View>
            <Text numberOfLines={1} style={[styles.name, { color: th.text }]}>
              {t.settings.themeNames[th.id]}
            </Text>
            {locked && (
              <View style={styles.lock}>
                <Ionicons name="lock-closed" size={11} color={th.text} />
                <Text style={[styles.lockTag, { color: th.text }]}>{t.settings.themeLockedTag}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    swatch: { width: '30%', minWidth: 92, borderRadius: 12, borderWidth: 2, padding: 10, gap: 8 },
    dotsRow: { flexDirection: 'row', gap: 6 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    name: { fontSize: 12, fontWeight: '600' },
    lock: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    lockTag: { fontSize: 10, fontWeight: '700', opacity: 0.8 },
  });
