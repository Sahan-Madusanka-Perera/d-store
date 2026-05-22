'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';

interface CategoryScrollWrapperProps {
  products: Product[];
}

export function CategoryScrollWrapper({ products }: CategoryScrollWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    // Check initial state after products render
    const timer = setTimeout(updateScrollButtons, 100);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      clearTimeout(timer);
    };
  }, [products, updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 340; // ~320px card + 20px gap
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative group/carousel">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 hover:scale-110 active:scale-95 ${
          canScrollLeft ? 'opacity-100 sm:-translate-x-1/2' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 hover:scale-110 active:scale-95 ${
          canScrollRight ? 'opacity-100 sm:translate-x-1/2' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="snap-start flex-none w-[280px] sm:w-[320px]"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
