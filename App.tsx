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
      <Scorekeeper />
    </SafeAreaProvider>
  );
}

function Scorekeeper() {
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

  function handleUndo() {
    if (match.state.rounds.length === 0) return;
    tapLight();
    match.undoLast();
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
            <Text style={styles.brandWord}>Capi</Text>
            <Text style={styles.brandWordAccent}>Scorekeeper</Text>
            <View style={styles.brandDot} />
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={handleUndo}
              disabled={match.state.rounds.length === 0}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && { opacity: 0.6 },
                match.state.rounds.length === 0 && { opacity: 0.35 },
              ]}
              hitSlop={8}
            >
              <Text style={styles.iconBtnText}>↶ undo</Text>
            </Pressable>
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
            >
              <Text style={styles.iconBtnText}>⚙︎</Text>
            </Pressable>
          </View>
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
            style={({ pressed }) => [
              styles.targetPill,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.targetPillLabel}>Hasta</Text>
            <Text style={styles.targetPillValue}>{match.state.targetScore}</Text>
            <Text style={styles.targetPillHint}>cambiar</Text>
          </Pressable>

          <View style={styles.teams}>
            <TeamCard
              team={match.state.teams.A}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'A'}
              glowColor={teamPalette.A.glow}
              onRename={openRename}
            />
            <View style={styles.vsRow}>
              <View style={styles.vsLine} />
              <Text style={styles.vsText}>vs</Text>
              <View style={styles.vsLine} />
            </View>
            <TeamCard
              team={match.state.teams.B}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'B'}
              glowColor={teamPalette.B.glow}
              onRename={openRename}
            />
          </View>

          <View style={styles.padBlock}>
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
          <View style={styles.padBlock}>
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

          <View style={styles.historyBlock}>
            <RoundHistory rounds={match.state.rounds} teams={match.state.teams} />
          </View>

          <View style={styles.footerRow}>
            <Pressable
              onPress={handleUndo}
              disabled={match.state.rounds.length === 0}
              style={({ pressed }) => [
                styles.footerBtn,
                pressed && { opacity: 0.7 },
                match.state.rounds.length === 0 && { opacity: 0.35 },
              ]}
            >
              <Text style={styles.footerBtnText}>↶ Deshacer</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                tapLight();
                setConfirmReset(true);
              }}
              style={({ pressed }) => [
                styles.footerBtn,
                styles.footerBtnDanger,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.footerBtnText, { color: colors.danger }]}>
                Reiniciar
              </Text>
            </Pressable>
          </View>

          <Text style={styles.tagline}>
            Hecho para la mesa dominicana · dominó, capicúa y café
          </Text>
        </ScrollView>
      </SafeAreaView>

      <CustomScoreModal
        visible={customFor !== null}
        teamName={customFor ? match.state.teams[customFor].name : ''}
        teamColor={customFor ? match.state.teams[customFor].color : colors.gold}
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
        title="¿Reiniciar partida?"
        message="Se borrarán los puntajes y las rondas. Los nombres y el objetivo se mantienen."
        confirmLabel="Reiniciar"
        cancelLabel="Cancelar"
        destructive
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandWordAccent: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginLeft: 4,
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    color: colors.textFaint,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  teams: {
    gap: spacing.sm,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  vsText: {
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  padBlock: {
    marginTop: spacing.xl,
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
  footerBtnDanger: {
    borderColor: 'rgba(229, 72, 77, 0.4)',
    backgroundColor: 'rgba(229, 72, 77, 0.06)',
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
