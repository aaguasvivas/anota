import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { getTheme, Theme } from '../theme/themes';
import type { MatchState, Team } from '../types';
import { DominoTile } from './DominoTile';
import { ShareCard } from './ShareCard';

type Props = {
  visible: boolean;
  state: MatchState;
  onNewMatch: () => void;
  onKeepPlaying: () => void;
};

// A plain overlay, not a react-native Modal. The keypad submit that wins the
// match dismisses the ScoreKeypad modal and shows this celebration in the
// same commit; as an overlay that never stacks UIKit presentations, and the
// share sheet gets a clean screen to present over.
export function WinnerModal({ visible, state, onNewMatch, onKeepPlaying }: Props) {
  const { t, pick } = useT();
  const theme = useTheme();
  const { proUnlocked } = useThemeControls();
  const styles = useThemedStyles(makeStyles);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cardRef = useRef<View>(null);
  // Free users always share the Classic Felt card; Pro shares the active theme.
  const cardTheme = proUnlocked ? theme : getTheme('classic');

  const phrase = useMemo(() => pick(t.winner.phrases), [visible, t, pick]);
  const subtitle = useMemo(() => pick(t.winner.subtitles), [visible, t, pick]);

  useEffect(() => {
    if (visible) {
      scale.setValue(0.6);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 14,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  // The Modal used to handle Android's back button; the overlay does it here.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onKeepPlaying();
      return true;
    });
    return () => sub.remove();
  }, [visible, onKeepPlaying]);

  const winnerId = state.winnerId;
  if (!visible || !winnerId) return null;
  const winner: Team = state.teams[winnerId];
  const winnerColor = theme.teams[winner.id].color;
  const loser: Team = winnerId === 'A' ? state.teams.B : state.teams.A;
  const winnerName = teamDisplayName(winner, t);
  const loserName = teamDisplayName(loser, t);

  async function shareResult() {
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
        return;
      }
      // fallback to text if the platform share sheet is unavailable
      await Share.share({
        message: t.winner.shareMessage(
          winnerName,
          loserName,
          winner.score,
          loser.score,
        ),
      });
    } catch {
      // user cancelled or capture failed; no-op
    }
  }

  return (
    <Animated.View style={[styles.backdrop, { opacity }]}>
        <View collapsable={false} style={{ position: 'absolute', left: -9999, top: 0 }}>
          <View ref={cardRef} collapsable={false}>
            <ShareCard
              theme={cardTheme}
              winnerName={winnerName}
              loserName={loserName}
              winnerScore={winner.score}
              loserScore={loser.score}
              winnerId={winner.id}
            />
          </View>
        </View>
        <Animated.View
          style={[
            styles.card,
            { opacity, transform: [{ scale }], borderColor: winnerColor },
          ]}
        >
          <LinearGradient
            colors={[
              `${winnerColor}33`,
              'rgba(0,0,0,0)',
              `${winnerColor}22`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.tileRow}>
            <DominoTile top={6} bottom={6} pipColor={winnerColor} size={42} />
          </View>

          <Text style={[styles.phrase, { color: winnerColor }]}>{phrase}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.scoreBlock}>
            <Text style={styles.winnerName} numberOfLines={1}>
              {winnerName}
            </Text>
            <Text style={[styles.winnerScore, { color: winnerColor }]}>{winner.score}</Text>
            <View style={styles.versus}>
              <View style={[styles.divider, { backgroundColor: `${winnerColor}55` }]} />
              <Text style={styles.vsText}>{t.chrome.vs}</Text>
              <View style={[styles.divider, { backgroundColor: `${winnerColor}55` }]} />
            </View>
            <Text style={styles.loserLine}>
              {loserName}  ·  {loser.score}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onKeepPlaying}
              accessibilityRole="button"
              accessibilityLabel={t.winner.keepPlaying}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.secondaryText}>{t.winner.keepPlaying}</Text>
            </Pressable>
            <Pressable
              onPress={onNewMatch}
              accessibilityRole="button"
              accessibilityLabel={t.winner.newMatch}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: winnerColor },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.primaryText}>{t.winner.newMatch}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={shareResult}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t.winner.share}
            style={styles.shareBtn}
          >
            <View style={styles.shareInner}>
              <Ionicons name="share-outline" size={15} color={theme.gold} />
              <Text style={styles.shareText}>{t.winner.share}</Text>
            </View>
          </Pressable>
        </Animated.View>
    </Animated.View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.felt,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: spacing.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  tileRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  phrase: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.textDim,
    textAlign: 'center',
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scoreBlock: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  winnerName: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  winnerScore: {
    fontSize: 88,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 92,
    fontVariant: ['tabular-nums'],
  },
  versus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  divider: {
    width: 36,
    height: 1,
  },
  vsText: {
    color: theme.textDim,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loserLine: {
    color: theme.textDim,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryBtn: {
    flex: 1.4,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryText: {
    color: theme.tileInk,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: theme.hairline,
    alignItems: 'center',
    backgroundColor: theme.bgDeep,
  },
  secondaryText: {
    color: theme.textDim,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  shareBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  shareText: {
    color: theme.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textDecorationLine: 'underline',
  },
  shareInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
