import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { computeLayoutMetrics, type LayoutMetrics } from '../layout/metrics';

// Responsive sizing for the single-screen layout. Reactive to window size and
// safe-area insets, so it adapts across devices (and rotation / split view).
export function useLayoutMetrics(): LayoutMetrics {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usable = height - insets.top - insets.bottom;
  return useMemo(() => computeLayoutMetrics(usable), [usable]);
}
