/**
 * Authoritative order pricing — the server's own arithmetic, not the browser's.
 *
 * The cart in src/store/cart.ts computes a total so the shopper can see one before they
 * commit. That number is a *display*, and it is computed in a place the shopper controls:
 * anyone can edit `d-store-cart` in localStorage, or POST straight to /api/orders with
 * whatever figures they like. Until this module existed the order row recorded exactly
 * what arrived in the request body, so a Rs 45,000 basket could be filed as an order for
 * Rs 1 — and with bank transfer as the payment method, nothing downstream would notice:
 * the slip would match the (tampered) total and the order would look settled.
 *
 * So every figure that ends up on an order is recomputed here from rows the shopper
 * cannot write: `products.price` for the unit price, `quantity_discounts` for category
 * rules, the constants in src/lib/constants.ts for shipping. The only things taken from
 * the request are *which* product and *how many* — and both are validated below.
 *
 * The rules mirror src/store/cart.ts and src/lib/bundle-discount.ts deliberately, so the
 * price quoted in the cart is the price charged. If you change a rule in one place,
 * change it in the other, and add a case to src/lib/__tests__/order-pricing.test.ts.
 */

import { SHIPPING_RATES } from '@/lib/constants';
import { BUNDLE_DISCOUNT_ID, BUNDLE_DISCOUNT_LABEL, bundleDiscountFor } from '@/lib/bundle-discount';

/** No single line may exceed this. A basket asking for 10,000 of one figure is a mistake or an attack. */
export const MAX_LINE_QUANTITY = 100;

/** Distinct products in one order. Guards the `in` query and the request body size. */
export const MAX_ORDER_LINES = 50;

/** What the caller asked for. Only these two fields are ever trusted. */
export interface RequestedLine {
  productId: string;
  quantity: number;
}

/** A product row as the pricing rules need it. */
export interface PricedProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: string | null;
  discount_eligible: boolean | null;
  members_only: boolean | null;
}

/** A category-quantity rule from the `quantity_discounts` table. */
export interface QuantityRule {
  id: string;
  category: string;
  min_quantity: number;
  discount_percentage: number | null;
  discount_fixed: number | null;
}

export interface PricedLine {
  productId: string;
  name: string;
  quantity: number;
  /** Straight from `products.price` — never from the request. */
  unitPrice: number;
  lineTotal: number;
}

export interface AppliedDiscount {
  discountId: string;
  description: string;
  amountOff: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotal: number;
  discountTotal: number;
  appliedDiscounts: AppliedDiscount[];
  shippingCost: number;
  total: number;
}

export type PricingFailure =
  | { ok: false; status: number; error: string };

export type PricingResult =
  | { ok: true; order: PricedOrder }
  | PricingFailure;

/** Money is stored as DECIMAL(10,2); round every derived figure to match. */
function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Validates the requested lines and collapses duplicates.
 *
 * Duplicates matter: a basket posting the same productId twice with quantity 1 each is
 * really quantity 2, and the discount thresholds have to see it that way or a shopper
 * could split a line to dodge a "3 or more" rule — or to stay under a stock check.
 */
export function normaliseLines(raw: unknown): { ok: true; lines: RequestedLine[] } | PricingFailure {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, status: 400, error: 'Your cart is empty.' };
  }
  if (raw.length > MAX_ORDER_LINES) {
    return { ok: false, status: 400, error: `An order cannot contain more than ${MAX_ORDER_LINES} different products.` };
  }

  const merged = new Map<string, number>();

  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) {
      return { ok: false, status: 400, error: 'Cart contains an invalid item.' };
    }

    const { productId, quantity } = entry as { productId?: unknown; quantity?: unknown };

    if (typeof productId !== 'string' && typeof productId !== 'number') {
      return { ok: false, status: 400, error: 'Cart contains an item with no product.' };
    }
    const id = String(productId).trim();
    if (!id) {
      return { ok: false, status: 400, error: 'Cart contains an item with no product.' };
    }

    // Number('') is 0 and Number(' 2 ') is 2, so go through Number() then demand an
    // integer: '2.5', 'abc', NaN, Infinity and negatives all fail here.
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return { ok: false, status: 400, error: 'Item quantities must be whole numbers of at least 1.' };
    }

    merged.set(id, (merged.get(id) ?? 0) + qty);
  }

  for (const [id, qty] of merged) {
    if (qty > MAX_LINE_QUANTITY) {
      return {
        ok: false,
        status: 400,
        error: `You can order at most ${MAX_LINE_QUANTITY} of any one item. Contact us for bulk orders.`,
      };
    }
    if (!id) {
      return { ok: false, status: 400, error: 'Cart contains an item with no product.' };
    }
  }

  return { ok: true, lines: [...merged].map(([productId, quantity]) => ({ productId, quantity })) };
}

/**
 * Shipping, recomputed from the address the order is actually being sent to.
 *
 * Mirrors calculateShipping() in the checkout page, including its quirk of testing the
 * free-shipping threshold against the pre-discount subtotal. Keep the two in step.
 */
