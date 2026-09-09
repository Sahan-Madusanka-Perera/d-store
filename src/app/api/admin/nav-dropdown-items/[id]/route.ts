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


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from('nav_dropdown_items')
      .update({ 
        label: body.label, 
        href: body.href, 
        sort_order: body.sort_order,
        image_url: body.image_url 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const denied = forbidden(error);
    if (denied) return denied;
    console.error('[ADMIN NAV] Request failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from('nav_dropdown_items').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const denied = forbidden(error);
    if (denied) return denied;
    console.error('[ADMIN NAV] Request failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
