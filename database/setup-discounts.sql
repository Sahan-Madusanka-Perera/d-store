CREATE TABLE IF NOT EXISTS quantity_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, 
    min_quantity INTEGER NOT NULL,
    discount_percentage DECIMAL, 
    discount_fixed DECIMAL, 
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
