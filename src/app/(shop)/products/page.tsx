import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';
import { createClient } from '@/utils/supabase/server';
import { Package, SlidersHorizontal } from 'lucide-react';
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
    const orQuery = `name.ilike.%${searchSafe}%,description.ilike.%${searchSafe}%,author.ilike.%${searchSafe}%,brand.ilike.%${searchSafe}%,series.ilike.%${searchSafe}%,character_names.cs.{${searchSafe}}`;
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            All Products
          </h1>
          <p className="text-muted-foreground">Discover {products.length} amazing items</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <div className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-muted rounded-2xl border border-border/60"></div>}>
              <ProductFilters />
            </Suspense>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden mb-6 flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 border border-border/60 rounded-xl text-sm font-medium bg-card shadow-sm hover:shadow-md transition-all">
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto bg-white p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left font-bold text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-muted rounded-2xl border border-border/60"></div>}>
                    <ProductFilters isMobile />
                  </Suspense>
                </SheetContent>
              </Sheet>
            </div>

            <Suspense fallback={<div className="h-[52px] mb-8 w-full animate-pulse bg-muted rounded-lg border border-border/60"></div>}>
              <SearchControls initialSearch={search || ''} initialSort={sort} />
            </Suspense>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/60 mt-8">
                <div className="flex justify-center mb-4">
                  <Package className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {error ? 'Error loading products. Please try again later.' : "We couldn't find any products matching your current filters."}
                </p>
                <Suspense fallback={null}>
                  <div className="flex justify-center">
                    <ProductFilters /> {/* This re-renders just to give clear filters button in empty state if needed. A bit hacky but works for now as a clear button substitute. Better to just add a small link. */}
                  </div>
                </Suspense>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
