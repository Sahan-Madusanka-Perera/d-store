import { Product } from '@/types/product';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductInfoAssistant from '@/components/ProductInfoAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, ArrowLeft, Truck, Shield, RotateCcw, Heart, Sparkles, Clock, Zap, Bell, BookOpen, Languages, Calendar, Hash, Weight, Maximize, Palette, Brush, Gift, Ruler, Puzzle, Box, Battery, Factory, Info, Book } from 'lucide-react';
import ExternalRating from '@/components/ExternalRating';
import WishlistButton from '@/components/WishlistButton';

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
  status?: string;
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
    status: (dbProduct.status as 'available' | 'coming_soon' | 'pre_order' | 'out_of_stock') || 'available',
    scale: '1/8',
    height: '20cm',
    specifications: dbProduct.specifications
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
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={getCategoryColor(product.category)}>
                {product.category}
              </Badge>
              {product.status === 'coming_soon' && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              )}
              {product.status === 'pre_order' && (
                <Badge className="bg-violet-500/10 text-violet-600 border-violet-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Pre-order Available
                </Badge>
              )}
              {product.status === 'out_of_stock' && (
                <Badge className="bg-red-500/10 text-red-600 border-red-200">
                  Out of Stock
                </Badge>
              )}
              {product.status === 'available' && product.stock > 0 && product.stock <= 5 && (
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

                <WishlistButton productId={product.id} variant="full" />
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

            {/* Product Specifications - Elegant & Informative */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Unified Specs Display similar to Amazon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">

                  {/* General Features */}
                  {product.brand && (
                    <div className="flex flex-col p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Brand</span>
                      </div>
                      <Link href={`/figures?brand=${encodeURIComponent(product.brand)}`}>
                        <span className="font-semibold text-foreground hover:text-primary transition-colors truncate">{product.brand}</span>
                      </Link>
                    </div>
                  )}

                  {product.category === 'manga' && product.publisher && (
                    <div className="flex flex-col p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Publisher</span>
                      </div>
                      <Link href={`/manga?publisher=${encodeURIComponent(product.publisher)}`}>
                        <span className="font-semibold text-foreground hover:text-primary transition-colors truncate">{product.publisher}</span>
                      </Link>
                    </div>
                  )}

                  {product.author && (
                    <div className="flex flex-col p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Brush className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Author</span>
                      </div>
                      <Link href={`/manga?search=${encodeURIComponent(product.author)}`}>
                        <span className="font-semibold text-foreground hover:text-primary transition-colors truncate">{product.author}</span>
                      </Link>
                    </div>
                  )}

                  {product.series && product.series !== 'Various' && (
                    <div className="flex flex-col p-3 bg-secondary/20 rounded-lg md:col-span-2">
                       <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Part of Series</span>
                      </div>
                      <Link href={`/${product.category}?search=${encodeURIComponent(product.series)}`}>
                        <Badge title={product.series} variant="outline" className="border-primary/20 bg-primary/5 text-primary uppercase font-bold tracking-wider hover:bg-primary/10 transition-colors cursor-pointer w-full justify-center py-1">
                          {product.series}
                        </Badge>
                      </Link>
                    </div>
                  )}

                  {/* Specifications JSON Rendering */}
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => {
                    if (!value) return null;
                    
                    // Map keys to nice labels and icons
                    let label = key;
                    let Icon = Info;
                    let spanClass = "md:col-span-1";
                    
                    if (key === 'publicationDate') { label = 'Publication Date'; Icon = Calendar; }
                    else if (key === 'language') { label = 'Language'; Icon = Languages; }
                    else if (key === 'printLength') { label = 'Print Length'; Icon = BookOpen; }
                    else if (key === 'isbn10') { label = 'ISBN-10'; Icon = Hash; }
                    else if (key === 'isbn13') { label = 'ISBN-13'; Icon = Hash; }
                    else if (key === 'itemWeight') { label = 'Item Weight'; Icon = Weight; }
                    else if (key === 'dimensions' || key === 'itemDimensions') { label = 'Dimensions'; Icon = Maximize; spanClass = "md:col-span-2"; }
                    else if (key === 'theme') { label = 'Theme'; Icon = Palette; }
                    else if (key === 'color') { label = 'Color'; Icon = Palette; }
                    else if (key === 'style') { label = 'Style'; Icon = Brush; }
                    else if (key === 'occasion') { label = 'Occasion'; Icon = Gift; }
                    else if (key === 'numberOfPieces') { label = 'Pieces'; Icon = Puzzle; }
                    else if (key === 'manufacturer') { label = 'Manufacturer'; Icon = Factory; }
                    else if (key === 'materialType') { label = 'Material Type'; Icon = Box; }
                    else if (key === 'asin') { label = 'ASIN'; Icon = Hash; }
                    else if (key === 'batteriesRequired') { label = 'Batteries Req?'; Icon = Battery; }
                    else if (key === 'finishTypes') { label = 'Finish Types'; Icon = Sparkles; }
                    else if (key === 'ageRange') { label = 'Age Range'; Icon = Info; }
                    else if (key === 'itemTypeName') { label = 'Item Type'; Icon = Info; }

                    return (
                      <div key={key} className={`flex flex-col p-3 bg-secondary/20 rounded-lg ${spanClass}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider truncate" title={label}>{label}</span>
                        </div>
                        <span className="font-semibold text-foreground break-words">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tags and Characters */}
                {(product.characterNames && product.characterNames.length > 0) || (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0) ? (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      {product.characterNames && product.characterNames.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mr-2">Characters:</span>
                          {product.characterNames.map((char) => (
                            <Link key={char} href={`/${product.category}?search=${encodeURIComponent(char)}`}>
                              <Badge title={char} variant="secondary" className="font-semibold hover:bg-muted transition-colors cursor-pointer">
                                {char}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mr-2">Sizes:</span>
                          {product.sizes.map((size) => (
                            <Badge key={size} variant="secondary" className="font-semibold">
                              {size}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mr-2">Colors:</span>
                          {product.colors.map((color) => (
                            <Badge key={color} variant="secondary" className="font-semibold capitalize">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : null}

                <Separator className="mt-4 mb-2" />

                <div className="flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-accent/10">
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground font-medium">Availability:</span>
                  </div>
                  <span className={`font-bold text-lg ${product.stock === 0
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

              {/* Inquire via WhatsApp */}
              <WhatsAppInquiryButton
                productName={product.name}
                productPrice={displayPrice}
                productCategory={product.category}
                productDescription={product.description}
              />

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
