'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import type { DatabaseProduct } from '@/types/database'
import Image from 'next/image'

export default function UniversalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<DatabaseProduct[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!open) {
            setQuery('')
            setResults([])
        }
    }, [open])

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)

        if (!query.trim()) {
            setResults([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        debounceTimer.current = setTimeout(() => {
            fetchSearchResults()
        }, 300)

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current)
        }
    }, [query])

    const fetchSearchResults = async () => {
        try {
            const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`)
            if (!res.ok) throw new Error('Search failed')
            const data = await res.json()
            setResults(data.products || [])
        } catch (error) {
            console.error(error)
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectProduct = (id: string | number) => {
        setOpen(false)
        router.push(`/products/${id}`)
    }

    const handleViewAll = () => {
        setOpen(false)
        router.push(`/products?search=${encodeURIComponent(query)}`)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                    <Search className="h-5 w-5" strokeWidth={1.5} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-zinc-950 border-white/10 shadow-2xl overflow-hidden rounded-2xl">
                <DialogTitle className="sr-only">Search Products</DialogTitle>
                <div className="flex items-center px-4 py-3 border-b border-white/10">
                    <Search className="h-5 w-5 text-zinc-500 mr-3 shrink-0" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search characters, series, publishers or products..."
                        className="flex-1 bg-transparent border-0 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0 text-lg sm:text-base h-10 w-full"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white rounded-full ml-2" onClick={() => setQuery('')}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12 text-zinc-500">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Searching...</span>
                        </div>
                    ) : query.trim() !== '' && results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
                                <Search className="h-5 w-5 text-zinc-600" />
                            </div>
                            <p className="text-zinc-300 font-medium">No results found for "{query}"</p>
                            <p className="text-zinc-500 text-sm mt-1">Try checking for typos or using different keywords.</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2 flex flex-col">
                            <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Products
                            </div>
                            {results.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelectProduct(product.id)}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left w-full group"
                                >
                                    <div className="relative h-14 w-14 rounded-md overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                                        <img
                                            src={product.image_url || (product.image_urls?.[0]) || '/placeholder.svg'}
                                            alt={product.name}
                                            className="object-cover h-full w-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                                            {product.category === 'manga' ? product.author || product.series || 'Manga' :
                                                product.category === 'figures' ? product.series || 'Figure' :
                                                    'Apparel'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {product.tags?.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-sm font-semibold text-white">
                                        LKR {product.price.toLocaleString()}
                                    </div>
                                </button>
                            ))}
                            <div className="px-2 pt-2 pb-1 mt-1 border-t border-white/5">
                                <Button
                                    variant="ghost"
                                    className="w-full text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 justify-between group"
                                    onClick={handleViewAll}
                                >
                                    View all results
                                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 px-4 text-center">
                            <p className="text-zinc-500 text-sm">Search across the entire store for characters, series, publishers, or specific items.</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {['Luffy', 'One Piece', 'Viz Media', 'T-Shirts'].map(term => (
                                    <button key={term} onClick={() => setQuery(term)} className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
