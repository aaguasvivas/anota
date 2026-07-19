// Native in-app purchase wrapper for Anota's one-time unlocks ("Anota Pro"
// and "Remove Ads"), built on expo-iap (the Expo-supported library). No
// third-party purchase server: ownership is read back from the store, keeping
// the privacy story intact.
//
// The purchase RESULT is delivered through the event listeners, not the return
// value of requestPurchase. buyProduct fires the purchase and settles when a
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

import { ALL_PRODUCT_IDS, asProductId, type ProductId } from './products';

export {
  PRO_PRODUCT_ID,
  REMOVE_ADS_PRODUCT_ID,
  type ProductId,
} from './products';

let updateSub: { remove: () => void } | null = null;
let errorSub: { remove: () => void } | null = null;
let connected = false;

// When a purchase is in flight, the listeners settle this resolver. Only the
// product being bought settles it; ownership of anything else that arrives
// (say, a restore racing in) still reaches the app through onOwned.
let pendingBuy: { sku: ProductId; settle: (owned: boolean) => void } | null =
  null;
function settleBuy(sku: ProductId | null, owned: boolean) {
  if (!pendingBuy) return;
  if (sku !== null && pendingBuy.sku !== sku) return;
  const { settle } = pendingBuy;
  pendingBuy = null;
  settle(owned);
}

// App-level hooks so a purchase result reaches entitlement state and the user
// even when the paywall sheet has been dismissed to let StoreKit present.
let onOwned: ((id: ProductId) => void) | null = null;
let onPurchaseError: ((message: string) => void) | null = null;
export function setPurchaseCallbacks(
  owned: ((id: ProductId) => void) | null,
  error: ((message: string) => void) | null,
): void {
  onOwned = owned;
  onPurchaseError = error;
}

function purchasedId(purchase: any): ProductId | null {
  return asProductId(purchase?.productId) ?? asProductId(purchase?.id);
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
      const id = purchasedId(purchase);
      if (id) {
        settleBuy(id, true);
        onOwned?.(id);
      }
    });
    errorSub = purchaseErrorListener((error: any) => {
      // Any error, including user cancellation, ends the in-flight buy.
      settleBuy(null, false);
      const code = String(error?.code ?? '');
      const message = String(error?.message ?? '');
      const cancelled = /cancel/i.test(code) || /cancel/i.test(message);
      if (!cancelled) {
        onPurchaseError?.(
          code ? `${code}: ${message}` : message || 'Purchase failed',
        );
      }
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

export async function getPriceLabels(): Promise<
  Partial<Record<ProductId, string>>
> {
  try {
    await ensureConnected();
    const products = await withTimeout(
      Promise.resolve(fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'in-app' })),
      10000,
      'fetchProducts',
    );
    const labels: Partial<Record<ProductId, string>> = {};
    for (const p of products ?? []) {
      const id = asProductId((p as any)?.id) ?? asProductId((p as any)?.productId);
      const price = (p as any)?.displayPrice;
      if (id && typeof price === 'string') labels[id] = price;
    }
    return labels;
  } catch {
    return {};
  }
}

export async function restoreOwned(): Promise<ProductId[]> {
  try {
    await ensureConnected();
    const purchases = await withTimeout(
      Promise.resolve(getAvailablePurchases()),
      10000,
      'getAvailablePurchases',
    );
    const owned = new Set<ProductId>();
    for (const p of purchases ?? []) {
      const id = purchasedId(p);
      if (id) owned.add(id);
    }
    return [...owned];
  } catch {
    return [];
  }
}

export async function buyProduct(sku: ProductId): Promise<boolean> {
  await ensureConnected();
  // Load the product first; some stores require it before a purchase.
  await withTimeout(
    Promise.resolve(fetchProducts({ skus: [sku], type: 'in-app' })),
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
    pendingBuy = {
      sku,
      settle: (owned: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(owned);
      },
    };
    // Fire the purchase; the result arrives via the listeners in initIap.
    Promise.resolve(
      requestPurchase({
        request: {
          apple: { sku },
          google: { skus: [sku] },
        },
        type: 'in-app',
      }),
    ).catch(() => settleBuy(sku, false));
  });
}
