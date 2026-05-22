import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PRIMARY_QUICK_SCORES, QUICK_SCORES, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { Team, TeamId } from '../types';
import { ScoreButton } from './ScoreButton';

type Props = {
  team: Team;
  teamId: TeamId;
  onAdd: (teamId: TeamId, points: number) => void;
  onCustom: (teamId: TeamId) => void;
};

const PRIMARY = new Set<number>(PRIMARY_QUICK_SCORES);

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

      <View style={styles.row}>
        {QUICK_SCORES.map((pts) => {
          const isPrimary = PRIMARY.has(pts);
          return (
            <ScoreButton
              key={pts}
              label={`+${pts}`}
              color={team.color}
              onPress={() => onAdd(teamId, pts)}
              subdued={!isPrimary}
              accessibilityLabel={t.team.plusForA11y(displayName, pts)}
              style={styles.cell}
            />
          );
        })}
      </View>

      <ScoreButton
        label={`+ ${t.chrome.customAdd}`}
        color={team.color}
        outline
        onPress={() => onCustom(teamId)}
        accessibilityLabel={t.team.customForA11y(displayName)}
        style={styles.other}
      />
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  other: {
    marginTop: spacing.sm,
    minHeight: 46,
  },
});
