import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../theme/themes';

// Fixed-size, off-screen-friendly card meant to be captured to an image and
// shared. It styles itself from the PASSED theme prop (NOT useTheme), so the
// caller can force Classic Felt for the free card while Pro uses the active
// theme. Rendered far off-screen by the caller, so the large logical size is
// free and simply yields a crisp high-resolution share image. The final score
// is the hero; the domino tile is a small accent in the two team colors.

const CARD_SIZE = 1080;

type Props = {
  theme: Theme;
  winnerName: string;
  loserName: string;
  winnerScore: number;
  loserScore: number;
  winnerId: 'A' | 'B';
};

const PIP_GRID: [number, number][] = [
  [0, 0],
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 0],
  [2, 2],
];

function TileHalf({ pipColor }: { pipColor: string }) {
  const cell = 40;
  const pip = cell * 0.5;
  return (
    <View style={styles.tileHalf}>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const visible = PIP_GRID.some(([r, c]) => r === row && c === col);
          return (
            <View key={`${row}-${col}`} style={[styles.pipCell, { width: cell, height: cell }]}>
              {visible ? (
                <View
                  style={{ width: pip, height: pip, borderRadius: pip / 2, backgroundColor: pipColor }}
                />
              ) : null}
            </View>
          );
        }),
      )}
    </View>
  );
}

export function ShareCard({
  theme,
  winnerName,
  loserName,
  winnerScore,
  loserScore,
  winnerId,
}: Props) {
  const winnerColor = theme.teams[winnerId].color;
  const loserColor = theme.teams[winnerId === 'A' ? 'B' : 'A'].color;

  return (
    <View style={[styles.card, { backgroundColor: theme.felt }]}>
      <Text style={[styles.wordmark, { color: theme.gold }]}>Anota</Text>

      <View style={styles.center}>
        <View style={[styles.tileBody, { backgroundColor: theme.tile, borderColor: theme.tileShadow }]}>
          <TileHalf pipColor={winnerColor} />
          <View style={[styles.tileDivider, { backgroundColor: theme.tileShadow }]} />
          <TileHalf pipColor={loserColor} />
        </View>

        <View style={styles.board}>
          <View style={styles.row}>
            <Text style={[styles.nameWin, { color: theme.text }]} numberOfLines={1}>
              {winnerName}
            </Text>
            <Text style={[styles.scoreWin, { color: winnerColor }]}>{winnerScore}</Text>
          </View>
          <View style={[styles.rowRule, { backgroundColor: theme.divider }]} />
          <View style={styles.row}>
            <Text style={[styles.nameLose, { color: theme.textDim }]} numberOfLines={1}>
              {loserName}
            </Text>
            <Text style={[styles.scoreLose, { color: theme.textDim }]}>{loserScore}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.footer, { color: theme.textFaint }]}>anota</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 110,
    paddingHorizontal: 90,
  },
  wordmark: {
    fontSize: 84,
    fontWeight: '900',
    letterSpacing: -2,
  },
  center: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  tileBody: {
    flexDirection: 'row',
    borderWidth: 3,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 64,
  },
  tileHalf: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    height: 120,
  },
  tileDivider: {
    width: 4,
    opacity: 0.7,
  },
  pipCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nameWin: {
    flex: 1,
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 24,
  },
  scoreWin: {
    fontSize: 168,
    fontWeight: '900',
    letterSpacing: -4,
    fontVariant: ['tabular-nums'],
  },
  rowRule: {
    height: 3,
    marginVertical: 18,
  },
  nameLose: {
    flex: 1,
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 24,
  },
  scoreLose: {
    fontSize: 110,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
