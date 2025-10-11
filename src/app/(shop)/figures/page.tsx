import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

// Sample figures data
const sampleFigures: Product[] = [
  {
    id: 'figure-1',
    name: 'Monkey D. Luffy Gear 5 Figure',
    description: 'Premium quality figure of Luffy in his legendary Gear 5 transformation. Highly detailed with dynamic pose.',
    price: 12500,
    category: 'figures',
    images: ['/placeholder.svg'],
    stock: 3,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    brand: 'Banpresto',
    series: 'One Piece',
    scale: '1/8',
    height: '23cm',
    figureMaterial: 'PVC, ABS'
  },
  {
    id: 'figure-2',
    name: 'Nezuko Kamado Demon Form',
    description: 'Beautiful figure of Nezuko in her demon form, featuring intricate details and premium paint job.',
    price: 9800,
    category: 'figures',
    images: ['/placeholder.svg'],
    stock: 7,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    brand: 'Good Smile Company',
    series: 'Demon Slayer',
    scale: '1/7',
    height: '19cm',
    figureMaterial: 'PVC, ABS'
  },
  {
    id: 'figure-3',
    name: 'Goku Ultra Instinct Figuarts',
    description: 'S.H.Figuarts Goku in Ultra Instinct form with multiple expressions and effect parts.',
    price: 8500,
    category: 'figures',
    images: ['/placeholder.svg'],
    stock: 5,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    brand: 'Bandai',
    series: 'Dragon Ball Super',
    scale: 'Non-scale',
    height: '16cm',
    figureMaterial: 'PVC, ABS'
  },
  {
    id: 'figure-4',
    name: 'Mikasa Ackerman Attack Pose',
    description: 'Dynamic figure of Mikasa in action pose with ODM gear and dual blades included.',
    price: 11200,
    category: 'figures',
    images: ['/placeholder.svg'],
    stock: 4,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    brand: 'Kotobukiya',
    series: 'Attack on Titan',
    scale: '1/8',
    height: '21cm',
    figureMaterial: 'PVC, ABS'
  }
];

export default function FiguresPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Anime Figures</h1>
        <p className="text-xl text-gray-600 mb-6">
          Premium collectible figures from your favorite anime and manga series. Authentic imports with quality guarantee.
        </p>
        
        {/* Collection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600">100+</div>
            <div className="text-sm text-gray-600">Figures Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">Premium</div>
            <div className="text-sm text-gray-600">Quality Only</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">Authentic</div>
            <div className="text-sm text-gray-600">Guaranteed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">Rare</div>
            <div className="text-sm text-gray-600">Limited Editions</div>
          </div>
        </div>
      </div>

      {/* Brand Showcase */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Premium Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Banpresto', specialty: 'Prize Figures' },
            { name: 'Good Smile Company', specialty: 'Nendoroids & Figma' },
            { name: 'Kotobukiya', specialty: 'ARTFX Series' },
            { name: 'Bandai', specialty: 'Figuarts & Model Kits' }
          ].map((brand) => (
            <div key={brand.name} className="bg-white/20 p-3 rounded-lg">
              <div className="font-semibold">{brand.name}</div>
              <div className="text-sm opacity-90">{brand.specialty}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Brands</option>
            <option value="banpresto">Banpresto</option>
            <option value="goodsmile">Good Smile Company</option>
            <option value="kotobukiya">Kotobukiya</option>
            <option value="bandai">Bandai</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Series</option>
            <option value="onepiece">One Piece</option>
            <option value="naruto">Naruto</option>
            <option value="demonslayer">Demon Slayer</option>
            <option value="dragonball">Dragon Ball</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">Price Range</option>
            <option value="0-5000">Under LKR 5,000</option>
            <option value="5000-10000">LKR 5,000 - 10,000</option>
            <option value="10000-20000">LKR 10,000 - 20,000</option>
            <option value="20000+">Above LKR 20,000</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Search figures..." 
            className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Featured Figures */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleFigures.map((figure) => (
            <ProductCard key={figure.id} product={figure} />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-semibold text-lg mb-2">Prize Figures</h4>
            <p className="text-gray-600">High-quality figures at affordable prices</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">⭐</div>
            <h4 className="font-semibold text-lg mb-2">Scale Figures</h4>
            <p className="text-gray-600">Premium detailed collectibles</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">🎪</div>
            <h4 className="font-semibold text-lg mb-2">Action Figures</h4>
            <p className="text-gray-600">Poseable figures with accessories</p>
          </div>
        </div>
      </div>

      {/* Pre-orders */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Pre-Orders Available</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold">Tanjiro Hinokami Kagura Figure</h4>
            <p className="text-sm text-gray-600 mb-2">Expected: December 2024</p>
            <span className="text-lg font-bold text-red-600">LKR 13,500</span>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold">Vegeta Ultra Ego Figuarts</h4>
            <p className="text-sm text-gray-600 mb-2">Expected: January 2025</p>
            <span className="text-lg font-bold text-red-600">LKR 9,200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
