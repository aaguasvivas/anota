import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TextStyle, View } from 'react-native';
import { FONT_CAP } from '../constants/layout';
import { useReduceMotion } from '../hooks/useReduceMotion';

type Props = {
  value: number;
  style?: TextStyle;
  glowColor?: string;
};

// Adding points pops the score and flashes the team glow. Removing points
// (Undo, remove a round, New match) dims the digits for a moment instead, so a
// correction never looks like a celebration. With Reduce Motion on, nothing
// scales; the glow and the dim are fades and stay.
export function AnimatedScore({ value, style, glowColor }: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const up = value > prev.current;
    prev.current = value;
    if (up) {
      glow.setValue(0.6);
      const glowFade = Animated.timing(glow, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      });
      if (reduceMotion) {
        glowFade.start();
        return;
      }
      scale.setValue(1.18);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 10,
          speed: 18,
        }),
        glowFade,
      ]).start();
    } else {
      textOpacity.setValue(0.35);
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [value, reduceMotion, scale, glow, textOpacity]);

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
            { backgroundColor: glowColor, opacity: glow },
          ]}
        />
      ) : null}
      <Animated.Text
        style={[style, { opacity: textOpacity, transform: [{ scale }] }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        maxFontSizeMultiplier={FONT_CAP.numeral}
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
