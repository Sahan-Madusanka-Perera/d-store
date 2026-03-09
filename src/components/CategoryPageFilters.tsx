"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CategoryPageFiltersProps {
  basePath: string;
  isMobile?: boolean;
  extraFilters?: {
    label: string;
    paramName: string;
    options: { id: string; name: string }[];
  }[];
}

export default function CategoryPageFilters({ basePath, isMobile = false, extraFilters }: CategoryPageFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [extraState, setExtraState] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    extraFilters?.forEach(f => {
      init[f.paramName] = searchParams.get(f.paramName) || 'all';
    });
    return init;
  });

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    const updated: Record<string, string> = {};
    extraFilters?.forEach(f => {
      updated[f.paramName] = searchParams.get(f.paramName) || 'all';
    });
    setExtraState(updated);
  }, [searchParams, extraFilters]);

  const buildUrl = (overrides: Record<string, string | null> = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([name, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
    });
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  };

  const priceRanges = [
    { label: 'Under LKR 2,000', min: '', max: '2000' },
    { label: 'LKR 2,000 - 5,000', min: '2000', max: '5000' },
    { label: 'LKR 5,000 - 10,000', min: '5000', max: '10000' },
    { label: 'Over LKR 10,000', min: '10000', max: '' },
  ];

  const applyCustomRange = () => {
    router.push(buildUrl({ minPrice: minPrice || null, maxPrice: maxPrice || null }));
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    const cleared: Record<string, string | null> = { minPrice: null, maxPrice: null };
    extraFilters?.forEach(f => { cleared[f.paramName] = null; });
    setExtraState(() => {
      const init: Record<string, string> = {};
      extraFilters?.forEach(f => { init[f.paramName] = 'all'; });
      return init;
    });
    router.push(buildUrl(cleared));
  };

  const hasActiveFilters = minPrice || maxPrice || Object.values(extraState).some(v => v !== 'all');

  return (
    <div className={isMobile ? 'px-2 py-2' : 'bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24'}>
      <h3 className="font-bold text-xl text-zinc-900 mb-6">Filters</h3>

      {/* Extra category-specific filters */}
      {extraFilters?.map((filter) => (
        <div key={filter.paramName} className="mb-8">
          <h4 className="font-medium text-sm text-zinc-500 uppercase tracking-wider mb-4">{filter.label}</h4>
          <div className="space-y-3">
            {filter.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name={filter.paramName}
                  value={opt.id}
                  checked={extraState[filter.paramName] === opt.id}
                  onChange={(e) => {
                    setExtraState(prev => ({ ...prev, [filter.paramName]: e.target.value }));
                    router.push(buildUrl({ [filter.paramName]: e.target.value }));
                  }}
                  className="w-4 h-4 text-zinc-900 bg-white border-gray-300 focus:ring-zinc-900 focus:ring-offset-white"
                />
                <span className={`text-sm ${extraState[filter.paramName] === opt.id ? 'font-semibold text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-900 transition-colors'}`}>
                  {opt.name}
                </span>
              </label>
            ))}
          </div>
          <div className="h-px bg-gray-200 w-full mt-8"></div>
        </div>
      ))}

      {/* Price Filter */}
      <div className="mb-8">
        <h4 className="font-medium text-sm text-zinc-500 uppercase tracking-wider mb-4">Price Range</h4>
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
                    router.push(buildUrl({ minPrice: range.min || null, maxPrice: range.max || null }));
                  }}
                  className="w-4 h-4 text-zinc-900 bg-white border-gray-300 focus:ring-zinc-900 focus:ring-offset-white"
                />
                <span className={`text-sm ${isActive ? 'font-semibold text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-900 transition-colors'}`}>
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">Rs.</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          <span className="text-zinc-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">Rs.</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
        </div>

        <Button onClick={applyCustomRange} className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-white" size="sm">
          Apply Custom Range
        </Button>
      </div>

      {hasActiveFilters && (
        <Button onClick={clearFilters} variant="outline" className="w-full text-zinc-500 hover:text-zinc-900 border-gray-200">
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
