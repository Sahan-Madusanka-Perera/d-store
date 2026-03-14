'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Sparkles, BookOpen, Shirt, ShoppingBag, Clock, Zap, Bell } from 'lucide-react';
import { toast } from 'sonner';
import WishlistButton from '@/components/WishlistButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const availablePublisherDiscounts = useCartStore(state => state.availablePublisherDiscounts);

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
        stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-muted-foreground/30" />);
      }
    }
    return stars;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'figures': return <Sparkles className="h-3 w-3" />;
      case 'manga': return <BookOpen className="h-3 w-3" />;
      case 'tshirts': return <Shirt className="h-3 w-3" />;
      default: return <ShoppingBag className="h-3 w-3" />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'manga': return 'bg-indigo-500/90 text-white';
      case 'figures': return 'bg-violet-500/90 text-white';
      case 'tshirts': return 'bg-amber-500/90 text-white';
      default: return 'bg-slate-500/90 text-white';
    }
  };

  const applicableDiscount =
    product.category === 'manga' && product.publisher
      ? availablePublisherDiscounts.find(
          d => d.publisher.toLowerCase() === product.publisher?.toLowerCase()
        )
      : null;

  const shouldShowDiscount = !!applicableDiscount;
  const discountPercent = applicableDiscount ? applicableDiscount.discount_percentage : 0;
  const originalPrice = product.price;
  const displayPrice = shouldShowDiscount ? originalPrice * (1 - discountPercent / 100) : originalPrice;

  // Derive effective product status
  const productStatus = product.status || (product.stock === 0 ? 'out_of_stock' : 'available');

  return (
    <Card className="group relative overflow-hidden border border-border/40 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card p-0 gap-0">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
        <Link href={`/products/${product.id}`}>
          <Image
            src={(product.images && product.images[0]) || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Persistent bottom gradient for text/badge readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
          <Button size="icon" variant="secondary" asChild className="h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md border-0">
            <Link href={`/products/${product.id}`}>
              <Eye className="h-4 w-4 text-foreground" />
            </Link>
          </Button>
          <WishlistButton productId={product.id} variant="icon" />
        </div>

        {/* Top-left: stock + discount stacked */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {productStatus === 'coming_soon' && (
            <Badge className="text-[11px] px-2 py-0.5 bg-blue-500 text-white shadow-md border-0">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          )}
          {productStatus === 'pre_order' && (
            <Badge className="text-[11px] px-2 py-0.5 bg-violet-500 text-white shadow-md border-0">
              <Zap className="h-3 w-3 mr-1" />
              Pre-order
            </Badge>
          )}
          {productStatus === 'available' && product.stock === 0 && (
            <Badge variant="destructive" className="text-[11px] px-2 py-0.5 shadow-md">
              Out of Stock
            </Badge>
          )}
          {productStatus === 'available' && product.stock > 0 && product.stock <= 5 && (
            <Badge className="text-[11px] px-2 py-0.5 bg-amber-500 text-white shadow-md border-0">
              Only {product.stock} left
            </Badge>
          )}
          {productStatus === 'out_of_stock' && (
            <Badge variant="destructive" className="text-[11px] px-2 py-0.5 shadow-md">
              Out of Stock
            </Badge>
          )}
          {shouldShowDiscount && productStatus === 'available' && (
            <Badge className="text-[11px] px-2 py-0.5 bg-rose-500 text-white shadow-md border-0">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Top-right: category */}
        <Badge className={`absolute top-2.5 right-2.5 z-10 text-[11px] px-2 py-0.5 shadow-md border-0 ${getCategoryStyle(product.category)}`}>
          <span className="flex items-center gap-1">
            {getCategoryIcon(product.category)}
            {product.category}
          </span>
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">{renderStars(rating)}</div>
          <span className="text-[11px] text-muted-foreground">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Author / Brand / Publisher — clickable */}
        {(product.author || product.brand || product.publisher) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            {product.category === 'manga' && product.publisher && (
              <Link href={`/manga?publisher=${encodeURIComponent(product.publisher)}`} className="hover:text-foreground transition-colors underline decoration-muted-foreground/30 hover:decoration-foreground/50 truncate">
                {product.publisher}
              </Link>
            )}
            {product.category === 'manga' && product.publisher && product.author && (
              <span className="text-muted-foreground/40 mx-0.5">·</span>
            )}
            {product.author && (
              <span className="italic truncate">{product.author}</span>
            )}
            {product.category === 'figures' && product.brand && (
              <Link href={`/figures?brand=${encodeURIComponent(product.brand)}`} className="hover:text-foreground transition-colors underline decoration-muted-foreground/30 hover:decoration-foreground/50 truncate">
                {product.brand}
              </Link>
            )}
            {product.category === 'tshirts' && product.brand && (
              <Link href={`/tshirts?search=${encodeURIComponent(product.brand)}`} className="hover:text-foreground transition-colors underline decoration-muted-foreground/30 hover:decoration-foreground/50 truncate">
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
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/15 transition-colors rounded px-1.5 py-0.5 max-w-[110px] truncate cursor-pointer">
                  {product.series}
                </span>
              </Link>
            )}
            {product.characterNames?.slice(0, 2).map((char, idx) => (
              <Link key={idx} href={`/${product.category}?search=${encodeURIComponent(char)}`}>
                <span className="inline-block text-[10px] font-medium text-muted-foreground bg-muted/60 hover:bg-muted transition-colors rounded px-1.5 py-0.5 max-w-[90px] truncate cursor-pointer">
                  {char}
                </span>
              </Link>
            ))}
            {product.characterNames && product.characterNames.length > 2 && (
              <span className="text-[10px] text-muted-foreground/60 self-center">
                +{product.characterNames.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(displayPrice)}
          </span>
          {shouldShowDiscount && (
            <span className="text-xs text-muted-foreground/60 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </CardContent>

      {/* Action Button */}
      <CardFooter className="px-4 pb-4 pt-0">
        {productStatus === 'coming_soon' ? (
          <WishlistButton productId={product.id} variant="full" className="w-full" />
        ) : productStatus === 'pre_order' ? (
          <Button
            onClick={handleAddToCart}
            className="w-full h-9 text-sm font-medium shadow-sm hover:shadow transition-all bg-violet-600 hover:bg-violet-700"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Pre-order Now
          </Button>
        ) : productStatus === 'out_of_stock' || product.stock === 0 ? (
          <Button
            disabled
            className="w-full h-9 text-sm font-medium"
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Out of Stock
          </Button>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full h-9 text-sm font-medium shadow-sm hover:shadow transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}