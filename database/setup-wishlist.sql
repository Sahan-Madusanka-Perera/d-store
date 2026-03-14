-- ============================================
-- Wishlist Feature Setup
-- ============================================
-- Run this in the Supabase SQL Editor

-- 1. Add 'status' column to products table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'available'
            CHECK (status IN ('available', 'coming_soon', 'pre_order', 'out_of_stock'));
    END IF;
END $$;

-- 2. Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notify_on_available BOOLEAN DEFAULT false,
    UNIQUE(user_id, product_id)
);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- 4. Enable RLS on wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: users can only manage their own wishlist items

-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist"
ON wishlists FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to own wishlist"
ON wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist items (e.g. toggle notify)
CREATE POLICY "Users can update own wishlist"
ON wishlists FOR UPDATE
USING (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can remove from own wishlist"
ON wishlists FOR DELETE
USING (auth.uid() = user_id);
