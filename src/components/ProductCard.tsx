'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Heart, Sparkles } from 'lucide-react';
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
      case 'manga': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
      case 'figures': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
      case 'tshirts': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'manga': return '📚'
      case 'figures': return '🎎'
      case 'tshirts': return '👕'
      default: return '🛍️'
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
    <Card className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={(product.images && product.images[0]) || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" asChild className="bg-white/90 hover:bg-white">
              <Link href={`/products/${product.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stock Badge */}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}
        
        {/* Low Stock Warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
            Only {product.stock} left!
          </Badge>
        )}
        
        {/* Category Badge */}
        <Badge className={`absolute top-2 right-2 ${getCategoryColor(product.category)}`}>
          {product.category}
        </Badge>
        
        {/* Discount Badge */}
        {shouldShowDiscount && (
          <Badge className="absolute bottom-2 left-2 bg-red-500 text-white">
            -{discountPercent}% OFF
          </Badge>
        )}
      </div>

      {/* Product Details */}
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-0.5">
            {renderStars(rating)}
          </div>
          <span className="text-xs text-muted-foreground">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {shouldShowDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          {product.brand && (
            <span className="font-medium">{product.brand}</span>
          )}
          {product.author && (
            <span className="italic">by {product.author}</span>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}