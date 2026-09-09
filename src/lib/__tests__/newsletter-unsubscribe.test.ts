import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  buildUnsubscribeUrl,
} from '../newsletter-unsubscribe';

/**
 * The unsubscribe token is the only thing authorising a write that happens with the
 * service-role key and no session. If it can be forged, anyone can unsubscribe anyone —
 * which for a bulk sender means a competitor can quietly empty your list.
 */

const ORIGINAL_SECRET = process.env.NEWSLETTER_SECRET;

describe('unsubscribe tokens', () => {
  beforeEach(() => {
    process.env.NEWSLETTER_SECRET = 'test-secret-value-for-signing';
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) delete process.env.NEWSLETTER_SECRET;
    else process.env.NEWSLETTER_SECRET = ORIGINAL_SECRET;
  });

  it('verifies a token it just signed', () => {
    const email = 'reader@example.com';
    expect(verifyUnsubscribeToken(email, signUnsubscribeToken(email))).toBe(true);
  });

  it('is deterministic, so a link stays valid across sends', () => {
    expect(signUnsubscribeToken('a@b.com')).toBe(signUnsubscribeToken('a@b.com'));
  });

  it('refuses a token issued for a different address', () => {
    const token = signUnsubscribeToken('victim@example.com');
    expect(verifyUnsubscribeToken('attacker@example.com', token)).toBe(false);
  });

  it('refuses a tampered token', () => {
    const email = 'reader@example.com';
    const token = signUnsubscribeToken(email);

    expect(verifyUnsubscribeToken(email, token.slice(0, -1))).toBe(false);
    expect(verifyUnsubscribeToken(email, `${token}x`)).toBe(false);
    expect(verifyUnsubscribeToken(email, token.replace(/^./, c => (c === 'a' ? 'b' : 'a')))).toBe(false);
  });

  it('refuses empty input rather than treating it as a match', () => {
    expect(verifyUnsubscribeToken('', '')).toBe(false);
    expect(verifyUnsubscribeToken('a@b.com', '')).toBe(false);
    expect(verifyUnsubscribeToken('', 'token')).toBe(false);
  });

  it('normalises case and whitespace, matching how the address is stored', () => {
    // Subscribe lowercases before insert. If signing did not, a link mailed to
    // "Foo@Example.com" would never verify against the stored "foo@example.com".
    const canonical = signUnsubscribeToken('foo@example.com');
    expect(signUnsubscribeToken('  FOO@Example.COM  ')).toBe(canonical);
  });

  it('produces a different token when the secret changes', () => {
    const before = signUnsubscribeToken('a@b.com');
    process.env.NEWSLETTER_SECRET = 'a-completely-different-secret';
    expect(signUnsubscribeToken('a@b.com')).not.toBe(before);
  });

  it('throws rather than signing with no secret configured', () => {
    delete process.env.NEWSLETTER_SECRET;
    const previousNextAuth = process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;

    // Silently signing with an empty key would produce tokens anyone could reproduce.
    expect(() => signUnsubscribeToken('a@b.com')).toThrow(/NEWSLETTER_SECRET/);

    if (previousNextAuth !== undefined) process.env.NEXTAUTH_SECRET = previousNextAuth;
  });

  it('builds a URL with both parameters escaped', () => {
    const url = new URL(buildUnsubscribeUrl('a+tag@example.com', 'https://d-store.lk'));

    expect(url.pathname).toBe('/api/newsletter/unsubscribe');
    // The '+' must survive as part of the address rather than decoding to a space.
    expect(url.searchParams.get('email')).toBe('a+tag@example.com');
    expect(verifyUnsubscribeToken('a+tag@example.com', url.searchParams.get('token')!)).toBe(true);
  });
});
