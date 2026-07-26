'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

/**
 * The footer links across the whole storefront, which is exactly what the pre-launch
 * splash is meant to seal off — and it renders the newsletter block a second time.
 * Keep it off that page.
 */
export function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === '/coming-soon') return null;

  return <Footer />;
}
