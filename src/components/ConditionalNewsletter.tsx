'use client';

import { usePathname } from 'next/navigation';
import { Newsletter } from '@/components/sections/Newsletter';
import { InstagramFeed } from '@/components/sections/InstagramFeed';

export function ConditionalNewsletter() {
    const pathname = usePathname();

    // Hide newsletter on these routes and their sub-routes
    const hiddenRoutes = ['/admin', '/login', '/forgot-password', '/reset-password', '/auth'];

    const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));

    if (shouldHide) {
        return null;
    }

    return (
        <div className="w-full flex-col flex relative z-10 pb-16">
            <div className="w-full px-4 md:px-8 max-w-7xl mx-auto mt-24 mb-16 sm:mb-24">
                <InstagramFeed />
            </div>
            {/* The negative margin makes it overlap the footer which is conceptually directly after this component */}
            <div className="w-full px-4 md:px-8 max-w-7xl mx-auto relative z-10 -mb-32 sm:-mb-40 md:-mb-48">
                <Newsletter />
            </div>
        </div>
    );
}
