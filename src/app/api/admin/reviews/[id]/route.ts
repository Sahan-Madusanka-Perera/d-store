import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  REVIEW_SOURCES,
  REVIEW_STATUSES,
  cleanText,
  reviewsAdminClient,
} from '@/lib/reviews';

/** Edit, moderate or delete a single review. Admin only. */

const MAX_NAME = 80;
const MAX_BODY = 2000;

function unauthorized(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return message.includes('Access denied') || message.includes('Authentication');
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const admin = reviewsAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 503 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Build the patch from known fields only — anything else in the body is ignored,
    // so a stray key can never reach the table.
    const patch: Record<string, unknown> = {};

    if (payload.author_name !== undefined) {
      const name = cleanText(payload.author_name, MAX_NAME);
      if (!name) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
      patch.author_name = name;
    }

    if (payload.body !== undefined) {
      const body = cleanText(payload.body, MAX_BODY);
      if (!body) return NextResponse.json({ error: 'Review text cannot be empty.' }, { status: 400 });
      patch.body = body;
    }

    if (payload.rating !== undefined) {
      const rating = Number(payload.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
      }
      patch.rating = rating;
    }

    if (payload.status !== undefined) {
      if (!REVIEW_STATUSES.includes(payload.status)) {
        return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
      }
      patch.status = payload.status;
    }

    if (payload.source !== undefined) {
      if (!REVIEW_SOURCES.includes(payload.source)) {
        return NextResponse.json({ error: 'Unknown source.' }, { status: 400 });
      }
      patch.source = payload.source;
    }

    if (payload.source_url !== undefined) {
      patch.source_url = cleanText(payload.source_url, 500) || null;
    }

    if (payload.reviewed_on !== undefined) {
      patch.reviewed_on = payload.reviewed_on || null;
    }

    if (payload.display_order !== undefined) {
      patch.display_order =
        payload.display_order === '' || payload.display_order === null
          ? null
          : Number(payload.display_order);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('reviews')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    console.error('[REVIEWS] Admin update failed:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const admin = reviewsAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 503 });
    }

    const { error } = await admin.from('reviews').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Review deleted.' });
  } catch (error: unknown) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    console.error('[REVIEWS] Admin delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
