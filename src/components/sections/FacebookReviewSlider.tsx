'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Facebook } from 'lucide-react';

interface Review {
    id: string;
    reviewerName: string;
    reviewText: string;
    date: string;
    rating: number; // usually 5 for positive
}

interface FacebookReviewSliderProps {
    reviews: Review[];
    overallRating: number;
    totalReviews: number;
    pageUrl: string;
}

export function FacebookReviewSlider({ reviews, overallRating, totalReviews, pageUrl }: FacebookReviewSliderProps) {
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
        const cardWidth = 360; // 340px card + gap
        el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    };

    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="w-full bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] border border-gray-200 overflow-hidden shadow-xl transition-all">
            <div className="p-8 md:p-12 flex flex-col gap-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 border-b border-gray-200 pb-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                            <Facebook className="w-10 h-10 md:w-12 md:h-12 text-white fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
                                What Our Community Says
                            </h2>
                            <p className="text-slate-500 font-medium mt-1 mb-4 text-base md:text-lg">
                                Real reviews from our Facebook family.
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(overallRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                    ))}
                                </div>
                                <span className="font-bold text-slate-900 text-lg">{overallRating.toFixed(1)}</span>
                                <span className="text-slate-400 text-sm font-medium">({totalReviews} Reviews)</span>
                            </div>
                        </div>
                    </div>
                    <a 
                        href={pageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20"
                    >
                        Recommend Us
                    </a>
                </div>

                {/* Slider */}
                <div className="relative group/carousel">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white text-slate-900 border border-slate-200 shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-slate-950 hover:text-white hover:scale-110 active:scale-95 ${
                            canScrollLeft ? 'opacity-100 sm:-translate-x-1/2' : 'opacity-0 pointer-events-none'
                        }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white text-slate-900 border border-slate-200 shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-slate-950 hover:text-white hover:scale-110 active:scale-95 ${
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
                                className="snap-start flex-none w-[300px] sm:w-[340px] bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg uppercase shrink-0">
                                        {review.reviewerName.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 leading-tight line-clamp-1">{review.reviewerName}</span>
                                        <span className="text-xs text-slate-500 mt-0.5">{review.date}</span>
                                    </div>
                                    <Facebook className="w-5 h-5 text-blue-500 fill-blue-500 ml-auto opacity-20" />
                                </div>
                                
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                    ))}
                                </div>
                                
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-5 italic">
                                    "{review.reviewText}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
