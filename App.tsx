import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from './src/components/ConfirmDialog';
import { CustomScoreModal } from './src/components/CustomScoreModal';
import { RoundHistory } from './src/components/RoundHistory';
import { ScorePad } from './src/components/ScorePad';
import { SettingsModal } from './src/components/SettingsModal';
import { TeamCard } from './src/components/TeamCard';
import { WinnerModal } from './src/components/WinnerModal';
import { colors, teamPalette } from './src/constants/colors';
import { radii, spacing } from './src/constants/layout';
import { useMatch } from './src/hooks/useMatch';
import { LanguageProvider, teamDisplayName, useT } from './src/i18n';
import type { TeamId } from './src/types';
import {
  notifySuccess,
  notifyWarning,
  tapLight,
  tapMedium,
} from './src/utils/haptics';

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
  const [customFor, setCustomFor] = useState<TeamId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Celebrate when a winner is detected.
  useEffect(() => {
    if (match.state.winnerId) {
      notifySuccess();
    }
  }, [match.state.winnerId]);

  function handleAdd(teamId: TeamId, points: number) {
    tapMedium();
    match.addPoints(teamId, points);
  }

  function handleResetConfirm() {
    notifyWarning();
    match.resetMatch();
    setConfirmReset(false);
  }

  function openRename() {
    setSettingsOpen(true);
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
            accessibilityLabel={t.chrome.settings}
          >
            <Text style={styles.iconBtnText}>⚙︎</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => {
              tapLight();
              setSettingsOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${t.chrome.target} ${match.state.targetScore}`}
            accessibilityHint={t.chrome.targetChange}
            style={({ pressed }) => [
              styles.targetPill,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.targetPillLabel}>{t.chrome.target}</Text>
            <Text style={styles.targetPillValue}>{match.state.targetScore}</Text>
            <Text style={styles.targetPillHint}>✎</Text>
          </Pressable>

          <View style={styles.teamBlock}>
            <TeamCard
              team={match.state.teams.A}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'A'}
              glowColor={teamPalette.A.glow}
              onRename={openRename}
            />
            <View style={styles.padInline}>
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

          <LeadsPill match={match} />

          <View style={styles.teamBlock}>
            <TeamCard
              team={match.state.teams.B}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'B'}
              glowColor={teamPalette.B.glow}
              onRename={openRename}
            />
            <View style={styles.padInline}>
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

          <View style={styles.historyBlock}>
            <RoundHistory rounds={match.state.rounds} teams={match.state.teams} />
          </View>

          <View style={styles.footerRow}>
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
              <Text style={styles.footerBtnText}>↶ {t.chrome.undo}</Text>
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
              <Text style={styles.footerBtnText}>⟲ {t.chrome.newMatch}</Text>
            </Pressable>
          </View>

          <Text style={styles.tagline}>{t.chrome.footerTagline}</Text>
        </ScrollView>
      </SafeAreaView>

      <CustomScoreModal
        visible={customFor !== null}
        teamId={customFor}
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

      <WinnerModal
        visible={!!match.state.winnerId}
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

type LeadsPillProps = {
  match: ReturnType<typeof useMatch>;
};

function LeadsPill({ match }: LeadsPillProps) {
  const { t } = useT();
  const { teams } = match.state;
  const tied = teams.A.score === teams.B.score;

  if (tied) {
    return (
      <View
        style={[
          styles.leadsPill,
          { borderColor: colors.hairline, backgroundColor: 'rgba(255,255,255,0.03)' },
        ]}
      >
        <Text style={[styles.leadsPillText, { color: colors.textDim }]}>
          {t.chrome.tied.toUpperCase()}
        </Text>
      </View>
    );
  }

  const leaderId = teams.A.score > teams.B.score ? 'A' : 'B';
  const leader = teams[leaderId];
  const diff = Math.abs(teams.A.score - teams.B.score);
  const name = teamDisplayName(leader, t);

  return (
    <View
      style={[
        styles.leadsPill,
        { borderColor: `${leader.color}66`, backgroundColor: `${leader.color}1A` },
      ]}
    >
      <View style={[styles.leadsPillDot, { backgroundColor: leader.color }]} />
      <Text style={[styles.leadsPillText, { color: leader.color }]}>
        {t.chrome.leadsBy(name, diff)}
      </Text>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandWord: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold,
    marginLeft: 4,
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconBtnText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  targetPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 180, 73, 0.1)',
    borderColor: 'rgba(230, 180, 73, 0.4)',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: spacing.lg,
    gap: 8,
  },
  targetPillLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  targetPillValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  targetPillHint: {
    color: colors.gold,
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '700',
  },
  teamBlock: {
    gap: spacing.md,
  },
  padInline: {
    marginTop: spacing.xs,
  },
  leadsPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginVertical: spacing.lg,
    gap: 8,
  },
  leadsPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  leadsPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  historyBlock: {
    marginTop: spacing.xxl,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
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
  tagline: {
    color: colors.textFaint,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xl,
    letterSpacing: 0.4,
  },
});
