import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { QUICK_SCORES, radii, spacing } from '../constants/layout';
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
      </View>

      <Pressable
        onPress={() => onCustom(teamId)}
        style={({ pressed }) => [
          styles.customBtn,
          { borderColor: team.color },
          pressed && { opacity: 0.6, transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={[styles.customText, { color: team.color }]}>
          + {t.chrome.customAdd}
        </Text>
      </Pressable>
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
  customBtn: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.felt,
  },
  customText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
