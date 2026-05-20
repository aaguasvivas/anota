import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Round, Team, TeamId } from '../types';

type Props = {
  rounds: Round[];
  teams: Record<TeamId, Team>;
};

export function RoundHistory({ rounds, teams }: Props) {
  const { t } = useT();

  if (rounds.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t.history.emptyTitle}</Text>
        <Text style={styles.emptySub}>{t.history.emptySubtitle}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{t.history.sectionTitle}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {rounds.slice(0, 16).map((r, idx) => {
          const team = teams[r.teamId];
          return (
            <View
              key={r.id}
              style={[
                styles.chip,
                {
                  borderColor: team.color,
                  backgroundColor: idx === 0 ? `${team.color}26` : colors.felt,
                },
              ]}
            >
              <Text style={[styles.chipPoints, { color: team.color }]}>+{r.points}</Text>
              <Text style={styles.chipTeam} numberOfLines={1}>
                {teamDisplayName(team, t)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 72,
    alignItems: 'center',
  },
  chipPoints: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  chipTeam: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
    maxWidth: 90,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyTitle: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  emptySub: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 2,
  },
});
