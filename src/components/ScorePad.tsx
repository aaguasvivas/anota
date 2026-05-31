import React from 'react';
import { StyleSheet, View } from 'react-native';
import { QUICK_SCORES, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team, TeamId } from '../types';
import { ScoreButton } from './ScoreButton';

type Props = {
  team: Team;
  teamId: TeamId;
  onAdd: (teamId: TeamId, points: number) => void;
  onCustom: (teamId: TeamId) => void;
};

export function ScorePad({ team, teamId, onAdd, onCustom }: Props) {
  const { t } = useT();
  const displayName = teamDisplayName(team, t);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {QUICK_SCORES.map((pts) => (
          <ScoreButton
            key={pts}
            label={`+${pts}`}
            color={team.color}
            subdued
            onPress={() => onAdd(teamId, pts)}
            accessibilityLabel={t.team.plusForA11y(displayName, pts)}
            style={styles.cell}
          />
        ))}
      </View>
      <ScoreButton
        label={`+ ${t.team.addPoints}`}
        color={team.color}
        onPress={() => onCustom(teamId)}
        accessibilityLabel={t.team.customForA11y(displayName)}
        style={styles.hero}
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
    minHeight: 52,
  },
});
