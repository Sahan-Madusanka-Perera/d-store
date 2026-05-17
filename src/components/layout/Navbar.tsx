'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useCartStore } from '@/store/cart';
import UserProfile from '@/components/profile/UserProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { ShoppingCart, Menu, X, Search, Heart, ChevronDown, BookOpen, Sparkles, Shirt, ShoppingBag, Package, Shield, CheckCircle, Truck, Globe } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import type { NavCategory as NavCategoryType } from '@/types/navigation';

const UniversalSearch = dynamic(() => import('@/components/search/UniversalSearch'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
      <Search className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
    </div>
  )
});

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Sparkles, BookOpen, Shirt, Package, ShoppingBag,
};

const CATEGORY_BASE: Record<string, string> = {
  Figures: '/figures',
  Books: '/manga',
  Apparel: '/tshirts',
  Goods: '/products',
  Series: '/products',
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  dropdown: string[];
}

const FALLBACK_NAV: NavItem[] = [
  { label: 'Figures', href: '/figures', icon: Sparkles, dropdown: ['Anime Figures', 'Action Figures', 'Gundam Kits', 'Other'] },
  { label: 'Books', href: '/manga', icon: BookOpen, dropdown: ['Manga', 'Manhwa', 'Graphic Novels', 'Novel'] },
  { label: 'Apparel', href: '/tshirts', icon: Shirt, dropdown: ['Graphic Tshirts'] },
  { label: 'Goods', href: '/products', icon: Package, dropdown: [] },
  { label: 'Series', href: '/products', icon: ShoppingBag, dropdown: ['One Piece', 'Jujutsu Kaisen', 'Attack on Titan', 'Demon Slayer', 'Naruto', 'Dragon Ball', 'Chainsaw Man', 'My Hero Academia'] },
];

function getDropdownHref(item: NavItem, subItem: string): string {
  const base = CATEGORY_BASE[item.label];
  if (base) return `${base}?search=${encodeURIComponent(subItem)}`;
  return `/${item.label.toLowerCase()}?search=${encodeURIComponent(subItem)}`;
}

