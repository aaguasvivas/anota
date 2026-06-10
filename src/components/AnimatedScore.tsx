import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextStyle, View } from 'react-native';

type Props = {
  value: number;
  style?: TextStyle;
  glowColor?: string;
};

export function AnimatedScore({ value, style, glowColor }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    scale.setValue(1.18);
    opacity.setValue(0.6);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
        speed: 18,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, scale, opacity]);

  return (
    // flexShrink lets a row parent constrain the score so the font can
    // auto-shrink instead of pushing siblings off the card (e.g. 4-digit
    // scores with unusually high custom targets).
    <View style={styles.wrap}>
      {glowColor ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.glow,
            { backgroundColor: glowColor, opacity },
          ]}
        />
      ) : null}
      <Animated.Text
        style={[style, { transform: [{ scale }] }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {value}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 1,
  },
  glow: {
    borderRadius: 80,
    transform: [{ scale: 1.3 }],
  },
});
