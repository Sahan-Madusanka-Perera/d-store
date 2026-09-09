import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/seo';

/**
 * sitemap.xml, built from the catalogue.
 *
 * Regenerated on each deploy, so a newly added product appears in the sitemap the next
 * time the site is built. Netlify rebuilds on every push; if products are added through
 * the admin panel without a deploy, either trigger a build hook after a batch or move
 * this to a route handler with `revalidate`. For a catalogue this size, per-deploy is
 * enough and costs nothing.
 *
 * Uses a plain anon client rather than `@/utils/supabase/server`, which reads cookies
 * and so cannot run during a build. The anon key is subject to the same RLS as any
 * visitor, which is exactly what we want here: whatever a logged-out shopper cannot see
 * must not be advertised in a sitemap either.
 */

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** The catalogue pages, in rough order of how much they matter. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Entry['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/figures', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/manga', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/tshirts', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/books', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/apparel', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/goods', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/series', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/other', priority: 0.6, changeFrequency: 'weekly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(route => ({
    url: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // While the pre-launch gate is up, every one of these URLs redirects to /coming-soon.
  // Advertising them would be inviting Google to crawl a few hundred redirects.
  if (process.env.COMING_SOON === 'true') {
    return [
      {
        url: `${SITE_URL}/coming-soon`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('[SITEMAP] Supabase env vars missing — product URLs omitted.');
    return staticEntries;
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // members_only listings are excluded deliberately: they are hidden from logged-out
    // visitors, and a sitemap is read by exactly such a visitor.
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('members_only', false)
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (error) throw error;

    const productEntries: MetadataRoute.Sitemap = (products ?? []).map(product => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticEntries, ...productEntries];
  } catch (error) {
    // A sitemap that is missing products is a bad day; a build that fails because the
    // database was briefly unreachable is a worse one.
    console.error('[SITEMAP] Could not load products:', error);
    return staticEntries;
  }
}
