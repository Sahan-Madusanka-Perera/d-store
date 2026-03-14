import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/ProductCard';
import CategorySearchControls from '@/components/CategorySearchControls';
import CategoryPageFilters from '@/components/CategoryPageFilters';
import { Product } from '@/types/product';
import { Shirt, Package, SlidersHorizontal } from 'lucide-react';
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

const tshirtFilters = [
  {
    label: 'Size',
    paramName: 'size',
    options: [
      { id: 'all', name: 'All Sizes' },
      { id: 'XS', name: 'XS' },
      { id: 'S', name: 'S' },
      { id: 'M', name: 'M' },
      { id: 'L', name: 'L' },
      { id: 'XL', name: 'XL' },
      { id: 'XXL', name: 'XXL' },
    ],
  },
];

interface TshirtsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TshirtsPage(props: TshirtsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const search = typeof searchParams.search === 'string' ? searchParams.search : null;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : null;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : null;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';
  const size = typeof searchParams.size === 'string' ? searchParams.size : null;

  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*')
    .eq('category', 'tshirts');

  if (search) {
    const searchSafe = search.replace(/[%_]/g, '\\$&');
    query = query.or(`name.ilike.%${searchSafe}%,description.ilike.%${searchSafe}%,brand.ilike.%${searchSafe}%,series.ilike.%${searchSafe}%`);
  }

  if (minPrice && !isNaN(minPrice)) query = query.gte('price', minPrice);
  if (maxPrice && !isNaN(maxPrice)) query = query.lte('price', maxPrice);
  if (size && size !== 'all') query = query.contains('sizes', [size]);

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'name_asc': query = query.order('name', { ascending: true }); break;
    case 'name_desc': query = query.order('name', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false }); break;
  }

  const { data: dbProducts, error } = await query;

  if (error) {
    console.error('Error fetching tshirts:', error);
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Error Loading T-Shirts</h1>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const products: Product[] = dbProducts?.map(mapDatabaseProduct) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
            <Shirt className="h-6 w-6 text-zinc-900" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase mb-6">
            Anime T-Shirts
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Express your anime passion with our stylish collection of premium t-shirts.
            Comfortable, durable, and featuring designs from your favorite series.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-12 w-full">
            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">{products.length}</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Designs</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">Premium</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Cotton</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">All Sizes</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Available</div>
            </div>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <div className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-white rounded-2xl border border-gray-200"></div>}>
              <CategoryPageFilters basePath="/tshirts" extraFilters={tshirtFilters} />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6 flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white shadow-sm hover:shadow-md transition-all">
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto bg-white p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left font-bold text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <Suspense fallback={null}>
                    <CategoryPageFilters basePath="/tshirts" isMobile extraFilters={tshirtFilters} />
                  </Suspense>
                </SheetContent>
              </Sheet>
            </div>

            <Suspense fallback={<div className="h-[52px] mb-8 w-full animate-pulse bg-white rounded-lg border border-gray-200"></div>}>
              <CategorySearchControls basePath="/tshirts" initialSearch={search || ''} initialSort={sort} />
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
                  <Shirt className="h-8 w-8 text-zinc-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">No T-Shirts Found</h2>
                <p className="text-zinc-500 font-medium max-w-md">
                  {search ? `No results for "${search}". Try a different search term.` : "We're currently designing awesome new anime t-shirts. Stay tuned!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
