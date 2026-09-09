/**
 * Shared SEO helpers.
 *
 * One definition of the site's canonical origin and its default social card, so a page
 * that forgets to set something still gets sensible values rather than Next's defaults
 * (which are a relative URL and no image at all).
 */

import { BRAND_NAME, BRAND_TAGLINE, SOCIAL_LINKS } from '@/lib/constants';

/**
 * The canonical origin, with no trailing slash.
 *
 * Every absolute URL the site emits — canonical tags, Open Graph images, the sitemap,
 * JSON-LD — is built from this. Getting it wrong does not break the site visibly; it
 * quietly points Google at the wrong host, which is worse. Netlify sets URL to the
 * production domain, so that is the fallback before localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

/** Absolute URL for a path, since Open Graph and JSON-LD both reject relative ones. */
export function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * The card shown when a link is pasted into WhatsApp, Facebook or Instagram DMs.
 *
 * For a Sri Lankan shop this matters more than it looks: most of the traffic that is not
 * search arrives through a shared link, and a link with no image is a link nobody taps.
 *
 * NOTE: public/og-default.jpg does not exist yet. Until it does, shared links fall back
 * to no image at all. It needs to be a real 1200x630 JPG or PNG — the transparent-
 * background logo is the wrong asset for this, since most clients composite an OG card
 * onto white and some onto dark. See SEO.md.
 */
export const DEFAULT_OG_IMAGE = absoluteUrl('/og-default.jpg');

/** Locale used for Open Graph. Sri Lanka, English. */
export const OG_LOCALE = 'en_LK';

/**
 * Organization schema, emitted once on the homepage.
 *
 * This is what lets Google associate the brand name with the site, the logo and the
 * social profiles — the difference between "dstorelk.com" appearing as a bare URL and
 * appearing as a named business with a logo in the results.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: BRAND_NAME,
    description: BRAND_TAGLINE,
    url: SITE_URL,
    logo: absoluteUrl('/Logo.Trns.png'),
    image: DEFAULT_OG_IMAGE,
    sameAs: SOCIAL_LINKS.map(link => link.href),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'LK',
      addressRegion: 'Western Province',
    },
    // Only currencies the shop actually prices in.
    currenciesAccepted: 'LKR',
    paymentAccepted: 'Bank Transfer',
  };
}

/**
 * WebSite schema with a search action, which is what can earn a sitelinks search box in
 * the results. Harmless if Google chooses not to show one.
 */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Maps the product `status` column onto the schema.org availability vocabulary. */
export function availabilityFor(status: string | null | undefined, stock: number): string {
  if (status === 'pre_order') return 'https://schema.org/PreOrder';
  if (status === 'coming_soon') return 'https://schema.org/PreOrder';
  if (status === 'out_of_stock' || stock <= 0) return 'https://schema.org/OutOfStock';
  return 'https://schema.org/InStock';
}

export interface ProductJsonLdInput {
  id: string | number;
  name: string;
  description?: string | null;
  price: number;
  images: string[];
  category?: string | null;
  brand?: string | null;
  author?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  series?: string | null;
  stock: number;
  status?: string | null;
  externalRating?: number | null;
  externalRatingCount?: number | null;
}

/**
 * Product schema — the highest-value structured data on the site.
 *
 * This is what puts the price, the availability and the star rating directly into the
 * search result rather than leaving it as a plain blue link. For a shop competing on
 * "buy X in Sri Lanka" queries, that is most of the click-through difference.
 *
 * `aggregateRating` is included ONLY when a genuine external rating exists. Google's
 * structured data policy treats invented review data as a manual-action offence, and the
 * site used to fabricate exactly that — see the ratings note in SECURITY.md. If there is
 * no real rating, the key is omitted entirely rather than defaulted.
 */
export function productJsonLd(product: ProductJsonLdInput) {
  const url = absoluteUrl(`/products/${product.id}`);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: product.name,
    url,
    image: product.images.length > 0 ? product.images : [DEFAULT_OG_IMAGE],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'LKR',
      price: product.price.toFixed(2),
      availability: availabilityFor(product.status, product.stock),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND_NAME },
    },
  };

  if (product.description) schema.description = product.description;
  if (product.series) schema.isPartOf = product.series;
  if (product.isbn) schema.isbn = product.isbn;

  // `brand` is the manufacturer for a figure, the publisher for a book.
  const brand = product.brand || product.publisher;
  if (brand) schema.brand = { '@type': 'Brand', name: brand };
  if (product.author) schema.author = { '@type': 'Person', name: product.author };

  if (
    product.externalRating &&
    product.externalRatingCount &&
    product.externalRatingCount > 0
  ) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.externalRating).toFixed(1),
      reviewCount: product.externalRatingCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/** Breadcrumb trail, which Google renders in place of the raw URL under a result. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Renders a JSON-LD block.
 *
 * JSON.stringify escapes nothing that matters for HTML, so `<` in a product description
 * could close the script tag early. Replacing it with the unicode escape is the standard
 * guard and is invisible to the parser.
 */
export function jsonLdScript(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
