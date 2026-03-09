'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import UserProfile from './UserProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UniversalSearch from './UniversalSearch';
import { ShoppingCart, Menu, X, BookOpen, Sparkles, Shirt, ShoppingBag, Search } from 'lucide-react';

export default function Navbar() {
  const [totalItems, setTotalItems] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartTotalItems = useCartStore(state => state.totalItems);
  const fetchAvailableDiscounts = useCartStore(state => state.fetchAvailableDiscounts);

  useEffect(() => {
    setTotalItems(cartTotalItems);
    fetchAvailableDiscounts();
  }, [cartTotalItems, fetchAvailableDiscounts]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
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
              {/* Search */}
              <div className="hidden sm:block">
                <UniversalSearch />
              </div>

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

              {/* Mobile menu toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  onPointerDown={() => setMobileOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Full-screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${mobileOpen ? 'visible' : 'invisible'}`}
        onClick={() => setMobileOpen(false)}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Content */}
        <div
          className={`relative z-10 h-full flex flex-col justify-between px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-all duration-500 ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar: Logo + Close */}
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMobileOpen(false)} className="h-8 w-24 relative">
              <img src="/Logo.Trns.png" alt="D-Store" className="h-full w-full object-contain" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              onPointerDown={(e) => {
                e.preventDefault();
                setMobileOpen(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                setMobileOpen(false);
              }}
              aria-label="Close menu"
              className="relative z-20 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors touch-manipulation"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col justify-center -mt-12 space-y-1">
            {[
              { href: '/manga', label: 'Manga', icon: BookOpen },
              { href: '/figures', label: 'Figures', icon: Sparkles },
              { href: '/tshirts', label: 'T-Shirts', icon: Shirt },
              { href: '/products', label: 'All Products', icon: ShoppingBag },
            ].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="group flex items-center gap-5 py-4 border-b border-white/[0.06] transition-all duration-300"
                style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : '0ms' }}
              >
                <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <span className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Bottom section: Search + Cart */}
          <div className="space-y-4 pb-4">
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <UniversalSearch onOpen={() => setMobileOpen(false)} />
            </div>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="w-full h-13 rounded-2xl bg-white text-black hover:bg-gray-200 text-sm font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2} />
              View Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}