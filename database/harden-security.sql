-- ============================================================================
--  D-Store — security hardening
--  Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor).
--  Take the backup Supabase offers first: this drops and replaces policies.
-- ============================================================================
--
--  Why this file exists
--  --------------------
--  Several policies written during development granted access to *any authenticated
--  user* on the assumption that the API routes would do the admin check. They do — but
--  the API is not the only way into the database. Every browser that loads the shop is
--  handed the anon key (it is a public key by design; that is what RLS is for), so a
--  signed-up customer can open a console and call PostgREST directly, skipping every
--  route handler and every requireAdmin() in the codebase.
--
--  Everything below assumes that. A policy is the only thing standing between a
--  customer's browser and the table.
--
--  What it changes, in order:
--    1. is_admin() — recursion-safe, search_path-safe, used by every policy after it
--    2. user_profiles  — closes privilege escalation (customer -> admin) and a
--                        recursive admin-read policy that errored at runtime
--    3. quantity_discounts — RLS was never enabled: the table was world-writable
--    4. carousel_slides / nav_* — writes were open to any signed-in customer
--    5. products      — writes restricted to admins (unchanged in spirit, made explicit)
--    6. orders / order_items — direct inserts revoked; orders go through create_order()
--    7. create_order() — prices already verified server-side; reserves stock atomically
--    8. order_status  — adds the 'confirmed' value the admin panel already uses
--    9. Storage       — bank slips readable only by their owner; uploads constrained
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. Preflight — confirm the column types this script assumes.
--    Stops with a clear message rather than failing halfway through.
-- ---------------------------------------------------------------------------
DO $preflight$
DECLARE
  v_orders_id   text;
  v_products_id text;
  v_missing     text[] := '{}';
  v_table       text;
BEGIN
  -- Stop before touching anything if a table this script secures does not exist.
  -- Failing halfway is the dangerous outcome: RLS gets enabled on some tables and the
  -- policies that make them usable never run, so the shop breaks *and* the tables the
  -- script had not reached yet stay wide open.
  FOREACH v_table IN ARRAY ARRAY[
    'user_profiles', 'products', 'orders', 'order_items', 'bank_slips',
    'quantity_discounts', 'carousel_slides', 'nav_categories', 'nav_dropdown_items'
  ] LOOP
    IF to_regclass('public.' || v_table) IS NULL THEN
      v_missing := v_missing || v_table;
    END IF;
  END LOOP;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION
      'Missing table(s): %. Run the matching database/setup-*.sql first, then re-run this script.',
      array_to_string(v_missing, ', ');
  END IF;

  SELECT atttypid::regtype::text INTO v_orders_id
  FROM pg_attribute
  WHERE attrelid = 'public.orders'::regclass AND attname = 'id' AND NOT attisdropped;

  SELECT atttypid::regtype::text INTO v_products_id
  FROM pg_attribute
  WHERE attrelid = 'public.products'::regclass AND attname = 'id' AND NOT attisdropped;

  RAISE NOTICE 'Detected orders.id = %, products.id = %', v_orders_id, v_products_id;

  IF v_orders_id IS NULL OR v_products_id IS NULL THEN
    RAISE EXCEPTION 'Could not find public.orders.id or public.products.id — is the schema set up?';
  END IF;
END
$preflight$;


-- ---------------------------------------------------------------------------
-- 1. is_admin()
--
--    SECURITY DEFINER so it reads user_profiles with the *owner's* rights. That is what
--    breaks the recursion: a policy on user_profiles that queries user_profiles directly
--    re-enters RLS and Postgres raises 42P17 "infinite recursion detected in policy".
--    The old "Admins can view all profiles" policy did exactly that, so the admin user
--    list failed at runtime.
--
--    `SET search_path` is not optional on a SECURITY DEFINER function. Without it a
--    caller can put their own schema in front and have the function resolve
--    `user_profiles` to a table they control, which would let anyone claim to be admin.
--
--    The parameter is named `user_id` because that is what database/setup-roles.sql
--    already called it. Postgres refuses to rename an input parameter through
--    CREATE OR REPLACE ("42P13: cannot change name of input parameter"), and the
--    suggested DROP FUNCTION is the wrong way out: on a second run of this script every
--    policy below depends on is_admin(), so the DROP would fail — or with CASCADE would
--    quietly delete those policies and leave the tables open. Keeping the name means
--    this replaces cleanly however many times it is run.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  -- Qualified on both sides: `is_admin.user_id` is the parameter, `user_profiles.id`
  -- the column. user_profiles has no user_id column today, but an unqualified
  -- reference would silently start meaning the column if one were ever added.
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE public.user_profiles.id = is_admin.user_id
      AND public.user_profiles.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;


