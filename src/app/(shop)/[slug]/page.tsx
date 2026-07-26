import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { viewerCanSeeMembersOnly, publicListingsOnly } from '@/lib/product-visibility';

/**
 * Series slug routes: /one-piece, /dandadan, /jujutsu-kaisen.
 *
 * The site already aliases /books → /manga and /series → /products with small redirect
 * pages; this extends that to series, which carousel slides and nav items were already
 * linking to (and 404ing on). Static routes win over this dynamic segment, so /figures,
 * /login and friends are unaffected.
 *
 * A slug only redirects when it actually names a series or tag in the catalogue.
 * Anything else is a genuine 404 rather than a soft one, so typos and bot probes don't
 * turn into thin search pages.
 */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesSlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  // Cheap guard before touching the database — real slugs are short and kebab-cased.
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/.test(slug)) notFound();

  const supabase = await createClient();

  let query = supabase.from('products').select('series, tags');
  if (!(await viewerCanSeeMembersOnly(supabase))) query = publicListingsOnly(query);

  const { data: rows } = await query;

  // Match against the names customers actually see, and redirect using the original
  // casing so the search page heading reads "One Piece", not "one-piece".
  for (const row of rows || []) {
    const candidates = [row.series, ...(row.tags || [])];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && slugify(candidate) === slug) {
        redirect(`/products?search=${encodeURIComponent(candidate)}`);
      }
    }
  }

  notFound();
}
