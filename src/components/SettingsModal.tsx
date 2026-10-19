import React, { useEffect, useRef, useState } from 'react';
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
import { FONT_CAP, radii, spacing, TARGET_PRESETS } from '../constants/layout';
import { ThemePicker } from './ThemePicker';
import { devRefs } from '../dev/captureHarness';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { useT } from '../i18n';
import { useRestore } from '../iap/useRestore';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { inkOn, Theme, ThemeId } from '../theme/themes';
import type { MatchState, TeamId } from '../types';
import { isHapticsMuted, setHapticsMuted, subscribePrefs } from '../utils/preferences';

type Props = {
  visible: boolean;
  state: MatchState;
  onClose: () => void;
  onRename: (teamId: TeamId, name: string) => void;
  onTargetChange: (target: number) => void;
  onRequestPro: (themeId?: ThemeId) => void;
  showRemoveAds: boolean;
  // Set when the sheet opened from a tap on a team name: that field gets focus.
  focusTeam: TeamId | null;
};

const CAP = FONT_CAP.scroll;

export function SettingsModal({
  visible,
  state,
  onClose,
  onRename,
  onTargetChange,
  onRequestPro,
  showRemoveAds,
  focusTeam,
}: Props) {
  const { t, lang, setLang } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const { proUnlocked } = useThemeControls();
  const { status: restoreStatus, restore, reset: resetRestore } = useRestore();
  const [nameA, setNameA] = useState(state.teams.A.name);
  const [nameB, setNameB] = useState(state.teams.B.name);
  const [customTarget, setCustomTarget] = useState(String(state.targetScore));
  const [hapticsOn, setHapticsOn] = useState(!isHapticsMuted());
  const nameARef = useRef<TextInput>(null);
  const nameBRef = useRef<TextInput>(null);
  const goldInk = inkOn(theme.gold, theme);

  useEffect(() => {
    if (visible) {
      setNameA(state.teams.A.name);
      setNameB(state.teams.B.name);
      setCustomTarget(String(state.targetScore));
      setHapticsOn(!isHapticsMuted());
      resetRestore();
    }
  }, [visible, state, resetRestore]);

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

  // Every way out (Done, backdrop, swipe or back) saves what was typed.
  function close() {
    commitNames();
    commitCustomTarget();
    onClose();
  }

  function focusRequestedName() {
    if (focusTeam === 'A') nameARef.current?.focus();
    if (focusTeam === 'B') nameBRef.current?.focus();
  }

  // Opened from a team name: Return saves and goes straight back to the game.
  function submitName() {
    commitNames();
    if (focusTeam) close();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'fade' : 'slide'}
      onRequestClose={close}
      onShow={focusRequestedName}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={CAP}>
              {t.chrome.settings}
            </Text>
            <Pressable
              onPress={close}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t.chrome.done}
              style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.doneText} maxFontSizeMultiplier={CAP}>
                {t.chrome.done}
              </Text>
            </Pressable>
          </View>
          <ScrollView
            ref={(r) => {
              devRefs.settingsScroll = r;
            }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            <Text style={styles.sectionLabel} maxFontSizeMultiplier={CAP}>
              {t.settings.namesSection}
            </Text>
            <View style={styles.teamRow}>
              <View style={[styles.swatch, { backgroundColor: theme.teams.A.color }]} />
              <TextInput
                ref={nameARef}
                value={nameA}
                onChangeText={setNameA}
                onBlur={commitNames}
                maxLength={24}
                placeholder={t.team.defaultA}
                placeholderTextColor={theme.textDim}
                style={styles.input}
                returnKeyType="done"
                selectTextOnFocus
                onSubmitEditing={submitName}
                maxFontSizeMultiplier={CAP}
                accessibilityLabel={t.settings.nameTopA11y}
              />
            </View>
            <View style={styles.teamRow}>
              <View style={[styles.swatch, { backgroundColor: theme.teams.B.color }]} />
              <TextInput
                ref={nameBRef}
                value={nameB}
                onChangeText={setNameB}
                onBlur={commitNames}
                maxLength={24}
                placeholder={t.team.defaultB}
                placeholderTextColor={theme.textDim}
                style={styles.input}
                returnKeyType="done"
                selectTextOnFocus
                onSubmitEditing={submitName}
                maxFontSizeMultiplier={CAP}
                accessibilityLabel={t.settings.nameBottomA11y}
              />
            </View>

            <Text style={[styles.sectionLabel, styles.sectionGap]} maxFontSizeMultiplier={CAP}>
              {t.settings.targetSection}
            </Text>
            <View style={styles.chipRow}>
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
                      styles.chip,
                      active && styles.chipActive,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[styles.targetChipText, active && { color: goldInk }]}
                      maxFontSizeMultiplier={CAP}
                    >
                      {preset}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.teamRow, { marginTop: spacing.md }]}>
              <Text style={styles.customLabel} maxFontSizeMultiplier={CAP}>
                {t.settings.customLabel}
              </Text>
              <TextInput
                value={customTarget}
                onChangeText={handleCustomTarget}
                onEndEditing={commitCustomTarget}
                onSubmitEditing={commitCustomTarget}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="200"
                placeholderTextColor={theme.textDim}
                style={[styles.input, { textAlign: 'right' }]}
                returnKeyType="done"
                maxFontSizeMultiplier={CAP}
                accessibilityLabel={t.settings.customTargetA11y}
              />
            </View>

            <Text style={[styles.sectionLabel, styles.sectionGap]} maxFontSizeMultiplier={CAP}>
              {t.settings.languageSection}
            </Text>
            <View style={styles.chipRow}>
              {(['es', 'en'] as const).map((code) => {
                const active = lang === code;
                const label = code === 'es' ? t.settings.languageEs : t.settings.languageEn;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setLang(code)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[styles.langChipText, active && { color: goldInk }]}
                      maxFontSizeMultiplier={CAP}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.toggleRow, styles.sectionGap]}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleLabel} maxFontSizeMultiplier={CAP}>
                  {t.settings.hapticsLabel}
                </Text>
                <Text style={styles.toggleHint} maxFontSizeMultiplier={CAP}>
                  {t.settings.hapticsHint}
                </Text>
              </View>
              <Switch
                value={hapticsOn}
                onValueChange={(v) => {
                  setHapticsOn(v);
                  setHapticsMuted(!v);
                }}
                trackColor={{ false: theme.bgDeep, true: theme.gold }}
                thumbColor={hapticsOn ? theme.tile : theme.textDim}
                accessibilityLabel={t.settings.hapticsLabel}
              />
            </View>

            <Text style={[styles.sectionLabel, styles.sectionGap]} maxFontSizeMultiplier={CAP}>
              {t.settings.themeSection}
            </Text>
            <ThemePicker onRequestPro={onRequestPro} />

            {!proUnlocked ? (
              <>
                <Text style={[styles.sectionLabel, styles.sectionGap]} maxFontSizeMultiplier={CAP}>
                  {t.settings.purchasesSection}
                </Text>
                {showRemoveAds ? (
                  <Pressable
                    onPress={() => onRequestPro()}
                    accessibilityRole="button"
                    accessibilityLabel={t.settings.removeAdsRow}
                    style={({ pressed }) => [styles.removeAdsBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.removeAdsText} maxFontSizeMultiplier={CAP}>
                      {t.settings.removeAdsRow}
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => {
                    if (restoreStatus !== 'pending') restore();
                  }}
                  disabled={restoreStatus === 'pending'}
                  accessibilityRole="button"
                  accessibilityLabel={t.pro.restore}
                  style={({ pressed }) => [styles.restoreBtn, pressed && { opacity: 0.6 }]}
                >
                  <Text style={styles.restoreText} maxFontSizeMultiplier={CAP}>
                    {restoreStatus === 'pending' ? t.pro.buying : t.pro.restore}
                  </Text>
                </Pressable>
                {restoreStatus === 'restored' || restoreStatus === 'notFound' ? (
                  <Text style={styles.restoreResult} maxFontSizeMultiplier={CAP}>
                    {restoreStatus === 'restored' ? t.pro.restored : t.pro.notFound}
                  </Text>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.felt,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.hairline,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  doneBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  doneText: {
    color: theme.gold,
    fontSize: 17,
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 16,
  },
  sectionLabel: {
    color: theme.textDim,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  sectionGap: {
    marginTop: spacing.xl,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: theme.bgDeep,
    borderWidth: 1,
    borderColor: theme.hairline,
  },
  chipActive: {
    backgroundColor: theme.gold,
    borderColor: theme.gold,
  },
  langChipText: {
    color: theme.textDim,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  targetChipText: {
    color: theme.textDim,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgDeep,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: theme.hairline,
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
    color: theme.text,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 14,
  },
  customLabel: {
    color: theme.textDim,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginRight: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bgDeep,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: theme.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  toggleHint: {
    color: theme.textDim,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  removeAdsBtn: {
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: `${theme.gold}66`,
    backgroundColor: `${theme.gold}1A`,
    alignItems: 'center',
  },
  removeAdsText: {
    color: theme.gold,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  restoreBtn: {
    marginTop: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreText: {
    color: theme.textDim,
    fontWeight: '700',
    fontSize: 14,
  },
  restoreResult: {
    color: theme.textDim,
    fontSize: 13,
    textAlign: 'center',
  },
});
