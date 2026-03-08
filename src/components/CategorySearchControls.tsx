"use client";

import { useRouter, useSearchParams } from 'next/navigation';

interface CategorySearchControlsProps {
  basePath: string;
  initialSearch?: string;
  initialSort?: string;
}

export default function CategorySearchControls({ basePath, initialSearch, initialSort }: CategorySearchControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const queryString = createQueryString('search', e.currentTarget.value);
      router.push(`${basePath}${queryString ? `?${queryString}` : ''}`);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const queryString = createQueryString('sort', e.target.value);
    router.push(`${basePath}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <input
        type="text"
        placeholder="Search..."
        defaultValue={initialSearch || ''}
        className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        onKeyDown={handleSearch}
      />
      <select
        className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/10 font-medium min-w-[180px]"
        defaultValue={initialSort || 'newest'}
        onChange={handleSortChange}
      >
        <option value="newest">Newest Arrivals</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A to Z</option>
        <option value="name_desc">Name: Z to A</option>
      </select>
    </div>
  );
}
