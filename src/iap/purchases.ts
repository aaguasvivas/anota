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

// Last raw store error seen, for diagnostics only. Never shown verbatim.
let lastStoreError = '';
export function getLastStoreError(): string {
  return lastStoreError;
}

// Thrown when the store has no record of a product we asked to buy. This is a
// configuration problem (App Store Connect), not a payment failure, and it
// deserves its own message instead of a generic "purchase failed".
export const PRODUCT_UNAVAILABLE = 'product-unavailable';

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
    // Register listeners BEFORE connecting. They do not need an open
    // connection, and if initConnection is slow or times out we must not be
    // left with zero listeners: a purchase would then be unable to either
    // succeed or report failure.
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
      const code = String(error?.code ?? '');
      const message = String(error?.message ?? '');
      lastStoreError = code ? `${code}: ${message}` : message;
      // This native event carries EVERY store error, not just purchase ones:
      // catalog lookups ("query-product"), unavailable store, and so on. Only
      // an error while a purchase is actually in flight belongs in front of
      // the user; anything else used to pop a bogus "purchase failed" alert
      // (which is what App Review saw).
      if (!pendingBuy) return;
      // Any error, including user cancellation, ends the in-flight buy.
      settleBuy(null, false);
      const cancelled = /cancel/i.test(code) || /cancel/i.test(message);
      if (!cancelled) {
        onPurchaseError?.(lastStoreError || 'Purchase failed');
      }
    });
    await ensureConnected();
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
  // Confirm the store actually knows this product before trying to buy it.
  // If it does not (missing or incomplete App Store Connect configuration,
  // or the product has not propagated yet), requestPurchase fails with an
  // opaque "Unable to Complete Request"; surfacing that as a payment error
  // sent us chasing the wrong bug for two review cycles.
  let known = false;
  try {
    const products = await withTimeout(
      Promise.resolve(fetchProducts({ skus: [sku], type: 'in-app' })),
      10000,
      'fetchProducts',
    );
    known = (products ?? []).some(
      (p: any) => p?.id === sku || p?.productId === sku,
    );
  } catch {
    // Lookup failed outright (offline, store down). Fall through and let the
    // purchase attempt decide rather than blocking a possibly-fine buy.
    known = true;
  }
  if (!known) {
    const err: any = new Error(PRODUCT_UNAVAILABLE);
    err.code = PRODUCT_UNAVAILABLE;
    throw err;
  }

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
