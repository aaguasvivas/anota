// Product catalog for Anota's two one-time unlocks. Pure module (no native
// imports) so entitlement mapping stays unit-testable.

export const PRO_PRODUCT_ID = 'dev.anota.pro';
export const REMOVE_ADS_PRODUCT_ID = 'dev.anota.removeads';

export type ProductId = typeof PRO_PRODUCT_ID | typeof REMOVE_ADS_PRODUCT_ID;

export const ALL_PRODUCT_IDS: ProductId[] = [
  PRO_PRODUCT_ID,
  REMOVE_ADS_PRODUCT_ID,
];

export function asProductId(value: unknown): ProductId | null {
  return value === PRO_PRODUCT_ID || value === REMOVE_ADS_PRODUCT_ID
    ? value
    : null;
}
