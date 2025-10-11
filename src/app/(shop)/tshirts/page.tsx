import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

// Sample t-shirts data
const sampleTShirts: Product[] = [
  {
    id: 'tshirt-1',
    name: 'One Piece Straw Hat Crew Tee',
    description: 'High-quality cotton t-shirt featuring the iconic Straw Hat Pirates logo. Perfect for any One Piece fan.',
    price: 2800,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    stock: 25,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy Blue', 'White'],
    fabricMaterial: '100% Cotton',
    printType: 'screen-print'
  },
  {
    id: 'tshirt-2',
    name: 'Demon Slayer Corps Uniform Tee',
    description: 'Replica design of the Demon Slayer Corps uniform. Comfortable fit with premium print quality.',
    price: 3200,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    stock: 18,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Dark Green'],
    fabricMaterial: '100% Cotton',
    printType: 'digital-print'
  },
  {
    id: 'tshirt-3',
    name: 'Dragon Ball Z Goku Kamehameha',
    description: 'Epic design featuring Goku charging his signature Kamehameha wave. Glow-in-the-dark effects included.',
    price: 3500,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    stock: 15,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Orange', 'Navy Blue', 'Black'],
    fabricMaterial: '100% Cotton',
    printType: 'screen-print'
  },
  {
    id: 'tshirt-4',
    name: 'Naruto Hidden Leaf Village',
    description: 'Show your ninja pride with this Hidden Leaf Village symbol tee. Soft fabric with durable print.',
    price: 2650,
    category: 'tshirts',
    images: ['/placeholder.svg'],
    stock: 22,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Green', 'Black', 'Gray'],
    fabricMaterial: '100% Cotton',
    printType: 'vinyl'
  }
];

export default function TShirtsPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Graphic T-Shirts</h1>
        <p className="text-xl text-gray-600 mb-6">
          Express your otaku pride with our premium quality anime and manga inspired t-shirts. Custom designs printed locally in Sri Lanka.
        </p>
        
        {/* Quality Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Cotton Quality</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">Local</div>
            <div className="text-sm text-gray-600">Sri Lankan Made</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">Custom</div>
            <div className="text-sm text-gray-600">Designs Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600">Fast</div>
            <div className="text-sm text-gray-600">2-3 Day Print</div>
          </div>
        </div>
      </div>

      {/* Print Quality Banner */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Premium Print Quality</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🎨 Screen Printing</h3>
            <p className="text-sm">Vibrant colors that last wash after wash</p>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">💎 Digital Printing</h3>
            <p className="text-sm">High-resolution detailed designs</p>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">✨ Vinyl Cutting</h3>
            <p className="text-sm">Durable material for long-lasting wear</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Sizes</option>
            <option value="s">Small (S)</option>
            <option value="m">Medium (M)</option>
            <option value="l">Large (L)</option>
            <option value="xl">Extra Large (XL)</option>
            <option value="xxl">Double XL (XXL)</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Colors</option>
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="navy">Navy Blue</option>
            <option value="gray">Gray</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Series</option>
            <option value="onepiece">One Piece</option>
            <option value="naruto">Naruto</option>
            <option value="demonslayer">Demon Slayer</option>
            <option value="dragonball">Dragon Ball</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Search designs..." 
            className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Featured T-Shirts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Designs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleTShirts.map((tshirt) => (
            <ProductCard key={tshirt.id} product={tshirt} />
          ))}
        </div>
      </div>

      {/* Size Guide */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Size Guide</h3>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-left">Chest (inches)</th>
                <th className="px-4 py-2 text-left">Length (inches)</th>
                <th className="px-4 py-2 text-left">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">S</td>
                <td className="px-4 py-2">36-38</td>
                <td className="px-4 py-2">26-27</td>
                <td className="px-4 py-2">Slim build</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">M</td>
                <td className="px-4 py-2">40-42</td>
                <td className="px-4 py-2">27-28</td>
                <td className="px-4 py-2">Average build</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">L</td>
                <td className="px-4 py-2">44-46</td>
                <td className="px-4 py-2">28-29</td>
                <td className="px-4 py-2">Broader build</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2 font-semibold">XL</td>
                <td className="px-4 py-2">48-50</td>
                <td className="px-4 py-2">29-30</td>
                <td className="px-4 py-2">Large build</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Orders */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Design Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Want a Custom Design?</h4>
            <p className="text-gray-600 mb-4">
              We can create custom t-shirts with your favorite anime characters or personal designs. 
              Minimum order of 5 pieces required.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• High-resolution artwork required</li>
              <li>• 7-10 day production time</li>
              <li>• Bulk discounts available</li>
              <li>• Free design consultation</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Contact for Custom Orders</h4>
            <p className="text-sm text-gray-600 mb-3">
              WhatsApp: +94 70 123 4567<br/>
              Email: custom@d-store.lk
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Start Custom Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
