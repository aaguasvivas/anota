import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONT_CAP, radii, spacing } from '../constants/layout';
import { useAdsRemoved } from '../ads/AdsRemovedProvider';
import { useT } from '../i18n';
import {
  buyProduct,
  getPriceLabels,
  PRO_PRODUCT_ID,
  PRODUCT_UNAVAILABLE,
  REMOVE_ADS_PRODUCT_ID,
} from '../iap/purchases';
import { useRestore } from '../iap/useRestore';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { inkOn, Theme, ThemeId } from '../theme/themes';

type Props = {
  visible: boolean;
  onClose: () => void;
  // The locked theme the user tapped, if the sheet opened from a theme tile.
  themeId?: ThemeId | null;
};

const FALLBACK_PRO_PRICE = '$2.99';
const FALLBACK_REMOVE_ADS_PRICE = '$1.99';

// Deliberately NOT a react-native Modal. Stacking or swapping native iOS
// modals is unreliable on the new architecture: UIKit can refuse the
// presentation ("already presenting"), which leaves an invisible layer that
// swallows every touch until the app is killed. This overlay is a plain view
// inside the root, so nothing is ever presented over the Settings modal, and
// StoreKit gets a clean screen to present the payment sheet on.
export function ProSheet({ visible, onClose, themeId }: Props) {
  const { t } = useT();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { proUnlocked, setProUnlocked, setThemeId } = useThemeControls();
  const { adsRemoved, setAdsRemoved } = useAdsRemoved();
  const { status: restoreStatus, restore, reset: resetRestore } = useRestore();
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [removeAdsPrice, setRemoveAdsPrice] = useState<string | null>(null);
  const [buying, setBuying] = useState<'pro' | 'ads' | null>(null);
  const [success, setSuccess] = useState<'thanks' | 'thanksNoAds' | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const titleRef = useRef<Text>(null);
  const pending = buying !== null || restoreStatus === 'pending';
  // Someone who already removed ads is offered only the upgrade to Pro.
  const offerRemoveAds = !adsRemoved;

  useEffect(() => {
    if (!visible) {
      // Reset while hidden so the next open never paints at full opacity.
      opacity.setValue(0);
      return;
    }
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
    const id = setTimeout(() => {
      if (titleRef.current) AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
    }, 350);
    return () => clearTimeout(id);
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
    setSuccess(null);
    resetRestore();
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
  }, [visible, resetRestore]);

  // After buying Pro from a locked tile, switch to that theme. This runs in an
  // effect, not in the buy handler, because setThemeId checks the Pro flag and
  // must see it after the unlock has rendered.
  useEffect(() => {
    if (success === 'thanks' && proUnlocked && themeId) setThemeId(themeId);
  }, [success, proUnlocked, themeId, setThemeId]);

  const proLabel = t.pro.buyPro.replace('{price}', proPrice ?? FALLBACK_PRO_PRICE);
  const removeAdsLabel = t.pro.buyRemoveAds.replace(
    '{price}',
    removeAdsPrice ?? FALLBACK_REMOVE_ADS_PRICE,
  );
  const goldInk = inkOn(theme.gold, theme);

  // A product the store does not know about is a configuration problem, not
  // a payment failure, and saying so plainly beats a generic retry prompt.
  function messageFor(e: any): string {
    return e?.code === PRODUCT_UNAVAILABLE ? t.pro.unavailable : t.pro.storeError;
  }

  // The sheet stays on screen while StoreKit works, so it owns the pending
  // state. Success also arrives through the global purchase listener, which
  // covers the case where the user closes the sheet mid-purchase.
  async function handleBuyPro() {
    if (pending) return;
    resetRestore();
    setBuying('pro');
    try {
      const owned = await buyProduct(PRO_PRODUCT_ID);
      if (owned) {
        setProUnlocked(true);
        setSuccess('thanks');
      }
    } catch (e: any) {
      Alert.alert(t.pro.errorTitle, messageFor(e));
    } finally {
      setBuying(null);
    }
  }

  async function handleBuyRemoveAds() {
    if (pending) return;
    resetRestore();
    setBuying('ads');
    try {
      const owned = await buyProduct(REMOVE_ADS_PRODUCT_ID);
      if (owned) {
        setAdsRemoved(true);
        setSuccess('thanksNoAds');
      }
    } catch (e: any) {
      Alert.alert(t.pro.errorTitle, messageFor(e));
    } finally {
      setBuying(null);
    }
  }

  if (!visible) return null;

  const successText =
    success === 'thanks'
      ? t.pro.thanks
      : success === 'thanksNoAds'
        ? t.pro.thanksNoAds
        : restoreStatus === 'restored'
          ? t.pro.restored
          : null;

  return (
    <Animated.View
      style={[styles.backdrop, { opacity }]}
      accessibilityViewIsModal
      onAccessibilityEscape={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />
      <View style={styles.card}>
        <Text ref={titleRef} style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={FONT_CAP.overlay}>
          {t.pro.title}
        </Text>
        <Text style={styles.blurb} maxFontSizeMultiplier={FONT_CAP.overlay}>
          {t.pro.blurb}
        </Text>
        {themeId && !successText ? (
          <Text style={styles.context} maxFontSizeMultiplier={FONT_CAP.overlay}>
            {t.pro.themeContext(t.settings.themeNames[themeId])}
          </Text>
        ) : null}

        {successText ? (
          <>
            <Text style={styles.success} maxFontSizeMultiplier={FONT_CAP.overlay}>
              {successText}
            </Text>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.pro.close}
              style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={[styles.buyText, { color: goldInk }]} maxFontSizeMultiplier={FONT_CAP.overlay}>
                {t.pro.close}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={handleBuyPro}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel={proLabel}
              style={({ pressed }) => [
                styles.buyBtn,
                pressed && { opacity: 0.85 },
                pending && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.buyText, { color: goldInk }]} maxFontSizeMultiplier={FONT_CAP.overlay}>
                {buying === 'pro' ? t.pro.buying : proLabel}
              </Text>
            </Pressable>
            <Text style={styles.includes} maxFontSizeMultiplier={FONT_CAP.overlay}>
              {offerRemoveAds ? t.pro.proIncludes : t.pro.proIncludesAdsOff}
            </Text>

            {offerRemoveAds ? (
              <Pressable
                onPress={handleBuyRemoveAds}
                disabled={pending}
                accessibilityRole="button"
                accessibilityLabel={removeAdsLabel}
                style={({ pressed }) => [
                  styles.altBtn,
                  pressed && { opacity: 0.85 },
                  pending && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.altText} maxFontSizeMultiplier={FONT_CAP.overlay}>
                  {buying === 'ads' ? t.pro.buying : removeAdsLabel}
                </Text>
              </Pressable>
            ) : null}

            {restoreStatus === 'notFound' ? (
              <Text style={styles.notFound} maxFontSizeMultiplier={FONT_CAP.overlay}>
                {t.pro.notFound}
              </Text>
            ) : null}

            <Pressable
              onPress={() => {
                if (!pending) restore();
              }}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel={t.pro.restore}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.linkText} maxFontSizeMultiplier={FONT_CAP.overlay}>
                {restoreStatus === 'pending' ? t.pro.buying : t.pro.restore}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.pro.close}
              style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.linkText} maxFontSizeMultiplier={FONT_CAP.overlay}>
                {t.pro.close}
              </Text>
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
    context: {
      color: theme.textDim,
      fontSize: 14,
      lineHeight: 20,
      marginTop: spacing.sm,
    },
    buyBtn: {
      marginTop: spacing.xl,
      paddingVertical: 14,
      borderRadius: radii.md,
      alignItems: 'center',
      backgroundColor: theme.gold,
    },
    buyText: {
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
      marginTop: spacing.xs,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    linkText: {
      color: theme.textDim,
      fontWeight: '700',
      fontSize: 14,
    },
  });
