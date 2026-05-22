-- Diagnostic script: Run in Supabase SQL Editor to debug product updates

-- 1. Check specifications column type
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'specifications';

-- 2. Check ALL columns on products table
SELECT column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'products';

-- 4. List ALL policies on products table
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'products';

-- 5. Test: manually update a product specification and see if it works
-- (Uncomment and change the ID to test)
-- UPDATE products SET specifications = specifications || '{"isbn10": "TEST123"}' WHERE id = 1;
