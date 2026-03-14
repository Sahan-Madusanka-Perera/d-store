import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: wishlistItems, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        added_at,
        notify_on_available,
        products (
          id,
          name,
          description,
          price,
          category,
          stock,
          status,
          image_url,
          image_urls,
          author,
          brand,
          publisher,
          series,
          character_names
        )
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Wishlist fetch error:', error);
      throw error;
    }

    return NextResponse.json({ wishlistItems: wishlistItems || [] });
  } catch (error) {
    console.error('Wishlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation — already in wishlist
        return NextResponse.json(
          { error: 'Product already in wishlist' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ wishlistItem: data }, { status: 201 });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
