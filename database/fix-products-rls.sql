-- Fix missing RLS UPDATE/DELETE policies for the products table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)

-- Check if RLS is enabled (it likely is since SELECT works via policies)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products (if not already set)
DO $$ BEGIN
  CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow admins to INSERT products
DO $$ BEGIN
  CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow admins to UPDATE products (THIS IS THE MISSING ONE)
DO $$ BEGIN
  CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allow admins to DELETE products
DO $$ BEGIN
  CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Verify: list all policies on products
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'products';
