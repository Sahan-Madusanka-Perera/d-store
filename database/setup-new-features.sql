-- 1. Create publisher discounts table
CREATE TABLE IF NOT EXISTS publisher_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher TEXT NOT NULL,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE publisher_discounts ENABLE ROW LEVEL SECURITY;

-- Policies for publisher_discounts
-- Anyone can view active discounts
CREATE POLICY "Anyone can view publisher discounts" 
ON publisher_discounts FOR SELECT 
USING (true);

-- Only admins can insert/update/delete (assuming is_admin exists logic, or simply limit by authenticated for development)
-- You can add your typical admin check policy here if needed.
CREATE POLICY "Admins can manage publisher discounts" 
ON publisher_discounts FOR ALL 
USING (auth.role() = 'authenticated');

-- 2. Add new fields to the products table
-- We use 'IF NOT EXISTS' to avoid errors if run multiple times
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' and column_name='tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' and column_name='character_names') THEN
        ALTER TABLE products ADD COLUMN character_names TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' and column_name='series') THEN
        -- Series might already exist, but if not:
        ALTER TABLE products ADD COLUMN series TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' and column_name='external_rating') THEN
        ALTER TABLE products ADD COLUMN external_rating NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' and column_name='external_rating_count') THEN
        ALTER TABLE products ADD COLUMN external_rating_count INTEGER;
    END IF;
END $$;
