import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Round, Team, TeamId } from '../types';

type Props = {
  rounds: Round[];
  teams: Record<TeamId, Team>;
  onRequestRemove: (round: Round) => void;
};

// Divider strip between the two team halves. Shows who's leading + recent
// round chips. Long-press a chip to remove that specific round.
export function RoundStrip({ rounds, teams, onRequestRemove }: Props) {
  const { t } = useT();
  const tied = teams.A.score === teams.B.score;
  const leaderId: TeamId = teams.A.score >= teams.B.score ? 'A' : 'B';
  const leader = teams[leaderId];
  const diff = Math.abs(teams.A.score - teams.B.score);
  const leaderName = teamDisplayName(leader, t);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.leadsPill,
          tied
            ? { borderColor: colors.hairline, backgroundColor: 'rgba(255,255,255,0.03)' }
            : { borderColor: `${leader.color}66`, backgroundColor: `${leader.color}1A` },
        ]}
      >
        {tied ? (
          <Text style={[styles.leadsText, { color: colors.textDim }]}>
            {t.chrome.tied.toUpperCase()}
          </Text>
        ) : (
          <>
            <View style={[styles.leadsDot, { backgroundColor: leader.color }]} />
            <Text style={[styles.leadsText, { color: leader.color }]}>
              {t.chrome.leadsBy(leaderName, diff)}
            </Text>
          </>
        )}
      </View>

      {rounds.length === 0 ? (
        <Text style={styles.emptyHint}>{t.history.emptySubtitle}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {rounds.slice(0, 12).map((r, idx) => {
            const team = teams[r.teamId];
            return (
              <Pressable
                key={r.id}
                onLongPress={() => onRequestRemove(r)}
                delayLongPress={350}
                accessibilityRole="button"
                accessibilityLabel={t.history.removeRoundConfirm(
                  r.points,
                  teamDisplayName(team, t),
                )}
                accessibilityHint={t.history.removeHint}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: team.color,
                    backgroundColor: idx === 0 ? `${team.color}26` : 'transparent',
                  },
                  pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
                ]}
              >
                <Text style={[styles.chipPoints, { color: team.color }]}>
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

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  leadsPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyHint: {
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 0.3,
    paddingVertical: 4,
  },
  row: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
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
