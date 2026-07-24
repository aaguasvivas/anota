// Anchored adaptive banner pinned under the footer. The slot has zero height
// until an ad actually loads (no blank reserved box), reports its height so
// the layout metrics can tighten, and quietly retries a failed load a few
// times. Unmounts entirely once the user is ad-free.
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Real unit in release; Google's sample unit in dev. Simulators are always
// auto-registered as test devices, so release builds on a sim still serve
// test creatives instead of billable impressions.
export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-4879291425090726/4560153532';

const MAX_RETRIES = 5;
const RETRY_MS = 60000;

type Props = {
  enabled: boolean;
  onHeight: (h: number) => void;
};

export function BannerSlot({ enabled, onHeight }: Props) {
  const [attempt, setAttempt] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unmounting the slot never fires onLayout, so report the collapse here.
  useEffect(() => {
    if (!enabled) onHeight(0);
  }, [enabled, onHeight]);

  useEffect(
    () => () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    },
    [],
  );

  if (!enabled) return null;

  function scheduleRetry() {
    if (retryTimer.current) return;
    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;
      setAttempt((a) => a + 1);
    }, RETRY_MS);
  }

  if (attempt > MAX_RETRIES) return null;

  return (
    <View
      style={styles.slot}
      onLayout={(e) => onHeight(Math.round(e.nativeEvent.layout.height))}
    >
      <BannerAd
        key={attempt}
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={scheduleRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    alignItems: 'center',
  },
});
