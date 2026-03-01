import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';
import { BookOpen, Package } from 'lucide-react';

function mapDatabaseProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    category: dbProduct.category,
    images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'],
    stock: dbProduct.stock,
    isActive: true,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    author: dbProduct.author,
    brand: dbProduct.brand,
    sizes: dbProduct.sizes,
    colors: dbProduct.colors,
    fabricMaterial: '100% Cotton',
    publisher: 'Various',
    language: 'english',
    series: 'Various',
    scale: '1/8',
    height: '20cm'
  };
}

export default async function MangaPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'manga')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching manga:', error);
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Error Loading Manga</h1>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Modern Minimal Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
            <BookOpen className="h-6 w-6 text-zinc-900" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase mb-6">
            Manga Collection
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Immerse yourself in captivating stories with our curated collection of manga.
            From shonen adventures to slice-of-life tales, find your next favorite series.
          </p>

          {/* Minimalist Stats Cards */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-12 w-full">
            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">{products?.length || 0}</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Titles</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">Latest</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Releases</div>
            </div>
            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl py-6 px-10 shadow-sm min-w-[160px]">
              <div className="text-4xl font-black text-zinc-900 tracking-tight pb-1">Top</div>
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Sellers</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((dbProduct) => {
              const product = mapDatabaseProduct(dbProduct);
              return (
                <div key={product.id} className="group">
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-gray-200 rounded-3xl shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 border border-gray-100 rounded-full mb-6">
              <BookOpen className="h-8 w-8 text-zinc-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">No Manga Available</h2>
            <p className="text-zinc-500 font-medium max-w-md">
              We're currently building our manga library. Amazing new stories are arriving soon, so check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
