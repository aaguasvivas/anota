import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing } from '../constants/layout';
import { useT } from '../i18n';
import { buyPro, getProPriceLabel, IAP_DIAG, restorePro } from '../iap/purchases';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/makeStyles';
import { Theme } from '../theme/themes';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const FALLBACK_PRICE = '$2.99';

export function ProSheet({ visible, onClose }: Props) {
  const { t } = useT();
  const styles = useThemedStyles(makeStyles);
  const { setProUnlocked } = useThemeControls();
  const [price, setPrice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState<'thanks' | 'restored' | null>(null);

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
      const code = e?.code ?? '';
      if (code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase could not start', `${code ? code + ': ' : ''}${e?.message ?? String(e)}`);
      }
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
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
                <Text style={styles.buyText}>{pending ? t.pro.buying : buyLabel}</Text>
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
          <Text style={styles.diag}>build {IAP_DIAG}</Text>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
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
    diag: {
      color: theme.textFaint,
      fontSize: 10,
      textAlign: 'center',
      marginTop: spacing.md,
      opacity: 0.5,
    },
  });
