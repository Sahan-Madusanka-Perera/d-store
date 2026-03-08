"use client";

import { useRouter, useSearchParams } from 'next/navigation';

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
        <div className="flex flex-wrap gap-4 mb-8">
            <input
                type="text"
                placeholder="Search products..."
                defaultValue={initialSearch || ''}
                className="border border-border/60 rounded-xl px-4 py-2.5 bg-card flex-1 min-w-[250px] shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={handleSearch}
            />

            <select
                className="border border-border/60 rounded-xl px-4 py-2.5 bg-card shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium min-w-[180px]"
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
