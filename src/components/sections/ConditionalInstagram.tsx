'use client';

import { usePathname } from 'next/navigation';

export function ConditionalInstagram({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Only show Instagram section on these pages
    const allowedRoutes = ['/', '/manga', '/figures', '/tshirts', '/products'];

    const shouldShow = allowedRoutes.some((route) => {
        if (route === '/') return pathname === '/';
        return pathname === route; // exact match only, not sub-routes like /products/123
    });

    if (!shouldShow) {
        return null;
    }

    return <>{children}</>;
}
