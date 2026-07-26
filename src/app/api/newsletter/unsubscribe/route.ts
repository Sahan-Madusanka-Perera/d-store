import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribeToken } from '@/lib/newsletter-unsubscribe';

/**
 * Unsubscribe from an email link — no session involved.
 *
 * GET  — a person clicked "Unsubscribe"; do the work, then hand off to
 *        /newsletter/unsubscribe for a branded confirmation.
 * POST — a mail client acting on the List-Unsubscribe-Post header (Gmail/Yahoo
 *        one-click). Must answer 200 with no page to render.
 *
 * Writes go through the service-role key because RLS scopes newsletter_subscribers
 * updates to the row's own authenticated owner, and there is no session here. The
 * HMAC token in the URL is what authorizes the change — without a valid one we never
 * touch the database. The key is server-only and must never reach the client bundle.
 */

function siteOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, '');
}

type Outcome = 'ok' | 'invalid' | 'unavailable';

async function unsubscribe(email: string, token: string): Promise<Outcome> {
  if (!email || !token || !verifyUnsubscribeToken(email, token)) return 'invalid';

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('[NEWSLETTER] SUPABASE_SERVICE_ROLE_KEY is not set — cannot process unsubscribe.');
    return 'unavailable';
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('email', email);

  if (error) {
    console.error('[NEWSLETTER] Unsubscribe update failed:', error);
    return 'unavailable';
  }

  return 'ok';
}

function readParams(request: Request) {
  const url = new URL(request.url);
  return {
    email: url.searchParams.get('email') || '',
    token: url.searchParams.get('token') || '',
  };
}

export async function GET(request: Request) {
  const { email, token } = readParams(request);
  const outcome = await unsubscribe(email, token);

  const destination = new URL('/newsletter/unsubscribe', siteOrigin(request));
  destination.searchParams.set('status', outcome);
  if (outcome === 'ok') destination.searchParams.set('email', email);

  return NextResponse.redirect(destination, { status: 303 });
}

// Gmail / Yahoo one-click unsubscribe posts here; there is no body worth parsing.
export async function POST(request: Request) {
  const { email, token } = readParams(request);
  const outcome = await unsubscribe(email, token);
  return NextResponse.json({ ok: outcome === 'ok' }, { status: outcome === 'ok' ? 200 : 400 });
}
