import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { enforce } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = enforce(request, 'upload-slip', 10, 10 * 60_000,
      'Too many uploads. Please wait a few minutes and try again.');
    if (limited) return limited;

    const supabase = await createClient();
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify this order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Parse the form data to get the file
    const formData = await request.formData();
    const file = formData.get('slip') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type. The map doubles as the extension source below.
    const allowedTypes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
    };
    const fileExt = allowedTypes[file.type];
    if (!fileExt) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // One order does not need an unbounded pile of slips, and each one is a 5 MB object
    // on a 1 GB free tier. A handful covers a genuine re-upload after a bad photo.
    const { count: existingSlips } = await supabase
      .from('bank_slips')
      .select('id', { count: 'exact', head: true })
      .eq('order_id', orderId);

    if ((existingSlips ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'This order already has several slips. Please contact us on WhatsApp instead.' },
        { status: 409 }
      );
    }

    // The path's first segment is the order id — the storage policy in
    // database/harden-security.sql joins on it to decide who may read the object.
    const fileName = `${orderId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bank-slips')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get a signed URL since the bucket is private (expires in 1 year)
    const { data: signedData, error: signError } = await supabase.storage
      .from('bank-slips')
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 year

    if (signError) {
      console.error('Sign URL error:', signError);
      return NextResponse.json({ error: 'Failed to generate file URL' }, { status: 500 });
    }

    const fileUrl = signedData.signedUrl;

    // Create bank_slips record
    const uploadedVia = (formData.get('uploaded_via') as string) || 'website';

    const { data: slip, error: slipError } = await supabase
      .from('bank_slips')
      .insert({
        order_id: orderId,
        slip_url: fileUrl,
        uploaded_via: uploadedVia,
        status: 'pending',
      })
      .select('*')
      .single();

    if (slipError) {
      console.error('Bank slip record error:', slipError);
      return NextResponse.json({ error: 'Failed to save slip record' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Bank slip uploaded successfully',
      slip,
    });
  } catch (error: unknown) {
    console.error('Error uploading slip:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
