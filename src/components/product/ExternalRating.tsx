'use client'

import { useState, useEffect } from 'react'
import { Star, Loader2, RefreshCw } from 'lucide-react'
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
    // No default label. It used to be 'Amazon', which meant a rating from MyAnimeList —
    // or one an admin typed in — was badged as an Amazon rating.
    const [source, setSource] = useState<string | null>(null)

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
                setSource(data.source ?? null)
            }
        } catch (error) {
            console.error('Failed to fetch external rating:', error)
            setRating(null)
            setCount(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Five positions, each an empty star with the filled one clipped over it to the
    // exact fraction this rating earns. The previous version pushed a sixth, absolutely
    // positioned star for the half case; it landed in its own zero-width flex slot at
    // the end of the row and rendered as a sliver hanging off the last star.
    const renderStars = (ratingValue: number) => (
        <div
            role="img"
            aria-label={`Rated ${ratingValue.toFixed(1)} out of 5`}
            className="flex items-center gap-0.5"
        >
            {Array.from({ length: 5 }, (_, i) => {
                const fill = Math.max(0, Math.min(1, ratingValue - i));
                return (
                    <span key={i} className="relative block h-4 w-4">
                        <Star aria-hidden="true" className="absolute inset-0 h-4 w-4 text-muted-foreground/30" />
                        {fill > 0 && (
                            <Star
                                aria-hidden="true"
                                className="absolute inset-0 h-4 w-4 fill-amber-400 text-amber-400"
                                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
                            />
                        )}
                    </span>
                );
            })}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                <span>Loading rating…</span>
            </div>
        )
    }

    if (rating === null) return null;

    // Attribute honestly, or not at all.
    const SOURCE_LABELS: Record<string, string> = {
        myanimelist: 'MyAnimeList',
        myfigurecollection: 'MFC',
        store: 'D-Store',
    };
    const sourceLabel = source ? SOURCE_LABELS[source] ?? null : null;

    // A line of metadata under the title, not a card. The amber panel this used to sit
    // in was the only amber thing on a page whose palette has no saturation in it, and
    // its `sm:` row break answers the viewport while the box itself is 381px wide from
    // lg up — so on a desktop the count wrapped to a second line inside the tint and
    // left the panel lopsided against the wishlist button beside it. The stars keep
    // their gold: that is a convention every shopper reads instantly, and it is the one
    // hue here doing work no weight could do.
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex items-center gap-0.5">
                {renderStars(rating)}
            </div>

            <span className="text-sm font-semibold tabular-nums text-foreground">
                {rating.toFixed(1)}
            </span>

            {count != null && (
                <span className="text-sm text-muted-foreground">
                    <span className="tabular-nums">{count.toLocaleString()}</span> ratings
                    {sourceLabel && ` on ${sourceLabel}`}
                </span>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                onClick={fetchRating}
                aria-label="Refresh rating"
                title="Refresh rating"
            >
                <RefreshCw aria-hidden="true" className="h-3 w-3" />
            </Button>
        </div>
    )
}
