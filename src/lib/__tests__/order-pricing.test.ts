import { describe, it, expect } from 'vitest';
import {
  normaliseLines,
  priceOrder,
  shippingFor,
  MAX_LINE_QUANTITY,
  MAX_ORDER_LINES,
  type PricedProduct,
  type QuantityRule,
} from '../order-pricing';
import { SHIPPING_RATES } from '../constants';

/**
 * These tests exist because this module is the only thing standing between the shop and
 * a customer who edits their own cart. Most of what follows is written from the attacker's
 * side: send a negative quantity, send the same product twice, send a product that is out
 * of stock, claim a members-only item as a guest. The happy path is the short part.
 */

const product = (over: Partial<PricedProduct> = {}): PricedProduct => ({
  id: '1',
  name: 'Test Product',
  price: 1000,
  category: 'manga',
  stock: 10,
  status: 'available',
  discount_eligible: false,
  members_only: false,
  ...over,
});

const base = {
  quantityRules: [] as QuantityRule[],
  province: 'Western',
  city: 'Colombo',
  isMember: true,
};

describe('normaliseLines', () => {
  it('rejects an empty cart', () => {
    const result = normaliseLines([]);
    expect(result.ok).toBe(false);
  });

  it('rejects a non-array', () => {
    expect(normaliseLines(null).ok).toBe(false);
    expect(normaliseLines('2 manga please').ok).toBe(false);
    expect(normaliseLines({ productId: '1', quantity: 1, size: null, color: null }).ok).toBe(false);
  });

  it('rejects quantities that are not positive whole numbers', () => {
    for (const quantity of [0, -1, -100, 1.5, NaN, Infinity, '', 'abc', null, undefined]) {
      const result = normaliseLines([{ productId: '1', quantity }]);
      expect(result.ok, `quantity ${String(quantity)} should be refused`).toBe(false);
    }
  });

  it('rejects a quantity above the per-line cap', () => {
    expect(normaliseLines([{ productId: '1', quantity: MAX_LINE_QUANTITY + 1, size: null, color: null }]).ok).toBe(false);
  });

  it('rejects more distinct products than the cap allows', () => {
    const lines = Array.from({ length: MAX_ORDER_LINES + 1 }, (_, i) => ({
      productId: String(i),
      quantity: 1,
    }));
    expect(normaliseLines(lines).ok).toBe(false);
  });

  it('merges duplicate product ids into one line', () => {
    // Splitting a line was a way to stay under a stock check and to dodge the "3 or
    // more" threshold from the other direction. Both need the merged view.
    const result = normaliseLines([
      { productId: '1', quantity: 2, size: null, color: null },
      { productId: '1', quantity: 3, size: null, color: null },
      { productId: '2', quantity: 1, size: null, color: null },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines).toEqual([
      { productId: '1', quantity: 5, size: null, color: null },
      { productId: '2', quantity: 1, size: null, color: null },
    ]);
  });

  it('applies the per-line cap to the merged total, not each entry', () => {
    const half = Math.ceil(MAX_LINE_QUANTITY / 2) + 1;
    const result = normaliseLines([
      { productId: '1', quantity: half, size: null, color: null },
      { productId: '1', quantity: half, size: null, color: null },
    ]);
    expect(result.ok).toBe(false);
  });

  it('keeps different variants of the same product as separate lines', () => {
    // The bug this guards: merging on productId alone collapsed a medium and a large
    // into one line of quantity 2, throwing the size away entirely.
    const result = normaliseLines([
      { productId: '1', quantity: 1, size: 'M' },
      { productId: '1', quantity: 1, size: 'L' },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines).toHaveLength(2);
    expect(result.lines.map(l => l.size).sort()).toEqual(['L', 'M']);
  });

  it('merges only when product AND variant both match', () => {
    const result = normaliseLines([
      { productId: '1', quantity: 1, size: 'M' },
      { productId: '1', quantity: 2, size: 'M' },
      { productId: '1', quantity: 1, size: 'L' },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines).toHaveLength(2);
    expect(result.lines.find(l => l.size === 'M')?.quantity).toBe(3);
    expect(result.lines.find(l => l.size === 'L')?.quantity).toBe(1);
  });

  it('treats a blank variant label as no variant', () => {
    const result = normaliseLines([
      { productId: '1', quantity: 1, size: '' },
      { productId: '1', quantity: 1, size: '   ' },
      { productId: '1', quantity: 1 },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // All three are the same thing, so they merge.
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].quantity).toBe(3);
    expect(result.lines[0].size).toBeNull();
  });

  it('applies the per-product cap across variants, not per line', () => {
    // 60 mediums and 60 larges is 120 of one product against one stock pool.
    const result = normaliseLines([
      { productId: '1', quantity: 60, size: 'M' },
      { productId: '1', quantity: 60, size: 'L' },
    ]);
    expect(result.ok).toBe(false);
  });

  it('accepts numeric product ids, since the products table uses integers', () => {
    const result = normaliseLines([{ productId: 42, quantity: 1, size: null, color: null }]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines[0].productId).toBe('42');
  });
});

describe('priceOrder — prices come from the database, never the request', () => {
  it('prices a line from products.price', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 2, size: null, color: null }],
      products: [product({ price: 2500 })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.lines[0].unitPrice).toBe(2500);
    expect(result.order.lines[0].lineTotal).toBe(5000);
    expect(result.order.subtotal).toBe(5000);
  });

  it('refuses a product id that is not in the catalogue', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '999', quantity: 1, size: null, color: null }],
      products: [product({ id: '1' })],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
  });

  it('refuses to sell more than the stock on hand', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 11, size: null, color: null }],
      products: [product({ stock: 10 })],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
    expect(result.error).toContain('10');
  });

  it('pools stock across variants of the same product', () => {
    // 3 mediums and 3 larges each fit under a stock of 4 on their own; together they
    // do not. Checking per line would have oversold by two.
    const result = priceOrder({
      ...base,
      lines: [
        { productId: '1', quantity: 3, size: 'M', color: null },
        { productId: '1', quantity: 3, size: 'L', color: null },
      ],
      products: [product({ stock: 4, category: 'tshirts' })],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(409);
  });

  it('carries the variant through to the priced line', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 1, size: 'XL', color: 'Black' }],
      products: [product({ category: 'tshirts' })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.lines[0].size).toBe('XL');
    expect(result.order.lines[0].color).toBe('Black');
  });

  it('sells exactly the last unit', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 10, size: null, color: null }],
      products: [product({ stock: 10 })],
    });
    expect(result.ok).toBe(true);
  });

  it('refuses a listing that is not yet on sale', () => {
    for (const status of ['coming_soon', 'pre_order', 'out_of_stock']) {
      const result = priceOrder({
        ...base,
        lines: [{ productId: '1', quantity: 1, size: null, color: null }],
        products: [product({ status })],
      });
      expect(result.ok, `status ${status} should not be sellable`).toBe(false);
    }
  });

  it('refuses a members-only listing for a guest', () => {
    const result = priceOrder({
      ...base,
      isMember: false,
      lines: [{ productId: '1', quantity: 1, size: null, color: null }],
      products: [product({ members_only: true })],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);
  });

  it('allows a members-only listing for a signed-in buyer', () => {
    const result = priceOrder({
      ...base,
      isMember: true,
      lines: [{ productId: '1', quantity: 1, size: null, color: null }],
      products: [product({ members_only: true })],
    });
    expect(result.ok).toBe(true);
  });
});

