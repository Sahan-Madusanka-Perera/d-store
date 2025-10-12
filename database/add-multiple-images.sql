-- Migration script to add image_urls column for multiple image support
-- Run this in your Supabase SQL editor

-- Add the new image_urls column (array of text)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Migrate existing single image_url to image_urls array
UPDATE products 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_urls IS NULL;

-- Update RLS policies to include image_urls
-- You can run these if you have RLS enabled
-- ALTER POLICY IF EXISTS "Public products are viewable by everyone" ON products 
-- FOR SELECT USING (true);

-- Comments for reference:
-- image_url: single image URL (keep for backward compatibility)
-- image_urls: array of image URLs (new field for multiple images)