"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchControlsProps {
    initialSearch?: string;
    initialSort?: string;
}

export default function SearchControls({ initialSearch, initialSort }: SearchControlsProps) {
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
            router.push(`/products${queryString ? `?${queryString}` : ''}`);
        }
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const queryString = createQueryString('sort', e.target.value);
        router.push(`/products${queryString ? `?${queryString}` : ''}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search all products..."
                    defaultValue={initialSearch || ''}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-gray-200 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                    onKeyDown={handleSearch}
                />
            </div>

            <select
                className="h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-zinc-700 shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all min-w-[180px] appearance-none cursor-pointer"
                defaultValue={initialSort || 'newest'}
                onChange={handleSortChange}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: '40px'
                }}
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
