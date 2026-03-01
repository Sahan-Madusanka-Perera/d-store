'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import UserProfile from './UserProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Menu, Store, BookOpen, Sparkles, Shirt, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const [totalItems, setTotalItems] = useState(0);
  const cartTotalItems = useCartStore(state => state.totalItems);
  const fetchAvailableDiscounts = useCartStore(state => state.fetchAvailableDiscounts);

  useEffect(() => {
    setTotalItems(cartTotalItems);
    fetchAvailableDiscounts();
  }, [cartTotalItems, fetchAvailableDiscounts]);

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none transition-all duration-300">
      <nav className="pointer-events-auto w-full max-w-5xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-xl shadow-black/20 rounded-full px-4 sm:px-6 transition-all duration-300 supports-[backdrop-filter]:bg-black/50">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative h-8 w-24 sm:h-9 sm:w-28 overflow-hidden transition-transform group-hover:opacity-80 duration-300">
              <img src="/Logo.Trns.png" alt="D-Store Logo" className="h-full w-full object-contain" />
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link href="/manga" className="px-4 py-2 text-[14px] font-semibold tracking-wide text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200">
              Manga
            </Link>
            <Link href="/figures" className="px-4 py-2 text-[14px] font-semibold tracking-wide text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200">
              Figures
            </Link>
            <Link href="/tshirts" className="px-4 py-2 text-[14px] font-semibold tracking-wide text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200">
              T-Shirts
            </Link>
            <Link href="/products" className="px-4 py-2 text-[14px] font-semibold tracking-wide text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200">
              All Products
            </Link>
          </div>

          {/* Right side - Cart and Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200">
              <Link href="/cart" className="flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-white text-black border-2 border-zinc-900 shadow-sm">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Profile */}
            <div className="text-zinc-300 hover:text-white transition-colors duration-200">
              <UserProfile />
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                    <Menu className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 p-6 shadow-2xl">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                      <div className="h-8 w-24 relative">
                        <img src="/Logo.Trns.png" alt="D-Store" className="h-full w-full object-contain" />
                      </div>
                    </div>

                    {/* Mobile Nav Links */}
                    <div className="flex flex-col space-y-2 flex-grow">
                      <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white text-base font-medium transition-all">
                        <Link href="/manga" className="flex items-center gap-4">
                          <BookOpen className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
                          Manga
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white text-base font-medium transition-all">
                        <Link href="/figures" className="flex items-center gap-4">
                          <Sparkles className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
                          Figures
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white text-base font-medium transition-all">
                        <Link href="/tshirts" className="flex items-center gap-4">
                          <Shirt className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
                          T-Shirts
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white text-base font-medium transition-all">
                        <Link href="/products" className="flex items-center gap-4">
                          <ShoppingBag className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
                          All Products
                        </Link>
                      </Button>
                    </div>

                    {/* Mobile Footer Area */}
                    <div className="pt-6 mt-6 border-t border-white/10">
                      <Button asChild className="w-full h-12 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-semibold shadow-md transition-all">
                        <Link href="/cart">
                          <ShoppingCart className="h-5 w-5 mr-3" strokeWidth={2} />
                          View Cart ({totalItems})
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}