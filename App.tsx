import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { initAds } from './src/ads/ads';
import {
  AdsRemovedProvider,
  useAdsRemoved,
} from './src/ads/AdsRemovedProvider';
import { BannerSlot } from './src/ads/BannerSlot';
import { ConfirmDialog } from './src/components/ConfirmDialog';
import { ProSheet } from './src/components/ProSheet';
import { ScoreKeypad } from './src/components/ScoreKeypad';
import { RoundStrip } from './src/components/RoundStrip';
import { ScorePad } from './src/components/ScorePad';
import { SettingsModal } from './src/components/SettingsModal';
import { TargetPill } from './src/components/TargetPill';
import { TeamCard } from './src/components/TeamCard';
import { WinnerModal } from './src/components/WinnerModal';
import { radii, spacing } from './src/constants/layout';
import { useLayoutMetrics } from './src/hooks/useLayoutMetrics';
import { useMatch } from './src/hooks/useMatch';
import { LanguageProvider, teamDisplayName, useT } from './src/i18n';
import {
  endIap,
  initIap,
  PRO_PRODUCT_ID,
  restoreOwned,
  setPurchaseCallbacks,
} from './src/iap/purchases';
import { useThemedStyles } from './src/theme/makeStyles';
import { ThemeProvider, useTheme, useThemeControls } from './src/theme/ThemeProvider';
import { Theme } from './src/theme/themes';
import type { Round, TeamId } from './src/types';
import {
  notifySuccess,
  notifyWarning,
  tapLight,
  tapMedium,
} from './src/utils/haptics';
import { hydratePrefs } from './src/utils/preferences';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AdsRemovedProvider>
          <LanguageProvider>
            <Scorekeeper />
          </LanguageProvider>
        </AdsRemovedProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Scorekeeper() {
  useKeepAwake();
  const { t } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    hydrated: themeHydrated,
    proUnlocked,
    setProUnlocked,
  } = useThemeControls();
  const {
    adsRemoved,
    setAdsRemoved,
    hydrated: adsHydrated,
  } = useAdsRemoved();
  const match = useMatch();
  const showWinner = !!match.state.winnerId && !match.state.winnerAcknowledged;
  const [customFor, setCustomFor] = useState<TeamId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [roundToRemove, setRoundToRemove] = useState<Round | null>(null);
  const [proOpen, setProOpen] = useState(false);

  // Pro includes ad removal; the standalone purchase only removes ads.
  const adFree = adsRemoved || proUnlocked;
  const [adsReady, setAdsReady] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const showBanner = adsReady && !adFree;
  const m = useLayoutMetrics(showBanner ? bannerHeight : 0);

  useEffect(() => {
    hydratePrefs();
  }, []);

  // Start the store connection and silently re-light prior purchases on
  // launch. Only ever set entitlements to true here: a flaky network must
  // never revoke a real purchase.
  useEffect(() => {
    let active = true;
    const grant = (id: string) => {
      if (id === PRO_PRODUCT_ID) setProUnlocked(true);
      else setAdsRemoved(true);
    };
    // A successful purchase unlocks even after the sheet is dismissed; any
    // real error surfaces to the user instead of silently failing.
    setPurchaseCallbacks(grant, (message) =>
      Alert.alert('Purchase problem', message),
    );
    initIap().then(async () => {
      const owned = await restoreOwned();
      if (active) owned.forEach(grant);
    });
    return () => {
      active = false;
      setPurchaseCallbacks(null, null);
      endIap();
    };
  }, [setProUnlocked, setAdsRemoved]);

  // Start the ads SDK only for users who have not paid ads away. Buyers never
  // see the consent flow or a single SDK request. Once ready, the banner slot
  // mounts; it unmounts the instant an unlock lands.
  useEffect(() => {
    if (!adsHydrated || !themeHydrated || adFree || adsReady) return;
    let active = true;
    initAds().then((ok) => {
      if (active && ok) setAdsReady(true);
    });
    return () => {
      active = false;
    };
  }, [adsHydrated, themeHydrated, adFree, adsReady]);

  // The Pro sheet is a plain overlay, never a second native modal: stacking
  // modals on the new architecture makes UIKit refuse the presentation and
  // desyncs native from JS, which froze the app. Settings (the only real
  // modal) closes, revealing the overlay behind it.
  const openPro = useCallback(() => {
    setSettingsOpen(false);
    setProOpen(true);
  }, []);

  // Closing the sheet returns to the themes the user was browsing.
  const closePro = useCallback(() => {
    setProOpen(false);
    setSettingsOpen(true);
  }, []);

  // Celebrate when an (unacknowledged) winner appears.
  useEffect(() => {
    if (showWinner) {
      notifySuccess();
    }
  }, [showWinner]);

  function handleAdd(teamId: TeamId, points: number) {
    tapMedium();
    match.addPoints(teamId, points);
  }

  function handleResetConfirm() {
    notifyWarning();
    match.resetMatch();
    setConfirmReset(false);
  }

  function confirmRemoveRound() {
    if (!roundToRemove) return;
    tapMedium();
    match.removeRound(roundToRemove.id);
    setRoundToRemove(null);
  }

  function openRename() {
    setSettingsOpen(true);
  }

  const removeRoundMessage = roundToRemove
    ? t.history.removeRoundConfirm(
        roundToRemove.points,
        teamDisplayName(match.state.teams[roundToRemove.teamId], t),
      )
    : '';

  if (!match.hydrated || !themeHydrated || !adsHydrated) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[theme.bg, theme.felt, theme.bgDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <StatusBar style={theme.isLight ? 'dark' : 'light'} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.bg, theme.felt, theme.bgDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style={theme.isLight ? 'dark' : 'light'} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandWord}>{t.brand.name}</Text>
            <View style={styles.brandDot} />
          </View>
          <TargetPill
            value={match.state.targetScore}
            onChange={match.setTargetScore}
            onPressLong={() => {
              tapLight();
              setSettingsOpen(true);
            }}
          />
          <Pressable
            onPress={() => {
              tapLight();
              setSettingsOpen(true);
            }}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.6 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.settings}
          >
            <Ionicons name="settings-outline" size={18} color={theme.textDim} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.teamRegion, { gap: m.regionGap }]}>
            <TeamCard
              team={match.state.teams.A}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'A'}
              onRename={openRename}
            />
            <View style={styles.padWrap}>
              <ScorePad
                team={match.state.teams.A}
                teamId="A"
                onAdd={handleAdd}
                onCustom={(id) => {
                  tapLight();
                  setCustomFor(id);
                }}
              />
            </View>
          </View>

          <View style={styles.divider}>
            <RoundStrip
              rounds={match.state.rounds}
              teams={match.state.teams}
              onRequestRemove={(r) => {
                tapLight();
                setRoundToRemove(r);
              }}
            />
          </View>

          <View style={[styles.teamRegion, { gap: m.regionGap }]}>
            <TeamCard
              team={match.state.teams.B}
              targetScore={match.state.targetScore}
              isLeader={match.leader === 'B'}
              onRename={openRename}
            />
            <View style={styles.padWrap}>
              <ScorePad
                team={match.state.teams.B}
                teamId="B"
                onAdd={handleAdd}
                onCustom={(id) => {
                  tapLight();
                  setCustomFor(id);
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              if (match.state.rounds.length === 0) return;
              tapLight();
              match.undoLast();
            }}
            disabled={match.state.rounds.length === 0}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.undo}
            accessibilityState={{ disabled: match.state.rounds.length === 0 }}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && { opacity: 0.7 },
              match.state.rounds.length === 0 && { opacity: 0.35 },
            ]}
          >
            <View style={styles.footerBtnInner}>
              <Ionicons name="arrow-undo-outline" size={16} color={theme.textDim} />
              <Text style={styles.footerBtnText}>{t.chrome.undo}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              tapLight();
              setConfirmReset(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t.chrome.newMatch}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.footerBtnInner}>
              <Ionicons name="reload-outline" size={16} color={theme.textDim} />
              <Text style={styles.footerBtnText}>{t.chrome.newMatch}</Text>
            </View>
          </Pressable>
        </View>

        <BannerSlot enabled={showBanner} onHeight={setBannerHeight} />
      </SafeAreaView>

      <ScoreKeypad
        visible={customFor !== null}
        team={customFor ? match.state.teams[customFor] : null}
        onCancel={() => setCustomFor(null)}
        onSubmit={(value) => {
          if (customFor) {
            handleAdd(customFor, value);
          }
          setCustomFor(null);
        }}
      />

      <SettingsModal
        visible={settingsOpen}
        state={match.state}
        onClose={() => setSettingsOpen(false)}
        onRename={match.renameTeam}
        onTargetChange={match.setTargetScore}
        onResetMatch={() => {
          setSettingsOpen(false);
          setConfirmReset(true);
        }}
        onRequestPro={openPro}
        showRemoveAds={!adFree}
      />

      <ProSheet visible={proOpen} onClose={closePro} />

      <ConfirmDialog
        visible={confirmReset}
        title={t.newMatchConfirm.title}
        message={t.newMatchConfirm.message}
        confirmLabel={t.newMatchConfirm.confirm}
        cancelLabel={t.chrome.cancel}
        onConfirm={handleResetConfirm}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        visible={roundToRemove !== null}
        title={removeRoundMessage}
        confirmLabel={t.chrome.confirm}
        cancelLabel={t.chrome.cancel}
        destructive
        onConfirm={confirmRemoveRound}
        onCancel={() => setRoundToRemove(null)}
      />

      <WinnerModal
        visible={showWinner}
        state={match.state}
        onNewMatch={() => {
          tapMedium();
          match.resetMatch();
        }}
        onKeepPlaying={() => {
          tapLight();
          match.dismissWinner();
        }}
      />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bgDeep,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandWord: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.gold,
    marginLeft: 3,
    shadowColor: theme.gold,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: theme.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  teamRegion: {
    gap: spacing.sm,
  },
  padWrap: {
    width: '100%',
  },
  divider: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.md,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: theme.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
  },
  footerBtnText: {
    color: theme.textDim,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  footerBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
