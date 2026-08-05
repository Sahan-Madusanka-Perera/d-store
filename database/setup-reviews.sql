-- Customer reviews, with moderation and off-site attribution.
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor).
--
-- Two kinds of row live here and the difference is `source`:
--   'site'  — submitted through the form on the storefront by a visitor
--   others  — pasted in by an admin from Facebook, Google, Instagram, WhatsApp, TikTok
--
-- Nothing a visitor submits is ever visible until an admin publishes it, so `status`
-- defaults to 'pending' and the public read policy only ever sees 'published'.

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    author_name TEXT NOT NULL CHECK (char_length(trim(author_name)) BETWEEN 1 AND 80),
    body        TEXT NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 2000),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),

    -- Where the review came from. 'site' means it was written here.
    source      TEXT NOT NULL DEFAULT 'site'
                CHECK (source IN ('site', 'facebook', 'google', 'instagram', 'whatsapp', 'tiktok', 'other')),
    -- Optional link back to the original post, so a pasted review can be verified.
    source_url  TEXT,

    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'published', 'hidden')),

    -- The date shown on the card. Separate from created_at because a review pasted
    -- from Facebook today may have been written a year ago, and showing "just now"
    -- next to it would be a lie.
    reviewed_on DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Manual ordering for the slider. NULLs sort last, then newest first.
    display_order INTEGER,

    -- Set when a signed-in customer submits; null for guests and admin-created rows.
    submitted_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- Kept for replying to a reviewer. Never rendered on the storefront.
    submitter_email TEXT,

    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- The storefront reads exactly this set, ordered this way, on most page loads.
CREATE INDEX IF NOT EXISTS reviews_published_idx
    ON public.reviews (display_order NULLS LAST, reviewed_on DESC)
    WHERE status = 'published';

-- The admin queue: everything awaiting a decision, oldest first.
CREATE INDEX IF NOT EXISTS reviews_pending_idx
    ON public.reviews (created_at)
    WHERE status = 'pending';

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Read: published rows are public; admins see everything.
DROP POLICY IF EXISTS "Published reviews are public" ON public.reviews;
CREATE POLICY "Published reviews are public"
    ON public.reviews FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Admins read every review" ON public.reviews;
CREATE POLICY "Admins read every review"
    ON public.reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
        )
    );

-- Writes: deliberately no INSERT/UPDATE/DELETE policy for anyone.
--
-- Submissions go through POST /api/reviews, which uses the service-role key and hard-codes
-- status='pending' and source='site'. If visitors could insert directly, RLS alone could
-- not stop them sending status='published' in the payload and self-publishing. Admin edits
-- go through /api/admin/reviews, which checks the role first. Both bypass RLS by design;
-- RLS here is the safety net for the anon key, not the authorisation model.

-- Keep updated_at honest.
CREATE OR REPLACE FUNCTION public.touch_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_set_updated_at ON public.reviews;
CREATE TRIGGER reviews_set_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.touch_reviews_updated_at();

-- Seed the six testimonials that were hardcoded in FacebookRecommendations.tsx, so the
-- section does not go empty the moment it starts reading from the database. Delete or
-- edit them in the admin once you have real ones.
INSERT INTO public.reviews (author_name, body, rating, source, status, reviewed_on, display_order)
VALUES
    ('Kasun Perera',       'Absolutely amazing quality and fast delivery! Got my One Piece figures in perfect condition. Highly recommended for any anime fan in Sri Lanka.', 5, 'facebook', 'published', CURRENT_DATE - 14,  1),
    ('Shenali Silva',      'The best place to buy authentic manga. The packaging is always so secure and the customer service is top notch. Love this store!',               5, 'facebook', 'published', CURRENT_DATE - 30,  2),
    ('Praveen Fernando',   'Great collection of action figures! Ordered a custom Gundam kit and they delivered it right to my doorstep. 10/10.',                            5, 'facebook', 'published', CURRENT_DATE - 60,  3),
    ('Nimesha Dias',       'I''ve bought several graphic tees and the print quality is fantastic. Doesn''t fade after washing. Really happy with my purchases.',            5, 'facebook', 'published', CURRENT_DATE - 90,  4),
    ('Thilina Jayasooriya','Authentic products and great prices. It''s hard to find a reliable hobby store, but D-Store always delivers. Keep up the good work!',           5, 'facebook', 'published', CURRENT_DATE - 120, 5),
    ('Sanduni Rathnayake', 'Bought a Jujutsu Kaisen box set. Arrived securely packed with bubble wrap. Very satisfied with the service and the owner is very friendly.',    5, 'facebook', 'published', CURRENT_DATE - 150, 6)
ON CONFLICT DO NOTHING;
