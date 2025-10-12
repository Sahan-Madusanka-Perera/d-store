'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import UserProfile from './UserProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Menu, Store } from 'lucide-react';

export default function Navbar() {
  const [totalItems, setTotalItems] = useState(0);
  const cartTotalItems = useCartStore(state => state.totalItems);
  
  useEffect(() => {
    setTotalItems(cartTotalItems);
  }, [cartTotalItems]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Store className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -inset-2 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">D-Store</span>
              <Badge variant="secondary" className="text-xs">
                SL 🇱🇰
              </Badge>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="/manga">Manga</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/figures">Figures</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/tshirts">T-Shirts</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/products">All Products</Link>
            </Button>
          </div>

          {/* Right side - Cart and Auth */}
                    {/* Right side - Cart and Auth */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <Button variant="outline" size="sm" asChild className="relative">
              <Link href="/cart" className="flex items-center space-x-1">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Profile */}
            <UserProfile />

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/" className="flex items-center space-x-2 mb-6">
                      <Store className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold text-primary">D-Store</span>
                      <Badge variant="secondary" className="text-xs">SL</Badge>
                    </Link>
                    
                    <Separator />
                    
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/manga">📚 Manga</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/figures">🎎 Figures</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/tshirts">👕 T-Shirts</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/products">🛍️ All Products</Link>
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <Button asChild className="w-full">
                      <Link href="/cart">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart ({totalItems})
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}