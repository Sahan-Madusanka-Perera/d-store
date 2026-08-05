import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Sign out, server-side.
 *
 * This is the reliable half of logging out: it runs in Node, where supabase-js behaves,
 * and it clears the auth cookies the middleware and every server component read. The
 * browser client's own signOut() hangs under Turbopack, which is why the button
 * appeared to do nothing — see src/lib/session-cookie.ts.
 *
 * Returns JSON rather than a redirect. It is called with fetch(), and a 3xx there just
 * makes the caller quietly download the login page; the caller does the navigating.
 */
export async function POST() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[AUTH] Server sign-out failed:', error.message)
    // Still 200: the caller is navigating to /login regardless, and a failure status
    // would only tempt it into blocking on a retry.
    return NextResponse.json({ ok: false, error: error.message })
  }

  return NextResponse.json({ ok: true })
}
