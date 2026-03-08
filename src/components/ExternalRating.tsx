'use client'

import { useState, useEffect } from 'react'
import { Star, Loader2, Link as LinkIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExternalRatingProps {
    productId: string;
    initialRating?: number;
    initialCount?: number;
}

export default function ExternalRating({ productId, initialRating, initialCount }: ExternalRatingProps) {
    const [rating, setRating] = useState<number | null>(initialRating || null)
    const [count, setCount] = useState<number | null>(initialCount || null)
    const [isLoading, setIsLoading] = useState(!initialRating)
    const [source, setSource] = useState('Amazon')

    useEffect(() => {
        if (!initialRating) {
            fetchRating()
        }
    }, [productId, initialRating])

    const fetchRating = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/products/${productId}/ratings`)
            if (res.ok) {
                const data = await res.json()
                setRating(data.rating)
                setCount(data.count)
                if (data.source) setSource(data.source)
            }
        } catch (error) {
            console.error('Failed to fetch external rating:', error)
            setRating(null)
            setCount(null)
        } finally {
            setIsLoading(false)
        }
    }

    const renderStars = (ratingValue: number) => {
        const stars = [];
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
                stars.push(<Star key={`${i}-empty`} className="w-4 h-4 text-gray-300 absolute" style={{ clipPath: 'inset(0 0 0 50%)' }} />);
            } else {
                stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
            }
        }
        return (
            <div className="flex gap-0.5 relative items-center">
                {stars.map((star, i) => (
                    <div key={i} className="relative flex">
                        {star}
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Fetching live ratings...</span>
            </div>
        )
    }

    if (rating === null) return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-sm shadow-sm ring-1 ring-black/5">
                    {/* Simple Amazon-like logo or icon */}
                    <span className="font-bold text-xs text-gray-800 tracking-tighter uppercase px-1">{source}</span>
                </div>
                <div className="flex gap-1 items-center">
                    {renderStars(rating)}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-800">
                    {rating.toFixed(1)} <span className="text-gray-500 font-medium">({count?.toLocaleString()} reviews)</span>
                </span>

                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-amber-100/50" onClick={fetchRating} title="Refresh external ratings">
                    <RefreshCw className="h-3 w-3 text-amber-600" />
                </Button>
            </div>
        </div>
    )
}
