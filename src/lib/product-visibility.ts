import type { createClient } from '@/utils/supabase/server';

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Listings flagged `members_only` are hidden from logged-out visitors.
 *
 * The database is the real gate — see database/setup-members-only-listings.sql, where
 * an RLS policy keeps those rows out of every anonymous SELECT. The helpers here mirror
 * the same rule in application queries so product counts, empty states and related-product
 * rails line up with what the viewer can actually see.
 */

/**
 * True when the current request carries a signed-in session.
 *
 * Deliberately `getSession()` (reads the cookie) rather than `getUser()` (round-trips to
 * the Auth server on every page render). This value only decides whether to *also* filter
 * client-side; it is not the authorization decision. A forged cookie gains nothing — the
 * RLS policy validates the JWT itself and returns public rows only, so the worst case is
 * a skipped redundant filter, not leaked data.
 */
export async function viewerCanSeeMembersOnly(supabase: ServerSupabaseClient): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return Boolean(session?.user);
}

/**
 * Restricts a `products` query to publicly visible listings.
 * Call it only when {@link viewerCanSeeMembersOnly} returned false.
 */
export function publicListingsOnly<T extends { eq(column: string, value: boolean): T }>(query: T): T {
  return query.eq('members_only', false);
}
