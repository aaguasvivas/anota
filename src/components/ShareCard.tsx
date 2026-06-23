import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../theme/themes';

// Fixed-size, off-screen-friendly card meant to be captured to an image and
// shared. It styles itself from the PASSED theme prop (NOT useTheme), so the
// caller can force Classic Felt for the free card while Pro uses the active
// theme. Rendered far off-screen by the caller, so the large logical size is
// free and simply yields a crisp high-resolution share image.

const CARD_SIZE = 1080;

type Props = {
  theme: Theme;
  winnerName: string;
  loserName: string;
  winnerScore: number;
  loserScore: number;
  winnerId: 'A' | 'B';
};

// A self-contained two-cell domino tile drawn from the passed theme so the card
// never depends on the active theme. Six pips on each half as a decorative
// centerpiece.
const PIP_GRID: [number, number][] = [
  [0, 0],
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 0],
  [2, 2],
];

function TileHalf({ theme, pipColor }: { theme: Theme; pipColor: string }) {
  const cell = 132;
  const pip = cell * 0.42;
  return (
    <View style={styles.tileHalf}>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const visible = PIP_GRID.some(([r, c]) => r === row && c === col);
          return (
            <View key={`${row}-${col}`} style={[styles.pipCell, { width: cell, height: cell }]}>
              {visible ? (
                <View
                  style={{
                    width: pip,
                    height: pip,
                    borderRadius: pip / 2,
                    backgroundColor: pipColor,
                  }}
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

  return (
    <View style={[styles.card, { backgroundColor: theme.felt }]}>
      <Text style={[styles.wordmark, { color: theme.gold }]}>Anota</Text>

      <View style={styles.tile}>
        <View style={[styles.tileBody, { backgroundColor: theme.tile, borderColor: theme.tileShadow }]}>
          <TileHalf theme={theme} pipColor={winnerColor} />
          <View style={[styles.tileDivider, { backgroundColor: theme.tileShadow }]} />
          <TileHalf theme={theme} pipColor={winnerColor} />
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <Text style={[styles.winnerName, { color: theme.text }]} numberOfLines={1}>
          {winnerName}
        </Text>
        <Text style={[styles.winnerScore, { color: winnerColor }]}>{winnerScore}</Text>

        <View style={styles.versus}>
          <View style={[styles.rule, { backgroundColor: `${winnerColor}55` }]} />
          <Text style={[styles.finalLabel, { color: theme.textDim }]}>Final</Text>
          <View style={[styles.rule, { backgroundColor: `${winnerColor}55` }]} />
        </View>

        <Text style={[styles.loserLine, { color: theme.textDim }]} numberOfLines={1}>
          {loserName}  -  {loserScore}
        </Text>
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
    paddingVertical: 96,
    paddingHorizontal: 80,
  },
  wordmark: {
    fontSize: 96,
    fontWeight: '900',
    letterSpacing: -2,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBody: {
    borderWidth: 3,
    borderRadius: 88,
    overflow: 'hidden',
  },
  tileHalf: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 396,
    height: 396,
  },
  tileDivider: {
    height: 6,
    opacity: 0.7,
  },
  pipCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
  },
  winnerName: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: 0.5,
    maxWidth: CARD_SIZE - 160,
  },
  winnerScore: {
    fontSize: 280,
    fontWeight: '900',
    letterSpacing: -8,
    lineHeight: 296,
    fontVariant: ['tabular-nums'],
  },
  versus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  rule: {
    width: 96,
    height: 3,
  },
  finalLabel: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  loserLine: {
    fontSize: 40,
    fontWeight: '600',
    letterSpacing: 0.8,
    maxWidth: CARD_SIZE - 160,
  },
  footer: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
