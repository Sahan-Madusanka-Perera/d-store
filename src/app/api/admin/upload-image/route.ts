import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export const maxDuration = 60; // Allow 60 seconds

export async function POST(req: Request) {
  try {
    await requireAdmin();
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = formData.get('bucket') as string | null;
    
    if (!file || !bucket) {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    // Convert to Buffer on the server
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });
      
    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error('API upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
