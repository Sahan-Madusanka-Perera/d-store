-- Comprehensive script to add any missing columns to pre-existing tables.

-- 1. Create order_status ENUM if it doesn't exist. 
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns to orders table
ALTER TABLE public.orders 
    ADD COLUMN IF NOT EXISTS status order_status DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS shipping_address TEXT NOT NULL DEFAULT 'Address not provided',
    ADD COLUMN IF NOT EXISTS city VARCHAR(100) NOT NULL DEFAULT 'City not provided',
    ADD COLUMN IF NOT EXISTS province VARCHAR(100) NOT NULL DEFAULT 'Province not provided',
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) NOT NULL DEFAULT '00000',
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NOT NULL DEFAULT '0000000000',
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'payhere';

-- 3. Add columns to order_items table
ALTER TABLE public.order_items 
    ADD COLUMN IF NOT EXISTS price_at_time DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- 4. Ensure RLS policies exist (this will recreate them or add them if missing. To be safe, we just enable RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Note: We are not redefining policies here as it might conflict. The setup-orders.sql had the policies. 
