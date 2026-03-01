'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Heart, Sparkles, BookOpen, Shirt, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart!`, {
      description: "Item successfully added to your cart",
      action: {
        label: "View Cart",
        onClick: () => window.location.href = '/cart'
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Generate consistent rating based on product ID (deterministic)
  const getProductRating = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 4.0 + (Math.abs(hash) % 100) / 100; // 4.0 to 5.0
  };
  
  const getReviewCount = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 3) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 50 + (Math.abs(hash) % 500); // 50 to 550 reviews
  };

  const rating = getProductRating(product.id.toString());
  const reviewCount = getReviewCount(product.id.toString());

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return stars;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'manga': return 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0'
      case 'figures': return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0'
      case 'tshirts': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white border-0'
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'figures': return <Sparkles className="h-4 w-4" />
      case 'manga': return <BookOpen className="h-4 w-4" />
      case 'tshirts': return <Shirt className="h-4 w-4" />
      default: return <ShoppingBag className="h-4 w-4" />
    }
  };

  // Generate discount based on product ID
  const hash = product.id.toString().split('').reduce((a, b) => {
    a = ((a << 2) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const shouldShowDiscount = (Math.abs(hash) % 10) > 6;
  const discountPercent = 10 + (Math.abs(hash) % 20);
  const originalPrice = shouldShowDiscount ? product.price / (1 - discountPercent / 100) : product.price;

  return (
    <Card className="group relative overflow-hidden border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col bg-card/80 backdrop-blur-sm">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
        <Link href={`/products/${product.id}`}>
          <Image
            src={(product.images && product.images[0]) || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
          />
        </Link>
        
        {/* Elegant Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
            <Button size="sm" variant="secondary" asChild className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-md border-0">
              <Link href={`/products/${product.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-md border-0">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stock Badge */}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-3 left-3 shadow-lg backdrop-blur-sm">
            Out of Stock
          </Badge>
        )}
        
        {/* Low Stock Warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <Badge className="absolute top-3 left-3 bg-amber-500/90 text-white shadow-lg backdrop-blur-sm border-0">
            Only {product.stock} left!
          </Badge>
        )}
        
        {/* Category Badge - More elegant */}
        <Badge className={`absolute top-3 right-3 shadow-md backdrop-blur-sm ${getCategoryColor(product.category)}`}>
          <span className="flex items-center gap-1.5">
            {getCategoryIcon(product.category)}
            {product.category}
          </span>
        </Badge>
        
        {/* Discount Badge - Refined */}
        {shouldShowDiscount && (
          <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg border-0">
            -{discountPercent}% OFF
          </Badge>
        )}
      </div>

      {/* Product Details */}
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {renderStars(rating)}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {rating.toFixed(1)} <span className="text-muted-foreground/60">({reviewCount})</span>
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-base text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Additional Info */}
        {(product.brand || product.author) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            {product.brand && (
              <span className="px-2 py-1 bg-muted/50 rounded-md font-medium">{product.brand}</span>
            )}
            {product.author && (
              <span className="italic truncate">{product.author}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          {shouldShowDiscount && (
            <span className="text-sm text-muted-foreground/70 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-5 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full shadow-sm hover:shadow-md transition-all font-medium"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}