import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

// Sample data - replace with actual database queries
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Naruto Volume 1',
    description: 'The first volume of the legendary ninja manga series',
    price: 1500,
    category: 'manga',
    images: ['/placeholder.svg'],
    stock: 10,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Masashi Kishimoto',
    publisher: 'Viz Media',
    language: 'english'
  },
  {
    id: '2',
    name: 'Luffy Gear 5 Figure',
    description: 'Premium quality Monkey D. Luffy Gear 5 transformation figure',
    price: 8500,
    category: 'figures',
    images: ['/placeholder.svg'],
    stock: 5,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    brand: 'Banpresto',
    series: 'One Piece',
    scale: '1/8',
    height: '20cm'
  },
  {
    id: '3',
    name: 'Anime Graphic Tee',
    description: 'Custom printed anime graphic t-shirt with high-quality design',
    price: 2500,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    stock: 25,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    fabricMaterial: '100% Cotton',
    printType: 'screen-print'
  }
];

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
        <p className="text-gray-600">
          Discover our collection of manga, figures, and custom t-shirts
        </p>
      </div>

      {/* Filters - Placeholder for now */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Categories</option>
            <option value="manga">Manga</option>
            <option value="figures">Figures</option>
            <option value="tshirts">T-Shirts</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">Price Range</option>
            <option value="0-2000">Under LKR 2,000</option>
            <option value="2000-5000">LKR 2,000 - 5,000</option>
            <option value="5000-10000">LKR 5,000 - 10,000</option>
            <option value="10000+">Above LKR 10,000</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Search products..." 
            className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sampleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty state when no products */}
      {sampleProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}