export default function Navbar() {
  const [totalItems, setTotalItems] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV);
  const cartTotalItems = useCartStore(state => state.totalItems);
  const fetchAvailableDiscounts = useCartStore(state => state.fetchAvailableDiscounts);
  const wishlistCount = useWishlistStore(state => state.items.length);
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    fetch('/api/nav-categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          const mapped: NavItem[] = data.map((cat: NavCategoryType) => ({
            label: cat.label,
            href: CATEGORY_BASE[cat.label] || cat.href || `/${cat.label.toLowerCase()}`,
            icon: ICON_MAP[cat.icon_name] || ShoppingBag,
            dropdown: (cat.dropdown_items || []).map((item: { label: string }) => item.label),
          }));
          setNavItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setTotalItems(cartTotalItems);
    fetchAvailableDiscounts();
  }, [cartTotalItems, fetchAvailableDiscounts]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Top Marquee Ribbon */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-black border-b border-white/5 overflow-hidden h-8 sm:h-9 flex items-center">
        <div className="flex animate-ticker whitespace-nowrap w-max">
          {/* Group 1 */}
          <div className="flex gap-8 sm:gap-12 md:gap-16 px-4 sm:px-6 md:px-8">
            {[
              { icon: Shield, text: 'Authentic' },
              { icon: CheckCircle, text: 'Brand New' },
              { icon: Globe, text: 'Officially Licensed' },
              { icon: Truck, text: 'Island-Wide Free Delivery' },
            ].concat([
              { icon: Shield, text: 'Authentic' },
              { icon: CheckCircle, text: 'Brand New' },
              { icon: Globe, text: 'Officially Licensed' },
              { icon: Truck, text: 'Island-Wide Free Delivery' },
            ]).concat([
              { icon: Shield, text: 'Authentic' },
              { icon: CheckCircle, text: 'Brand New' },
              { icon: Globe, text: 'Officially Licensed' },
              { icon: Truck, text: 'Island-Wide Free Delivery' },
            ]).map((item, i) => (
              <span key={`g1-${i}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-zinc-400 shrink-0 select-none">
                <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" strokeWidth={2} />
                {item.text}
              </span>
            ))}
          </div>
          {/* Group 2 */}
          <div className="flex gap-8 sm:gap-12 md:gap-16 px-4 sm:px-6 md:px-8" aria-hidden="true">
            {[
              { icon: Shield, text: 'Authentic' },
              { icon: CheckCircle, text: 'Brand New' },
              { icon: Globe, text: 'Officially Licensed' },
              { icon: Truck, text: 'Island-Wide Free Delivery' },
            ].concat([
              { icon: Shield, text: 'Authentic' },
              { icon: CheckCircle, text: 'Brand New' },
              { icon: Globe, text: 'Officially Licensed' },
              { icon: Truck, text: 'Island-Wide Free Delivery' },
            ]).concat([
              { icon: Shield, text: 'Authentic' },
              { icon: CheckCircle, text: 'Brand New' },
              { icon: Globe, text: 'Officially Licensed' },
              { icon: Truck, text: 'Island-Wide Free Delivery' },
            ]).map((item, i) => (
              <span key={`g2-${i}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-zinc-400 shrink-0 select-none">
                <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" strokeWidth={2} />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed top-11 sm:top-12 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none transition-all duration-300">
        <nav className="pointer-events-auto w-full max-w-7xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-xl shadow-black/20 rounded-full px-4 sm:px-6 transition-all duration-300 supports-[backdrop-filter]:bg-black/50">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="relative h-8 w-24 sm:h-9 sm:w-28 overflow-hidden transition-transform group-hover:opacity-80 duration-300">
                <img src="/Logo.Trns.png" alt="D-Store Logo" className="h-full w-full object-contain" />
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <NavDropdown key={item.label} item={item} />
              ))}
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="hidden sm:block">
                <UniversalSearch />
              </div>

              <Button variant="ghost" size="icon" asChild className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                <Link href="/profile/wishlist" className="flex items-center justify-center">
                  <Heart className="h-5 w-5" strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-white text-black border-2 border-zinc-900 shadow-sm">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

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

              <div className="text-zinc-300 hover:text-white transition-colors duration-200">
                <UserProfile />
              </div>

              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${mobileOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-500 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`relative z-10 h-[100dvh] flex flex-col px-6 pt-6 pb-6 sm:pb-8 transition-all duration-500 ${mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-shrink-0 items-center justify-between mb-8">
            <Link href="/" onClick={() => setMobileOpen(false)} className="h-8 w-24 relative">
              <img src="/Logo.Trns.png" alt="D-Store" className="h-full w-full object-contain" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item, i) => (
              <div key={item.label} className="group">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-5 py-4 border-b border-white/[0.06] transition-all duration-300 active:opacity-60"
                  style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : '0ms' }}
                >
                  <item.icon className="w-5 h-5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-2xl font-bold tracking-tight text-white">
                    {item.label}
                  </span>
                  {item.dropdown.length > 0 && (
                    <ChevronDown className="w-4 h-4 text-zinc-500 ml-auto" strokeWidth={1.5} />
                  )}
                </Link>
                {item.dropdown.length > 0 && (
                  <div className="ml-12 space-y-1 pb-2 border-b border-white/[0.06]">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub}
                        href={getDropdownHref(item, sub)}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-[15px] text-zinc-400 hover:text-white transition-colors active:text-white"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex-shrink-0 space-y-3 pt-4 mt-auto border-t border-white/10">
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/30">
              <UniversalSearch onOpen={() => setMobileOpen(false)} isMobile={true} />
            </div>
            <div className="flex gap-3">
              <Link
                href="/profile/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-12 rounded-2xl border border-white/20 text-white hover:bg-white/10 text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
              >
                <Heart className="h-5 w-5" strokeWidth={1.5} />
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-12 rounded-2xl bg-white text-black hover:bg-gray-200 text-sm font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NavDropdown({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  if (item.dropdown.length === 0) {
    return (
      <Link
        href={item.href}
        className="px-4 py-2 text-[14px] font-semibold tracking-wide text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        className="px-4 py-2 text-[14px] font-semibold tracking-wide text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition-all duration-200 inline-flex items-center gap-1"
      >
        {item.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Link>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-xl shadow-black/20 py-2 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {item.dropdown.map((subItem) => (
            <Link
              key={subItem}
              href={getDropdownHref(item, subItem)}
              className="block px-5 py-2.5 text-[14px] text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {subItem}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
