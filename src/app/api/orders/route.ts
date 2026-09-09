import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SL_PROVINCES } from '@/lib/constants';
import { enforce } from '@/lib/rate-limit';
import {
  normaliseLines,
  priceOrder,
  type PricedProduct,
  type QuantityRule,
} from '@/lib/order-pricing';

/**
 * Order creation.
 *
 * The request says which products and how many. Everything else — unit prices, discounts,
 * shipping, the order total — is computed here from the database by src/lib/order-pricing.ts.
 * The client's own figures are read only to check them against ours, and a mismatch is
 * refused rather than quietly corrected: if the shopper was shown a different number to
 * the one we would charge, the honest thing is to send them back to the cart, not to bill
 * them a surprise.
 *
 * Stock is reserved through the `create_order` RPC (database/harden-security.sql), which
 * decrements and inserts inside one transaction. Doing it here in two steps would let two
 * shoppers pass the same stock check a millisecond apart and both succeed.
 */

/** How far the client's total may differ from ours before we refuse. One cent of float drift. */
const TOTAL_TOLERANCE = 0.01;

interface ShippingAddressInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

const MAX_FIELD = 200;

function text(value: unknown, max = MAX_FIELD): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

/** Sri Lankan mobile and landline numbers, with or without +94 / leading 0. */
function looksLikePhone(value: string): boolean {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateAddress(raw: unknown):
  | { ok: true; address: ShippingAddressInput }
  | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Shipping address is required.' };
  }

  const input = raw as Record<string, unknown>;
  const address: ShippingAddressInput = {
    firstName: text(input.firstName, 80),
    lastName: text(input.lastName, 80),
    email: text(input.email, 160).toLowerCase(),
    phone: text(input.phone, 30),
    address: text(input.address, 400),
    city: text(input.city, 100),
    province: text(input.province, 100),
    postalCode: text(input.postalCode, 20),
  };

  const missing = (Object.keys(address) as (keyof ShippingAddressInput)[]).filter(k => !address[k]);
  if (missing.length > 0) {
    return { ok: false, error: 'Please fill in every shipping field.' };
  }

  if (!looksLikeEmail(address.email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!looksLikePhone(address.phone)) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }
  // The province decides the shipping rate, so it has to be one we actually price.
  if (!(SL_PROVINCES as readonly string[]).includes(address.province)) {
    return { ok: false, error: 'Please choose a valid province.' };
  }

  return { ok: true, address };
}

export async function POST(request: NextRequest) {
  try {
    // Placing an order is cheap for us but writing rows is not free on the hobby tier,
    // and a signed-in script could otherwise fill the orders table unattended.
    const limited = enforce(request, 'orders-create', 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();

    // getUser(), not getSession(): this validates the JWT with the auth server rather
    // than trusting a cookie the browser handed us.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to place an order.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { items, shippingAddress, totalAmount: clientTotal } = body as {
      items?: unknown;
      shippingAddress?: unknown;
      totalAmount?: unknown;
    };

    const lineResult = normaliseLines(items);
    if (!lineResult.ok) {
      return NextResponse.json({ error: lineResult.error }, { status: lineResult.status });
    }

    const addressResult = validateAddress(shippingAddress);
    if (!addressResult.ok) {
      return NextResponse.json({ error: addressResult.error }, { status: 400 });
    }
    const address = addressResult.address;

    // --- Authoritative data: prices and rules the shopper cannot write ---
    const productIds = lineResult.lines.map(l => l.productId);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, category, stock, status, discount_eligible, members_only')
      .in('id', productIds);

    if (productsError) {
      console.error('[ORDERS] Product lookup failed:', productsError);
      return NextResponse.json({ error: 'Could not price your order. Please try again.' }, { status: 500 });
    }

    const { data: rules, error: rulesError } = await supabase
      .from('quantity_discounts')
      .select('id, category, min_quantity, discount_percentage, discount_fixed')
      .eq('is_active', true);

    if (rulesError) {
      // A discount rule we cannot read must not silently become "no discount" — the
      // shopper was quoted one in the cart, and charging more than the quote is worse
      // than failing loudly.
      console.error('[ORDERS] Discount lookup failed:', rulesError);
      return NextResponse.json({ error: 'Could not price your order. Please try again.' }, { status: 500 });
    }

    const pricing = priceOrder({
      lines: lineResult.lines,
      products: (products ?? []) as PricedProduct[],
      quantityRules: (rules ?? []) as QuantityRule[],
      province: address.province,
      city: address.city,
      isMember: true, // a signed-in buyer; the 401 above guarantees it
    });

    if (!pricing.ok) {
      return NextResponse.json({ error: pricing.error }, { status: pricing.status });
    }

    const { order: quote } = pricing;

    // The cart showed the shopper a number. If ours differs, something is out of date
    // (a price changed, a rule expired) or the payload was edited. Either way, refuse —
    // never silently charge a total the shopper has not seen.
    if (typeof clientTotal === 'number' && Number.isFinite(clientTotal)) {
      if (Math.abs(clientTotal - quote.total) > TOTAL_TOLERANCE) {
        console.warn(
          `[ORDERS] Total mismatch for user ${user.id}: client sent ${clientTotal}, server computed ${quote.total}`,
        );
        return NextResponse.json(
          {
            error: 'Prices have changed since you added these items. Please review your cart and try again.',
            expectedTotal: quote.total,
          },
          { status: 409 },
        );
      }
    }

    // --- Write the order and reserve stock in one transaction ---
    const { data: created, error: rpcError } = await supabase.rpc('create_order', {
      p_total_amount: quote.total,
      p_shipping_cost: quote.shippingCost,
      p_shipping_address: JSON.stringify(address),
      p_city: address.city,
      p_province: address.province,
      p_postal_code: address.postalCode,
      p_phone: address.phone,
      p_items: quote.lines.map(line => ({
        product_id: line.productId,
        quantity: line.quantity,
        price_at_time: line.unitPrice,
      })),
    });

    if (rpcError) {
      // The RPC raises a named exception when stock ran out between our check and the
      // write — someone else's order landed first. That is a 409, not a server fault.
      const message = rpcError.message || '';
      if (message.includes('INSUFFICIENT_STOCK')) {
        return NextResponse.json(
          { error: 'One of your items just sold out. Please review your cart and try again.' },
          { status: 409 },
        );
      }
      console.error('[ORDERS] create_order failed:', rpcError);
      return NextResponse.json({ error: 'Failed to create your order. Please try again.' }, { status: 500 });
    }

    const orderId = created?.order_id ?? created;

    return NextResponse.json({
      message: 'Order created successfully',
      orderId,
      // The figures the customer is owed an explanation of. Deliberately explicit —
      // the confirmation screen should show what was actually charged, not re-derive it.
      total: quote.total,
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      shippingCost: quote.shippingCost,
      appliedDiscounts: quote.appliedDiscounts,
    });
  } catch (error: unknown) {
    console.error('[ORDERS] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