describe('priceOrder — discounts', () => {
  const rule = (over: Partial<QuantityRule> = {}): QuantityRule => ({
    id: 'r1',
    category: 'manga',
    min_quantity: 3,
    discount_percentage: 10,
    discount_fixed: null,
    ...over,
  });

  it('applies a percentage rule once the category threshold is met', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 3, size: null, color: null }],
      products: [product({ price: 1000 })],
      quantityRules: [rule()],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotal).toBe(3000);
    expect(result.order.discountTotal).toBe(300);
  });

  it('does not apply a rule below its threshold', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 2, size: null, color: null }],
      products: [product({ price: 1000 })],
      quantityRules: [rule()],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.discountTotal).toBe(0);
  });

  it('picks the highest threshold the basket qualifies for', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 10, size: null, color: null }],
      products: [product({ price: 1000 })],
      quantityRules: [
        rule({ id: 'small', min_quantity: 3, discount_percentage: 5 }),
        rule({ id: 'big', min_quantity: 10, discount_percentage: 20 }),
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.discountTotal).toBe(2000);
    expect(result.order.appliedDiscounts[0].discountId).toBe('big');
  });

  it('caps a fixed discount at the value of its category', () => {
    // A Rs 5,000-off rule on a Rs 1,000 basket must not hand back Rs 4,000.
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 1, size: null, color: null }],
      products: [product({ price: 1000 })],
      quantityRules: [rule({ min_quantity: 1, discount_percentage: null, discount_fixed: 5000 })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.discountTotal).toBe(1000);
    expect(result.order.total).toBeGreaterThanOrEqual(0);
  });

  it('never lets stacked discounts exceed the subtotal', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 3, size: null, color: null }],
      products: [product({ price: 1000, discount_eligible: true })],
      quantityRules: [rule({ min_quantity: 1, discount_percentage: 100 })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.discountTotal).toBeLessThanOrEqual(result.order.subtotal);
    expect(result.order.total).toBeGreaterThanOrEqual(0);
  });

  it('applies the 3-or-more bundle across different eligible products', () => {
    const result = priceOrder({
      ...base,
      lines: [
        { productId: '1', quantity: 2, size: null, color: null },
        { productId: '2', quantity: 1, size: null, color: null },
      ],
      products: [
        product({ id: '1', price: 1000, discount_eligible: true }),
        product({ id: '2', price: 2000, discount_eligible: true, category: 'figures' }),
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 3 eligible units, Rs 4,000 of eligible value, 10% off.
    expect(result.order.discountTotal).toBe(400);
  });

  it('excludes ineligible items from the bundle discount', () => {
    const result = priceOrder({
      ...base,
      lines: [
        { productId: '1', quantity: 3, size: null, color: null },
        { productId: '2', quantity: 1, size: null, color: null },
      ],
      products: [
        product({ id: '1', price: 1000, discount_eligible: true }),
        product({ id: '2', price: 9000, discount_eligible: false, category: 'figures' }),
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // 10% of the eligible Rs 3,000 only — the Rs 9,000 item is charged in full.
    expect(result.order.discountTotal).toBe(300);
  });
});

describe('shippingFor', () => {
  it('is free above the threshold regardless of destination', () => {
    expect(shippingFor(SHIPPING_RATES.FREE_SHIPPING_THRESHOLD, 'Uva', 'Badulla')).toBe(0);
  });

  it('charges the Colombo rate for Colombo addresses', () => {
    expect(shippingFor(1000, 'Western', 'Colombo 07')).toBe(SHIPPING_RATES.COLOMBO);
    expect(shippingFor(1000, 'Western', 'colombo')).toBe(SHIPPING_RATES.COLOMBO);
  });

  it('charges the Western rate elsewhere in the Western Province', () => {
    expect(shippingFor(1000, 'Western', 'Negombo')).toBe(SHIPPING_RATES.WESTERN_PROVINCE);
  });

  it('charges the standard rate for other provinces', () => {
    expect(shippingFor(1000, 'Central', 'Kandy')).toBe(SHIPPING_RATES.OTHER_PROVINCES);
  });

  it('is included in the order total', () => {
    const result = priceOrder({
      ...base,
      province: 'Central',
      city: 'Kandy',
      lines: [{ productId: '1', quantity: 1, size: null, color: null }],
      products: [product({ price: 1000 })],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.shippingCost).toBe(SHIPPING_RATES.OTHER_PROVINCES);
    expect(result.order.total).toBe(1000 + SHIPPING_RATES.OTHER_PROVINCES);
  });
});

describe('priceOrder — money is rounded to two decimal places', () => {
  it('does not leak floating point noise into a total', () => {
    const result = priceOrder({
      ...base,
      lines: [{ productId: '1', quantity: 3, size: null, color: null }],
      products: [product({ price: 1010.1 })],
      quantityRules: [
        { id: 'r', category: 'manga', min_quantity: 3, discount_percentage: 7, discount_fixed: null },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const value of [result.order.subtotal, result.order.discountTotal, result.order.total]) {
      expect(value, `${value} should have at most 2 decimal places`)
        .toBe(Math.round(value * 100) / 100);
    }
  });
});
