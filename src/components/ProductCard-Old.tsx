'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cart';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`Added ${product.name} to cart!`);
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
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Discount calculation
  const getDiscountInfo = () => {
    const hash = product.id.toString().split('').reduce((a, b) => {
      a = ((a << 2) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const shouldShowDiscount = (Math.abs(hash) % 10) > 6;
    const discountPercent = 15 + (Math.abs(hash) % 15);
    
    return { shouldShowDiscount, discountPercent };
  };

  const { shouldShowDiscount, discountPercent } = getDiscountInfo();

  return (
    <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl">
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Link href={`/products/${product.id}`}>
          <Image
            src={(product.images && product.images[0]) || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.stock === 0 && (
            <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
              Out of Stock
            </Badge>
          )}
          
          {shouldShowDiscount && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg animate-pulse">
              -{discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Stock Warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-orange-100/90 backdrop-blur-sm text-orange-700 border-orange-200 shadow-lg">
              Only {product.stock} left
            </Badge>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            asChild
          >
            <Link href={`/products/${product.id}`}>
              <Eye className="h-5 w-5 text-gray-700" />
            </Link>
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <Heart className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Product Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {renderStars(rating)}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Category-specific Info */}
        <div className="min-h-[24px] flex items-center">
          {product.category === 'manga' && product.author && (
            <p className="text-sm text-gray-600">by {product.author}</p>
          )}
          
          {product.category === 'figures' && product.brand && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {product.brand}
            </Badge>
          )}

          {product.category === 'tshirts' && product.sizes && (
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <Badge key={size} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {size}
                </Badge>
              ))}
              {product.sizes.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                  +{product.sizes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          {shouldShowDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price * (1 + discountPercent / 100))}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>

      {/* Decorative Elements */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </Card>
  );
}
