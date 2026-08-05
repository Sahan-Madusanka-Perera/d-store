import { createClient } from '@supabase/supabase-js';

/**
 * Shared vocabulary for customer reviews — see database/setup-reviews.sql.
 *
 * The storefront never writes to this table directly. Submissions and admin edits both
 * go through API routes using the service-role client below, because RLS cannot stop a
 * visitor putting `status: 'published'` in an insert payload — only server code that
 * ignores the client's value can.
 */

export const REVIEW_STATUSES = ['pending', 'published', 'hidden'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_SOURCES = [
  'site',
  'facebook',
  'google',
  'instagram',
  'whatsapp',
  'tiktok',
  'other',
] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

/** Labels for the source badge on a review card and the admin dropdown. */
export const REVIEW_SOURCE_LABEL: Record<ReviewSource, string> = {
  site: 'D-Store',
  facebook: 'Facebook',
  google: 'Google',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  other: 'Elsewhere',
};

export interface Review {
  id: string;
  author_name: string;
  body: string;
  rating: number;
  source: ReviewSource;
  source_url: string | null;
  status: ReviewStatus;
  reviewed_on: string;
  display_order: number | null;
  submitter_email: string | null;
  created_at: string;
  updated_at: string;
}

/** What the storefront is allowed to see. Never expose submitter_email publicly. */
export type PublicReview = Pick<
  Review,
  'id' | 'author_name' | 'body' | 'rating' | 'source' | 'source_url' | 'reviewed_on'
>;

export const PUBLIC_REVIEW_FIELDS =
  'id, author_name, body, rating, source, source_url, reviewed_on';

/**
 * Service-role client. Server-only — this key must never reach the client bundle.
 * Returns null when unconfigured so callers can degrade instead of throwing.
 */
export function reviewsAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('[REVIEWS] SUPABASE_SERVICE_ROLE_KEY is not set.');
    return null;
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * "2 weeks ago" style, derived from the review's own date rather than stored as text —
 * the old hardcoded reviews had the age baked into a string, so they were quietly
 * getting staler every month while still claiming "2 weeks ago".
 */
export function relativeDate(isoDate: string): string {
  const then = new Date(`${isoDate}T00:00:00Z`).getTime();
  if (Number.isNaN(then)) return '';

  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
  if (days <= 1) return 'Today';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? 'A year ago' : `${years} years ago`;
}

/** Trim, collapse runs of whitespace, and cap — applied to everything before it is stored. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}
