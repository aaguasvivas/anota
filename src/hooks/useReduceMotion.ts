import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Live iOS Reduce Motion setting. React Native's Animated API ignores it, so
// components that move check this and fall back to fades.
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (live) setReduce(on);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