export function shippingFor(subtotal: number, province: string, city: string): number {
  if (subtotal >= SHIPPING_RATES.FREE_SHIPPING_THRESHOLD) return 0;
  if (province === 'Western' && city.toLowerCase().includes('colombo')) {
    return SHIPPING_RATES.COLOMBO;
  }
  if (province === 'Western') return SHIPPING_RATES.WESTERN_PROVINCE;
  return SHIPPING_RATES.OTHER_PROVINCES;
}

/**
 * The whole calculation, given rows already fetched from the database.
 *
 * Split out from the route so it can be tested without a database — see
 * src/lib/__tests__/order-pricing.test.ts.
 */
export function priceOrder(args: {
  lines: RequestedLine[];
  products: PricedProduct[];
  quantityRules: QuantityRule[];
  province: string;
  city: string;
  /** True when the buyer is signed in. Members-only listings need it. */
  isMember: boolean;
}): PricingResult {
  const { lines, products, quantityRules, province, city, isMember } = args;

  const byId = new Map(products.map(p => [String(p.id), p]));
  const priced: PricedLine[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);

    // A product that vanished between adding to cart and checking out, or an id the
    // shopper invented. Either way there is no price for it, so there is no order.
    if (!product) {
      return { ok: false, status: 400, error: 'One of the items in your cart is no longer available. Please review your cart.' };
    }

    if (product.members_only && !isMember) {
      return { ok: false, status: 403, error: 'One of the items in your cart is available to members only.' };
    }

    // 'coming_soon' and 'pre_order' listings are displayed but not sellable yet; the
    // storefront hides the buy button, and this is the matching server-side rule.
    if (product.status && product.status !== 'available') {
      return { ok: false, status: 409, error: `"${product.name}" is not available for purchase right now.` };
    }

    if (!Number.isFinite(product.price) || product.price < 0) {
      return { ok: false, status: 409, error: `"${product.name}" is not priced correctly. Please contact us.` };
    }

    if (product.stock < line.quantity) {
      return {
        ok: false,
        status: 409,
        error: product.stock < 1
          ? `"${product.name}" has just sold out.`
          : `Only ${product.stock} of "${product.name}" left in stock.`,
      };
    }

    priced.push({
      productId: String(product.id),
      name: product.name,
      quantity: line.quantity,
      unitPrice: money(product.price),
      lineTotal: money(product.price * line.quantity),
    });
  }

  const subtotal = money(priced.reduce((sum, l) => sum + l.lineTotal, 0));

  // --- Category quantity rules, highest threshold first (matches the cart) ---
  const applied: AppliedDiscount[] = [];
  let discountTotal = 0;

  const stats = new Map<string, { quantity: number; totalValue: number }>();
  for (const line of priced) {
    const category = byId.get(line.productId)!.category;
    const current = stats.get(category) ?? { quantity: 0, totalValue: 0 };
    current.quantity += line.quantity;
    current.totalValue += line.lineTotal;
    stats.set(category, current);
  }

  const rulesByThreshold = [...quantityRules].sort((a, b) => b.min_quantity - a.min_quantity);

  for (const [category, stat] of stats) {
    const rule = rulesByThreshold.find(r => r.category === category && stat.quantity >= r.min_quantity);
    if (!rule) continue;

    let amountOff = 0;
    let description = '';

    if (rule.discount_percentage) {
      amountOff = (stat.totalValue * rule.discount_percentage) / 100;
      description = `${rule.discount_percentage}% off on ${category}`;
    } else if (rule.discount_fixed) {
      // Never let a fixed discount exceed what that category is actually worth —
      // a Rs 500-off rule on a Rs 300 basket must not create a negative line.
      amountOff = Math.min(rule.discount_fixed, stat.totalValue);
      description = `LKR ${rule.discount_fixed} off on ${category}`;
    }

    if (amountOff > 0) {
      amountOff = money(amountOff);
      discountTotal += amountOff;
      applied.push({ discountId: String(rule.id), description, amountOff });
    }
  }

  // --- The "3 or more eligible items" bundle ---
  const bundle = bundleDiscountFor(
    priced.map(line => ({
      eligible: Boolean(byId.get(line.productId)!.discount_eligible),
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    })),
  );

  if (bundle.qualifies && bundle.amountOff > 0) {
    const amountOff = money(bundle.amountOff);
    discountTotal += amountOff;
    applied.push({ discountId: BUNDLE_DISCOUNT_ID, description: BUNDLE_DISCOUNT_LABEL, amountOff });
  }

  // Belt and braces: discounts can stack, and a stacked total must still never exceed
  // the basket. Without this a category rule plus the bundle could, on the right data,
  // produce a negative total and an order that owes the customer money.
  discountTotal = money(Math.min(discountTotal, subtotal));

  const shippingCost = shippingFor(subtotal, province, city);
  const total = money(Math.max(0, subtotal - discountTotal) + shippingCost);

  return {
    ok: true,
    order: { lines: priced, subtotal, discountTotal, appliedDiscounts: applied, shippingCost, total },
  };
}
