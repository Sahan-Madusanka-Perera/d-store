import { requireAdmin } from '@/lib/auth'
import UserProfile from '@/components/UserProfile'
import ProductManager from '@/components/ProductManager'
import CarouselManager from '@/components/admin/CarouselManager'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, DollarSign, AlertTriangle, Users, TrendingUp, ShoppingCart, Eye, Settings, Mail, LayoutTemplate, Activity } from 'lucide-react'
import Link from 'next/link'
import DashboardActions from '@/components/admin/DashboardActions'
export default async function AdminDashboard() {
  // This will throw an error and redirect if user is not admin
  const user = await requireAdmin()

  // Get dashboard stats
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('id, stock, price, category')
  const totalProducts = products?.length || 0
  const lowStockItems = products?.filter(p => p.stock < 10).length || 0
  const totalValue = products?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0

  // Category breakdown
  const categoryStats = products?.reduce((acc: Record<string, number>, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black text-white border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-3xl font-black uppercase tracking-tighter">
                  D-Store
                  <span className="text-brand-gradient bg-clip-text text-transparent ml-2 hidden sm:inline-block">Admin System</span>
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md hidden md:flex">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                System Online
              </Badge>
              <div className="text-sm font-medium text-gray-300 hidden lg:block tracking-wide">
                SYS.OP: <span className="text-white">{user.email}</span>
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">Command Center</h2>
              <p className="text-gray-500 mt-1 text-lg">Manage your digital storefront infrastructure.</p>
            </div>

            <TabsList className="bg-gray-100/80 p-1 border border-gray-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Activity className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><Package className="w-4 h-4 mr-2" /> Products</TabsTrigger>
              <TabsTrigger value="carousel" className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all"><LayoutTemplate className="w-4 h-4 mr-2" /> Carousel</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-transparent hover:border-black transition-colors rounded-xl overflow-hidden shadow-sm hover:shadow-xl group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Products</CardTitle>
                  <Package className="h-5 w-5 text-black group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-black mb-1">{totalProducts}</div>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% vs last cycle
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-black transition-colors rounded-xl overflow-hidden shadow-sm hover:shadow-xl group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Value</CardTitle>
                  <DollarSign className="h-5 w-5 text-black group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-black mb-1 tracking-tight">
                    <span className="text-gray-400 text-xl mr-1">LKR</span>
                    {totalValue.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8% vs last cycle
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-red-500 transition-colors rounded-xl overflow-hidden shadow-sm hover:shadow-xl group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-red-50/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-600">Stock Alerts</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform animate-pulse" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-black text-red-600 mb-1">{lowStockItems}</div>
                  <div className="flex items-center text-xs text-red-600 font-medium">
                    Critical stock levels
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-black transition-colors rounded-xl overflow-hidden shadow-sm hover:shadow-xl group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Active Users</CardTitle>
                  <Users className="h-5 w-5 text-black group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-black mb-1">1,234</div>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Network growing
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Overview & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Breakdown */}
              <Card className="rounded-xl border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight">
                    <Package className="h-5 w-5" />
                    Inventory Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3.5 rounded-sm ${category === 'manga' ? 'bg-[#E63946]' :
                          category === 'figures' ? 'bg-[#457B9D]' :
                            'bg-[#1D3557]'
                          }`}></div>
                        <span className="capitalize font-bold text-gray-700">{category}</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-sm shadow-sm">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="rounded-xl border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight">
                    <Settings className="h-5 w-5" />
                    System Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <DashboardActions />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="rounded-xl border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight">
                    <Eye className="h-5 w-5" />
                    System Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-bold text-sm">TRANSACTION: NEW ORDER</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">ID: #12345 | USR: John Doe</div>
                      </div>
                      <Badge className="bg-black text-white hover:bg-gray-900 font-mono">LKR 3,500</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-bold text-sm">INVENTORY: DEPLOYED</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">ITEM: Naruto Figure</div>
                      </div>
                      <Badge variant="outline" className="border-gray-300 font-mono">NEW_ENTRY</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-red-500 border border-gray-100 rounded-lg bg-red-50/30">
                      <div>
                        <div className="font-bold text-sm text-red-700">ALERT: LOW STOCK</div>
                        <div className="text-xs text-red-500 font-mono mt-0.5">ITEM: AOT Vol 34</div>
                      </div>
                      <Badge variant="destructive" className="font-mono">CRITICAL</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-2 border-gray-200 shadow-lg lg:col-span-3 rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight">
                  <Package className="h-6 w-6" />
                  Product Registry
                </CardTitle>
                <CardDescription className="text-gray-500 font-medium">Manage and deploy inventory to the storefront.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ProductManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carousel" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-2 border-gray-200 shadow-lg rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <CarouselManager />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}