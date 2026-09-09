import { Product } from '@/types/product';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { viewerCanSeeMembersOnly, publicListingsOnly } from '@/lib/product-visibility';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/product/AddToCartButton';
import WhatsAppInquiryButton from '@/components/product/WhatsAppInquiryButton';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfoAssistant from '@/components/product/ProductInfoAssistant';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { chip, CHIP_NUMERIC } from '@/components/ui/chip';
import { ChevronRight, Truck, Shield, Sparkles, BookOpen, Languages, Calendar, Hash, Weight, Maximize, Palette, Brush, Gift, Puzzle, Box, Battery, Factory, Info, Book, Globe, Lock, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ExternalRating from '@/components/product/ExternalRating';
import WishlistButton from '@/components/product/WishlistButton';
import { getCategoryLabel } from '@/lib/constants';
import { BUNDLE_DISCOUNT_BLURB } from '@/lib/bundle-discount';
import type { Metadata } from 'next';
import { cache, type ReactNode } from 'react';
import {
  productJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
  absoluteUrl,
  DEFAULT_OG_IMAGE,
} from '@/lib/seo';

interface DatabaseProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: 'manga' | 'figures' | 'tshirts' | 'other';
  stock: number;
  created_at: string;
  updated_at: string;
  author?: string;
  brand?: string;
  sizes?: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors?: string[];
  image_url?: string;
  image_urls?: string[];
  publisher?: string;
  series?: string;
  character_names?: string[];
  status?: string;
  members_only?: boolean;
  discount_eligible?: boolean;
  compare_at_price?: number | null;
  specifications?: Record<string, any>;
}

function mapDatabaseProduct(dbProduct: DatabaseProduct): Product {
  // Handle both single image (image_url) and multiple images (image_urls)
  let images: string[] = [];

  if (dbProduct.image_urls && Array.isArray(dbProduct.image_urls) && dbProduct.image_urls.length > 0) {
    // Use multiple images if available
    images = dbProduct.image_urls;
  } else if (dbProduct.image_url) {
    // Fall back to single image
    images = [dbProduct.image_url];
  } else {
    // Default placeholder
    images = ['/placeholder.svg'];
  }

  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    category: dbProduct.category as 'manga' | 'figures' | 'tshirts' | 'other',
    images: images,
    stock: dbProduct.stock,
    isActive: true,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    author: dbProduct.author,
    brand: dbProduct.brand,
    sizes: dbProduct.sizes as ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[] | undefined,
    colors: dbProduct.colors,
    fabricMaterial: '100% Cotton',
    publisher: dbProduct.publisher,
    language: 'english',
    series: dbProduct.series || 'Various',
    characterNames: dbProduct.character_names,
    status: (dbProduct.status as 'available' | 'coming_soon' | 'pre_order' | 'out_of_stock') || 'available',
    membersOnly: Boolean(dbProduct.members_only),
    discountEligible: Boolean(dbProduct.discount_eligible),
    compareAtPrice: dbProduct.compare_at_price ?? undefined,
    scale: '1/8',
    height: '20cm',
    specifications: dbProduct.specifications
  };
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

/**
 * How a raw `specifications` key is presented. Previously an 18-branch if/else chain
 * inside the render, which is why `batteriesRequired` reached the page as the label
 * "Batteries Req?".
 */
const SPEC_META: Record<string, { label: string; icon: LucideIcon }> = {
  publicationDate: { label: 'Publication Date', icon: Calendar },
  language: { label: 'Language', icon: Languages },
  printLength: { label: 'Print Length', icon: BookOpen },
  isbn10: { label: 'ISBN-10', icon: Hash },
  isbn13: { label: 'ISBN-13', icon: Hash },
  itemWeight: { label: 'Item Weight', icon: Weight },
  dimensions: { label: 'Dimensions', icon: Maximize },
  itemDimensions: { label: 'Dimensions', icon: Maximize },
  theme: { label: 'Theme', icon: Palette },
  color: { label: 'Color', icon: Palette },
  style: { label: 'Style', icon: Brush },
  occasion: { label: 'Occasion', icon: Gift },
  numberOfPieces: { label: 'Pieces', icon: Puzzle },
  manufacturer: { label: 'Manufacturer', icon: Factory },
  materialType: { label: 'Material Type', icon: Box },
  asin: { label: 'ASIN', icon: Hash },
  batteriesRequired: { label: 'Batteries Required', icon: Battery },
  finishTypes: { label: 'Finish Types', icon: Sparkles },
  ageRange: { label: 'Age Range', icon: Info },
  itemTypeName: { label: 'Item Type', icon: Info },
};

