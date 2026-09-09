import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { viewerCanSeeMembersOnly, publicListingsOnly } from '@/lib/product-visibility';
import { buildSearchFilter } from '@/lib/product-search';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    // parseInt('abc') is NaN, and `.range(NaN, NaN)` is not an error PostgREST catches —
    // it just misbehaves. An unbounded limit was worse: ?limit=1000000 dumped the whole
    // catalogue in one request, which on a free tier is a denial-of-service with a URL.
    const MAX_LIMIT = 100;
    const rawLimit = Number(searchParams.get('limit'));
    const rawOffset = Number(searchParams.get('offset'));
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT) : 10;
    const offset = Number.isFinite(rawOffset) ? Math.max(Math.trunc(rawOffset), 0) : 0;

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Members-only listings never reach logged-out callers (this route backs the search bar)
    if (!(await viewerCanSeeMembersOnly(supabase))) {
      query = publicListingsOnly(query);
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by search term
    if (search) {
      query = query.or(buildSearchFilter(search, category && category !== 'all' ? category : 'all', !category || category === 'all'));
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, count, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? (offset + limit < count) : false
      }
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
