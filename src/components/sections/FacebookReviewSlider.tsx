'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { REVIEW_SOURCE_LABEL, relativeDate, type PublicReview } from '@/lib/reviews';

/**
 * Customer review slider.
 *
 * Changes worth knowing about, since each was a defect rather than taste:
 *  - The average was the hardcoded string "5.0". It is computed now, so a 3-star review
 *    can no longer sit beneath a headline claiming a perfect score.
 *  - Review text was `line-clamp-5` and italic. Truncating the one thing a reader came
 *    for, with no way to expand, is worse than an uneven row; cards now stretch to the
 *    tallest and show the review in full, upright.
 *  - The body used `text-muted-foreground` while the name got `text-foreground`, which
 *    inverted the hierarchy — the review matters more than who signed it.
 *  - Avatars were an indigo→purple gradient that appears nowhere else on the site.
 */

interface CustomerReviewSliderProps {
  reviews: PublicReview[];
}

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`${className} ${
            n <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/30'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function CustomerReviewSlider({ reviews }: CustomerReviewSliderProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    const timer = setTimeout(updateScrollButtons, 100);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      clearTimeout(timer);
    };
  }, [reviews, updateScrollButtons]);

  // Real average, to one decimal, from the reviews actually on screen.
  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -368 : 368, behavior: 'smooth' });
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="w-full overflow-hidden rounded-[2rem] border border-border bg-muted/30 md:rounded-[2.5rem]"
    >
      <div className="flex flex-col gap-8 p-6 sm:p-8 md:p-12">
        {/* The score is the credential, so it sits level with the heading rather than
            under an all-caps eyebrow. */}
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="reviews-heading"
              className="text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl"
            >
              What our customers say
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {reviews.length} review{reviews.length === 1 ? '' : 's'} from shoppers across Sri Lanka
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl font-black leading-none tabular-nums text-foreground">
              {average.toFixed(1)}
            </span>
            <div className="flex flex-col gap-1">
              <Stars rating={Math.round(average)} />
              <span className="text-xs text-muted-foreground">out of 5</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous reviews"
            className={`absolute left-2 top-1/2 z-sticky flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-opacity duration-200 hover:bg-foreground hover:text-background sm:left-0 sm:-translate-x-1/2 ${
              canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          </button>

          <button
            onClick={() => scroll('right')}
            aria-label="More reviews"
            className={`absolute right-2 top-1/2 z-sticky flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-opacity duration-200 hover:bg-foreground hover:text-background sm:right-0 sm:translate-x-1/2 ${
              canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          </button>

          {/* items-stretch so every card matches the tallest — the alternative was
              clamping the review text, which hides the content people came to read. */}
          <ul
            ref={scrollRef}
            className="hide-scrollbar -mx-4 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-4 pb-4 pt-1 sm:mx-0 sm:px-0"
          >
            {reviews.map(review => (
              <li
                key={review.id}
                className="flex w-[290px] shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:w-[340px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Stars rating={review.rating} />
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {REVIEW_SOURCE_LABEL[review.source]}
                  </span>
                </div>

                <Quote className="mt-4 h-5 w-5 shrink-0 text-muted-foreground/30" aria-hidden="true" />

                {/* The review itself is the primary content: full text, foreground colour. */}
                <p className="mt-2 flex-1 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
                  {review.body}
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold uppercase text-background"
                  >
                    {review.author_name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{review.author_name}</p>
                    <p className="text-xs text-muted-foreground">{relativeDate(review.reviewed_on)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
