import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

/** requireAdmin() refuses by throwing. Answer 403 rather than letting it become a 500. */
function forbidden(error: unknown) {
  if (error instanceof Error && error.message.startsWith('Access denied')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return null;
}


export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('nav_categories')
      .select('*, dropdown_items:nav_dropdown_items(*)')
      .order('sort_order');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    const denied = forbidden(error);
    if (denied) return denied;
    console.error('[ADMIN NAV] Request failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from('nav_categories')
      .insert({ label: body.label, href: body.href || `/${body.label.toLowerCase()}`, icon_name: body.icon_name || 'ShoppingBag', sort_order: body.sort_order || 0 })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const denied = forbidden(error);
    if (denied) return denied;
    console.error('[ADMIN NAV] Request failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
