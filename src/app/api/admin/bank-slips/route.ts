import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: slips, error } = await supabase
      .from('bank_slips')
      .select(`
        *,
        orders (
          id,
          total_amount,
          status,
          payment_method,
          shipping_address,
          created_at,
          order_items (
            id,
            quantity,
            price_at_time,
            products ( name, image_url )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bank slips:', error);
      return NextResponse.json({ error: 'Failed to fetch bank slips' }, { status: 500 });
    }

    return NextResponse.json({ slips });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Unauthorized or server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
