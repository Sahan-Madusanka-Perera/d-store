import { Product } from '@/types/product';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductInfoAssistant from '@/components/ProductInfoAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, ArrowLeft, Truck, Shield, RotateCcw, Heart, Sparkles } from 'lucide-react';
import ExternalRating from '@/components/ExternalRating';

interface DatabaseProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: 'manga' | 'figures' | 'tshirts';
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
    publisher: dbProduct.publisher,
    language: 'english',
    series: dbProduct.series || 'Various',
    characterNames: dbProduct.character_names,
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

  let discountPercent = 0;
  if (product.category === 'manga' && product.publisher) {
    const { data: discountData } = await supabase
      .from('publisher_discounts')
      .select('discount_percentage')
      .ilike('publisher', product.publisher)
      .eq('is_active', true)
      .maybeSingle();

    if (discountData) {
      discountPercent = discountData.discount_percentage;
    }
  }

  const shouldShowDiscount = discountPercent > 0;
  const originalPrice = product.price;
  const displayPrice = shouldShowDiscount ? originalPrice * (1 - discountPercent / 100) : originalPrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'manga': return 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0'
      case 'figures': return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0'
      case 'tshirts': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white border-0'
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb - Refined */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5">
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
          <div className="space-y-8">
            {/* Category and Stock Status */}
            <div className="flex items-center gap-3">
              <Badge className={getCategoryColor(product.category)}>
                {product.category}
              </Badge>
              {product.stock > 0 && product.stock <= 5 && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
                  Only {product.stock} left in stock
                </Badge>
              )}
            </div>

            {/* Title and External Rating */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <ExternalRating
                  productId={product.id}
                  initialRating={dbProduct.external_rating}
                  initialCount={dbProduct.external_rating_count}
                />

                <Button variant="ghost" size="sm" className="hover:bg-primary/5 sm:ml-auto w-fit">
                  <Heart className="h-4 w-4 mr-2 text-rose-500 fill-rose-500/10" />
                  Add to Wishlist
                </Button>
              </div>
            </div>

            {/* Price - Elegant */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(displayPrice)}
              </span>

              {/* Show discount if applicable */}
              {shouldShowDiscount && (
                <>
                  <span className="text-xl text-muted-foreground/70 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0">
                    -{discountPercent}% Off
                  </Badge>
                </>
              )}
            </div>

            {/* Description - Elegant */}
            <div>
              <h3 className="font-semibold text-xl mb-3 text-foreground">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                {product.description}
              </p>
            </div>

            {/* AI Character Assistant */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <ProductInfoAssistant
                  productName={product.name}
                  productDescription={product.description}
                  category={product.category}
                />
                <div className="flex-1">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">New to anime? Get character info powered by AI!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Product Specifications - Elegant */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.brand && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Brand:</span>
                    <span className="font-semibold text-foreground">{product.brand}</span>
                  </div>
                )}

                {/* Newly mapped attributes */}
                {product.series && product.series !== 'Various' && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Series:</span>
                    <Link href={`/products?search=${encodeURIComponent(product.series)}`}>
                      <Badge title={product.series} variant="outline" className="border-primary/20 bg-primary/5 text-primary uppercase font-bold tracking-wider max-w-[200px] truncate block text-center hover:bg-primary/10 transition-colors cursor-pointer">
                        {product.series}
                      </Badge>
                    </Link>
                  </div>
                )}

                {product.characterNames && product.characterNames.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground font-medium">Characters:</span>
                    <div className="flex flex-wrap gap-2 justify-end max-w-[60%]">
                      {product.characterNames.map((char) => (
                        <Link key={char} href={`/products?search=${encodeURIComponent(char)}`}>
                          <Badge title={char} variant="secondary" className="font-semibold px-2 max-w-[150px] truncate block text-center hover:bg-muted transition-colors cursor-pointer">
                            {char}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {product.author && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Author:</span>
                    <span className="font-semibold text-foreground">{product.author}</span>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground font-medium">Sizes:</span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {product.sizes.map((size) => (
                        <Badge key={size} variant="secondary" className="text-xs font-semibold">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground font-medium">Colors:</span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {product.colors.map((color) => (
                        <Badge key={color} variant="secondary" className="text-xs font-semibold capitalize">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Availability:</span>
                  <span className={`font-semibold ${product.stock === 0
                    ? 'text-destructive'
                    : product.stock <= 5
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                    }`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} units available`}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart - Elegant */}
            <div className="space-y-5">
              <AddToCartButton product={product} />

              {/* Additional Info - Refined */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Free shipping on orders over LKR 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Authentic products guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section - Elegant */}
        <Separator className="my-16" />
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">You might also like</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Discover more products in the {product.category} category
          </p>
          <Button asChild variant="outline" size="lg" className="shadow-sm hover:shadow-md">
            <Link href={`/${product.category}`}>
              View More {product.category}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
