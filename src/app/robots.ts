import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt, generated.
 *
 * While the pre-launch gate is up, crawling stays open apart from the private paths. That
 * is what lets Google follow `/` — the one URL it already knows — through its redirect to
 * /coming-soon, and fetch the /_next/ CSS and JS it needs to render the splash. An
 * earlier version disallowed everything but /coming-soon, which blocked both.
 *
 * The catalogue stays out of the index without a disallow: nothing on the splash links
 * into it, and the gated sitemap lists only the splash.
 *
 * Like the middleware's own COMING_SOON read, this is evaluated at build time on Netlify.
 * Flipping the variable needs a redeploy before robots.txt changes.
 */

// Nothing here should ever appear in a search result, gate or no gate.
const PRIVATE_PATHS = [
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
];

export default function robots(): MetadataRoute.Robots {
  const comingSoon = process.env.COMING_SOON === 'true';

  if (comingSoon) {
    return {
      rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS }],
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...PRIVATE_PATHS,
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
