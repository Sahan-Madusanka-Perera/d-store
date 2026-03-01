import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';
import { createClient } from '@/utils/supabase/server';
import { Package } from 'lucide-react';

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
    publisher: 'Various',
    language: 'english',
    series: 'Various',
    scale: '1/8',
    height: '20cm'
  };
}

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('*, image_url, image_urls')
    .order('created_at', { ascending: false });

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
        
        <div className="flex flex-wrap gap-4 mb-10">
          <select className="border border-border/60 rounded-lg px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium">
            <option>All Categories</option>
            <option value="manga">Manga</option>
            <option value="figures">Figures</option>
            <option value="tshirts">T-Shirts</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Search products..." 
            className="border border-border/60 rounded-lg px-4 py-2.5 bg-card flex-1 min-w-[250px] shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {error ? 'Error loading products. Please try again later.' : 'Add some products in the admin dashboard!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
