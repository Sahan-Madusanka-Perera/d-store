import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 8;
    
    let recommendedProducts = [];
    let isPersonalized = false;
    let purchasedProductIds: string[] = [];

    // Strategy 1: History-Based Recommendations (If Authenticated)
    if (session?.user) {
      // Find past purchased series and products to exclude
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', session.user.id);

      if (!orderError && orderData && orderData.length > 0) {
        const orderIds = orderData.map((order) => order.id);

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('product_id, products ( series )')
          .in('order_id', orderIds);

        if (!itemsError && itemsData && itemsData.length > 0) {
          const pastSeries = new Set<string>();
          
          itemsData.forEach((item: any) => {
            if (item.product_id) purchasedProductIds.push(item.product_id);
            if (item.products?.series) pastSeries.add(item.products.series);
          });

          const seriesArray = Array.from(pastSeries);

          if (seriesArray.length > 0) {
            // Find products matching the series that haven't been purchased
            let query = supabase
              .from('products')
              .select('*')
              .gt('stock', 0)
              .in('series', seriesArray);
            
            if (purchasedProductIds.length > 0) {
              // Note: strictly speaking Supabase/PostgREST `not.in` needs specific syntax or can be filtered client side if minor
              // For robustness with large lists, filtering out purchased items:
              query = query.not('id', 'in', `(${purchasedProductIds.join(',')})`);
            }

            const { data: seriesProducts, error: seriesError } = await query.limit(limit);

            if (!seriesError && seriesProducts && seriesProducts.length > 0) {
              recommendedProducts = seriesProducts;
              isPersonalized = true;
            }
          }
        }
      }
    }

    // Strategy 2: Popularity-Based (Fallback)
    // If not personalized or not enough products found in series
    if (!isPersonalized || recommendedProducts.length < limit) {
      const remainingLimit = limit - recommendedProducts.length;
      
      // Since we don't have a direct "sales count" on products, we can 
      // query the most recent products or top selling mock (or a view if available).
      // Given the schema, we can approximate popularity by querying random items or
      // aggregating order_items if we had a view. Without a view or complex RPC, 
      // we'll fetch popular/recent items.
      
      let fallbackQuery = supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false }); // Fallback to newest drops as trending
      
    // Exclude already recommended items and purchased items
    const excludeIds = [
      ...recommendedProducts.map(p => p.id),
      ...purchasedProductIds
    ];
    
    if (excludeIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: fallbackProducts, error: fallbackError } = await fallbackQuery.limit(remainingLimit);

    if (fallbackError) {
      console.error("Fallback error:", fallbackError);
    }

    if (!fallbackError && fallbackProducts) {
      recommendedProducts = [...recommendedProducts, ...fallbackProducts];
    }
    }

    return NextResponse.json({
      success: true,
      products: recommendedProducts,
      isPersonalized
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch recommendations' 
    }, { status: 500 });
  }
}
