'use client';

import { useState } from 'react';
import { Star, Check, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Customer-facing review submission.
 *
 * Collapsed to a single button until asked for — the reviews section is something most
 * visitors read rather than write, and an always-open form pushes the reviews
 * themselves below the fold for everyone in order to serve the few.
 *
 * Nothing submitted here appears on the site until an admin publishes it, and the form
 * says so: a review that silently vanishes reads as a bug.
 */
export default function ReviewForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;

    if (rating === 0) {
      setStatus('error');
      setMessage('Please choose a star rating.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, body, rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStatus('done');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'done') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-600/20 bg-emerald-50 px-6 py-5 text-center dark:border-emerald-400/20 dark:bg-emerald-500/10">
        <Check className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">{message}</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="flex justify-center">
        <Button variant="outline" size="lg" onClick={() => setIsOpen(true)}>
          <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
          Write a review
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-foreground">Write a review</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Reviews are checked before they go up, so yours won&apos;t appear straight away.
      </p>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-foreground">Your rating</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              aria-pressed={rating === n}
              className="rounded p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  n <= (hovered || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/40'
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="review-name" className="mb-1.5 block text-sm font-semibold text-foreground">
          Your name
        </label>
        <input
          id="review-name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={80}
          placeholder="How you'd like to be shown"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="review-body" className="mb-1.5 block text-sm font-semibold text-foreground">
          Your review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
          rows={4}
          minLength={10}
          maxLength={2000}
          placeholder="What did you order, and how did it go?"
          className="w-full rounded-lg border border-border bg-background p-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{body.length}/2000</p>
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {message}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            'Submit review'
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
