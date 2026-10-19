import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FONT_CAP, radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import { useTheme } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { inkOn, Theme } from '../theme/themes';
import type { Round, Team, TeamId } from '../types';

type Props = {
  rounds: Round[];
  teams: Record<TeamId, Team>;
  onRequestRemove: (round: Round) => void;
};

// Divider strip between the two team halves. Shows who's leading and every
// round, newest first (solid chip). Long-press a chip to remove that round.
export function RoundStrip({ rounds, teams, onRequestRemove }: Props) {
  const { t } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tied = teams.A.score === teams.B.score;
  const leaderId: TeamId = teams.A.score >= teams.B.score ? 'A' : 'B';
  const leader = teams[leaderId];
  const leaderColor = theme.teams[leaderId].color;
  const leaderText = theme.teams[leaderId].text;
  const diff = Math.abs(teams.A.score - teams.B.score);
  const leaderName = teamDisplayName(leader, t);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.leadsPill,
          tied
            ? { borderColor: theme.hairline, backgroundColor: 'rgba(255,255,255,0.03)' }
            : { borderColor: `${leaderColor}66`, backgroundColor: `${leaderColor}1A` },
        ]}
      >
        {tied ? (
          <Text style={[styles.leadsText, { color: theme.textDim }]} maxFontSizeMultiplier={FONT_CAP.board}>
            {t.chrome.tied.toUpperCase()}
          </Text>
        ) : (
          <>
            <View style={[styles.leadsDot, { backgroundColor: leaderColor }]} />
            <Text
              style={[styles.leadsText, { color: leaderText }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              maxFontSizeMultiplier={FONT_CAP.board}
            >
              {t.chrome.leadsBy(leaderName, diff)}
            </Text>
          </>
        )}
      </View>

      {rounds.length === 0 ? (
        <Text
          style={styles.emptyHint}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.9}
          maxFontSizeMultiplier={FONT_CAP.board}
        >
          {t.history.emptySubtitle}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroller}
          contentContainerStyle={styles.row}
        >
          {rounds.map((r, idx) => {
            const team = teams[r.teamId];
            const chipColor = theme.teams[r.teamId].color;
            const newest = idx === 0;
            const remove = () => onRequestRemove(r);
            return (
              <Pressable
                key={r.id}
                onLongPress={remove}
                delayLongPress={350}
                hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
                accessibilityRole="button"
                accessibilityLabel={`+${r.points}, ${teamDisplayName(team, t)}`}
                accessibilityHint={t.history.removeHint}
                accessibilityActions={[{ name: 'activate' }]}
                onAccessibilityAction={remove}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: chipColor,
                    backgroundColor: newest ? chipColor : 'transparent',
                  },
                  pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.chipPoints,
                    { color: newest ? inkOn(chipColor, theme) : theme.teams[r.teamId].text },
                  ]}
                  maxFontSizeMultiplier={FONT_CAP.board}
                >
                  +{r.points}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      width: '100%',
      alignItems: 'center',
    },
    leadsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '100%',
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: radii.pill,
      borderWidth: 1,
      gap: 6,
      marginBottom: spacing.sm,
    },
    leadsDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    leadsText: {
      flexShrink: 1,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    emptyHint: {
      color: theme.textDim,
      fontSize: 12,
      letterSpacing: 0.3,
      paddingVertical: 4,
    },
    // Edge to edge: the strip reaches past the board's side padding, and its
    // padding (inside negative margins) gives each chip a taller touch area
    // without changing the board layout.
    scroller: {
      alignSelf: 'stretch',
      marginHorizontal: -spacing.lg,
      marginVertical: -10,
    },
    row: {
      flexGrow: 1,
      justifyContent: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
    },
    chip: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: radii.pill,
      borderWidth: 1,
      minWidth: 42,
      alignItems: 'center',
    },
    chipPoints: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.1,
      fontVariant: ['tabular-nums'],
    },
  });
