'use client';

import { usePathname } from 'next/navigation';

/**
 * The footer links across the whole storefront, which is exactly what the pre-launch
 * splash is meant to seal off — and it renders the newsletter block a second time.
 * Keep it off that page.
 *
 * Takes the footer as `children` rather than importing it. Importing a Server
 * Component into a `'use client'` module pulls it — and everything it renders — into
 * the client graph, which turned the async <InstagramFeed> into an async Client
 * Component and threw on every page carrying a footer:
 *
 *   <InstagramFeed> is an async Client Component. Only Server Components can be async.
 *
 * Passed in as children, the element is created by the server layout and arrives
 * already rendered, so the Instagram fetch stays on the server where it belongs.
 */
export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/coming-soon') return null;

  return <>{children}</>;
}
