'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface HeroCarouselProps {
  initialSlides: any[];
}

export function HeroCarousel({ initialSlides }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <section className="relative w-full border-b border-border overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="flex h-[70vh] min-h-[480px] md:h-[95vh] md:min-h-[750px]">
          {initialSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`flex-[0_0_100%] min-w-0 relative ${slide.bg_class} flex items-center justify-center overflow-hidden transition-colors duration-700`}
              style={slide.bg_color ? { backgroundColor: slide.bg_color } : {}}
            >

              {/* Dynamic Nature Color Background (Advanced Blending) */}
              {slide.image_url && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <Image
                    src={slide.image_url}
                    alt="Background Blur"
                    fill
                    className="object-cover scale-[1.5] blur-2xl opacity-50 mix-blend-overlay"
                    priority={index === 0}
                  />
                  {/* Gradient Overlay — adjusted for mobile readability */}
                  <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>
                </div>
              )}

              <div className="max-w-7xl mx-auto px-5 sm:px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center pb-24 md:pb-20 z-10">

                {/* Content */}
                <div className={`space-y-4 md:space-y-8 text-center ${slide.image_alignment === 'left' ? 'md:text-right md:order-last' : 'md:text-left'}`}>
                  <h1 className="text-[2.2rem] sm:text-[3rem] md:text-[6rem] font-black leading-[0.9] tracking-tighter uppercase whitespace-pre-line drop-shadow-xl">
                    {slide.title}
                  </h1>
                  <p className={`text-base sm:text-lg md:text-2xl font-medium opacity-90 max-w-lg mx-auto drop-shadow-md ${slide.image_alignment === 'left' ? 'md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0'}`}>
                    {slide.subtitle}
                  </p>
                  <div className="pt-2 md:pt-4">
                    <Button
                      asChild
                      size="lg"
                      className={`rounded-full px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-bold tracking-wide shadow-2xl ${slide.bg_class.includes('text-white') ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`}
                    >
                      <Link href={slide.link_url}>
                        {slide.cta_text} <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Visual Image / Placeholder — visible on mobile too */}
                <div className={`flex justify-center items-center relative pointer-events-none w-full h-[180px] sm:h-[220px] md:h-[120%] ${slide.image_alignment === 'left' ? 'md:order-first' : ''}`}>
                  <div className={`relative w-full h-full flex items-center justify-center md:scale-110 ${slide.image_alignment === 'left' ? 'md:-translate-x-12' : 'md:translate-x-12'}`}>

                    {/* Decorative Element */}
                    {!slide.image_url && (
                      <div className={`absolute inset-0 rounded-full opacity-20 ${slide.bg_class.includes('text-white') ? 'bg-white' : 'bg-black'} blur-3xl animate-pulse`}></div>
                    )}

                    {/* Actual Custom Image or Fallback */}
                    <div className="z-10 flex items-center justify-center w-full h-full relative">
                      {slide.image_url ? (
                        <div className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] md:w-[700px] md:h-[700px] relative animate-float opacity-95">
                          <Image
                            src={slide.image_url}
                            alt={slide.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : index === 0 ? (
                        <div className="w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] md:w-[500px] md:h-[500px] relative animate-float">
                          <Image
                            src="/Logo.Trns.png"
                            alt="D-Store Official Logo"
                            fill
                            className="object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                          />
                        </div>
                      ) : (
                        <div className="text-[5rem] sm:text-[7rem] md:text-[12rem] animate-float transform rotate-[-10deg]">
                          {index === 1 && "👒"}
                          {index === 2 && "📚"}
                          {index > 2 && "✨"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Background texture/noise */}
              <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons — Desktop */}
      <div className="absolute bottom-28 right-12 hidden md:flex gap-4 z-30">
        <button onClick={scrollPrev} className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <button onClick={scrollNext} className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dot Indicators — Mobile & Tablet */}
      <div className="absolute bottom-[70px] sm:bottom-[74px] left-0 right-0 flex md:hidden justify-center gap-2 z-30">
        {initialSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${selectedIndex === i ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Brand Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black text-white py-4 sm:py-6 border-t border-white/10 z-20 overflow-hidden">
        <div className="flex gap-10 sm:gap-16 animate-ticker whitespace-nowrap w-max">
          {["SHONEN JUMP", "BANDAI", "GOOD SMILE", "VIZ MEDIA", "TOEI ANIMATION", "MAPPA", "SHUEISHA", "KADOKAWA"].concat(["SHONEN JUMP", "BANDAI", "GOOD SMILE", "VIZ MEDIA", "TOEI ANIMATION", "MAPPA", "SHUEISHA", "KADOKAWA"]).map((brand, i) => (
            <span key={i} className="text-sm sm:text-xl md:text-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-80 shrink-0 select-none">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
