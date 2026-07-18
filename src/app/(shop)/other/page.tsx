import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import CategorySearchControls from '@/components/category/CategorySearchControls';
import CategoryPageFilters from '@/components/category/CategoryPageFilters';
import { Product } from '@/types/product';
import { Layers, Package, SlidersHorizontal } from 'lucide-react';
import { Suspense } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function mapDatabaseProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    category: dbProduct.category,
    images: dbProduct.image_urls?.length ? dbProduct.image_urls : dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'],
    stock: dbProduct.stock,
    isActive: true,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    author: dbProduct.author,
    brand: dbProduct.brand,
    sizes: dbProduct.sizes,
    colors: dbProduct.colors,
    fabricMaterial: '100% Cotton',
    publisher: dbProduct.publisher || undefined,
    language: 'english',
    series: dbProduct.series || undefined,
    characterNames: dbProduct.character_names || undefined,
    status: dbProduct.status || 'available',
    scale: '1/8',
    height: '20cm'
  };
}

interface OtherPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OtherPage(props: OtherPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const search = typeof searchParams.search === 'string' ? searchParams.search : null;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : null;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : null;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';

  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*')
    .eq('category', 'other');

  if (search) {
    const searchSafe = search.replace(/[%_]/g, '\\$&');
    let orQuery = `name.ilike.%${searchSafe}%,description.ilike.%${searchSafe}%,brand.ilike.%${searchSafe}%,series.ilike.%${searchSafe}%,tags.cs.{${searchSafe}}`;

    const exactLower = search.toLowerCase().trim();
    if (['other', 'tcg', 'card', 'cards', 'trading card', 'trading cards', 'collectible', 'collectibles'].includes(exactLower)) {
      orQuery += `,category.eq.other`;
    }

    query = query.or(orQuery);
  }

  if (minPrice && !isNaN(minPrice)) query = query.gte('price', minPrice);
  if (maxPrice && !isNaN(maxPrice)) query = query.lte('price', maxPrice);

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'name_asc': query = query.order('name', { ascending: true }); break;
    case 'name_desc': query = query.order('name', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false }); break;
  }

  const { data: dbProducts, error } = await query;

  if (error) {
    console.error('Error fetching other products:', error);
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Error Loading Products</h1>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const products: Product[] = dbProducts?.map(mapDatabaseProduct) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-card border border-border rounded-full mb-8 shadow-sm">
            <Layers className="h-6 w-6 text-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase mb-6">
            {search ? search : 'More From The Store'}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Trading card games, stationery, and collectibles that don't fit neatly into a box.
            If it's otaku culture, it belongs here.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-12 w-full">
            <div className="flex flex-col items-center justify-center bg-card border border-border rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-foreground tracking-tight pb-1">{products.length}</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Items</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-card border border-border rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-foreground tracking-tight pb-1">TCG</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Cards</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-card border border-border rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-foreground tracking-tight pb-1">Curated</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Finds</div>
            </div>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <div className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-card rounded-2xl border border-border"></div>}>
              <CategoryPageFilters basePath="/other" />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6 flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium bg-card shadow-sm hover:shadow-md transition-all">
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto bg-background p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left font-bold text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <Suspense fallback={null}>
                    <CategoryPageFilters basePath="/other" isMobile />
                  </Suspense>
                </SheetContent>
              </Sheet>
            </div>

            <Suspense fallback={<div className="h-[52px] mb-8 w-full animate-pulse bg-card rounded-lg border border-border"></div>}>
              <CategorySearchControls basePath="/other" initialSearch={search || ''} initialSort={sort} />
            </Suspense>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-4 bg-card border border-border rounded-3xl shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-muted border border-border rounded-full mb-6">
                  <Package className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">Nothing Here Yet</h2>
                <p className="text-muted-foreground font-medium max-w-md">
                  {search ? `No results for "${search}". Try a different search term.` : "We're stocking up on trading cards and more. Check back soon!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
