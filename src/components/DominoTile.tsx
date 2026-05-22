import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

type Props = {
  top: number; // 0-6
  bottom: number; // 0-6
  pipColor: string;
  size?: number; // tile width
};

// 7-position pip grid keyed by die face (0..6).
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  0: [],
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

function Half({ value, pipColor, size }: { value: number; pipColor: string; size: number }) {
  const face = PIP_LAYOUTS[Math.max(0, Math.min(6, value))] ?? [];
  const pipSize = size * 0.16;
  return (
    <View style={[styles.half, { height: size, width: size }]}>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const visible = face.some(([r, c]) => r === row && c === col);
          return (
            <View
              key={`${row}-${col}`}
              style={[
                styles.pipCell,
                { width: size / 3, height: size / 3 },
              ]}
            >
              {visible ? (
                <View
                  style={{
                    width: pipSize,
                    height: pipSize,
                    borderRadius: pipSize / 2,
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

export function DominoTile({ top, bottom, pipColor, size = 56 }: Props) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size * 2 + 4, borderRadius: size * 0.22 },
      ]}
    >
      <Half value={top} pipColor={pipColor} size={size} />
      <View style={styles.divider} />
      <Half value={bottom} pipColor={pipColor} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.tile,
    borderColor: colors.tileShadow,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  half: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  divider: {
    height: 2,
    backgroundColor: colors.tileShadow,
    opacity: 0.7,
  },
  pipCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Pick a stable-looking face based on score so the tile feels alive.
export function tileFacesForScore(score: number, targetScore: number): [number, number] {
  const ratio = Math.max(0, Math.min(1, score / targetScore));
  const top = Math.round(ratio * 6);
  const bottom = Math.max(0, 6 - top);
  return [top, bottom];
}
