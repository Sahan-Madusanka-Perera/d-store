'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { DatabaseProduct } from '@/types/database';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecommendationResponse {
  success: boolean;
  products: DatabaseProduct[];
  isPersonalized: boolean;
}

export function RecommendedProducts() {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations?limit=8');
        const data: RecommendationResponse = await response.json();
        
        if (data.success && data.products) {
          setProducts(data.products);
          setIsPersonalized(data.isPersonalized);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

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

  if (loading) {
    return (
      <section className="py-20 border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-48 h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-12"></div>
          <div className="flex gap-6 overflow-x-hidden">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-[280px] sm:w-[320px] flex-none">
                <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 rounded-[1rem] animate-pulse mb-4"></div>
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  // Map DatabaseProduct to the format expected by ProductCard
  const mappedProducts = products.map(p => {
    let images: string[] = [];
    if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) {
      images = p.image_urls;
    } else if (p.image_url) {
      images = [p.image_url];
    } else {
      images = ['/placeholder.svg'];
    }

    return {
      id: p.id.toString(),
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category,
      images: images,
      stock: p.stock,
      isActive: true,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      status: p.stock > 0 ? 'available' : 'out_of_stock',
      series: p.series,
      characterNames: p.character_names,
      externalRating: p.external_rating,
      externalRatingCount: p.external_rating_count,
      author: p.author,
      publisher: p.publisher,
      brand: p.brand,
    } as any;
  });

  return (
    <section className="py-20 border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <h2 className="text-heading">
            {isPersonalized ? "RECOMMENDED FOR YOU" : "TRENDING NOW"}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            {isPersonalized 
              ? "Curated selections based on your unique collection."
              : "Discover the most sought-after items our community is loving right now."}
          </p>
        </motion.div>

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
            {mappedProducts.map((product, index) => (
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
      </div>
    </section>
  );
}
