'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

/**
 * Compact signup for the pre-launch splash. Posts to the same
 * /api/newsletter/subscribe endpoint the storefront footer uses, so early interest
 * lands in the existing subscriber list and can be mailed with the launch campaign.
 *
 * Styled in literal white-on-black rather than theme tokens, because it only ever
 * renders over the splash's video backdrop — see src/app/coming-soon/page.tsx.
 */
export default function ComingSoonSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStatus('done');
      setMessage(data.message || "You're on the list.");
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={submit} className="group relative">
        <label htmlFor="notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="notify-email"
          type="email"
          required
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          disabled={status === 'loading' || status === 'done'}
          placeholder="you@example.com"
          aria-describedby={message ? 'notify-status' : undefined}
          className="h-14 w-full rounded-none border-b-2 border-white/30 bg-transparent pr-14 text-base text-white placeholder:text-white/65 transition-colors focus:border-white focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'done'}
          aria-label="Notify me at launch"
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white text-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60 disabled:hover:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === 'done' ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </form>

      <p
        id="notify-status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm font-medium ${
          status === 'error' ? 'text-red-300' : 'text-white/75'
        }`}
        style={{ textShadow: '0 1px 20px rgba(0,0,0,0.6)' }}
      >
        {message || 'Be first to know when the doors open.'}
      </p>
    </div>
  );
}
