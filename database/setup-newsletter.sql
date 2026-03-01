-- Newsletter Database Setup

-- 1. Create the subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the campaigns table (To track sent newsletters)
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_by UUID REFERENCES auth.users(id),
    recipient_count INTEGER DEFAULT 0
);

-- 3. Set up Row Level Security (RLS) policies

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE to insert into subscribers (for the public footer form)
CREATE POLICY "Anyone can subscribe to newsletter" 
    ON public.newsletter_subscribers FOR INSERT 
    WITH CHECK (true);

-- Allow admins ONLY to view the subscriber list
CREATE POLICY "Admins can view subscribers" 
    ON public.newsletter_subscribers FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
        )
    );

-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription" 
    ON public.newsletter_subscribers FOR SELECT 
    USING ( email = (auth.jwt() ->> 'email')::text );

-- Allow users to update their own subscription
CREATE POLICY "Users can update their own subscription" 
    ON public.newsletter_subscribers FOR UPDATE 
    USING ( email = (auth.jwt() ->> 'email')::text );

-- Allow admins ONLY to view campaigns
CREATE POLICY "Admins can view campaigns" 
    ON public.newsletter_campaigns FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
        )
    );

-- Allow admins ONLY to insert campaigns
CREATE POLICY "Admins can create campaigns" 
    ON public.newsletter_campaigns FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
        )
    );
