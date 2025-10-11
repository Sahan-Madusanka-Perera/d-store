import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">D-Store</span>
            <span className="text-lg text-gray-500 ml-2">SL</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Your ultimate destination for manga, anime figures, and custom graphic t-shirts in Sri Lanka
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link 
              href="/products"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </Link>
            <Link 
              href="/manga"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse Manga
            </Link>
          </div>

          {/* Featured Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <Link href="/manga" className="group">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Manga</h3>
                <p className="text-gray-600">Latest volumes from your favorite series</p>
              </div>
            </Link>

            <Link href="/figures" className="group">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🗾</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Figures</h3>
                <p className="text-gray-600">Premium anime and manga collectibles</p>
              </div>
            </Link>

            <Link href="/tshirts" className="group">
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">👕</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">T-Shirts</h3>
                <p className="text-gray-600">Custom printed graphic tees</p>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose D-Store SL?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <h4 className="font-semibold mb-1">Island-wide Delivery</h4>
                <p className="text-sm text-gray-600">Free shipping above LKR 5,000</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <h4 className="font-semibold mb-1">Secure Payments</h4>
                <p className="text-sm text-gray-600">PayHere & Cash on Delivery</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✨</div>
                <h4 className="font-semibold mb-1">Authentic Products</h4>
                <p className="text-sm text-gray-600">Original imports & quality prints</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold mb-1">SL Focused</h4>
                <p className="text-sm text-gray-600">Built for Sri Lankan otaku</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
