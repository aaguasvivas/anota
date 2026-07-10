import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radii, spacing } from '../constants/layout';
import { useT } from '../i18n';
import { buyPro, getProPriceLabel, restorePro } from '../iap/purchases';
import { useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const FALLBACK_PRICE = '$2.99';

// Deliberately NOT a react-native Modal. Stacking or swapping native iOS
// modals is unreliable on the new architecture: UIKit can refuse the
// presentation ("already presenting"), which leaves an invisible layer that
// swallows every touch until the app is killed. This overlay is a plain view
// inside the root, so nothing is ever presented over the Settings modal, and
// StoreKit gets a clean screen to present the payment sheet on.
export function ProSheet({ visible, onClose }: Props) {
  const { t } = useT();
  const styles = useThemedStyles(makeStyles);
  const { setProUnlocked } = useThemeControls();
  const [price, setPrice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState<'thanks' | 'restored' | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity]);

  // The Modal used to handle Android's back button; the overlay does it here.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  // Fetch the real localized price each time the sheet opens. Until it
  // resolves (or if the store is unreachable) fall back to the list price.
  // Also reset transient state so a reopened sheet never shows a stale
  // success message or "not found" hint from a previous session.
  useEffect(() => {
    if (!visible) return;
    let active = true;
    setNotFound(false);
    setSuccess(null);
    getProPriceLabel().then((label) => {
      if (active && label) setPrice(label);
    });
    return () => {
      active = false;
    };
  }, [visible]);

  const resolvedPrice = price ?? FALLBACK_PRICE;
  const buyLabel = t.pro.buy.replace('{price}', resolvedPrice);

  // The sheet stays on screen while StoreKit works, so it owns the pending
  // state. Success also arrives through the global purchase listener, which
  // covers the case where the user closes the sheet mid-purchase.
  async function handleBuy() {
    if (pending) return;
    setNotFound(false);
    setPending(true);
    try {
      const owned = await buyPro();
      if (owned) {
        setProUnlocked(true);
        setSuccess('thanks');
      }
    } catch (e: any) {
      Alert.alert('Purchase problem', String(e?.message ?? e));
    } finally {
      setPending(false);
    }
  }

  async function handleRestore() {
    if (pending) return;
    setNotFound(false);
    setPending(true);
    try {
      const owned = await restorePro();
      if (owned) {
        setProUnlocked(true);
        setSuccess('restored');
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setPending(false);
    }
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.backdrop, { opacity }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.title}>{t.pro.title}</Text>
        <Text style={styles.blurb}>{t.pro.blurb}</Text>

        {success ? (
          <>
            <Text style={styles.success}>
              {success === 'thanks' ? t.pro.thanks : t.pro.restored}
            </Text>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.pro.close}
              style={({ pressed }) => [
                styles.buyBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.buyText}>{t.pro.close}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={handleBuy}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel={buyLabel}
              style={({ pressed }) => [
                styles.buyBtn,
                pressed && { opacity: 0.85 },
                pending && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.buyText}>
                {pending ? t.pro.buying : buyLabel}
              </Text>
            </Pressable>

            {notFound ? <Text style={styles.notFound}>{t.pro.notFound}</Text> : null}

            <Pressable
              onPress={handleRestore}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel={t.pro.restore}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.linkText}>{t.pro.restore}</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.pro.close}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.closeText}>{t.pro.close}</Text>
            </Pressable>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1000,
      elevation: 1000,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.felt,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: theme.hairline,
      padding: spacing.xl,
    },
    title: {
      color: theme.gold,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    blurb: {
      color: theme.textDim,
      fontSize: 14,
      marginTop: spacing.sm,
      lineHeight: 20,
    },
    buyBtn: {
      marginTop: spacing.xl,
      paddingVertical: 14,
      borderRadius: radii.md,
      alignItems: 'center',
      backgroundColor: theme.gold,
    },
    buyText: {
      color: theme.tileInk,
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 0.2,
    },
    notFound: {
      color: theme.textDim,
      fontSize: 13,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    success: {
      color: theme.gold,
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 22,
      marginTop: spacing.xl,
    },
    linkBtn: {
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    linkText: {
      color: theme.textDim,
      fontWeight: '700',
      fontSize: 14,
    },
    closeText: {
      color: theme.textFaint,
      fontWeight: '700',
      fontSize: 14,
    },
  });
