import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';

type Props = {
  progress: number; // 0..1
  color: string;
  glowColor?: string;
  height?: number;
};

export function ProgressBar({ progress, color, glowColor, height = 8 }: Props) {
  const styles = useThemedStyles(makeStyles);
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: progress,
      useNativeDriver: false,
      bounciness: 6,
      speed: 14,
    }).start();
  }, [progress, anim]);

  const widthInterpolate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolate,
            backgroundColor: color,
            borderRadius: height / 2,
            shadowColor: glowColor ?? color,
            shadowOpacity: 0.7,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    track: {
      width: '100%',
      backgroundColor: theme.hairline,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
    },
  });
