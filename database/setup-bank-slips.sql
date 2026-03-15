-- Create Enum for Bank Slip Status
DO $$ BEGIN
    CREATE TYPE bank_slip_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Enum for Upload Method
DO $$ BEGIN
    CREATE TYPE slip_upload_method AS ENUM ('website', 'whatsapp');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Bank Slips Table
-- Note: order_id is BIGINT to match the actual orders.id integer primary key
CREATE TABLE IF NOT EXISTS public.bank_slips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    slip_url TEXT NOT NULL,
    uploaded_via slip_upload_method DEFAULT 'website' NOT NULL,
    status bank_slip_status DEFAULT 'pending' NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bank_slips ENABLE ROW LEVEL SECURITY;

-- Users can view slips for their own orders
CREATE POLICY "Users can view their own bank slips" ON public.bank_slips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = bank_slips.order_id AND orders.user_id = auth.uid()
        )
    );

-- Users can insert slips for their own orders
CREATE POLICY "Users can upload slips for their own orders" ON public.bank_slips
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = bank_slips.order_id AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all slips
CREATE POLICY "Admins can view all bank slips" ON public.bank_slips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update slip status
CREATE POLICY "Admins can update bank slips" ON public.bank_slips
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() AND role = 'admin'
        )
    );

-- Create storage bucket for bank slips (run this via Supabase dashboard if SQL doesn't work)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-slips', 'bank-slips', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for bank-slips bucket
CREATE POLICY "Authenticated users can upload bank slips"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bank-slips' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own bank slips in storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'bank-slips' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can view all bank slips in storage"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'bank-slips' AND
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() AND role = 'admin'
    )
);
