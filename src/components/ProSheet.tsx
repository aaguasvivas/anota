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
import { useAdsRemoved } from '../ads/AdsRemovedProvider';
import { useT } from '../i18n';
import {
  buyProduct,
  getPriceLabels,
  PRO_PRODUCT_ID,
  REMOVE_ADS_PRODUCT_ID,
  restoreOwned,
} from '../iap/purchases';
import { useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const FALLBACK_PRO_PRICE = '$2.99';
const FALLBACK_REMOVE_ADS_PRICE = '$1.99';

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
  const { setAdsRemoved } = useAdsRemoved();
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [removeAdsPrice, setRemoveAdsPrice] = useState<string | null>(null);
  const [pending, setPending] = useState<'pro' | 'ads' | 'restore' | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState<
    'thanks' | 'thanksNoAds' | 'restored' | null
  >(null);
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

  // Fetch the real localized prices each time the sheet opens. Until they
  // resolve (or if the store is unreachable) fall back to the list prices.
  // Also reset transient state so a reopened sheet never shows a stale
  // success message or "not found" hint from a previous session.
  useEffect(() => {
    if (!visible) return;
    let active = true;
    setNotFound(false);
    setSuccess(null);
    getPriceLabels().then((labels) => {
      if (!active) return;
      if (labels[PRO_PRODUCT_ID]) setProPrice(labels[PRO_PRODUCT_ID]);
      if (labels[REMOVE_ADS_PRODUCT_ID]) {
        setRemoveAdsPrice(labels[REMOVE_ADS_PRODUCT_ID]);
      }
    });
    return () => {
      active = false;
    };
  }, [visible]);

  const proLabel = t.pro.buyPro.replace(
    '{price}',
    proPrice ?? FALLBACK_PRO_PRICE,
  );
  const removeAdsLabel = t.pro.buyRemoveAds.replace(
    '{price}',
    removeAdsPrice ?? FALLBACK_REMOVE_ADS_PRICE,
  );

  // The sheet stays on screen while StoreKit works, so it owns the pending
  // state. Success also arrives through the global purchase listener, which
  // covers the case where the user closes the sheet mid-purchase.
  async function handleBuyPro() {
    if (pending) return;
    setNotFound(false);
    setPending('pro');
    try {
      const owned = await buyProduct(PRO_PRODUCT_ID);
      if (owned) {
        setProUnlocked(true);
        setSuccess('thanks');
      }
    } catch (e: any) {
      Alert.alert('Purchase problem', String(e?.message ?? e));
    } finally {
      setPending(null);
    }
  }

  async function handleBuyRemoveAds() {
    if (pending) return;
    setNotFound(false);
    setPending('ads');
    try {
      const owned = await buyProduct(REMOVE_ADS_PRODUCT_ID);
      if (owned) {
        setAdsRemoved(true);
        setSuccess('thanksNoAds');
      }
    } catch (e: any) {
      Alert.alert('Purchase problem', String(e?.message ?? e));
    } finally {
      setPending(null);
    }
  }

  async function handleRestore() {
    if (pending) return;
    setNotFound(false);
    setPending('restore');
    try {
      const owned = await restoreOwned();
      if (owned.includes(PRO_PRODUCT_ID)) setProUnlocked(true);
      if (owned.includes(REMOVE_ADS_PRODUCT_ID)) setAdsRemoved(true);
      if (owned.length > 0) {
        setSuccess('restored');
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setPending(null);
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
              {success === 'thanks'
                ? t.pro.thanks
                : success === 'thanksNoAds'
                  ? t.pro.thanksNoAds
                  : t.pro.restored}
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
              onPress={handleBuyPro}
              disabled={pending !== null}
              accessibilityRole="button"
              accessibilityLabel={proLabel}
              style={({ pressed }) => [
                styles.buyBtn,
                pressed && { opacity: 0.85 },
                pending !== null && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.buyText}>
                {pending === 'pro' ? t.pro.buying : proLabel}
              </Text>
            </Pressable>
            <Text style={styles.includes}>{t.pro.proIncludes}</Text>

            <Pressable
              onPress={handleBuyRemoveAds}
              disabled={pending !== null}
              accessibilityRole="button"
              accessibilityLabel={removeAdsLabel}
              style={({ pressed }) => [
                styles.altBtn,
                pressed && { opacity: 0.85 },
                pending !== null && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.altText}>
                {pending === 'ads' ? t.pro.buying : removeAdsLabel}
              </Text>
            </Pressable>

            {notFound ? <Text style={styles.notFound}>{t.pro.notFound}</Text> : null}

            <Pressable
              onPress={handleRestore}
              disabled={pending !== null}
              accessibilityRole="button"
              accessibilityLabel={t.pro.restore}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.linkText}>
                {pending === 'restore' ? t.pro.buying : t.pro.restore}
              </Text>
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
    includes: {
      color: theme.textDim,
      fontSize: 12,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    altBtn: {
      marginTop: spacing.md,
      paddingVertical: 13,
      borderRadius: radii.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.hairline,
      backgroundColor: 'rgba(255,255,255,0.04)',
    },
    altText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 14,
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
