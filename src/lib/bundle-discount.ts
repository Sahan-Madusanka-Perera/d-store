/**
 * The "buy 3 or more eligible items, get 10% off" rule.
 *
 * Threshold, rate and the sentence shown on the listing all live here so the promise
 * made on the product page and the arithmetic done in the cart cannot drift apart —
 * the failure mode being a listing that advertises one number while the basket
 * quietly applies another.
 *
 * Note this is evaluated in the browser, like the existing category and publisher
 * discounts (see src/store/cart.ts). The order API records whatever total the client
 * sends, so treat these figures as a shopfront promise rather than an enforced one.
 */

export const BUNDLE_DISCOUNT_MIN_ITEMS = 3;
export const BUNDLE_DISCOUNT_PERCENT = 10;

/** Copy for the product page, below the price. */
export const BUNDLE_DISCOUNT_BLURB =
  `This item is eligible for ${BUNDLE_DISCOUNT_PERCENT}% discount when buying ` +
  `${BUNDLE_DISCOUNT_MIN_ITEMS} or more eligible items`;

/** Line item shown in the cart and checkout summary once the rule fires. */
export const BUNDLE_DISCOUNT_LABEL =
  `${BUNDLE_DISCOUNT_PERCENT}% off — ${BUNDLE_DISCOUNT_MIN_ITEMS}+ eligible items`;

/** Stable id so this discount can be told apart from a database-backed one. */
export const BUNDLE_DISCOUNT_ID = 'bundle-eligible-items';

/**
 * Counts toward the threshold by units, not by lines: three copies of one eligible
 * manga is three eligible items, which is what a shopper reading the blurb expects.
 */
export function bundleDiscountFor(
  lines: { eligible: boolean; quantity: number; lineTotal: number }[],
): { qualifies: boolean; eligibleUnits: number; amountOff: number } {
  const eligible = lines.filter(line => line.eligible);
  const eligibleUnits = eligible.reduce((sum, line) => sum + line.quantity, 0);

  if (eligibleUnits < BUNDLE_DISCOUNT_MIN_ITEMS) {
    return { qualifies: false, eligibleUnits, amountOff: 0 };
  }

  // Only the eligible lines are discounted — an ineligible item in the same basket
  // helps nothing and is charged in full.
  const eligibleSubtotal = eligible.reduce((sum, line) => sum + line.lineTotal, 0);

  return {
    qualifies: true,
    eligibleUnits,
    amountOff: (eligibleSubtotal * BUNDLE_DISCOUNT_PERCENT) / 100,
  };
}
