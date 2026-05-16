import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  await requireAdmin();
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('nav_dropdown_items')
    .insert({
      category_id: body.category_id,
      label: body.label,
      href: body.href || `/${body.label.toLowerCase().replace(/\s+/g, '-')}`,
      sort_order: body.sort_order || 0
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