-- ---------------------------------------------------------------------------
-- 1b. current_profile_role()
--
--     Returns the role stored for the caller. Needed by the UPDATE policy in step 2,
--     which has to compare the row being written against the role already on record.
--
--     It must be SECURITY DEFINER for the same reason is_admin() is: a policy ON
--     user_profiles that reads FROM user_profiles re-enters RLS and Postgres aborts with
--     42P17 "infinite recursion detected in policy for relation user_profiles". A
--     SECURITY DEFINER function runs as the owner and is not subject to the policy, so
--     the lookup terminates.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_profile_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_profile_role() TO authenticated;


-- ---------------------------------------------------------------------------
-- 2. user_profiles — the privilege escalation
--
--    The old policy was:
--        FOR UPDATE USING (auth.uid() = id)
--
--    with no WITH CHECK and no column restriction. It says "you may update your own
--    row", and `role` is a column on your own row. So any customer could run
--
--        supabase.from('user_profiles').update({ role: 'admin' }).eq('id', <their id>)
--
--    from the browser console and become an administrator — full admin panel, every
--    order, every customer's address and phone number, product prices.
--
--    Postgres has no per-column RLS, so the fix is a WITH CHECK that compares the new
--    row's role to the one already stored: you may edit your profile, but you may not
--    change what you are. Admins go through /api/admin/users, which uses the same table
--    but is reached only after requireAdmin().
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop every policy on the table rather than a list of known names. Two reasons:
-- policies are OR'd together, so one forgotten permissive leftover undoes everything
-- below; and naming only the old policies made this script fail on a second run, when
-- the policies it creates itself already exist.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'user_profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update their own profile except role"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- The role being written must equal the one already on record. Read through the
    -- SECURITY DEFINER helper, never with a subquery on user_profiles directly — that
    -- would re-enter this very policy and error with 42P17.
    AND role = public.current_profile_role()
  );

CREATE POLICY "Admins can update any profile"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Nobody inserts here by hand; the on_auth_user_created trigger owns this table's rows.
-- No INSERT or DELETE policy is defined, so both are denied for anon and authenticated.


-- ---------------------------------------------------------------------------
-- 3. quantity_discounts — RLS was never switched on
--
--    database/setup-discounts.sql creates the table and stops. Supabase grants anon and
--    authenticated full DML on public tables by default and relies on RLS to take it
--    back, so with RLS off this table was readable AND writable by anyone on the
--    internet — including INSERT of a 100%-off rule, which the cart would then apply.
-- ---------------------------------------------------------------------------
ALTER TABLE public.quantity_discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active discounts" ON public.quantity_discounts;
DROP POLICY IF EXISTS "Admins manage discounts" ON public.quantity_discounts;

-- The cart needs to read the rules to show a shopper what they qualify for.
CREATE POLICY "Anyone can view active discounts"
  ON public.quantity_discounts FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage discounts"
  ON public.quantity_discounts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ---------------------------------------------------------------------------
