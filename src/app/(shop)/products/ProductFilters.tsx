"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
    isMobile?: boolean;
}

export default function ProductFilters({ isMobile = false }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');

    // Update state when URL changes
    useEffect(() => {
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setCategory(searchParams.get('category') || 'all');
    }, [searchParams]);

    const createQueryString = (paramsToUpdate: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(paramsToUpdate).forEach(([name, value]) => {
            if (value && value !== 'all') {
                params.set(name, value);
            } else {
                params.delete(name);
            }
        });

        return params.toString();
    };

    const applyFilters = () => {
        const queryString = createQueryString({
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
            category: category || null
        });
        router.push(`/products${queryString ? `?${queryString}` : ''}`);
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setCategory('all');
        const queryString = createQueryString({
            minPrice: null,
            maxPrice: null,
            category: null
        });
        router.push(`/products${queryString ? `?${queryString}` : ''}`);
    };

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'manga', name: 'Manga' },
        { id: 'figures', name: 'Figures' },
        { id: 'tshirts', name: 'Apparel' }
    ];

    const priceRanges = [
        { label: 'Under LKR 2,000', min: '', max: '2000' },
        { label: 'LKR 2,000 - 5,000', min: '2000', max: '5000' },
        { label: 'LKR 5,000 - 10,000', min: '5000', max: '10000' },
        { label: 'Over LKR 10,000', min: '10000', max: '' },
    ];

    return (
        <div className={isMobile ? 'px-2 py-2' : 'bg-card rounded-2xl border border-border/60 p-6 shadow-sm sticky top-24'}>
            <h3 className="font-bold text-xl mb-6">Filters</h3>

            {/* Category Filter */}
            <div className="mb-8">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">Category</h4>
                <div className="space-y-3">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                value={cat.id}
                                checked={category === cat.id}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    const qs = createQueryString({ category: e.target.value });
                                    router.push(`/products${qs ? `?${qs}` : ''}`);
                                }}
                                className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                            />
                            <span className={`text-sm ${category === cat.id ? 'font-semibold' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`}>
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="h-px bg-border/60 w-full mb-8"></div>

            {/* Price Filter */}
            <div className="mb-8">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">Price Range</h4>
                <div className="space-y-3 mb-6">
                    {priceRanges.map((range, idx) => {
                        const isActive = minPrice === range.min && maxPrice === range.max;
                        return (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    checked={isActive}
                                    onChange={() => {
                                        setMinPrice(range.min);
                                        setMaxPrice(range.max);
                                        const qs = createQueryString({ minPrice: range.min || null, maxPrice: range.max || null });
                                        router.push(`/products${qs ? `?${qs}` : ''}`);
                                    }}
                                    className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-background"
                                />
                                <span className={`text-sm ${isActive ? 'font-semibold' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`}>
                                    {range.label}
                                </span>
                            </label>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rs.</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rs.</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <Button onClick={applyFilters} className="w-full mt-4" size="sm">
                    Apply Custom Range
                </Button>
            </div>

            {(minPrice || maxPrice || category !== 'all') && (
                <Button onClick={clearFilters} variant="outline" className="w-full text-muted-foreground hover:text-foreground border-border/60">
                    Clear All Filters
                </Button>
            )}
        </div>
    );
}