type SpecRow = { key: string; label: string; icon: LucideIcon; value: ReactNode };

/**
 * A value that leads somewhere says so before you hover it: an underline in the border
 * colour that firms up to the foreground on the way in. The old treatment announced
 * itself only once the cursor had already arrived, and did it in an indigo this palette
 * does not contain.
 */
const SPEC_LINK =
  'underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground';

/**
 * Values a shopper can act on — a character to browse, a size to look for. Not labels,
 * so they keep their own capitalisation rather than being shouted in uppercase; the
 * links invert to ink on hover, which is the same weight the chip vocabulary uses for
 * "this one matters".
 */
const DATA_CHIP =
  'inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-[13px] font-medium text-foreground ring-1 ring-inset ring-border';
const DATA_CHIP_LINK =
  `${DATA_CHIP} transition-colors hover:bg-foreground hover:text-background hover:ring-foreground`;
const GROUP_LABEL =
  'block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground';

/**
 * The product row, fetched once per request.
 *
 * `cache()` dedupes this between generateMetadata and the page body — Next calls both
 * for every render, and without it each product page would run the same query twice.
 */
const getProduct = cache(async (id: string) => {
  const supabase = await createClient();
  const canSeeMembersOnly = await viewerCanSeeMembersOnly(supabase);

  let productQuery = supabase
    .from('products')
    .select('*, image_url, image_urls')
    .eq('id', id);

  if (!canSeeMembersOnly) productQuery = publicListingsOnly(productQuery);

  const { data, error } = await productQuery.single();
  return { dbProduct: data, error, canSeeMembersOnly, supabase };
});

