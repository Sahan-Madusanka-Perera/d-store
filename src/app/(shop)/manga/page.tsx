import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Error Loading Manga</h1>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-6 shadow-xl">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-red-600 bg-clip-text text-transparent mb-6">
            Manga Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in captivating stories with our curated collection of manga. 
            From shonen adventures to slice-of-life tales, find your next favorite series.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{products?.length || 0}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Manga Titles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">Fresh</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Releases</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">Popular</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Series</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((dbProduct) => {
              const product = mapDatabaseProduct(dbProduct);
              return (
                <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <span className="text-4xl text-gray-400">📖</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Manga Available</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We&apos;re building our manga library. Amazing stories are coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
