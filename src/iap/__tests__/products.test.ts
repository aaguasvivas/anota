import {
  ALL_PRODUCT_IDS,
  asProductId,
  PRO_PRODUCT_ID,
  REMOVE_ADS_PRODUCT_ID,
} from '../products';

describe('product catalog', () => {
  it('maps known ids and rejects everything else', () => {
    expect(asProductId(PRO_PRODUCT_ID)).toBe(PRO_PRODUCT_ID);
    expect(asProductId(REMOVE_ADS_PRODUCT_ID)).toBe(REMOVE_ADS_PRODUCT_ID);
    expect(asProductId('dev.anota.unknown')).toBeNull();
    expect(asProductId(undefined)).toBeNull();
    expect(asProductId(42)).toBeNull();
  });

  it('lists both products exactly once', () => {
    expect(ALL_PRODUCT_IDS).toEqual([PRO_PRODUCT_ID, REMOVE_ADS_PRODUCT_ID]);
    expect(new Set(ALL_PRODUCT_IDS).size).toBe(2);
  });
});
