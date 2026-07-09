// Native in-app purchase wrapper for the single "Anota Pro" unlock.
// All react-native-iap (v15, Nitro) specifics live here so the rest of the app
// stays simple. There is no third-party purchase server: ownership is read back
// from the store itself, which keeps the privacy story intact.
//
// Every store call is wrapped in a timeout so a wedged native connection can
// never freeze the app; it fails cleanly with a readable reason instead.
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

// Bump this when publishing a diagnostic OTA so we can confirm on-device that
// the update actually applied.
export const IAP_DIAG = 'd2';

let updateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let errorSub: ReturnType<typeof purchaseErrorListener> | null = null;
let connected = false;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`TIMEOUT: ${label} (${ms}ms)`)), ms);
    }),
  ]);
}

async function ensureConnected(): Promise<void> {
  if (connected) return;
  await withTimeout(Promise.resolve(initConnection()), 10000, 'initConnection');
  connected = true;
}

export async function initIap(): Promise<void> {
  try {
    await ensureConnected();
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
    connected = false;
    await endConnection();
  } catch {
    // ignore
  }
}

export async function getProPriceLabel(): Promise<string | null> {
  try {
    await ensureConnected();
    const products = await withTimeout(
      Promise.resolve(fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' })),
      10000,
      'fetchProducts',
    );
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
    await ensureConnected();
    const purchases = await withTimeout(
      Promise.resolve(getAvailablePurchases()),
      10000,
      'getAvailablePurchases',
    );
    return ownsPro(purchases ?? []);
  } catch {
    return false;
  }
}

export async function buyPro(): Promise<boolean> {
  // Make sure the store connection is live before anything else.
  await ensureConnected();

  // v15 requires the product to be loaded before a purchase can be presented.
  const products = await withTimeout(
    Promise.resolve(fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' })),
    10000,
    'fetchProducts',
  );
  if (!products || products.length === 0) {
    throw new Error('No product returned for dev.anota.pro (StoreKit empty)');
  }

  await withTimeout(
    Promise.resolve(
      requestPurchase({
        request: {
          apple: { sku: PRO_PRODUCT_ID },
          ios: { sku: PRO_PRODUCT_ID },
          android: { skus: [PRO_PRODUCT_ID] },
          google: { skus: [PRO_PRODUCT_ID] },
        },
        type: 'in-app',
      }),
    ),
    120000,
    'requestPurchase',
  );

  // Ownership from the store is the source of truth; confirm rather than trust
  // the request return shape.
  return restorePro();
}
