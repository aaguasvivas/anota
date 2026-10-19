import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONT_CAP, radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { LayoutMetrics } from '../layout/metrics';
import { useTheme } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';
import type { Team } from '../types';
import { AnimatedScore } from './AnimatedScore';
import { DominoTile, tileFacesForScore } from './DominoTile';
import { ProgressBar } from './ProgressBar';

type Props = {
  team: Team;
  targetScore: number;
  isLeader: boolean;
  onRename: () => void;
  // From App, which is the only place that knows the banner height.
  metrics: LayoutMetrics;
};

export function TeamCard({ team, targetScore, isLeader, onRename, metrics: m }: Props) {
  const { t } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const teamColor = theme.teams[team.id].color;
  const teamText = theme.teams[team.id].text;
  const teamGlow = theme.teams[team.id].glow;
  const progress = Math.min(1, team.score / targetScore);
  const remaining = Math.max(0, targetScore - team.score);
  const name = teamDisplayName(team, t);
  const [topFace, bottomFace] = tileFacesForScore(team.score, targetScore);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.04)',
          'rgba(255,255,255,0.01)',
          `${teamColor}1A`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: isLeader ? teamColor : theme.hairline,
            shadowColor: isLeader ? teamColor : '#000',
            shadowOpacity: isLeader ? 0.35 : 0.25,
            paddingVertical: m.cardPadV,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.tileWrap}>
            <DominoTile top={topFace} bottom={bottomFace} pipColor={teamColor} size={m.tileSize} />
          </View>
          <Pressable
            onPress={onRename}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={name}
            accessibilityHint={t.team.renameHint}
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
              maxFontSizeMultiplier={FONT_CAP.board}
            >
              {name}
            </Text>
            <Ionicons name="pencil" size={13} color={teamColor} style={styles.editIcon} />
          </Pressable>
          {isLeader ? (
            <View
              style={[styles.leaderPill, { borderColor: teamColor }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Text style={[styles.leaderText, { color: teamText }]} maxFontSizeMultiplier={FONT_CAP.board}>
                {t.chrome.leader}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={styles.scoreRow}
          accessible
          accessibilityLabel={t.team.scoreA11y(name, team.score, targetScore, remaining, isLeader)}
        >
          <AnimatedScore
            value={team.score}
            style={{
              ...styles.score,
              color: theme.text,
              fontSize: m.scoreFontSize,
              lineHeight: m.scoreLineHeight,
            }}
            glowColor={teamGlow}
          />
          <View style={styles.targetCol}>
            <Text style={styles.targetSlash} maxFontSizeMultiplier={FONT_CAP.numeral}>
              / {targetScore}
            </Text>
            <Text
              style={styles.remaining}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              maxFontSizeMultiplier={FONT_CAP.numeral}
            >
              {remaining === 0 ? t.team.arrived : t.team.toWin(remaining)}
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={progress}
          color={teamColor}
          glowColor={teamGlow}
          height={m.progressHeight}
        />
      </LinearGradient>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
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
      color: theme.text,
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
    leaderText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
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
      flexShrink: 0,
    },
    targetSlash: {
      color: theme.textDim,
      fontSize: 16,
      fontWeight: '600',
    },
    remaining: {
      color: theme.textDim,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 1,
      letterSpacing: 0.2,
    },
  });
