import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team } from '../types';
import { AnimatedScore } from './AnimatedScore';
import { DominoTile, tileFacesForScore } from './DominoTile';
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
  const [topFace, bottomFace] = tileFacesForScore(team.score, targetScore);

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
            <DominoTile top={topFace} bottom={bottomFace} pipColor={team.color} size={22} />
          </View>
          <Pressable
            onPress={onRename}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={name}
            accessibilityHint={t.settings.namesSection}
            style={({ pressed }) => [
              styles.nameWrap,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text
              style={styles.teamName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {name}
            </Text>
            <Ionicons name="pencil" size={13} color={team.color} style={styles.editIcon} />
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
          height={5}
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
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tileWrap: {
    marginRight: spacing.sm,
  },
  nameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  editIcon: {
    opacity: 0.55,
  },
  leaderPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  leaderPillSpacer: {
    width: 0,
  },
  leaderText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  score: {
    fontSize: 60,
    fontWeight: '800',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
    lineHeight: 64,
  },
  targetCol: {
    marginLeft: spacing.sm,
    paddingBottom: 8,
  },
  targetSlash: {
    color: colors.textDim,
    fontSize: 16,
    fontWeight: '600',
  },
  remaining: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 1,
    letterSpacing: 0.3,
  },
});
