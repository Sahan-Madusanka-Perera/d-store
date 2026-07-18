-- Custom Orders Table
-- Stores custom order requests from visitors (no auth required to submit)

CREATE TABLE IF NOT EXISTS public.custom_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL, -- 'book' | 'figure'
    sub_category VARCHAR(50) NOT NULL,
    publisher_manufacturer VARCHAR(255),
    reference_image_url TEXT,
    order_description TEXT,
    budget_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a custom order (public-facing form, no auth needed)
CREATE POLICY "Anyone can submit custom orders" ON public.custom_orders
    FOR INSERT WITH CHECK (true);

-- Only admins can view custom orders
CREATE POLICY "Admins can view all custom orders" ON public.custom_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update custom orders (status changes, admin notes)
CREATE POLICY "Admins can update custom orders" ON public.custom_orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete custom orders
CREATE POLICY "Admins can delete custom orders" ON public.custom_orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND role = 'admin'
        )
    );

-- Index for faster admin queries
CREATE INDEX idx_custom_orders_status ON public.custom_orders(status);
CREATE INDEX idx_custom_orders_created_at ON public.custom_orders(created_at DESC);

-- Create storage bucket for custom order reference images
-- Public bucket: submitters aren't authenticated, and the admin panel needs
-- to display the images directly without generating signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-order-references', 'custom-order-references', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for custom-order-references bucket
CREATE POLICY "Anyone can upload custom order reference images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-order-references');

CREATE POLICY "Anyone can view custom order reference images"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-order-references');
