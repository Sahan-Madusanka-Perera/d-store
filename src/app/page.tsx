import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Truck, Shield, Headphones, Sparkles, Zap, Heart, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Ultra Modern */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Advanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl float-animation"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl float-animation" style={{animationDelay: '0.5s'}}></div>
          
          {/* Geometric Patterns */}
          <div className="absolute top-20 right-20 w-32 h-32 border border-purple-200/30 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-32 left-16 w-24 h-24 border border-pink-200/30 rotate-12 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 fade-in-up">
              {/* Hero Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-sm border border-purple-200/30 rounded-full shadow-xl">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-purple-700">🇱🇰 Sri Lanka's Premier Otaku Haven</span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>

              {/* Main Title */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-black leading-none">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800">
                    UNLOCK THE
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
                    OTAKU
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800">
                    UNIVERSE
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Discover premium manga volumes, collectible figures, and exclusive anime merchandise. 
                  Your gateway to authentic Japanese pop culture in Sri Lanka.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl px-8 py-4 shadow-xl text-lg font-semibold">
                  <Link href="/products" className="flex items-center">
                    🛍️ Explore Collection
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="group border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 rounded-2xl px-8 py-4 shadow-lg text-lg font-semibold">
                  <Link href="/figures" className="flex items-center text-purple-700">
                    <Heart className="mr-2 h-5 w-5 group-hover:text-red-500 transition-colors" />
                    🎎 Premium Figures
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">500+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">1000+</div>
                  <div className="text-sm text-muted-foreground">Happy Otakus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">Island-wide</div>
                  <div className="text-sm text-muted-foreground">Delivery</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">200+</div>
                  <div className="text-sm text-gray-600 font-medium">Premium Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2,000+</div>
                  <div className="text-sm text-gray-600 font-medium">Quality Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">30,000+</div>
                  <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Main Hero Card */}
                <div className="absolute inset-4 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-6 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-purple-300 rounded-2xl flex items-center justify-center">
                      <div className="text-6xl">🎎</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-800">Premium Figures</h3>
                      <p className="text-gray-600 text-sm">Authentic collectibles from Japan</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">4.9/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce">
                  📚
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-200 to-blue-300 rounded-2xl flex items-center justify-center text-2xl shadow-xl animate-bounce delay-300">
                  👕
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-orange-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-purple-800 mb-6">Why Otakus Choose D-Store? ⭐</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience Sri Lanka's most trusted anime marketplace with premium quality, authentic products, and unmatched service
            </p>
          </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 shadow-xl hover:shadow-2xl group transition-all duration-300">
              <CardContent className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold text-purple-800">🚚 Island-wide Delivery</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    Lightning-fast delivery to all 9 provinces. From Colombo to Jaffna!
                  </CardDescription>
                  <Badge className="bg-blue-500 text-white text-xs">
                    FREE shipping over LKR 5,000
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border-0 modern-card glass-card shadow-xl hover:shadow-2xl group fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold gradient-text">🛡️ 100% Authentic</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    Official merchandise from Japan. No bootlegs, only premium quality!
                  </CardDescription>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                    Authenticity Guaranteed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border-0 modern-card glass-card shadow-xl hover:shadow-2xl group fade-in-up" style={{animationDelay: '0.2s'}}>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <Headphones className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold gradient-text">🎧 Otaku Support</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    Get help from fellow anime enthusiasts who understand your passion.
                  </CardDescription>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs">
                    Community Driven
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 border-0 modern-card glass-card shadow-xl hover:shadow-2xl group fade-in-up" style={{animationDelay: '0.3s'}}>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold gradient-text">⚡ Instant Updates</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    Get notified first about new releases and limited editions!
                  </CardDescription>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs">
                    Real-time Alerts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 fade-in-up">
            <h2 className="text-heading gradient-text mb-6">Explore Our Universe 🌟</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dive into carefully curated collections that bring your favorite anime worlds to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Manga */}
            <Link href="/manga" className="group">
              <Card className="h-64 bg-gradient-to-br from-blue-100 to-indigo-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <CardContent className="h-full flex flex-col justify-between p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Manga Universe</h3>
                    <p className="text-gray-600">Latest volumes & classic series</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" className="text-blue-700 font-medium group-hover:text-blue-800">
                      Explore Manga
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Figures */}
            <Link href="/figures" className="group">
              <Card className="h-64 bg-gradient-to-br from-purple-100 to-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <CardContent className="h-full flex flex-col justify-between p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎎</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium Figures</h3>
                    <p className="text-gray-600">Authentic collectibles & limited editions</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" className="text-purple-700 font-medium group-hover:text-purple-800">
                      Explore Figures
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* T-Shirts */}
            <Link href="/tshirts" className="group">
              <Card className="h-64 bg-gradient-to-br from-green-100 to-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <CardContent className="h-full flex flex-col justify-between p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">👕</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Anime Apparel</h3>
                    <p className="text-gray-600">Custom designs & premium quality</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" className="text-green-700 font-medium group-hover:text-green-800">
                      Explore Apparel
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full border border-white/30">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-semibold">Exclusive Access</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Join the Ultimate Otaku Community
              </h2>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                🎌 Get exclusive access to limited editions, early releases, and insider deals
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-2xl px-8 py-4 font-semibold">
                  Subscribe
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-6 pt-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>No spam ever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Exclusive deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Early access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
