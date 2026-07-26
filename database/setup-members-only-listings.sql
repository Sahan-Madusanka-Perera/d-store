-- Members-only listings
-- Adds a per-product flag that hides a listing from logged-out visitors.
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor).

-- 1. The flag itself. Existing products stay public.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS members_only BOOLEAN NOT NULL DEFAULT false;

-- Partial index for the guest catalogue — the only rows a logged-out visitor reads.
CREATE INDEX IF NOT EXISTS products_public_created_at_idx
  ON public.products (created_at DESC)
  WHERE members_only = false;

-- 2. Replace the read policy.
-- RLS policies are permissive (OR'd together), so the old "USING (true)" policy
-- would keep every product visible no matter what we add alongside it. Drop the
-- existing SELECT policies so the new one is the only gate on reads.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, cmd FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products' AND cmd IN ('SELECT', 'ALL')
  LOOP
    IF pol.cmd = 'ALL' THEN
      RAISE NOTICE 'Policy "%" is FOR ALL, so it also grants SELECT and can bypass the members-only gate. Review it manually.', pol.policyname;
    ELSE
      EXECUTE format('DROP POLICY %I ON public.products', pol.policyname);
    END IF;
  END LOOP;
END $$;

-- Guests see public listings only. Any signed-in user sees the full catalogue.
CREATE POLICY "Products are viewable by everyone except members-only listings"
  ON public.products
  FOR SELECT
  USING (
    members_only = false
    OR auth.uid() IS NOT NULL
  );

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Verify: the SELECT row below should be the policy created above, and the
-- INSERT/UPDATE/DELETE policies from fix-products-rls.sql should be untouched.
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY cmd, policyname;
