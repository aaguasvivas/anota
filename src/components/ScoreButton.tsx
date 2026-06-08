import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { radii } from '../constants/layout';

type Props = {
  label: string;
  onPress: () => void;
  color: string;
  style?: StyleProp<ViewStyle>;
  outline?: boolean;
  // Lower visual weight; team-color tint instead of full fill.
  subdued?: boolean;
  accessibilityLabel?: string;
};

export function ScoreButton({
  label,
  onPress,
  color,
  style,
  outline,
  subdued,
  accessibilityLabel,
}: Props) {
  const bg = outline ? undefined : subdued ? `${color}26` : color;
  const labelColor = outline || subdued ? color : colors.tile;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        outline && { borderColor: color, borderWidth: 1.5 },
        subdued && { borderColor: `${color}66`, borderWidth: 1 },
        bg ? { backgroundColor: bg } : null,
        pressed && styles.pressed,
        style,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
    >
      <View pointerEvents="none">
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  label: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
