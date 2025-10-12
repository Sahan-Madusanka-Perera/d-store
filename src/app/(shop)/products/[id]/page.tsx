import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, ArrowLeft, Truck, Shield, RotateCcw, Heart } from 'lucide-react';

function mapDatabaseProduct(dbProduct: any): Product {
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
    category: dbProduct.category as 'manga' | 'figures' | 'tshirts',
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
    publisher: 'Various',
    language: 'english',
    series: 'Various',
    scale: '1/8',
    height: '20cm'
  };
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: dbProduct, error } = await supabase
    .from('products')
    .select('*, image_url, image_urls')
    .eq('id', id)
    .single();

  if (error || !dbProduct) {
    notFound();
  }

  const product = mapDatabaseProduct(dbProduct);

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

  const rating = getProductRating(product.id);
  const reviewCount = getReviewCount(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'manga': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'figures': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'tshirts': return 'bg-green-100 text-green-800 hover:bg-green-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <ProductImageGallery 
            images={product.images} 
            productName={product.name}
            stock={product.stock}
          />

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category and Stock Status */}
            <div className="flex items-center justify-between">
              <Badge className={getCategoryColor(product.category)}>
                {product.category}
              </Badge>
              {product.stock > 0 && product.stock <= 5 && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Only {product.stock} left in stock
                </Badge>
              )}
            </div>

            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {renderStars(rating)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Add to Wishlist
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              
              {/* Show discount for some items (deterministic based on product ID) */}
              {(() => {
                const hash = product.id.split('').reduce((a, b) => {
                  a = ((a << 2) - a) + b.charCodeAt(0);
                  return a & a;
                }, 0);
                const shouldShowDiscount = (Math.abs(hash) % 10) > 6;
                const discountPercent = 15 + (Math.abs(hash) % 15);
                
                return shouldShowDiscount && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price * (1 + discountPercent / 100))}
                    </span>
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      -{discountPercent}% Off
                    </Badge>
                  </>
                );
              })()}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.brand && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                )}
                
                {product.author && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{product.author}</span>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Available Sizes:</span>
                    <div className="flex gap-1">
                      {product.sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Available Colors:</span>
                    <div className="flex gap-1">
                      {product.colors.map((color) => (
                        <Badge key={color} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={`font-medium ${product.stock === 0 ? 'text-destructive' : product.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} units available`}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart */}
            <div className="space-y-4">
              <AddToCartButton product={product} />
              
              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders over LKR 5,000</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Authentic products guaranteed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <Separator className="my-12" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You might also like</h2>
          <p className="text-muted-foreground mb-8">
            Discover more products in the {product.category} category
          </p>
          <Button asChild variant="outline">
            <Link href={`/${product.category}`}>
              View More {product.category}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
