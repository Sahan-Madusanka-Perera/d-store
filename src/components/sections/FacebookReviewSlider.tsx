'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Review {
    id: string;
    reviewerName: string;
    reviewText: string;
    date: string;
    rating: number;
}

interface CustomerReviewSliderProps {
    reviews: Review[];
}

export function CustomerReviewSlider({ reviews }: CustomerReviewSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

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
        const timer = setTimeout(updateScrollButtons, 100);
        return () => {
            el.removeEventListener('scroll', updateScrollButtons);
            clearTimeout(timer);
        };
    }, [reviews, updateScrollButtons]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
    };

    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="w-full bg-muted/40 rounded-[2.5rem] md:rounded-[3rem] border border-border overflow-hidden shadow-xl dark:shadow-black/30 transition-all">
            <div className="p-8 md:p-12 flex flex-col gap-10">

                {/* Header */}
                <div className="flex flex-col items-center text-center gap-4 border-b border-border pb-10">
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        Testimonials
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
                        What Our Customers Say
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span className="font-black text-foreground text-2xl">5.0</span>
                    </div>
                </div>

                {/* Slider */}
                <div className="relative group/carousel">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card text-foreground border border-border shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-foreground hover:text-background hover:scale-110 active:scale-95 ${
                            canScrollLeft ? 'opacity-100 sm:-translate-x-1/2' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card text-foreground border border-border shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-foreground hover:text-background hover:scale-110 active:scale-95 ${
                            canScrollRight ? 'opacity-100 sm:translate-x-1/2' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                    >
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="snap-start flex-none w-[300px] sm:w-[340px] bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border flex flex-col hover:shadow-md dark:hover:shadow-black/30 transition-shadow"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg uppercase shrink-0">
                                        {review.reviewerName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground leading-tight line-clamp-1">{review.reviewerName}</span>
                                        <span className="text-xs text-muted-foreground mt-0.5">{review.date}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                                    ))}
                                </div>

                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-5 italic">
                                    &ldquo;{review.reviewText}&rdquo;
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Keep old export name for backwards compatibility (used in FacebookReviewSlider imports elsewhere if any)
export { CustomerReviewSlider as FacebookReviewSlider };
