import { createClient } from '@/utils/supabase/server';
import { viewerCanSeeMembersOnly, publicListingsOnly } from '@/lib/product-visibility';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryScrollWrapper } from './CategoryScrollWrapper';

// Map nav category href → product category key
function getCategoryKey(href: string): string | null {
  const path = href.split('?')[0].replace(/^\//, '');
  return path && path !== 'products' ? path : null;
}

// Titles & descriptions per category for a premium feel
const CATEGORY_META: Record<string, { subtitle: string; gradient: string }> = {
  figures: {
    subtitle: 'Premium collectible figures crafted with meticulous detail.',
    gradient: 'from-violet-500/10 to-indigo-500/10',
  },
  manga: {
    subtitle: 'Build your manga library with the latest and greatest titles.',
    gradient: 'from-rose-500/10 to-pink-500/10',
  },
  tshirts: {
    subtitle: 'Wear your fandom with style — graphic tees for every otaku.',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  other: {
    subtitle: 'Trading card games, stationery, and collectibles worth hunting for.',
    gradient: 'from-teal-500/10 to-emerald-500/10',
  },
};

const DEFAULT_META = {
  subtitle: 'Explore our curated selection of premium anime merchandise.',
  gradient: 'from-slate-500/10 to-gray-500/10',
};

const PRODUCTS_PER_SECTION = 8;

export async function CategoryShowcase() {
  const supabase = await createClient();
  const canSeeMembersOnly = await viewerCanSeeMembersOnly(supabase);

  // Fetch nav categories to know which categories to display
  const { data: navCategories } = await supabase
    .from('nav_categories')
    .select('id, label, href, sort_order')
    .order('sort_order');

  if (!navCategories || navCategories.length === 0) return null;

  // Which product categories to show, in nav order, without duplicates
  // (two nav items can point at the same /figures).
  const categoryKeys: string[] = [];
  const navByKey = new Map<string, (typeof navCategories)[number]>();
  for (const nav of navCategories) {
    const key = getCategoryKey(nav.href);
    if (!key || navByKey.has(key)) continue; // Skip generic categories like "Series" or "Goods"
    categoryKeys.push(key);
    navByKey.set(key, nav);
  }

  if (categoryKeys.length === 0) return null;

  // One round trip's worth of latency instead of one per nav item. Per-category
  // queries (rather than a single `.in()` with a global limit) keep each section's
  // "newest 8" exact — a busy category can't starve a quiet one out of the results.
  const results = await Promise.all(
    categoryKeys.map(async key => {
      let productsQuery = supabase
        .from('products')
        .select('id, name, price, image_url, image_urls, stock, category, series, brand, author, publisher, external_rating, external_rating_count, character_names, description, created_at, updated_at')
        .eq('category', key)
        .order('created_at', { ascending: false })
        .limit(PRODUCTS_PER_SECTION);

      if (!canSeeMembersOnly) productsQuery = publicListingsOnly(productsQuery);

      const { data } = await productsQuery;
      return { key, products: data || [] };
    })
  );

  const sections = results
    .filter(({ products }) => products.length > 0)
    .map(({ key, products }) => ({
      label: navByKey.get(key)!.label.toUpperCase(),
      href: navByKey.get(key)!.href,
      categoryKey: key,
      products,
    }));

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        const meta = CATEGORY_META[section.categoryKey] || DEFAULT_META;

        const mappedProducts = section.products.map(p => {
          let images: string[] = [];
          if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) {
            images = p.image_urls;
          } else if (p.image_url) {
            images = [p.image_url];
          } else {
            images = ['/placeholder.svg'];
          }

          return {
            id: p.id.toString(),
            name: p.name,
            description: p.description || '',
            price: p.price,
            category: p.category,
            images,
            stock: p.stock,
            isActive: true,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            status: (p.stock > 0 ? 'available' : 'out_of_stock') as any,
            series: p.series,
            characterNames: p.character_names,
            externalRating: p.external_rating,
            externalRatingCount: p.external_rating_count,
            author: p.author,
            publisher: p.publisher,
            brand: p.brand,
          } as any;
        });

        return (
          <section key={section.categoryKey} className="py-20 border-b border-border overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="text-heading">{section.label}</h2>
                  <p className="mt-3 text-muted-foreground max-w-xl">
                    {meta.subtitle}
                  </p>
                </div>
                <Link
                  href={section.href}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-8 h-11 text-sm font-medium shadow-sm border border-zinc-900 text-zinc-900 bg-white hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:bg-zinc-950 dark:hover:bg-white dark:hover:text-zinc-900 transition-all duration-300 group self-start sm:self-auto"
                >
                  View All
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Product Carousel with Arrows */}
              <CategoryScrollWrapper products={mappedProducts} />
            </div>
          </section>
        );
      })}
    </>
  );
}
