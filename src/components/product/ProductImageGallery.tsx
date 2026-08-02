'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  stock: number;
}

export default function ProductImageGallery({ images, productName, stock }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // document.body only exists once we're on the client; the portal target has to wait.
  // Server snapshot false, client snapshot true, and nothing to subscribe to — this
  // never changes after hydration.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const nextImage = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const prevImage = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedImageIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(selectedImageIndex);
  }, [selectedImageIndex, emblaApi]);

  // Keyboard navigation for full screen mode
  useEffect(() => {
    if (!isFullScreen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsFullScreen(false);
          break;
        case 'ArrowLeft':
          if (images.length > 1) prevImage();
          break;
        case 'ArrowRight':
          if (images.length > 1) nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullScreen, images.length]);

  // The overlay covers the viewport but the page underneath still took the wheel, so
  // closing it dropped you somewhere else on the page than where you opened it.
  useEffect(() => {
    if (!isFullScreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isFullScreen]);

  return (
    <div className="space-y-4 will-change-transform">
      {/* Main Image with Navigation */}
      <div className="relative w-full aspect-square max-h-[450px] lg:max-h-[550px] bg-muted rounded-2xl overflow-hidden shadow-xl dark:shadow-black/30 group cursor-pointer">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full">
                <Image
                  src={img}
                  alt={`${productName} - Image ${idx + 1}`}
                  fill
                  className="object-cover transition-[filter] duration-300 group-hover:brightness-110"
                  priority={idx === 0}
                  onClick={() => setIsFullScreen(true)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Full Screen Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 bg-black/20 hover:bg-black/40 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={() => setIsFullScreen(true)}
        >
          <Expand className="h-5 w-5" />
        </Button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
        
        {/* Image indicator */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  selectedImageIndex === index 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Horizontal Scrollable Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`relative flex-shrink-0 w-20 h-20 bg-muted rounded-lg overflow-hidden cursor-pointer transition-[ring,opacity] duration-200 ${
                  selectedImageIndex === index ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-blue-400'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Screen Modal.
          Rendered into <body> rather than in place. `position: fixed` is resolved
          against the nearest ancestor with a transform, filter, or will-change —
          and this gallery sits inside two `will-change-transform` wrappers on the
          product page. In place, `inset-0` therefore meant "the gallery column",
          so full screen was only ever as big as the left half of the page. */}
      {isFullScreen && isMounted && createPortal(
        <div className="fixed inset-0 z-modal bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setIsFullScreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Full Screen Image.
              Fills the viewport rather than a 1152px box: the old max-w-6xl/max-h-[90vh]
              wrapper meant "full screen" showed the figure smaller than a large monitor
              could manage. object-contain still protects the aspect ratio, and the
              controls below sit at z-10 so they overlay the image instead of stealing
              room from it. */}
          <div className="absolute inset-0 p-2 sm:p-6">
            <Image
              src={images[selectedImageIndex]}
              alt={productName}
              fill
              sizes="100vw"
              className="object-contain"
              quality={100}
              priority
            />
          </div>

          {/* Navigation in Full Screen */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Thumbnail Navigation at Bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-screen-lg overflow-x-auto px-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-white transition-all ${
                    selectedImageIndex === index ? 'ring-2 ring-white scale-110' : 'opacity-70'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}