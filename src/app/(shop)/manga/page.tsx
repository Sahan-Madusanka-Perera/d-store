import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

// Sample manga data
const sampleManga: Product[] = [
  {
    id: 'manga-1',
    name: 'One Piece Volume 105',
    description: 'The latest adventure of the Straw Hat Pirates continues as they face new challenges in the New World.',
    price: 1650,
    category: 'manga',
    images: ['/placeholder.svg'],
    stock: 15,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Eiichiro Oda',
    publisher: 'Viz Media',
    language: 'english',
    isbn: '978-1-4215-9876-5'
  },
  {
    id: 'manga-2',
    name: 'Attack on Titan Final Volume',
    description: 'The epic conclusion to the legendary series that changed manga forever.',
    price: 1800,
    category: 'manga',
    images: ['/placeholder.svg'],
    stock: 8,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Hajime Isayama',
    publisher: 'Kodansha',
    language: 'english',
    isbn: '978-1-6327-1234-7'
  },
  {
    id: 'manga-3',
    name: 'Demon Slayer Volume 23',
    description: 'Tanjiro faces his greatest challenge yet in this thrilling volume.',
    price: 1550,
    category: 'manga',
    images: ['/placeholder.svg'],
    stock: 20,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Koyoharu Gotouge',
    publisher: 'Viz Media',
    language: 'english',
    isbn: '978-1-9741-2345-8'
  },
  {
    id: 'manga-4',
    name: 'Jujutsu Kaisen Volume 20',
    description: 'The cursed battles intensify as Yuji and friends face new supernatural threats.',
    price: 1650,
    category: 'manga',
    images: ['/placeholder.svg'],
    stock: 12,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    author: 'Gege Akutami',
    publisher: 'Viz Media',
    language: 'english',
    isbn: '978-1-4215-3456-9'
  }
];

export default function MangaPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Manga Collection</h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover the latest volumes from your favorite series, imported directly from Japan and translated into English.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-gray-600">Series Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">New</div>
            <div className="text-sm text-gray-600">Weekly Releases</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">English</div>
            <div className="text-sm text-gray-600">Translations</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600">Fast</div>
            <div className="text-sm text-gray-600">Island Delivery</div>
          </div>
        </div>
      </div>

      {/* Popular Series Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-2">Popular Series</h2>
        <div className="flex flex-wrap gap-2">
          {['One Piece', 'Naruto', 'Dragon Ball', 'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen'].map((series) => (
            <span key={series} className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {series}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Publishers</option>
            <option value="viz">Viz Media</option>
            <option value="kodansha">Kodansha</option>
            <option value="seven-seas">Seven Seas</option>
            <option value="yen-press">Yen Press</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Genres</option>
            <option value="shonen">Shonen</option>
            <option value="seinen">Seinen</option>
            <option value="shojo">Shojo</option>
            <option value="josei">Josei</option>
          </select>
          
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">Price Range</option>
            <option value="0-1500">Under LKR 1,500</option>
            <option value="1500-2000">LKR 1,500 - 2,000</option>
            <option value="2000+">Above LKR 2,000</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Search manga titles..." 
            className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Featured/New Releases */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Releases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleManga.map((manga) => (
            <ProductCard key={manga.id} product={manga} />
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold">Chainsaw Man Volume 15</h4>
            <p className="text-sm text-gray-600">Expected: End of November 2024</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold">Tokyo Revengers Final Arc</h4>
            <p className="text-sm text-gray-600">Expected: December 2024</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold">My Hero Academia Volume 39</h4>
            <p className="text-sm text-gray-600">Expected: January 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
