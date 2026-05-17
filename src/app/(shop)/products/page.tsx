import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { createClient } from '@/utils/supabase/server';
import { Package, ShoppingBag, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';
import SearchControls from './SearchControls';
import ProductFilters from './ProductFilters';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AnimatedHeroText from '@/components/ui/AnimatedHeroText';

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
    category: dbProduct.category,
    images: images,
    stock: dbProduct.stock,
    isActive: true,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    author: dbProduct.author,
    brand: dbProduct.brand,
    sizes: dbProduct.sizes,
    colors: dbProduct.colors,
    fabricMaterial: '100% Cotton',
    publisher: dbProduct.publisher,
    language: 'english',
    series: dbProduct.series || undefined,
    characterNames: dbProduct.character_names || undefined,
    status: (dbProduct.status as 'available' | 'coming_soon' | 'pre_order' | 'out_of_stock') || 'available',
    scale: '1/8',
    height: '20cm'
  };
}

interface ProductsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const search = typeof searchParams.search === 'string' ? searchParams.search : null;
  const category = typeof searchParams.category === 'string' ? searchParams.category : null;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : null;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : null;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';

  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*, image_url, image_urls');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (minPrice && !isNaN(minPrice)) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice && !isNaN(maxPrice)) {
    query = query.lte('price', maxPrice);
  }

  if (search) {
    const searchSafe = search.replace(/[%_]/g, '\\$&');
    let orQuery = `name.ilike.%${searchSafe}%,description.ilike.%${searchSafe}%,author.ilike.%${searchSafe}%,brand.ilike.%${searchSafe}%,series.ilike.%${searchSafe}%,character_names.cs.{${searchSafe}},tags.cs.{${searchSafe}}`;
    
    const exactLower = search.toLowerCase().trim();
    if (['manga'].includes(exactLower)) {
      orQuery += `,category.eq.manga`;
    }
    if (['figure', 'figures', 'anime figure', 'anime figures'].includes(exactLower)) {
      orQuery += `,category.eq.figures`;
    }
    if (['shirt', 'shirts', 'tshirt', 't-shirt', 'tshirts', 't-shirts', 'apparel', 'graphic tshirt', 'graphic tshirts'].includes(exactLower)) {
      orQuery += `,category.eq.tshirts`;
    }
    
    query = query.or(orQuery);
  }

  // Apply Sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('name', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data: dbProducts, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
  }

  const products: Product[] = dbProducts?.map(mapDatabaseProduct) || [];

  // Category breakdown for stats
  const mangaCount = products.filter(p => p.category === 'manga').length;
  const figuresCount = products.filter(p => p.category === 'figures').length;
  const tshirtCount = products.filter(p => p.category === 'tshirts').length;

  // Check if we have a theme wallpaper for this search
  let themeWallpaperUrl: string | null = null;
  if (search) {
    const { data: themeData } = await supabase
      .from('nav_dropdown_items')
      .select('image_url')
      .ilike('label', search)
      .not('image_url', 'is', null)
      .maybeSingle();
      
    if (themeData?.image_url) {
      themeWallpaperUrl = themeData.image_url;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative">
      
      {/* Edge-to-Edge Theme Background Overlay */}
      {themeWallpaperUrl && (
        <div className="absolute -top-28 sm:-top-36 left-0 w-full h-[calc(70vh+7rem)] sm:h-[calc(85vh+9rem)] z-0 overflow-hidden bg-black pointer-events-none">
          <img 
            src={themeWallpaperUrl} 
            alt={search || 'Series Theme'} 
            className="w-full h-full object-cover opacity-70 scale-105 animate-slow-zoom" 
          />
          {/* Black overlay for contrast */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
          
          {/* Gradient to fade the bottom of the image into pure black */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"></div>
        </div>
      )}

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        
        {/* Header */}
        <div className={`flex flex-col items-center text-center ${themeWallpaperUrl ? 'pt-24 md:pt-40 mb-32 md:mb-48' : 'mb-16 md:mb-24'}`}>
          
          {!themeWallpaperUrl && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
              <ShoppingBag className="h-6 w-6 text-zinc-900" strokeWidth={1.5} />
            </div>
          )}

          {themeWallpaperUrl ? (
            <AnimatedHeroText 
              text={search ? search : 'All Products'} 
              className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 drop-shadow-2xl text-white" 
            />
          ) : (
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 drop-shadow-2xl text-zinc-900">
              {search ? search : 'All Products'}
            </h1>
          )}
          
          <p className={`text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md ${themeWallpaperUrl ? 'text-zinc-100 font-semibold' : 'text-zinc-500'}`}>
            {themeWallpaperUrl 
              ? `Explore our exclusive collection of ${search} premium merchandise.`
              : `Browse our entire catalogue of premium anime merchandise. From manga and collectible figures to stylish apparel — find it all here.`}
          </p>

          {!themeWallpaperUrl && (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-12 w-full">
              <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
                <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">{products.length}</div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Products</div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
                <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">3</div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Categories</div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
                <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">New</div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Arrivals</div>
              </div>
            </div>
          )}
        </div>

        {/* Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <div className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-white rounded-2xl border border-gray-200"></div>}>
              <ProductFilters />
            </Suspense>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden mb-6 flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold bg-white shadow-sm hover:shadow-md transition-all">
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto bg-white p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left font-bold text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-white rounded-2xl border border-gray-200"></div>}>
                    <ProductFilters isMobile />
                  </Suspense>
                </SheetContent>
              </Sheet>
            </div>

            <Suspense fallback={<div className="h-[52px] mb-8 w-full animate-pulse bg-white rounded-lg border border-gray-200"></div>}>
              <SearchControls initialSearch={search || ''} initialSort={sort} />
            </Suspense>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 border border-gray-100 rounded-full mb-6">
                  <Package className="h-8 w-8 text-zinc-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">No Products Found</h2>
                <p className="text-zinc-500 font-medium max-w-md">
                  {error ? 'Error loading products. Please try again later.' : search ? `No results for "${search}". Try a different search term or adjust your filters.` : "We couldn't find any products matching your current filters."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
