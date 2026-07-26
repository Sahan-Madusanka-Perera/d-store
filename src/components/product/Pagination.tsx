'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/**
 * Page links preserve every other search param, so paging never silently drops the
 * visitor's filters or sort. Rendered as real anchors rather than buttons: they are
 * navigations, so they should be middle-clickable, shareable and crawlable.
 */
export default function Pagination({ currentPage, totalPages, totalItems, pageSize }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete('page');
    else params.set('page', String(page));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // A sliding window keeps the control a fixed width however many pages exist.
  const windowSize = 5;
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  const box = 'inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3.5 text-sm font-semibold transition-colors';

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
        Showing {firstItem}&ndash;{lastItem} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {currentPage > 1 ? (
          <Link href={hrefFor(currentPage - 1)} rel="prev" aria-label="Previous page"
                className={`${box} border-border bg-card hover:border-foreground`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span aria-disabled="true" className={`${box} border-border bg-muted/40 text-muted-foreground/40`}>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {start > 1 && (
          <>
            <Link href={hrefFor(1)} className={`${box} border-border bg-card hover:border-foreground`}>1</Link>
            {start > 2 && <span className="px-1 text-muted-foreground">&hellip;</span>}
          </>
        )}

        {pages.map(page => (
          page === currentPage ? (
            <span key={page} aria-current="page"
                  className={`${box} border-foreground bg-foreground text-background`}>
              {page}
            </span>
          ) : (
            <Link key={page} href={hrefFor(page)} aria-label={`Page ${page}`}
                  className={`${box} border-border bg-card hover:border-foreground`}>
              {page}
            </Link>
          )
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-muted-foreground">&hellip;</span>}
            <Link href={hrefFor(totalPages)} className={`${box} border-border bg-card hover:border-foreground`}>
              {totalPages}
            </Link>
          </>
        )}

        {currentPage < totalPages ? (
          <Link href={hrefFor(currentPage + 1)} rel="next" aria-label="Next page"
                className={`${box} border-border bg-card hover:border-foreground`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span aria-disabled="true" className={`${box} border-border bg-muted/40 text-muted-foreground/40`}>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
