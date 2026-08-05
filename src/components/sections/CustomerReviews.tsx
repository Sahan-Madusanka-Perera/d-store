import { createClient } from '@/utils/supabase/server';
import { PUBLIC_REVIEW_FIELDS, type PublicReview } from '@/lib/reviews';
import { CustomerReviewSlider } from './FacebookReviewSlider';
import ReviewForm from './ReviewForm';

/**
 * Published customer reviews.
 *
 * Reads straight from the table with the anon key — the RLS policy on `reviews` only
 * exposes `status = 'published'`, so there is nothing to filter for here beyond the
 * ordering, and a pending submission cannot leak through this path.
 *
 * Renders nothing if the table is missing (the migration has not been run yet) rather
 * than taking the footer down with it.
 */
export async function CustomerReviews() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(PUBLIC_REVIEW_FIELDS)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('reviewed_on', { ascending: false })
    .limit(24);

  if (error) {
    console.error('[REVIEWS] Could not load published reviews:', error.message);
    return null;
  }

  const reviews = (data ?? []) as PublicReview[];
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-8">
      <CustomerReviewSlider reviews={reviews} />
      <ReviewForm />
    </div>
  );
}
