import React from 'react';
import { StyleSheet, View } from 'react-native';
import { QUICK_SCORES, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team, TeamId } from '../types';
import { ScoreButton } from './ScoreButton';
import { useLayoutMetrics } from '../hooks/useLayoutMetrics';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  team: Team;
  teamId: TeamId;
  onAdd: (teamId: TeamId, points: number) => void;
  onCustom: (teamId: TeamId) => void;
};

export function ScorePad({ team, teamId, onAdd, onCustom }: Props) {
  const { t } = useT();
  const theme = useTheme();
  const m = useLayoutMetrics();
  const displayName = teamDisplayName(team, t);
  const color = theme.teams[teamId].color;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {QUICK_SCORES.map((pts) => (
          <ScoreButton
            key={pts}
            label={`+${pts}`}
            color={color}
            subdued
            onPress={() => onAdd(teamId, pts)}
            accessibilityLabel={t.team.plusForA11y(displayName, pts)}
            style={[styles.cell, { minHeight: m.chipHeight }]}
          />
        ))}
      </View>
      <ScoreButton
        label={`+ ${t.team.addPoints}`}
        color={color}
        onPress={() => onCustom(teamId)}
        accessibilityLabel={t.team.customForA11y(displayName)}
        style={[styles.hero, { minHeight: m.heroHeight }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  hero: {
    marginTop: spacing.sm,
  },
});
