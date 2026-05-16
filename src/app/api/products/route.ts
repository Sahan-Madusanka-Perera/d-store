import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by search term
    if (search) {
      const searchSafe = search.replace(/[%_]/g, '\\$&'); // Escape special chars for LIKE
      let orQuery = `name.ilike.%${searchSafe}%,description.ilike.%${searchSafe}%,author.ilike.%${searchSafe}%,brand.ilike.%${searchSafe}%,series.ilike.%${searchSafe}%`;
      
      const exactLower = search.toLowerCase().trim();
      if (['manga'].includes(exactLower)) {
        orQuery += `,category.eq.manga`;
      }
      if (['figure', 'figures', 'anime figure', 'anime figures'].includes(exactLower)) {
        orQuery += `,category.eq.figures`;
      }
      if (['shirt', 'shirts', 'tshirt', 't-shirt', 'tshirts', 't-shirts', 'apparel', 'graphic tshirt', 'graphic tshirts'].includes(exactLower)) {
        orQuery += `,category.eq.tshirts`;
      }
      
      query = query.or(orQuery);
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

export async function POST(request: NextRequest) {
  try {
    // Admin only - Create new product
    const productData = await request.json();

    // TODO: Validate admin authentication
    // TODO: Validate product data
    // TODO: Save to database

    console.log('Creating new product:', productData);

    return NextResponse.json(
      { message: 'Product creation coming soon' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}