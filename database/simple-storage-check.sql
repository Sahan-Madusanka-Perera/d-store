-- Simple check for storage bucket
SELECT id, name, public FROM storage.buckets WHERE name = 'product-images';

-- Check if there are any objects in the bucket
SELECT COUNT(*) as object_count FROM storage.objects WHERE bucket_id = 'product-images';