/**
 * Per-product title, description and social card.
 *
 * Every product page previously inherited the site-wide title, so a few hundred pages
 * all told Google they were "D-STORE | The Ultimate Hobby Store". That is the single
 * biggest on-page SEO problem a catalogue can have: nothing distinguishes one product
 * from another in the index, and none of them can rank for their own name.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const { dbProduct } = await getProduct(id);

  if (!dbProduct) {
    return { title: 'Product not found', robots: { index: false, follow: false } };
  }

  const product = mapDatabaseProduct(dbProduct);
  const canonical = `/products/${dbProduct.id}`;

  // Prefer the real description; fall back to something specific rather than generic.
  const description = (product.description?.trim() || [
    product.name,
    product.brand || product.publisher,
    product.series,
  ].filter(Boolean).join(' — '))
    .replace(/\s+/g, ' ')
    .slice(0, 155);

  const image = product.images[0] || DEFAULT_OG_IMAGE;

  return {
    title: product.name,
    description,
    alternates: { canonical },
    // A members-only listing should not be advertised in search results.
    robots: dbProduct.members_only
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: absoluteUrl(canonical),
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const { dbProduct, error, canSeeMembersOnly, supabase } = await getProduct(id);

  // A members-only listing is indistinguishable from a missing one for guests.
  if (error || !dbProduct) {
    notFound();
  }

  const product = mapDatabaseProduct(dbProduct);

  // Fetch related products
  const filterParts: string[] = [];
  if (dbProduct.brand) filterParts.push(`brand.eq."${dbProduct.brand.replace(/"/g, '""')}"`);
  if (dbProduct.publisher) filterParts.push(`publisher.eq."${dbProduct.publisher.replace(/"/g, '""')}"`);
  if (dbProduct.series) filterParts.push(`series.eq."${dbProduct.series.replace(/"/g, '""')}"`);

  let relatedQuery = supabase
    .from('products')
    .select('*, image_url, image_urls')
    .eq('category', dbProduct.category)
    .neq('id', dbProduct.id);

  if (!canSeeMembersOnly) relatedQuery = publicListingsOnly(relatedQuery);

  if (filterParts.length > 0) {
    relatedQuery = relatedQuery.or(filterParts.join(','));
  }

  const relatedResult = await relatedQuery.limit(4);

  let relatedData = relatedResult.data;

  // Fallback if no specific matches found
  if (!relatedData || relatedData.length === 0) {
    let fallbackQuery = supabase
      .from('products')
      .select('*, image_url, image_urls')
      .eq('category', dbProduct.category)
      .neq('id', dbProduct.id);

    if (!canSeeMembersOnly) fallbackQuery = publicListingsOnly(fallbackQuery);

    const { data: fallbackData } = await fallbackQuery.limit(4);
    relatedData = fallbackData;
  }
  
  const relatedProducts = (relatedData || []).map(mapDatabaseProduct);

  // The page shows the shelf price. Quantity and bundle discounts depend on the rest of
  // the basket, so they are applied in the cart; the only markdown a single listing can
  // express is its own compare-at price, and only when that is above what we charge.
  const displayPrice = product.price;
  const referencePrice = product.compareAtPrice ?? 0;
  const showReferencePrice = referencePrice > displayPrice;
  const savingPercent = showReferencePrice
    ? Math.round(((referencePrice - displayPrice) / referencePrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Exactly one availability label, resolved in the order a shopper needs it: what
  // changes how they buy, then what stops them buying, then what is running out. The
  // four badges this replaced were mutually exclusive anyway, and two of them carried a
  // `border-blue-200` / `border-amber-200` with no dark variant, so in dark mode they
  // lit a pale ring around a dark chip.
  const stockLabel: { text: string; tone: 'ink' | 'plate' } | null =
    product.status === 'coming_soon' ? { text: 'Coming soon', tone: 'plate' } :
    product.status === 'pre_order' ? { text: 'Pre-order', tone: 'plate' } :
    product.status === 'out_of_stock' || product.stock === 0 ? { text: 'Sold out', tone: 'plate' } :
    product.stock <= 5 ? { text: `Only ${product.stock} left`, tone: 'ink' } :
    null;

  // One table, not three boxes. The identifiers, the specification blob and the stock
  // count are all facts about the same object and a shopper reads them as one list; as
  // three separately bordered containers inside a bordered Card they were nested twice
  // over, and on any listing with no brand, publisher, author or series — every
  // t-shirt — the first container rendered as a bare hairline with nothing inside it.
  const specRows: SpecRow[] = [];

  if (product.brand) {
    specRows.push({
      key: 'brand', label: 'Brand', icon: Factory,
      value: (
        <Link className={SPEC_LINK} href={`/figures?brand=${encodeURIComponent(product.brand)}`}>
          {product.brand}
        </Link>
      ),
    });
  }
  if (product.category === 'manga' && product.publisher) {
    specRows.push({
      key: 'publisher', label: 'Publisher', icon: Book,
      value: (
        <Link className={SPEC_LINK} href={`/manga?publisher=${encodeURIComponent(product.publisher)}`}>
          {product.publisher}
        </Link>
      ),
    });
  }
  if (product.author) {
    specRows.push({
      key: 'author', label: 'Author', icon: Brush,
      value: (
        <Link className={SPEC_LINK} href={`/manga?search=${encodeURIComponent(product.author)}`}>
          {product.author}
        </Link>
      ),
    });
  }
  if (product.series && product.series !== 'Various') {
    specRows.push({
      key: 'series', label: 'Series', icon: BookOpen,
      value: (
        <Link className={SPEC_LINK} href={`/${product.category}?search=${encodeURIComponent(product.series)}`}>
          {product.series}
        </Link>
      ),
    });
  }

  for (const [key, value] of Object.entries(product.specifications ?? {})) {
    if (!value) continue;
    const meta = SPEC_META[key];
    specRows.push({
      key,
      label: meta?.label ?? key,
      icon: meta?.icon ?? Info,
      value: String(value),
    });
  }

  // Last, and phrased for the number it actually holds — this row read "1 units
  // available" for every listing down to its final copy.
  specRows.push({
    key: 'availability', label: 'Availability', icon: Box,
    value: product.stock === 0
      ? <span className="text-destructive">Out of stock</span>
      : `${product.stock} ${product.stock === 1 ? 'unit' : 'units'} available`,
  });

  const hasChipGroups = Boolean(
    product.characterNames?.length || product.sizes?.length || product.colors?.length
  );

  // Structured data. This is what turns a plain blue link into a result carrying the
  // price, the stock status and (where a genuine one exists) a star rating. For a shop
  // competing on "buy <series> figure sri lanka", that is most of the click difference.
  const jsonLd = [
    productJsonLd({
      id: dbProduct.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images.map(src => (src.startsWith('http') ? src : absoluteUrl(src))),
      category: product.category,
      brand: product.brand,
      author: product.author,
      publisher: product.publisher,
      isbn: product.isbn,
      series: product.series,
      stock: product.stock,
      status: product.status,
      externalRating: dbProduct.external_rating,
      externalRatingCount: dbProduct.external_rating_count,
    }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: getCategoryLabel(product.category), path: `/${product.category}` },
      { name: product.name, path: `/products/${dbProduct.id}` },
    ]),
  ];

  return (
    <div className="min-h-screen">
      {/* Emitted as one <script> per graph. Google reads either shape; separate blocks
          keep a malformed one from invalidating the other. */}
      {jsonLd.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(graph)}
        />
      ))}
      {/* Aligned to the navbar, which is built as a padded wrapper around a max-w-7xl
          pill: the gutter lives on the parent, so the pill's left edge IS the max-w-7xl
          box edge. This page had the same max-w-7xl box but put its gutter *inside* it
          (lg:px-12), so its content started 48px right of where the navbar started and
          the thumbnail rail never lined up with anything.

          Same structure here — gutter on the parent, max-w-7xl child — so the rail and
          the pill share a left edge at every width. The page keeps its full 1280px, so
          the gallery column goes ~763px -> ~827px and the main image ~683px -> ~747px,
          still inside the 780px cap below, so the square survives uncropped.

          pt-0 because the shop layout's pt-28/sm:pt-36 is sized for the taller navbar on
          non-product pages; here the pill sits at top-3 and ends around 76px, so the
          layout's own padding is already generous. */}
      <div className="px-4 pb-8 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
        {/* Breadcrumbs, not a back button.
            Two reasons beyond filling the empty band under the navbar. A back button
            offers one destination; a trail shows where you are and gives you the
            category and the homepage on the way out — and "back" is a thing the browser
            already does. And Google asks that BreadcrumbList markup correspond to
            breadcrumbs a visitor can actually see; the JSON-LD above emits exactly this
            trail, so now it does. */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <Link
                href={`/${product.category}`}
                className="transition-colors hover:text-foreground"
              >
                {getCategoryLabel(product.category)}
              </Link>
            </li>
            {/* min-w-0 + truncate: product names here run to a full sentence, and without
                it the trail pushes itself off the edge on a phone. */}
            <li className="flex min-w-0 items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span aria-current="page" className="truncate font-medium text-foreground">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* fr tracks, not percentages: `55% 45%` resolves against the grid's content box
            and then adds the 48px gap on top, so the old grid overflowed its container by
            exactly one gap — the details column swallowed the page's right padding and the
            whole thing sat off-centre from lg up. fr tracks split the space that's
            actually left after the gap.

            2fr/1fr hands the gallery two thirds of the row, leaving the details column
            at 381px. That is about as far as this can go. The label-left/value-right
            spec rows themselves survive down to ~347px and only wrap around 318px
            (Dimensions and Publication Date go first), but the four trust tiles below
            the buy button are on a 2-up grid, so they hit three lines well before that
            and the row loses its shape. The gap tightens to 40px at lg to buy the image
            back a little of the difference — the two columns differ enough in weight
            that they don't need 48px between them. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
          {/* Product Images Gallery + Description (Left).
              The offset tracks the header height, which on this route is the nav pill
              alone — the promo ribbon is hidden on product pages (see Navbar). That
              puts the pill's bottom edge at 12 + 64 = 76px, so 96px clears it with air.
              It was 128px when the ribbon was still here; before that it was 32px, which
              parked the gallery behind the translucent pill. */}
          <div className="space-y-8 lg:sticky lg:top-24 lg:self-start will-change-transform">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              stock={product.stock}
            />

            {/* Description - Left side below gallery.
                Whatever the admin typed is plain text, so the paragraphing has to be
                reconstructed here: blank lines become real paragraphs, and a lone
                newline inside one stays a line break via whitespace-pre-line. Rendering
                the raw string in a single <p> collapsed all of it into one block. */}
            {product.description.trim() && (
              <div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Description</h3>
                <div className="space-y-4">
                  {product.description
                    .replace(/\r\n/g, '\n')
                    .split(/\n\s*\n/)
                    .map(paragraph => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p
                        key={index}
                        className="whitespace-pre-line text-muted-foreground leading-relaxed text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Hierarchy by weight, not by hue: ink for the fact that changes how you
                buy, plate for the fact you can only wait on, ghost for taxonomy. The
                category chip stays even though the breadcrumb two rows up already names
                the category — it keeps this row from emptying out on an ordinary
                in-stock listing, which would jump the headline 40px between products. */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={chip('ghost')}>{getCategoryLabel(product.category)}</span>
              {product.membersOnly && <span className={chip('ink')}>Members only</span>}
              {stockLabel && <span className={chip(stockLabel.tone)}>{stockLabel.text}</span>}
            </div>

            {/* Title and External Rating */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Wraps as a unit rather than at a `sm:` breakpoint. This column is
                  381px wide from lg up whatever the viewport says, and the rating plus
                  the wishlist button come to more than that — so the viewport-keyed row
                  was still a row on a desktop and squeezed the rating until its refresh
                  control fell onto a line of its own. */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <ExternalRating
                  productId={product.id}
                  initialRating={dbProduct.external_rating}
                  initialCount={dbProduct.external_rating_count}
                />

                <WishlistButton productId={product.id} variant="full" />
              </div>
            </div>

            {/* Price - Elegant.
                flex-wrap because price + struck reference + saving badge is wider than
                a 390px phone: without it the badge ran 9px past the viewport edge. */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(displayPrice)}
              </span>

              {showReferencePrice && (
                <span className="text-xl text-muted-foreground/70 line-through">
                  {formatPrice(referencePrice)}
                </span>
              )}

              {savingPercent > 0 && (
                <span className={chip('ink', { className: CHIP_NUMERIC })}>
                  -{savingPercent}%
                </span>
              )}
            </div>

            {/* The bundle promise, directly under the price where the shopper is
                already looking. Counted across every eligible product in the basket. */}
            {product.discountEligible && (
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3">
                <Tag aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-foreground">
                  {BUNDLE_DISCOUNT_BLURB}.
                </p>
              </div>
            )}

            {/* Only rendered where there is something to look up. The assistant returns
                null for apparel and goods, so the panel that framed it used to appear on
                those pages as a gradient box offering character info with no button
                underneath it. The offer now names what comes back instead of naming the
                technology that fetches it. */}
            {(product.category === 'manga' || product.category === 'figures') && (
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  {product.category === 'manga'
                    ? 'New to this series? Get a short summary — the story, who wrote it, and how far it runs.'
                    : "Don't know the character? Get a short summary of who they are and the series they come from."}
                </p>
                <div className="mt-3">
                  <ProductInfoAssistant
                    productName={product.name}
                    productDescription={product.description}
                    category={product.category}
                  />
                </div>
              </div>
            )}

            {/* Product facts: a heading and one table. This was a Card wrapping three
                separately bordered lists plus a filled availability block — four nested
                containers deep on a page that already sits inside a column, which is why
                the section read as a stack of boxes rather than a specification. */}
            <section className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">Product Details</h2>

              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {specRows.map(row => (
                  <div key={row.key} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="flex min-w-0 items-center gap-2.5">
                      <row.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-muted-foreground">{row.label}</span>
                    </dt>
                    <dd className="min-w-0 truncate text-right text-sm font-medium text-foreground">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {hasChipGroups && (
                <div className="space-y-4">
                  {product.characterNames && product.characterNames.length > 0 && (
                    <div>
                      <span className={GROUP_LABEL}>Characters</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.characterNames.map(char => (
                          <Link
                            key={char}
                            href={`/${product.category}?search=${encodeURIComponent(char)}`}
                            className={DATA_CHIP_LINK}
                          >
                            {char}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <span className={GROUP_LABEL}>Sizes</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.sizes.map(size => (
                          <span key={size} className={DATA_CHIP}>{size}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <span className={GROUP_LABEL}>Colors</span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.colors.map(color => (
                          <span key={color} className={`${DATA_CHIP} capitalize`}>{color}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Add to Cart - Elegant */}
            <div className="space-y-5">
              <AddToCartButton product={product} />

              {/* Inquire via WhatsApp */}
              <WhatsAppInquiryButton
                productName={product.name}
                productPrice={displayPrice}
                productCategory={product.category}
                productDescription={product.description}
              />

              {/* One block with hairlines between the cells, not four floating tiles.
                  The icons were indigo, emerald, blue and rose — four unrelated hues
                  carrying no distinction, on a palette with no saturation in it. They
                  are all muted now, which lets the wordmark-black Add to Cart above stay
                  the loudest thing in the column. */}
              <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                {[
                  { Icon: Truck, text: 'Free island-wide delivery' },
                  { Icon: Shield, text: 'Guaranteed authentic' },
                  { Icon: Globe, text: 'Officially licensed' },
                  { Icon: Lock, text: 'Secure shipping' },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 bg-background px-3.5 py-3">
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-[13px] font-medium text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products Section - Elegant */}
        {relatedProducts.length > 0 && (
          <>
            <Separator className="my-16" />
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">You might also like</h2>
                <p className="text-muted-foreground text-lg">
                  More from {getCategoryLabel(product.category)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Button asChild variant="outline" size="lg" className="shadow-sm hover:shadow-md">
                  <Link href={`/${product.category}`}>
                    View More {getCategoryLabel(product.category)}
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
