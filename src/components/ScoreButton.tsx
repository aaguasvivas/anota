import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FONT_CAP, radii } from '../constants/layout';
import { useTheme } from '../theme/ThemeProvider';
import { largeLabelInk } from '../theme/themes';

type Props = {
  label: string;
  onPress: () => void;
  color: string;
  style?: StyleProp<ViewStyle>;
  // Lower visual weight; team-color tint instead of full fill.
  subdued?: boolean;
  accessibilityLabel?: string;
};

export function ScoreButton({
  label,
  onPress,
  color,
  style,
  subdued,
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const bg = subdued ? `${color}26` : color;
  const labelColor = subdued ? color : largeLabelInk(color, theme);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        // Tinted chips sit flat: a drop shadow under tinted digits blurs them,
        // most visibly on the light Bone theme.
        subdued && { borderColor: `${color}66`, borderWidth: 1, shadowOpacity: 0, elevation: 0 },
        { backgroundColor: bg },
        pressed && styles.pressed,
        style,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
    >
      <View pointerEvents="none">
        <Text
          style={[styles.label, { color: labelColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={FONT_CAP.numeral}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // No base `flex`: callers opt into flex via the `cell` style for row
    // layouts (chips share width equally). A base `flex: 1` sets flexBasis to 0,
    // which collapses the button's layout box to 0 height when it's a direct
    // child of an auto-height column (e.g. the full-width hero "+ Points"
    // button) - making it render outside its box and overflow onto the footer.
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
