'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { DatabaseProduct } from '@/types/database';

interface RecommendationResponse {
  success: boolean;
  products: DatabaseProduct[];
  isPersonalized: boolean;
}

export function RecommendedProducts() {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

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

  if (loading) {
    return (
      <section className="py-20 border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-48 h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-12"></div>
          <div className="flex gap-6 overflow-x-hidden">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-[280px] sm:w-[320px] flex-none">
                <div className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-800 rounded-[1rem] animate-pulse mb-4"></div>
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
    } as any; // Using any here because the ProductCard uses the rigorous Product type from the store 
               // but we only need the fields that the UI actually renders.
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

        <div className="relative">
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
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
