-- SQL script to check if the product-images storage bucket exists and has proper policies
-- Run this in your Supabase SQL editor to check the storage setup

-- Check if the product-images bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'product-images';

-- Check existing objects in the bucket (to see if uploads worked before)
SELECT name, bucket_id, created_at FROM storage.objects WHERE bucket_id = 'product-images' ORDER BY created_at DESC LIMIT 10;

-- Check RLS policies on storage.objects table (these control upload permissions)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- If the bucket doesn't exist, create it:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- If policies are missing, add basic upload/select policies:
-- CREATE POLICY "Public can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
-- CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');