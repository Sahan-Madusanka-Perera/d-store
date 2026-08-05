import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  REVIEW_SOURCES,
  REVIEW_STATUSES,
  cleanText,
  reviewsAdminClient,
  type ReviewSource,
  type ReviewStatus,
} from '@/lib/reviews';

/**
 * Admin review management: list everything, and create a review on the shop's behalf.
 *
 * The create path is what lets an owner paste a review from Facebook or Google and
 * attribute it honestly — source, the original date and a link back to the post are all
 * settable, so a card never implies a review was written here when it was not.
 */

const MAX_NAME = 80;
const MAX_BODY = 2000;

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const admin = reviewsAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 503 });
    }

    const status = new URL(request.url).searchParams.get('status');

    let query = admin
      .from('reviews')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('reviewed_on', { ascending: false });

    if (status && REVIEW_STATUSES.includes(status as ReviewStatus)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Access denied') || message.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('[REVIEWS] Admin list failed:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const admin = reviewsAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 503 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const authorName = cleanText(payload.author_name, MAX_NAME);
    const body = cleanText(payload.body, MAX_BODY);
    const rating = Number(payload.rating);

    if (!authorName || !body) {
      return NextResponse.json({ error: 'Name and review text are required.' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const source: ReviewSource = REVIEW_SOURCES.includes(payload.source)
      ? payload.source
      : 'other';
    const status: ReviewStatus = REVIEW_STATUSES.includes(payload.status)
      ? payload.status
      : 'published';

    const { data, error } = await admin
      .from('reviews')
      .insert([
        {
          author_name: authorName,
          body,
          rating,
          source,
          source_url: cleanText(payload.source_url, 500) || null,
          status,
          // Admin-entered rows carry the original review's date, not today's.
          reviewed_on: payload.reviewed_on || new Date().toISOString().slice(0, 10),
          display_order:
            payload.display_order === '' || payload.display_order == null
              ? null
              : Number(payload.display_order),
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Access denied') || message.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('[REVIEWS] Admin create failed:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
