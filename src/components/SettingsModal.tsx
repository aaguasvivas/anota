import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, teamPalette } from '../constants/colors';
import { radii, spacing, TARGET_PRESETS } from '../constants/layout';
import { useT } from '../i18n';
import type { MatchState, TeamId } from '../types';
import { isHapticsMuted, setHapticsMuted, subscribePrefs } from '../utils/preferences';

type Props = {
  visible: boolean;
  state: MatchState;
  onClose: () => void;
  onRename: (teamId: TeamId, name: string) => void;
  onTargetChange: (target: number) => void;
  onResetMatch: () => void;
};

export function SettingsModal({
  visible,
  state,
  onClose,
  onRename,
  onTargetChange,
  onResetMatch,
}: Props) {
  const { t, lang, setLang } = useT();
  const [nameA, setNameA] = useState(state.teams.A.name);
  const [nameB, setNameB] = useState(state.teams.B.name);
  const [customTarget, setCustomTarget] = useState(String(state.targetScore));
  const [hapticsOn, setHapticsOn] = useState(!isHapticsMuted());

  useEffect(() => {
    if (visible) {
      setNameA(state.teams.A.name);
      setNameB(state.teams.B.name);
      setCustomTarget(String(state.targetScore));
      setHapticsOn(!isHapticsMuted());
    }
  }, [visible, state]);

  useEffect(() => subscribePrefs((p) => setHapticsOn(!p.hapticsMuted)), []);

  function commitNames() {
    onRename('A', nameA);
    onRename('B', nameB);
  }

  function handleCustomTarget(v: string) {
    setCustomTarget(v.replace(/[^0-9]/g, '').slice(0, 4));
  }

  // Commit on blur/submit (not per keystroke), matching TargetPill, so typing an
  // intermediate value mid-game can't momentarily set a tiny target and trip the
  // winner modal (e.g. typing "1" toward "150" while a team already has points).
  function commitCustomTarget() {
    const num = parseInt(customTarget, 10);
    if (Number.isFinite(num) && num > 0) {
      onTargetChange(num);
    } else {
      setCustomTarget(String(state.targetScore));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            <Text style={styles.title}>{t.settings.title}</Text>

            <Text style={styles.sectionLabel}>{t.settings.languageSection}</Text>
            <View style={styles.langRow}>
              <Pressable
                onPress={() => setLang('es')}
                accessibilityRole="button"
                accessibilityLabel={t.settings.languageEs}
                accessibilityState={{ selected: lang === 'es' }}
                style={({ pressed }) => [
                  styles.langChip,
                  lang === 'es' && styles.langChipActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.langChipText,
                    lang === 'es' && styles.langChipTextActive,
                  ]}
                >
                  {t.settings.languageEs}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLang('en')}
                accessibilityRole="button"
                accessibilityLabel={t.settings.languageEn}
                accessibilityState={{ selected: lang === 'en' }}
                style={({ pressed }) => [
                  styles.langChip,
                  lang === 'en' && styles.langChipActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.langChipText,
                    lang === 'en' && styles.langChipTextActive,
                  ]}
                >
                  {t.settings.languageEn}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
              {t.settings.namesSection}
            </Text>
            <View style={styles.teamRow}>
              <View style={[styles.swatch, { backgroundColor: teamPalette.A.color }]} />
              <TextInput
                value={nameA}
                onChangeText={setNameA}
                onBlur={commitNames}
                maxLength={24}
                placeholder={t.team.defaultA}
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={commitNames}
              />
            </View>
            <View style={styles.teamRow}>
              <View style={[styles.swatch, { backgroundColor: teamPalette.B.color }]} />
              <TextInput
                value={nameB}
                onChangeText={setNameB}
                onBlur={commitNames}
                maxLength={24}
                placeholder={t.team.defaultB}
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={commitNames}
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
              {t.settings.targetSection}
            </Text>
            <View style={styles.targetRow}>
              {TARGET_PRESETS.map((preset) => {
                const active = state.targetScore === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => {
                      onTargetChange(preset);
                      setCustomTarget(String(preset));
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.settings.targetSection} ${preset}`}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.targetChip,
                      active && styles.targetChipActive,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.targetChipText,
                        active && styles.targetChipTextActive,
                      ]}
                    >
                      {preset}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.teamRow, { marginTop: spacing.md }]}>
              <Text style={styles.customLabel}>{t.settings.customLabel}</Text>
              <TextInput
                value={customTarget}
                onChangeText={handleCustomTarget}
                onEndEditing={commitCustomTarget}
                onSubmitEditing={commitCustomTarget}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="200"
                placeholderTextColor={colors.textFaint}
                style={[styles.input, { textAlign: 'right' }]}
                returnKeyType="done"
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
              {t.settings.hapticsSection}
            </Text>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel}>{t.settings.hapticsLabel}</Text>
                <Text style={styles.toggleHint}>{t.settings.hapticsHint}</Text>
              </View>
              <Switch
                value={hapticsOn}
                onValueChange={(v) => {
                  setHapticsOn(v);
                  setHapticsMuted(!v);
                }}
                trackColor={{ false: colors.bgDeep, true: colors.gold }}
                thumbColor={hapticsOn ? colors.text : colors.textDim}
                accessibilityLabel={t.settings.hapticsLabel}
              />
            </View>

            <Pressable
              onPress={onResetMatch}
              accessibilityRole="button"
              accessibilityLabel={t.settings.resetMatch}
              style={({ pressed }) => [
                styles.resetBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.resetText}>{t.settings.resetMatch}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                commitNames();
                commitCustomTarget();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={t.chrome.done}
              style={({ pressed }) => [
                styles.doneBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.doneText}>{t.chrome.done}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.felt,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.hairline,
    maxHeight: '88%',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  body: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl + 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xl,
    letterSpacing: 0.2,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  langChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  langChipText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  langChipTextActive: {
    color: colors.tileInk,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDeep,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 14,
  },
  targetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  targetChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  targetChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  targetChipText: {
    color: colors.textDim,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  targetChipTextActive: {
    color: colors.tileInk,
  },
  customLabel: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginRight: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgDeep,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  toggleHint: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  resetBtn: {
    marginTop: spacing.xxl,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 72, 77, 0.5)',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 72, 77, 0.08)',
  },
  resetText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  doneBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  doneText: {
    color: colors.tileInk,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
