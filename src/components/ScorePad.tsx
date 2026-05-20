import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.headerRow}>
        <Text style={[styles.headerName, { color: team.color }]} numberOfLines={1}>
          {t.team.plusFor(displayName)}
        </Text>
      </View>

      <View style={styles.grid}>
        {QUICK_SCORES.map((pts) => (
          <ScoreButton
            key={pts}
            label={`+${pts}`}
            color={team.color}
            onPress={() => onAdd(teamId, pts)}
            style={styles.gridItem}
          />
        ))}
        <ScoreButton
          label={`+ ${t.chrome.customAdd}`}
          color={team.color}
          outline
          onPress={() => onCustom(teamId)}
          style={styles.customItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  headerName: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    minWidth: '30%',
    flexBasis: '30%',
    flexGrow: 1,
  },
  customItem: {
    flexBasis: '100%',
    flexGrow: 0,
    minHeight: 48,
  },
});
