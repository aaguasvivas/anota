import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from './src/components/ConfirmDialog';
import { ScoreKeypad } from './src/components/ScoreKeypad';
import { RoundStrip } from './src/components/RoundStrip';
import { ScorePad } from './src/components/ScorePad';
import { SettingsModal } from './src/components/SettingsModal';
import { TargetPill } from './src/components/TargetPill';
import { TeamCard } from './src/components/TeamCard';
import { WinnerModal } from './src/components/WinnerModal';
import { colors, teamPalette } from './src/constants/colors';
import { radii, spacing } from './src/constants/layout';
import { useLayoutMetrics } from './src/hooks/useLayoutMetrics';
import { useMatch } from './src/hooks/useMatch';
import { LanguageProvider, teamDisplayName, useT } from './src/i18n';
import type { Round, TeamId } from './src/types';
import {
  notifySuccess,
  notifyWarning,
  tapLight,
  tapMedium,
} from './src/utils/haptics';
import { hydratePrefs } from './src/utils/preferences';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <Scorekeeper />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function Scorekeeper() {
  useKeepAwake();
  const { t } = useT();
  const match = useMatch();
  const showWinner = !!match.state.winnerId && !match.state.winnerAcknowledged;
  const m = useLayoutMetrics();
  const [customFor, setCustomFor] = useState<TeamId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [roundToRemove, setRoundToRemove] = useState<Round | null>(null);

  useEffect(() => {
    hydratePrefs();
  }, []);

  // Celebrate when an (unacknowledged) winner appears.
  useEffect(() => {
    if (showWinner) {
      notifySuccess();
    }
  }, [showWinner]);

  function handleAdd(teamId: TeamId, points: number) {
    tapMedium();
    match.addPoints(teamId, points);
  }

  function handleResetConfirm() {
    notifyWarning();
    match.resetMatch();
    setConfirmReset(false);
  }

  function confirmRemoveRound() {
    if (!roundToRemove) return;
    tapMedium();
    match.removeRound(roundToRemove.id);
    setRoundToRemove(null);
  }

  function openRename() {
    setSettingsOpen(true);
  }

  const removeRoundMessage = roundToRemove
    ? t.history.removeRoundConfirm(
        roundToRemove.points,
        teamDisplayName(match.state.teams[roundToRemove.teamId], t),
      )
    : '';

  if (!match.hydrated) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.bg, colors.felt, colors.bgDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.felt, colors.bgDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandWord}>{t.brand.name}</Text>
            <View style={styles.brandDot} />
          </View>
          <TargetPill
            value={match.state.targetScore}
            onChange={match.setTargetScore}
            onPressLong={() => {
              tapLight();
              setSettingsOpen(true);
            }}
          />
          <Pressable
            onPress={() => {
              tapLight();
              setSettingsOpen(true);
            }}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.6 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.settings}
          >
            <Ionicons name="settings-outline" size={18} color={colors.textDim} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.teamRegion, { gap: m.regionGap }]}>
            <TeamCard
              team={match.state.teams.A}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'A'}
              glowColor={teamPalette.A.glow}
              onRename={openRename}
            />
            <View style={styles.padWrap}>
              <ScorePad
                team={match.state.teams.A}
                teamId="A"
                onAdd={handleAdd}
                onCustom={(id) => {
                  tapLight();
                  setCustomFor(id);
                }}
              />
            </View>
          </View>

          <View style={styles.divider}>
            <RoundStrip
              rounds={match.state.rounds}
              teams={match.state.teams}
              onRequestRemove={(r) => {
                tapLight();
                setRoundToRemove(r);
              }}
            />
          </View>

          <View style={[styles.teamRegion, { gap: m.regionGap }]}>
            <TeamCard
              team={match.state.teams.B}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'B'}
              glowColor={teamPalette.B.glow}
              onRename={openRename}
            />
            <View style={styles.padWrap}>
              <ScorePad
                team={match.state.teams.B}
                teamId="B"
                onAdd={handleAdd}
                onCustom={(id) => {
                  tapLight();
                  setCustomFor(id);
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              if (match.state.rounds.length === 0) return;
              tapLight();
              match.undoLast();
            }}
            disabled={match.state.rounds.length === 0}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.undo}
            accessibilityState={{ disabled: match.state.rounds.length === 0 }}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && { opacity: 0.7 },
              match.state.rounds.length === 0 && { opacity: 0.35 },
            ]}
          >
            <View style={styles.footerBtnInner}>
              <Ionicons name="arrow-undo-outline" size={16} color={colors.textDim} />
              <Text style={styles.footerBtnText}>{t.chrome.undo}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              tapLight();
              setConfirmReset(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.newMatch}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.footerBtnInner}>
              <Ionicons name="reload-outline" size={16} color={colors.textDim} />
              <Text style={styles.footerBtnText}>{t.chrome.newMatch}</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScoreKeypad
        visible={customFor !== null}
        team={customFor ? match.state.teams[customFor] : null}
        onCancel={() => setCustomFor(null)}
        onSubmit={(value) => {
          if (customFor) {
            handleAdd(customFor, value);
          }
          setCustomFor(null);
        }}
      />

      <SettingsModal
        visible={settingsOpen}
        state={match.state}
        onClose={() => setSettingsOpen(false)}
        onRename={match.renameTeam}
        onTargetChange={match.setTargetScore}
        onResetMatch={() => {
          setSettingsOpen(false);
          setConfirmReset(true);
        }}
      />

      <ConfirmDialog
        visible={confirmReset}
        title={t.newMatchConfirm.title}
        message={t.newMatchConfirm.message}
        confirmLabel={t.newMatchConfirm.confirm}
        cancelLabel={t.chrome.cancel}
        onConfirm={handleResetConfirm}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        visible={roundToRemove !== null}
        title={removeRoundMessage}
        confirmLabel={t.chrome.confirm}
        cancelLabel={t.chrome.cancel}
        destructive
        onConfirm={confirmRemoveRound}
        onCancel={() => setRoundToRemove(null)}
      />

      <WinnerModal
        visible={showWinner}
        state={match.state}
        onNewMatch={() => {
          tapMedium();
          match.resetMatch();
        }}
        onKeepPlaying={() => {
          tapLight();
          match.dismissWinner();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandWord: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginLeft: 3,
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  teamRegion: {
    gap: spacing.sm,
  },
  padWrap: {
    width: '100%',
  },
  divider: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.md,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
  },
  footerBtnText: {
    color: colors.textDim,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  footerBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
