-- Check if we have products with multiple images to test the gallery
SELECT 
  id, 
  name, 
  category,
  image_url,
  image_urls,
  CASE 
    WHEN image_urls IS NOT NULL THEN array_length(image_urls, 1)
    ELSE 0
  END as image_count
FROM products 
ORDER BY created_at DESC 
LIMIT 10;