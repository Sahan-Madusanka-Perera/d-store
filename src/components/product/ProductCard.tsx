'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Zap, Bell } from 'lucide-react';
import { toast } from 'sonner';
import WishlistButton from '@/components/product/WishlistButton';
import { getCategoryLabel } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

/**
 * One vocabulary for every label that floats over the product image.
 *
 * These used to be seven saturated pills — indigo, violet, amber, teal, blue, rose,
 * slate — each with a drop shadow and an icon sitting next to a word that already said
 * the same thing. The palette in globals.css is 0% saturation end to end, so those hues
 * belonged to no design system, and with three stacked at once nothing read as more
 * important than anything else.
 *
 * So: no hue, no icon, no shadow. Weight is the only hierarchy — ink for the one fact
 * that moves a purchase, plate for state, ghost for taxonomy — and the plates are
 * translucent with a backdrop blur, which is honest depth over a photograph in a way a
 * box-shadow on an 18px pill is not.
 */
const CHIP = 'inline-flex items-center rounded-md px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] leading-none';
const CHIP_INK = `${CHIP} bg-foreground text-background`;
const CHIP_PLATE = `${CHIP} bg-background/95 backdrop-blur-md text-foreground ring-1 ring-inset ring-foreground/10`;
const CHIP_GHOST = `${CHIP} bg-background/95 backdrop-blur-md text-foreground/70 ring-1 ring-inset ring-foreground/10`;

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart!`, {
      description: 'Item successfully added to your cart',
      action: {
        label: 'View Cart',
        onClick: () => (window.location.href = '/cart'),
      },
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductRating = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 4.0 + (Math.abs(hash) % 100) / 100;
  };

  const getReviewCount = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 3) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 50 + (Math.abs(hash) % 500);
  };

  const rating = getProductRating(product.id.toString());
  const reviewCount = getReviewCount(product.id.toString());

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-muted-foreground/30" />);
      }
    }
    return stars;
  };

  // The card shows the shelf price. Quantity and bundle discounts depend on what else
  // is in the basket, so they belong to the cart, not to a single card — the only
  // markdown expressible here is the compare-at price on the product itself.
  const displayPrice = product.price;
  const referencePrice = product.compareAtPrice ?? 0;
  const showReferencePrice = referencePrice > displayPrice;
  const savingPercent = showReferencePrice
    ? Math.round(((referencePrice - displayPrice) / referencePrice) * 100)
    : 0;

  // Derive effective product status
  const productStatus = product.status || (product.stock === 0 ? 'out_of_stock' : 'available');

  // Exactly one availability label, resolved in the order a shopper needs it: what
  // changes how they buy, then what stops them buying, then what is running out. The
  // stack of up to three pills said less than one does, and 'Sold out' now matches the
  // button underneath it rather than reading 'Out of Stock' beside it.
  const stockLabel: { text: string; tone: string } | null =
    productStatus === 'coming_soon' ? { text: 'Coming soon', tone: CHIP_PLATE } :
    productStatus === 'pre_order' ? { text: 'Pre-order', tone: CHIP_PLATE } :
    productStatus === 'out_of_stock' || product.stock === 0 ? { text: 'Sold out', tone: CHIP_PLATE } :
    product.membersOnly ? { text: 'Members only', tone: CHIP_INK } :
    product.stock > 0 && product.stock <= 5 ? { text: `Only ${product.stock} left`, tone: CHIP_INK } :
    null;

  // Button config per status
  const getActionButton = () => {
    switch (productStatus) {
      case 'coming_soon':
        return <WishlistButton productId={product.id} variant="full" className="w-full" />;

      case 'pre_order':
        return (
          <Button
            onClick={handleAddToCart}
            className="w-full h-11 text-[13px] font-bold tracking-wide shadow-sm hover:shadow-md transition-all bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
          >
            <Zap className="h-4 w-4 mr-2" />
            Pre-order Now
          </Button>
        );

      case 'out_of_stock':
        return (
          <Button
            disabled
            className="w-full h-11 text-[13px] font-bold tracking-wide rounded-xl"
          >
            <Bell className="h-4 w-4 mr-2" />
            Sold Out
          </Button>
        );

      default:
        if (product.stock === 0) {
          return (
            <Button
              disabled
              className="w-full h-11 text-[13px] font-bold tracking-wide rounded-xl"
            >
              <Bell className="h-4 w-4 mr-2" />
              Sold Out
            </Button>
          );
        }
        return (
          <Button
            onClick={handleAddToCart}
            className="w-full h-11 text-[13px] font-bold tracking-wide shadow-sm hover:shadow-md active:scale-[0.98] transition-all rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        );
    }
  };

  return (
    <Card className="group relative overflow-hidden border border-border hover:border-foreground/20 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 h-full flex flex-col bg-card p-0 gap-0 rounded-2xl">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          {product.images && product.images.length > 1 ? (
            <div className="relative w-full h-full">
              <Image
                src={product.images[1]}
                alt={`${product.name} - view 2`}
                fill
                className="object-cover"
              />
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:-translate-y-full"
              />
            </div>
          ) : (
            <Image
              src={(product.images && product.images[0]) || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
        </Link>

        {/* Persistent bottom gradient for text/badge readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
          <Button size="icon" variant="secondary" asChild className="h-10 w-10 rounded-full bg-background/90 hover:bg-background shadow-lg border-0">
            <Link href={`/products/${product.id}`}>
              <Eye className="h-4 w-4 text-foreground" />
            </Link>
          </Button>
          <WishlistButton productId={product.id} variant="icon" />
        </div>

        {/* Labels over the image: availability and value on the left, category on the
            right. One flex row rather than two absolutes — 'Members only' beside 'Other
            Collectibles' comes to 279px, and the narrowest card this grid produces is
            294px, so as absolutes they were 15px from overlapping. Here the category
            gives ground instead. The row is pointer-events-none so the strip it covers
            still clicks through to the product. */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <div className="flex shrink-0 flex-col items-start gap-1.5">
            {stockLabel && <span className={stockLabel.tone}>{stockLabel.text}</span>}
            {savingPercent > 0 && productStatus === 'available' && (
              <span className={cn(CHIP_INK, 'tracking-normal tabular-nums')}>-{savingPercent}%</span>
            )}
          </div>
          {/* Ghost weight — where the product lives, not something to act on. */}
          <span className={`${CHIP_GHOST} min-w-0`}>
            <span className="min-w-0 truncate">{getCategoryLabel(product.category)}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col gap-2">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">{renderStars(rating)}</div>
          <span className="text-xs text-muted-foreground font-medium">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-[15px] text-foreground line-clamp-2 hover:text-muted-foreground transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Author / Brand / Publisher — clickable */}
        {(product.author || product.brand || product.publisher) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            {product.category === 'manga' && product.publisher && (
              <Link href={`/manga?publisher=${encodeURIComponent(product.publisher)}`} className="hover:text-foreground transition-colors underline decoration-muted-foreground/40 hover:decoration-muted-foreground truncate">
                {product.publisher}
              </Link>
            )}
            {product.category === 'manga' && product.publisher && product.author && (
              <span className="text-muted-foreground/50 mx-0.5">·</span>
            )}
            {product.author && (
              <span className="italic truncate">{product.author}</span>
            )}
            {product.category === 'figures' && product.brand && (
              <Link href={`/figures?brand=${encodeURIComponent(product.brand)}`} className="hover:text-foreground transition-colors underline decoration-muted-foreground/40 hover:decoration-muted-foreground truncate">
                {product.brand}
              </Link>
            )}
            {product.category === 'tshirts' && product.brand && (
              <Link href={`/tshirts?search=${encodeURIComponent(product.brand)}`} className="hover:text-foreground transition-colors underline decoration-muted-foreground/40 hover:decoration-muted-foreground truncate">
                {product.brand}
              </Link>
            )}
          </div>
        )}

        {/* Tags: series + characters */}
        {((product.series && product.series !== 'Various') || (product.characterNames && product.characterNames.length > 0)) && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.series && product.series !== 'Various' && (
              <Link href={`/${product.category}?search=${encodeURIComponent(product.series)}`}>
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 transition-colors rounded-md px-2 py-0.5 max-w-[110px] truncate cursor-pointer">
                  {product.series}
                </span>
              </Link>
            )}
            {product.characterNames?.slice(0, 2).map((char, idx) => (
              <Link key={idx} href={`/${product.category}?search=${encodeURIComponent(char)}`}>
                <span className="inline-block text-[10px] font-medium text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-md px-2 py-0.5 max-w-[90px] truncate cursor-pointer">
                  {char}
                </span>
              </Link>
            ))}
            {product.characterNames && product.characterNames.length > 2 && (
              <span className="text-[10px] text-muted-foreground/70 self-center">
                +{product.characterNames.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-3">
          <span className="text-xl font-bold text-foreground">
            {formatPrice(displayPrice)}
          </span>
          {showReferencePrice && (
            <span className="text-sm text-muted-foreground/70 line-through">
              {formatPrice(referencePrice)}
            </span>
          )}
        </div>
      </CardContent>

      {/* Action Button */}
      <CardFooter className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        {getActionButton()}
      </CardFooter>
    </Card>
  );
}