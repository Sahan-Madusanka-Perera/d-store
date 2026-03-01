ALTER TABLE carousel_slides
ADD COLUMN IF NOT EXISTS bg_color text,
ADD COLUMN IF NOT EXISTS image_alignment text DEFAULT 'right';