-- 4. carousel_slides, nav_categories, nav_dropdown_items
--
--    All three were writable by `auth.role() = 'authenticated'` — i.e. by every customer
--    who ever signed up. The comment in supabase/setup_carousel.sql explains the
--    reasoning ("the app will enforce admin-only access via API routes"), which is the
--    assumption this file exists to correct.
--
--    Concretely: a customer could rewrite the homepage carousel's link_url to a phishing
--    page, or repoint a nav item, without touching the admin panel at all.
-- ---------------------------------------------------------------------------
ALTER TABLE public.carousel_slides    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_dropdown_items ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  pol record;
BEGIN
  FOREACH t IN ARRAY ARRAY['carousel_slides', 'nav_categories', 'nav_dropdown_items'] LOOP
    -- Policies are OR'd together, so a permissive leftover would undo everything below.
    FOR pol IN SELECT policyname FROM pg_policies
               WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "Public read" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format(
      'CREATE POLICY "Admins write" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 5. products — reads stay public (minus members-only), writes are admin-only.
-- ---------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.products', pol.policyname);
  END LOOP;
END $$;

-- Guests see the public catalogue; any signed-in user sees members-only listings too.
CREATE POLICY "Products are viewable except members-only listings"
  ON public.products FOR SELECT
  USING (members_only = false OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins insert products"
  ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update products"
  ON public.products FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete products"
  ON public.products FOR DELETE USING (public.is_admin());


-- ---------------------------------------------------------------------------
-- 6. orders and order_items — no more client-side inserts
--
--    The old policies let a customer insert their own order row directly, with any
--    total_amount they liked, and matching order_items at any price_at_time. Combined
--    with an API that recorded whatever the request body contained, a Rs 45,000 basket
--    could be filed as an order for Rs 1.
--
--    Pricing now happens on the server (src/lib/order-pricing.ts) and the write happens
--    in create_order() below, which is SECURITY DEFINER. So the INSERT policies here are
--    removed entirely: there is no longer any path from a browser to an orders row that
--    skips the server's arithmetic.
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  pol record;
BEGIN
  FOREACH t IN ARRAY ARRAY['orders', 'order_items'] LOOP
    FOR pol IN SELECT policyname FROM pg_policies
               WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;
  END LOOP;
END $$;

CREATE POLICY "Users read their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users read their own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Admins read all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

-- Deliberately no INSERT policy on either table. create_order() is the only writer.


-- ---------------------------------------------------------------------------
-- 7. create_order() — one transaction: reserve stock, write the order.
--
--    Called by POST /api/orders *after* that route has recomputed every figure from
--    this database. It does not re-price (the route owns that, and testing arithmetic
--    in TypeScript is far easier than in plpgsql) but it does re-check stock, because
--    between the route's check and this write another shopper's order may have landed.
--
--    The UPDATE ... WHERE stock >= quantity is the whole point: Postgres locks the row,
--    so two concurrent orders for the last unit serialise and the second sees 0 rows
--    updated. Checking then writing in two statements would let both succeed.
--
--    Generated with the detected id types so it works whether products.id is integer,
--    bigint or uuid.
-- ---------------------------------------------------------------------------
DO $build$
DECLARE
  v_product_id_type  text;
  v_order_id_type    text;
  v_shipping_expr    text;
  v_item_cols        text;
  v_item_vals        text;
BEGIN
  SELECT atttypid::regtype::text INTO v_product_id_type
  FROM pg_attribute
  WHERE attrelid = 'public.products'::regclass AND attname = 'id' AND NOT attisdropped;

  SELECT atttypid::regtype::text INTO v_order_id_type
  FROM pg_attribute
  WHERE attrelid = 'public.orders'::regclass AND attname = 'id' AND NOT attisdropped;

  -- orders.shipping_address is jsonb in the live database but TEXT in
  -- database/setup-orders.sql. Postgres has no implicit or assignment cast from text to
  -- jsonb, so inserting the parameter unqualified fails outright on the real schema
  -- ("column is of type jsonb but expression is of type text"). Cast only when needed —
  -- ::jsonb against a text column would be just as wrong in the other direction.
  SELECT CASE
           WHEN atttypid::regtype::text IN ('jsonb', 'json')
             THEN 'p_shipping_address::' || atttypid::regtype::text
           ELSE 'p_shipping_address'
         END
    INTO v_shipping_expr
  FROM pg_attribute
  WHERE attrelid = 'public.orders'::regclass
    AND attname = 'shipping_address' AND NOT attisdropped;

  v_shipping_expr := COALESCE(v_shipping_expr, 'p_shipping_address');

  -- order_items carries BOTH `price` and `price_at_time` in the live database, and
  -- `price` is NOT NULL with no default — so an insert naming only price_at_time fails.
  -- setup-orders.sql declares only price_at_time, so neither column can be assumed.
  -- They hold the same figure: the unit price at the moment the order was placed.
  IF EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public.order_items'::regclass
      AND attname = 'price' AND NOT attisdropped
  ) THEN
    v_item_cols := 'order_id, product_id, quantity, price, price_at_time';
    v_item_vals := 'v_order_id, v_pid, v_qty, v_unit_price, v_unit_price';
  ELSE
    v_item_cols := 'order_id, product_id, quantity, price_at_time';
    v_item_vals := 'v_order_id, v_pid, v_qty, v_unit_price';
  END IF;

  -- Which variant was bought. order_items has carried selected_size/selected_color from
  -- the start and nothing ever wrote to them, so every t-shirt order reached the admin
  -- panel with no size on it — unfulfillable without messaging the customer to ask.
  -- Optional because setup-orders.sql declares neither column.
  IF EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public.order_items'::regclass
      AND attname = 'selected_size' AND NOT attisdropped
  ) THEN
    v_item_cols := v_item_cols || ', selected_size';
    v_item_vals := v_item_vals || ', v_size';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public.order_items'::regclass
      AND attname = 'selected_color' AND NOT attisdropped
  ) THEN
    v_item_cols := v_item_cols || ', selected_color';
    v_item_vals := v_item_vals || ', v_color';
  END IF;

  RAISE NOTICE 'create_order: orders.id=%, products.id=%, shipping=%, item cols=(%)',
    v_order_id_type, v_product_id_type, v_shipping_expr, v_item_cols;

  EXECUTE format($fn$
    CREATE OR REPLACE FUNCTION public.create_order(
      p_total_amount     NUMERIC,
      p_shipping_cost    NUMERIC,
      p_shipping_address TEXT,
      p_city             TEXT,
      p_province         TEXT,
      p_postal_code      TEXT,
      p_phone            TEXT,
      p_items            JSONB
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $body$
    DECLARE
      v_user_id    UUID := auth.uid();
      v_order_id   %1$s;
      v_item       JSONB;
      v_pid        %2$s;
      v_qty        INTEGER;
      v_unit_price NUMERIC;
      v_size       TEXT;
      v_color      TEXT;
      v_updated    INTEGER;
    BEGIN
      IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'NOT_AUTHENTICATED';
      END IF;

      IF p_total_amount IS NULL OR p_total_amount < 0 THEN
        RAISE EXCEPTION 'INVALID_TOTAL';
      END IF;

      IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'EMPTY_ORDER';
      END IF;

      INSERT INTO public.orders (
        user_id, status, total_amount, shipping_cost,
        shipping_address, city, province, postal_code, phone, payment_method
      ) VALUES (
        v_user_id, 'pending', p_total_amount, COALESCE(p_shipping_cost, 0),
        %3$s, p_city, p_province, p_postal_code, p_phone, 'bank_transfer'
      )
      RETURNING id INTO v_order_id;

      FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_pid        := (v_item->>'product_id')::%2$s;
        v_qty        := (v_item->>'quantity')::INTEGER;
        v_unit_price := (v_item->>'price_at_time')::NUMERIC;
        -- ->> already yields SQL NULL for a JSON null, which is what "no variant" means.
        v_size       := v_item->>'selected_size';
        v_color      := v_item->>'selected_color';

        IF v_qty IS NULL OR v_qty < 1 THEN
          RAISE EXCEPTION 'INVALID_QUANTITY';
        END IF;
        IF v_unit_price IS NULL OR v_unit_price < 0 THEN
          RAISE EXCEPTION 'INVALID_PRICE';
        END IF;

        -- Reserve the stock. Zero rows updated means someone else took it first.
        UPDATE public.products
           SET stock = stock - v_qty
         WHERE id = v_pid
           AND stock >= v_qty;

        GET DIAGNOSTICS v_updated = ROW_COUNT;
        IF v_updated = 0 THEN
          -- Raising rolls the whole function back, order row included.
          RAISE EXCEPTION 'INSUFFICIENT_STOCK for product %%', v_pid;
        END IF;

        INSERT INTO public.order_items (%4$s) VALUES (%5$s);
      END LOOP;

      RETURN jsonb_build_object('order_id', v_order_id);
    END;
    $body$;
  $fn$, v_order_id_type, v_product_id_type, v_shipping_expr, v_item_cols, v_item_vals);
END
$build$;

REVOKE ALL ON FUNCTION public.create_order(NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;


-- ---------------------------------------------------------------------------
-- 8. order_status — the admin panel already writes 'confirmed'
--
--    src/app/api/admin/orders/[id]/route.ts sets status='confirmed' when a bank slip is
--    verified, and lists it as an allowed status. The enum created in setup-orders.sql
--    has no such value, so that write fails: verifying a slip left the order stuck.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'order_status' AND e.enumlabel = 'confirmed'
    ) THEN
      ALTER TYPE order_status ADD VALUE 'confirmed' AFTER 'pending';
      RAISE NOTICE 'Added ''confirmed'' to order_status.';
    END IF;
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- 9. bank_slips and storage
--
--    The old storage policy read:
--        USING (bucket_id = 'bank-slips' AND auth.role() = 'authenticated')
--
--    Its name said "Users can view their own bank slips in storage"; its condition said
--    "any signed-in user may read every slip in the bucket". Bank slips carry account
--    numbers, account holders' names and transfer amounts, so that was every customer's
--    banking detail readable by every other customer.
--
--    Slips are uploaded as `<order_id>/<timestamp>.<ext>`, so the first path segment
--    identifies the order and can be joined back to its owner.
-- ---------------------------------------------------------------------------
ALTER TABLE public.bank_slips ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'bank_slips'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.bank_slips', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users read slips for their own orders"
  ON public.bank_slips FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = bank_slips.order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users add slips to their own orders"
  ON public.bank_slips FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = bank_slips.order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Admins read all slips"
  ON public.bank_slips FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins update slips"
  ON public.bank_slips FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Keep the bucket private. `public = true` would make every slip readable by URL alone.
UPDATE storage.buckets SET public = false WHERE id = 'bank-slips';

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN (
        'Authenticated users can upload bank slips',
        'Users can view their own bank slips in storage',
        'Admins can view all bank slips in storage',
        'Owners read their own bank slips',
        'Admins read every bank slip',
        'Users upload slips into their own order folder',
        'Anyone can upload custom order reference images',
        'Anyone can view custom order reference images',
        'Public read of custom order references',
        'Server uploads custom order references'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- The first path segment is the order id; only that order's owner may read the object.
CREATE POLICY "Owners read their own bank slips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bank-slips'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.user_id = auth.uid()
        AND o.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Admins read every bank slip"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bank-slips' AND public.is_admin());

CREATE POLICY "Users upload slips into their own order folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'bank-slips'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.user_id = auth.uid()
        AND o.id::text = (storage.foldername(name))[1]
    )
  );

-- custom-order-references: the bucket is public by design (the admin panel renders the
-- images directly), but "anyone may upload" meant an unauthenticated stranger could
-- store arbitrary files on your domain and burn the free tier's storage quota. Uploads
-- now go only through POST /api/custom-orders, which validates type and size and runs
-- with the service-role key — service_role bypasses RLS, so no INSERT policy is needed.
CREATE POLICY "Public read of custom order references"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'custom-order-references');


-- ---------------------------------------------------------------------------
-- 10. Verification — read these results before you close the tab.
-- ---------------------------------------------------------------------------

-- (a) Every table in `public` should report rowsecurity = true.
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- (b) No policy outside this file's design should mention auth.role() = 'authenticated',
--     which is the pattern that granted customers admin-level writes. Expect zero rows.
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual ILIKE '%auth.role()%authenticated%' OR with_check ILIKE '%auth.role()%authenticated%')
ORDER BY tablename;
