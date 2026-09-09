import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { enforce } from '@/lib/rate-limit';

/**
 * External rating for a product, cached on the product row.
 *
 * ## What changed here, and why it matters
 *
 * This route used to *invent* a rating whenever the real lookup came back empty: a hash
 * of the product name mapped to a score between 4.0 and 5.0, a review count of
 * `Math.floor(Math.random() * 350) + 50`, and `source: 'amazon'` stamped on top. The
 * storefront rendered that as "4.7 ★ (312 ratings) · Amazon".
 *
 * That is a fabricated endorsement attributed to a named third party, shown to a shopper
 * deciding whether to buy. Under the Consumer Affairs Authority Act it is a misleading
 * representation, and the fact that it always landed between 4.0 and 5.0 means it was
 * only ever flattering — which is the definition of the practice regulators look for.
 * The same file already carries a careful note about not faking a compare-at price; this
 * was the same problem one field over.
 *
 * So: no invented numbers. A rating is returned only when it came from MyAnimeList, from
 * MyFigureCollection, or from a value an admin entered by hand. When there is none, the
 * response says so and the product page shows no rating at all.
 */

/** Cached ratings are refreshed at most once a day. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface RatingResponse {
  rating: number | null;
  count: number | null;
  source: 'myanimelist' | 'myfigurecollection' | 'store' | null;
}

const NO_RATING: RatingResponse = { rating: null, count: null, source: null };

/** MyAnimeList, via Jikan. Returns null rather than throwing — a rating is a nicety. */
async function fetchFromJikan(query: string): Promise<RatingResponse | null> {
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const top = data?.data?.[0];
    if (!top?.score || !top?.scored_by) return null;

    // Jikan scores out of 10; the storefront's stars are out of 5.
    return {
      rating: Number((top.score / 2).toFixed(1)),
      count: Number(top.scored_by),
      source: 'myanimelist',
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Each miss costs an outbound call to a third-party API that rate-limits us in turn.
    const limited = enforce(request, 'product-ratings', 60, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const { id: productId } = await params;

    const { data: product, error } = await supabase
      .from('products')
      .select('name, category, series, external_rating, external_rating_count, updated_at')
      .eq('id', productId)
      .single();

    // A missing product is a 404, not a 500 — and `.single()` errors on no rows.
    if (error || !product) {
      return NextResponse.json(NO_RATING, { status: 404 });
    }

    // Serve the cached value while it is fresh.
    if (product.external_rating && product.external_rating_count) {
      const age = Date.now() - new Date(product.updated_at).getTime();
      if (!Number.isFinite(age) || age < CACHE_TTL_MS) {
        return NextResponse.json({
          rating: Number(product.external_rating),
          count: Number(product.external_rating_count),
          source: product.category === 'manga' ? 'myanimelist' : 'store',
        } satisfies RatingResponse);
      }
    }

    // Only manga has a free, reliable rating source. Everything else has no honest
    // number to show, so it shows none.
    let result: RatingResponse | null = null;
    if (product.category === 'manga' || product.series) {
      const query = product.series || product.name.replace(/(vol\.?|volume)\s*\d+/i, '').trim();
      if (query) result = await fetchFromJikan(query);
    }

    if (!result) {
      return NextResponse.json(NO_RATING);
    }

    // Cache it. Products are admin-only for writes now (database/harden-security.sql),
    // so this goes through the service-role key rather than the caller's anon session —
    // and it is a cache refresh, not something the caller can steer: the values come
    // from Jikan, keyed on a product row the caller did not choose the contents of.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: cacheError } = await admin
        .from('products')
        .update({ external_rating: result.rating, external_rating_count: result.count })
        .eq('id', productId);

      // A failed cache write costs a repeat lookup next time. Not worth failing the request.
      if (cacheError) console.error('[RATINGS] Cache write failed:', cacheError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[RATINGS] Lookup failed:', error);
    // Degrade to "no rating" rather than a 500 — the product page renders fine without one.
    return NextResponse.json(NO_RATING);
  }
}
