import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cleanText, reviewsAdminClient } from '@/lib/reviews';

/**
 * Public review submission.
 *
 * Everything that decides visibility is set here, not taken from the request: status is
 * always 'pending' and source is always 'site'. A submission is a request to be
 * published, never an act of publishing — see database/setup-reviews.sql.
 */

const MAX_NAME = 80;
const MAX_BODY = 2000;

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const authorName = cleanText(payload.authorName, MAX_NAME);
    const body = cleanText(payload.body, MAX_BODY);
    const rating = Number(payload.rating);

    if (!authorName) {
      return NextResponse.json({ error: 'Please add your name.' }, { status: 400 });
    }
    if (body.length < 10) {
      return NextResponse.json(
        { error: 'Please write a little more — at least 10 characters.' },
        { status: 400 },
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please choose a rating from 1 to 5.' }, { status: 400 });
    }

    const admin = reviewsAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'Reviews are temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    // Attribute to the signed-in customer when there is one, so the admin can tell a
    // real account from an anonymous submission. Guests may still review.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await admin.from('reviews').insert([
      {
        author_name: authorName,
        body,
        rating,
        source: 'site',
        status: 'pending',
        submitted_by: user?.id ?? null,
        submitter_email: user?.email ?? (cleanText(payload.email, 160) || null),
      },
    ]);

    if (error) {
      console.error('[REVIEWS] Submission insert failed:', error);
      throw error;
    }

    return NextResponse.json(
      { message: 'Thanks! Your review has been sent and will appear once we approve it.' },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('[REVIEWS] Submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong sending your review.' },
      { status: 500 },
    );
  }
}
