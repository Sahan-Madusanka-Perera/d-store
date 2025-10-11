export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">D-Store Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="ml-auto text-green-500 text-sm">+12%</div>
            </div>
            <div className="text-gray-600 text-sm">Total Products</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="ml-auto text-green-500 text-sm">+8%</div>
            </div>
            <div className="text-gray-600 text-sm">Orders Today</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">LKR 125K</div>
              <div className="ml-auto text-green-500 text-sm">+15%</div>
            </div>
            <div className="text-gray-600 text-sm">Revenue Today</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="ml-auto text-red-500 text-sm">-2</div>
            </div>
            <div className="text-gray-600 text-sm">Low Stock Items</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Add New Product
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                Process Orders
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                Update Inventory
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-medium">#12345</div>
                  <div className="text-sm text-gray-600">John Doe</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">LKR 3,500</div>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Paid</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-medium">#12344</div>
                  <div className="text-sm text-gray-600">Jane Smith</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">LKR 8,200</div>
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Naruto Vol 72</div>
                  <div className="text-sm text-gray-600">Manga</div>
                </div>
                <div className="text-red-600 font-medium">2 left</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Luffy Gear 5 Figure</div>
                  <div className="text-sm text-gray-600">Figures</div>
                </div>
                <div className="text-red-600 font-medium">1 left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Product Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Manga Collection</div>
                  <div className="text-sm text-gray-600">45 products</div>
                </div>
                <button className="text-blue-600 hover:text-blue-800">Manage</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Anime Figures</div>
                  <div className="text-sm text-gray-600">78 products</div>
                </div>
                <button className="text-blue-600 hover:text-blue-800">Manage</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">T-Shirts</div>
                  <div className="text-sm text-gray-600">33 products</div>
                </div>
                <button className="text-blue-600 hover:text-blue-800">Manage</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Sales Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <span className="font-medium">LKR 450,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Month</span>
                <span className="font-medium">LKR 1,800,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Top Category</span>
                <span className="font-medium">Manga (60%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Order</span>
                <span className="font-medium">LKR 4,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}