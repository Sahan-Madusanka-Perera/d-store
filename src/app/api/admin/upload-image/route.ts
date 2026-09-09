import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth';

export const maxDuration = 60; // Allow 60 seconds

/**
 * Admin image upload.
 *
 * Three things were taken on trust here and are not any more:
 *
 *   - `bucket` came straight from the form and was passed to Supabase unchecked, so a
 *     malformed admin panel (or a mistyped field) could write into any bucket in the
 *     project, `bank-slips` included.
 *   - The file's type was never checked. An SVG is an image to every file picker and a
 *     script host to every browser, and these buckets are public: uploading one gives
 *     you a stored-XSS payload on your own domain, served with your own certificate.
 *   - The extension came from `file.name`, which the client controls end to end.
 *
 * Admin-only is not a reason to skip this. It is one compromised or careless admin
 * session away from being a public file host, and the checks cost nothing.
 */

/**
 * Buckets this route may write to. Every caller in the admin panel sends
 * 'product-images' (CarouselManager and NavCategoryManager both reuse it), so the
 * allowlist is exactly that. Add a bucket here when a caller genuinely needs one —
 * the point is that the set is closed, not that it is small.
 */
const ALLOWED_BUCKETS = new Set(['product-images']);

/** Raster formats only. SVG is deliberately absent — it can carry script. */
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket');

    if (!(file instanceof File) || typeof bucket !== 'string') {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json(
        { error: `Unknown bucket. Allowed: ${[...ALLOWED_BUCKETS].join(', ')}` },
        { status: 400 },
      );
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: 'Unsupported image type. Allowed: JPEG, PNG, WebP, GIF, AVIF.' },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'That file is empty.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 8MB.' }, { status: 400 });
    }

    const supabase = await createClient();

    // The name is ours, not the caller's: a random stem plus the extension implied by
    // the type we just validated.
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error('[UPLOAD] Supabase upload error:', error);
      return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('Access denied')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('[UPLOAD] Unexpected error:', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
