import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('nav_categories')
    .select('*, dropdown_items:nav_dropdown_items(*)')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
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
}
