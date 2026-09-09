import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt, generated.
 *
 * The important line is the COMING_SOON branch. While the pre-launch gate is up, the
 * middleware redirects every URL except a handful to /coming-soon — Googlebot included.
 * Letting a crawler loose on that means it discovers a few hundred product URLs that all
 * 307 to the same splash page, which is how a site teaches Google that its catalogue is
 * one page of duplicate content. Far better to say "nothing to see yet" and open up in
 * one clean move on launch day.
 *
 * Like the middleware's own COMING_SOON read, this is evaluated at build time on Netlify.
 * Flipping the variable needs a redeploy before robots.txt changes.
 */
export default function robots(): MetadataRoute.Robots {
  const comingSoon = process.env.COMING_SOON === 'true';

  if (comingSoon) {
    return {
      rules: [{ userAgent: '*', allow: '/coming-soon', disallow: '/' }],
      host: SITE_URL,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Nothing here should ever appear in a search result.
          '/admin',
          '/api/',
          '/profile',
          '/checkout',
          '/cart',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/unauthorized',
          '/auth/',
          '/success',
          '/cancel',
          '/newsletter/unsubscribe',
          // Faceted search URLs. Every combination of these is a near-duplicate of the
          // category page, and crawlers will happily enumerate all of them — spending
          // the crawl budget that should be going to product pages.
          '/*?*search=',
          '/*?*sort=',
          '/*?*page=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
