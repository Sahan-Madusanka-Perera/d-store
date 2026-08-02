-- Bundle-discount eligibility + compare-at pricing
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor).

-- 1. Per-product opt-in to the "buy 3 or more eligible items, get 10% off" rule.
--    Existing products stay out of it, so turning this on is always a deliberate act.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_eligible BOOLEAN NOT NULL DEFAULT false;

-- 2. Reference price shown struck through above the real one (Shopify calls this
--    compare_at_price). NULL means "show nothing" — the storefront only renders it
--    when it is set AND higher than price, so a stale or mistaken value degrades to
--    simply not appearing rather than to a nonsensical "was Rs.100, now Rs.9500".
--
--    A note for whoever fills this in: this should be a genuine reference — the RRP,
--    or a price this item actually sold at. A "was" price that never existed is
--    misleading pricing under the Consumer Affairs Authority Act.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL;

-- Guard the obvious data-entry slip. A compare-at at or below the real price would
-- render as a discount that isn't one.
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_compare_at_price_above_price;
ALTER TABLE public.products
  ADD CONSTRAINT products_compare_at_price_above_price
  CHECK (compare_at_price IS NULL OR compare_at_price > price);

-- The cart totals eligible units across the whole basket, so this is read for every
-- eligible line rather than filtered on; a partial index keeps that cheap.
CREATE INDEX IF NOT EXISTS products_discount_eligible_idx
  ON public.products (id)
  WHERE discount_eligible = true;
