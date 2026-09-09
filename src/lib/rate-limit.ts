/**
 * A small fixed-window rate limiter for the public API routes.
 *
 * Every endpoint a logged-out visitor can reach was previously unmetered, and several of
 * them cost real money or real quota per call: /api/newsletter/subscribe sends an email
 * through Resend, /api/character-info calls Gemini, /api/custom-orders writes a 5 MB file
 * to Supabase Storage, /api/reviews inserts a row with the service-role key. On a free
 * tier, a few thousand scripted requests is the difference between a working shop and a
 * suspended project — and the newsletter route will happily mail a stranger's address on
 * repeat, which is how a domain gets a spam reputation.
 *
 * ## What this is not
 *
 * The counters live in the process's memory. On Netlify or Vercel each serverless
 * instance keeps its own, so the real ceiling is roughly `limit x instances`, and a cold
 * start forgets everything. That makes this a cost-control measure and a brake on casual
 * abuse — NOT a defence against a distributed attack, and not a substitute for the
 * server-side validation each route does anyway.
 *
 * If the shop outgrows that, swap the Map for Upstash Redis or Supabase — `check()` is
 * the only function callers touch, so the change stays inside this file.
 */

import { NextResponse } from 'next/server';

interface Window {
  count: number;
  /** Epoch ms at which this window expires and the count resets. */
  resetAt: number;
}

const buckets = new Map<string, Window>();

/** Stop the Map growing without bound in a long-lived process. */
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number): void {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Best-effort client identity.
 *
 * `x-forwarded-for` is the only signal available behind Netlify/Vercel, and it is
 * client-supplied — trivially spoofed by anyone who wants to. It still separates
 * ordinary repeat callers from one another, which is what the limit is for. The first
 * entry is the original client; the rest are proxies.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const realIp = request.headers.get('x-real-ip') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || realIp.trim() || 'unknown';
  return `${scope}:${ip}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets — the value for a Retry-After header. */
  retryAfter: number;
}

/**
 * Counts one hit against `key`.
 *
 * @param limit    how many requests are allowed per window
 * @param windowMs how long the window lasts
 */
export function check(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

/**
 * The shape every route uses: returns a ready-to-send 429 when the caller is over the
 * limit, or `null` to carry on.
 *
 * ```ts
 * const limited = enforce(request, 'newsletter-subscribe', 5, 60_000);
 * if (limited) return limited;
 * ```
 *
 * The message is deliberately vague about the limit — telling a script exactly how many
 * requests it has left, and exactly when to resume, only makes it easier to pace.
 */
export function enforce(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
  message = 'Too many requests. Please slow down and try again shortly.',
): NextResponse | null {
  const result = check(clientKey(request, scope), limit, windowMs);
  if (result.allowed) return null;

  return NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
  );
}

/** Exposed so tests can start from a clean slate. Not for production use. */
export function __resetForTests(): void {
  buckets.clear();
}
