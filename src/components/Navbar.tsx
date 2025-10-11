'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [totalItems, setTotalItems] = useState(0);
  const cartTotalItems = useCartStore(state => state.totalItems);
  
  useEffect(() => {
    setTotalItems(cartTotalItems);
  }, [cartTotalItems]);

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">D-Store</span>
            <span className="text-sm text-gray-500 ml-2">SL</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/manga" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Manga
            </Link>
            <Link 
              href="/figures" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Figures
            </Link>
            <Link 
              href="/tshirts" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              T-Shirts
            </Link>
            <Link 
              href="/products" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              All Products
            </Link>
          </div>

          {/* Cart */}
          <Link 
            href="/cart" 
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-2.5M7 13l2.5 2.5m4.5 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/manga" 
            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            Manga
          </Link>
          <Link 
            href="/figures" 
            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            Figures
          </Link>
          <Link 
            href="/tshirts" 
            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            T-Shirts
          </Link>
          <Link 
            href="/products" 
            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            All Products
          </Link>
        </div>
      </div>
    </nav>
  );
}