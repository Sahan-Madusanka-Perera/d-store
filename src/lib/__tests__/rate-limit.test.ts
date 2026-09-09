import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { check, clientKey, enforce, __resetForTests } from '../rate-limit';

describe('rate limiter', () => {
  beforeEach(() => {
    __resetForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the limit and refuses the next one', () => {
    for (let i = 0; i < 3; i++) {
      expect(check('k', 3, 60_000).allowed, `request ${i + 1} should be allowed`).toBe(true);
    }
    expect(check('k', 3, 60_000).allowed).toBe(false);
  });

  it('counts down the remaining allowance', () => {
    expect(check('k', 3, 60_000).remaining).toBe(2);
    expect(check('k', 3, 60_000).remaining).toBe(1);
    expect(check('k', 3, 60_000).remaining).toBe(0);
    expect(check('k', 3, 60_000).remaining).toBe(0);
  });

  it('resets once the window has passed', () => {
    check('k', 1, 60_000);
    expect(check('k', 1, 60_000).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(check('k', 1, 60_000).allowed).toBe(true);
  });

  it('keeps separate counters per key', () => {
    check('a', 1, 60_000);
    expect(check('a', 1, 60_000).allowed).toBe(false);
    expect(check('b', 1, 60_000).allowed).toBe(true);
  });

  it('reports a retry-after inside the window', () => {
    check('k', 1, 60_000);
    const result = check('k', 1, 60_000);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });
});

describe('clientKey', () => {
  const req = (headers: Record<string, string>) => new Request('https://d-store.lk/api/x', { headers });

  it('uses the first address in x-forwarded-for', () => {
    // The first entry is the original client; the rest are proxies that appended
    // themselves. Keying on the last would put every visitor behind one CDN node in
    // the same bucket.
    expect(clientKey(req({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 10.0.0.2' }), 's'))
      .toBe('s:1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    expect(clientKey(req({ 'x-real-ip': '9.9.9.9' }), 's')).toBe('s:9.9.9.9');
  });

  it('still returns a key when no address header is present', () => {
    expect(clientKey(req({}), 's')).toBe('s:unknown');
  });

  it('separates scopes so one endpoint cannot exhaust another', () => {
    const headers = { 'x-forwarded-for': '1.2.3.4' };
    expect(clientKey(req(headers), 'newsletter')).not.toBe(clientKey(req(headers), 'reviews'));
  });
});

describe('enforce', () => {
  beforeEach(() => __resetForTests());

  const req = () => new Request('https://d-store.lk/api/x', {
    headers: { 'x-forwarded-for': '5.5.5.5' },
  });

  it('returns null while under the limit', () => {
    expect(enforce(req(), 'scope', 2, 60_000)).toBeNull();
    expect(enforce(req(), 'scope', 2, 60_000)).toBeNull();
  });

  it('returns a 429 with Retry-After once over', () => {
    enforce(req(), 'scope', 1, 60_000);
    const response = enforce(req(), 'scope', 1, 60_000);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
    expect(response!.headers.get('Retry-After')).toBeTruthy();
  });

  it('does not disclose the exact limit in the response body', async () => {
    enforce(req(), 'scope', 1, 60_000);
    const response = enforce(req(), 'scope', 1, 60_000)!;
    const body = await response.json();

    expect(body.error).not.toMatch(/\d+\s*(requests|per)/i);
  });
});
