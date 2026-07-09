// Native in-app purchase wrapper for the single "Anota Pro" unlock, built on
// expo-iap (the Expo-supported library). No third-party purchase server:
// ownership is read back from the store, keeping the privacy story intact.
//
// The purchase RESULT is delivered through the event listeners, not the return
// value of requestPurchase. buyPro fires the purchase and settles when a
// listener reports success or failure. Every store call has a timeout so a
// wedged connection can never freeze the app.
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'expo-iap';

export const PRO_PRODUCT_ID = 'dev.anota.pro';

let updateSub: { remove: () => void } | null = null;
let errorSub: { remove: () => void } | null = null;
let connected = false;

// When a purchase is in flight, the listeners settle this resolver.
let pendingBuy: ((owned: boolean) => void) | null = null;
function settleBuy(owned: boolean) {
  const cb = pendingBuy;
  pendingBuy = null;
  cb?.(owned);
}

function isProId(value: unknown): boolean {
  return value === PRO_PRODUCT_ID;
}

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
    updateSub = purchaseUpdatedListener(async (purchase: any) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        // Non-fatal; ownership is still confirmed below.
      }
      if (isProId(purchase?.productId) || isProId(purchase?.id)) {
        settleBuy(true);
      }
    });
    errorSub = purchaseErrorListener(() => {
      // Any error, including user cancellation, ends the in-flight buy.
      settleBuy(false);
    });
  } catch {
    // Store unavailable; the app stays fully usable for free.
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
    return (products?.[0] as any)?.displayPrice ?? null;
  } catch {
    return null;
  }
}

export async function restorePro(): Promise<boolean> {
  try {
    await ensureConnected();
    const purchases = await withTimeout(
      Promise.resolve(getAvailablePurchases()),
      10000,
      'getAvailablePurchases',
    );
    return (purchases ?? []).some(
      (p: any) => isProId(p?.productId) || isProId(p?.id),
    );
  } catch {
    return false;
  }
}

export async function buyPro(): Promise<boolean> {
  await ensureConnected();
  // Load the product first; some stores require it before a purchase.
  await withTimeout(
    Promise.resolve(fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' })),
    10000,
    'fetchProducts',
  );

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      pendingBuy = null;
      resolve(false);
    }, 120000);
    pendingBuy = (owned: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(owned);
    };
    // Fire the purchase; the result arrives via the listeners in initIap.
    Promise.resolve(
      requestPurchase({
        request: {
          apple: { sku: PRO_PRODUCT_ID },
          google: { skus: [PRO_PRODUCT_ID] },
        },
        type: 'in-app',
      }),
    ).catch(() => settleBuy(false));
  });
}
