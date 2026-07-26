import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Unsubscribe links have to work from an inbox, with no session and no login, so the
 * link itself has to carry proof that the holder was sent that email.
 *
 * An HMAC of the address keyed on a server secret does that without a schema change or
 * a token column: the signature is deterministic (so a link stays valid across sends)
 * and unforgeable without the secret. Never expose the secret to the client.
 */

function secret(): string {
  const value = process.env.NEWSLETTER_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) {
    throw new Error(
      'Missing NEWSLETTER_SECRET (or NEXTAUTH_SECRET) — unsubscribe links cannot be signed.'
    );
  }
  return value;
}

export function signUnsubscribeToken(email: string): string {
  return createHmac('sha256', secret())
    .update(email.trim().toLowerCase())
    .digest('base64url');
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  try {
    const expected = Buffer.from(signUnsubscribeToken(email));
    const received = Buffer.from(token);
    // Compare in constant time; bail on length mismatch first since timingSafeEqual throws.
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(email: string, siteUrl: string): string {
  const token = signUnsubscribeToken(email);
  return `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
