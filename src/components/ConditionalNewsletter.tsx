'use client';

import { usePathname } from 'next/navigation';
import { Newsletter } from '@/components/sections/Newsletter';

export function ConditionalNewsletter() {
    const pathname = usePathname();

    // Hide newsletter on these routes and their sub-routes
    const hiddenRoutes = ['/admin', '/login', '/forgot-password', '/reset-password', '/auth'];

    const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));

    if (shouldHide) {
        return null;
    }

    return <Newsletter />;
}
