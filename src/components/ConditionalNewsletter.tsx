'use client';

import { usePathname } from 'next/navigation';

export function ConditionalNewsletter({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide newsletter on these routes and their sub-routes
    const hiddenRoutes = ['/admin', '/login', '/forgot-password', '/reset-password', '/auth'];

    const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));

    if (shouldHide) {
        return null;
    }

    return <>{children}</>;
}
