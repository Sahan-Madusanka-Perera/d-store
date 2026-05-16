import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('nav_categories')
    .select('*, dropdown_items:nav_dropdown_items(*)')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(categories || []);
}
