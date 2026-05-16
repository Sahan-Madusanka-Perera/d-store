-- Nav Categories table: top-level nav items (Figures, Books, Apparel, Goods, Series)
CREATE TABLE IF NOT EXISTS nav_categories (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'ShoppingBag',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nav Dropdown Items table: sub-items within each category
CREATE TABLE IF NOT EXISTS nav_dropdown_items (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES nav_categories(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default data
INSERT INTO nav_categories (label, href, icon_name, sort_order) VALUES
  ('Figures', '/figures', 'Sparkles', 1),
  ('Books', '/manga', 'BookOpen', 2),
  ('Apparel', '/tshirts', 'Shirt', 3),
  ('Goods', '/products', 'Package', 4),
  ('Series', '/products', 'ShoppingBag', 5)
ON CONFLICT DO NOTHING;

INSERT INTO nav_dropdown_items (category_id, label, href, sort_order)
SELECT id, 'Anime Figures', '/figures?search=Anime+Figures', 1 FROM nav_categories WHERE label = 'Figures'
UNION ALL
SELECT id, 'Action Figures', '/figures?search=Action+Figures', 2 FROM nav_categories WHERE label = 'Figures'
UNION ALL
SELECT id, 'Gundam Kits', '/figures?search=Gundam', 3 FROM nav_categories WHERE label = 'Figures'
UNION ALL
SELECT id, 'Other', '/figures', 4 FROM nav_categories WHERE label = 'Figures'
UNION ALL
SELECT id, 'Manga', '/manga', 1 FROM nav_categories WHERE label = 'Books'
UNION ALL
SELECT id, 'Manhwa', '/manga?search=Manhwa', 2 FROM nav_categories WHERE label = 'Books'
UNION ALL
SELECT id, 'Graphic Novels', '/manga?search=Graphic+Novels', 3 FROM nav_categories WHERE label = 'Books'
UNION ALL
SELECT id, 'Novel', '/manga?search=Novel', 4 FROM nav_categories WHERE label = 'Books'
UNION ALL
SELECT id, 'Graphic Tshirts', '/tshirts', 1 FROM nav_categories WHERE label = 'Apparel'
UNION ALL
SELECT id, 'One Piece', '/products?search=One+Piece', 1 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'Jujutsu Kaisen', '/products?search=Jujutsu+Kaisen', 2 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'Attack on Titan', '/products?search=Attack+on+Titan', 3 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'Demon Slayer', '/products?search=Demon+Slayer', 4 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'Naruto', '/products?search=Naruto', 5 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'Dragon Ball', '/products?search=Dragon+Ball', 6 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'Chainsaw Man', '/products?search=Chainsaw+Man', 7 FROM nav_categories WHERE label = 'Series'
UNION ALL
SELECT id, 'My Hero Academia', '/products?search=My+Hero+Academia', 8 FROM nav_categories WHERE label = 'Series';

ALTER TABLE nav_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_dropdown_items ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read, only admins can write
CREATE POLICY "Anyone can view nav categories" ON nav_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert nav categories" ON nav_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update nav categories" ON nav_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete nav categories" ON nav_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view nav dropdown items" ON nav_dropdown_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert nav dropdown items" ON nav_dropdown_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update nav dropdown items" ON nav_dropdown_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete nav dropdown items" ON nav_dropdown_items FOR DELETE USING (auth.role() = 'authenticated');
