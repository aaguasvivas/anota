import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team } from '../types';
import { AnimatedScore } from './AnimatedScore';
import { DominoTile } from './DominoTile';
import { ProgressBar } from './ProgressBar';

type Props = {
  team: Team;
  targetScore: number;
  isLeader: boolean;
  glowColor: string;
  onRename: () => void;
};

export function TeamCard({ team, targetScore, isLeader, glowColor, onRename }: Props) {
  const { t } = useT();
  const progress = team.score / targetScore;
  const remaining = Math.max(0, targetScore - team.score);
  const name = teamDisplayName(team, t);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.04)',
          'rgba(255,255,255,0.01)',
          `${team.color}1A`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: isLeader ? team.color : colors.hairline,
            shadowColor: isLeader ? team.color : '#000',
            shadowOpacity: isLeader ? 0.35 : 0.25,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.tileWrap}>
            <DominoTile top={6} bottom={6} pipColor={team.color} size={36} />
          </View>
          <Pressable
            onPress={onRename}
            hitSlop={10}
            style={({ pressed }) => [
              styles.nameWrap,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.teamName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.editHint}>{t.chrome.tapRename}</Text>
          </Pressable>
          {isLeader ? (
            <View style={[styles.leaderPill, { borderColor: team.color }]}>
              <Text style={[styles.leaderText, { color: team.color }]}>
                {t.chrome.leader}
              </Text>
            </View>
          ) : (
            <View style={styles.leaderPillSpacer} />
          )}
        </View>

        <View style={styles.scoreRow}>
          <AnimatedScore
            value={team.score}
            style={{ ...styles.score, color: colors.text }}
            glowColor={glowColor}
          />
          <View style={styles.targetCol}>
            <Text style={styles.targetSlash}>/ {targetScore}</Text>
            <Text style={styles.remaining}>
              {remaining === 0 ? t.team.arrived : t.team.toWin(remaining)}
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={progress}
          color={team.color}
          glowColor={glowColor}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tileWrap: {
    marginRight: spacing.md,
  },
  nameWrap: {
    flex: 1,
  },
  teamName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  editHint: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.6,
  },
  leaderPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  leaderPillSpacer: {
    width: 0,
  },
  leaderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  score: {
    fontSize: 76,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    lineHeight: 80,
  },
  targetCol: {
    marginLeft: spacing.md,
    paddingBottom: 10,
  },
  targetSlash: {
    color: colors.textDim,
    fontSize: 18,
    fontWeight: '600',
  },
  remaining: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.4,
  },
});
