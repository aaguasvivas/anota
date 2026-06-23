// Native in-app purchase wrapper for the single "Anota Pro" unlock.
// All react-native-iap (v15, Nitro) specifics live here so the rest of the app
// stays simple. There is no third-party purchase server: ownership is read back
// from the store itself, which keeps the privacy story intact.
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
} from 'react-native-iap';

export const PRO_PRODUCT_ID = 'dev.anota.pro';

let updateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let errorSub: ReturnType<typeof purchaseErrorListener> | null = null;

export async function initIap(): Promise<void> {
  try {
    await initConnection();
    // Always finish delivered transactions so the store queue stays clean,
    // even if the purchase arrives outside an active buy flow.
    updateSub = purchaseUpdatedListener((purchase: Purchase) => {
      finishTransaction({ purchase, isConsumable: false }).catch(() => {});
    });
    errorSub = purchaseErrorListener(() => {
      // Errors (including user cancellation) are handled at the call site.
    });
  } catch {
    // Store unavailable (no network, simulator without StoreKit, etc.).
    // The app stays fully usable for free; Pro just cannot be bought right now.
  }
}

export async function endIap(): Promise<void> {
  try {
    updateSub?.remove();
    errorSub?.remove();
    updateSub = null;
    errorSub = null;
    await endConnection();
  } catch {
    // ignore
  }
}

export async function getProPriceLabel(): Promise<string | null> {
  try {
    const products = await fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' });
    return products?.[0]?.displayPrice ?? null;
  } catch {
    return null;
  }
}

function ownsPro(purchases: Purchase[]): boolean {
  return purchases.some((p) => p.productId === PRO_PRODUCT_ID);
}

export async function restorePro(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    return ownsPro(purchases ?? []);
  } catch {
    return false;
  }
}

export async function buyPro(): Promise<boolean> {
  await requestPurchase({
    request: {
      apple: { sku: PRO_PRODUCT_ID },
      ios: { sku: PRO_PRODUCT_ID },
      android: { skus: [PRO_PRODUCT_ID] },
      google: { skus: [PRO_PRODUCT_ID] },
    },
    type: 'in-app',
  });
  // Ownership from the store is the source of truth; confirm rather than trust
  // the request return shape.
  return restorePro();
}
