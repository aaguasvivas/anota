import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { radii, spacing } from '../constants/layout';
import { teamDisplayName, useT } from '../i18n';
import type { MatchState, Team } from '../types';
import { DominoTile } from './DominoTile';

type Props = {
  visible: boolean;
  state: MatchState;
  onNewMatch: () => void;
  onKeepPlaying: () => void;
};

export function WinnerModal({ visible, state, onNewMatch, onKeepPlaying }: Props) {
  const { t, pick } = useT();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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

  const winnerId = state.winnerId;
  if (!winnerId) return null;
  const winner: Team = state.teams[winnerId];
  const loser: Team = winnerId === 'A' ? state.teams.B : state.teams.A;
  const winnerName = teamDisplayName(winner, t);
  const loserName = teamDisplayName(loser, t);

  async function shareResult() {
    try {
      await Share.share({
        message: t.winner.shareMessage(
          winnerName,
          loserName,
          winner.score,
          loser.score,
        ),
      });
    } catch {
      // user cancelled
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepPlaying}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            { opacity, transform: [{ scale }], borderColor: winner.color },
          ]}
        >
          <LinearGradient
            colors={[
              `${winner.color}33`,
              'rgba(0,0,0,0)',
              `${winner.color}22`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.tileRow}>
            <DominoTile top={6} bottom={6} pipColor={winner.color} size={42} />
          </View>

          <Text style={[styles.phrase, { color: winner.color }]}>{phrase}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.scoreBlock}>
            <Text style={styles.winnerName} numberOfLines={1}>
              {winnerName}
            </Text>
            <Text style={[styles.winnerScore, { color: winner.color }]}>{winner.score}</Text>
            <View style={styles.versus}>
              <View style={[styles.divider, { backgroundColor: `${winner.color}55` }]} />
              <Text style={styles.vsText}>{t.chrome.vs}</Text>
              <View style={[styles.divider, { backgroundColor: `${winner.color}55` }]} />
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
                { backgroundColor: winner.color },
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
              <Ionicons name="share-outline" size={15} color={colors.gold} />
              <Text style={styles.shareText}>{t.winner.share}</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.felt,
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
    color: colors.textDim,
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
    color: colors.text,
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
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loserLine: {
    color: colors.textDim,
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
    color: colors.tileInk,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    backgroundColor: colors.bgDeep,
  },
  secondaryText: {
    color: colors.textDim,
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
    color: colors.gold,
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
