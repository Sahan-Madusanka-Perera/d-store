'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  stock: number;
}

export default function ProductImageGallery({ images, productName, stock }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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

  return (
    <div className="space-y-4">
      {/* Main Image with Navigation */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
        <Image
          src={images[selectedImageIndex]}
          alt={productName}
          fill
          className="object-cover transition-all duration-300 hover:scale-105"
          priority
          onClick={() => setIsFullScreen(true)}
        />
        
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
                className={`relative flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${
                  selectedImageIndex === index ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setIsFullScreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Full Screen Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4">
            <Image
              src={images[selectedImageIndex]}
              alt={productName}
              fill
              className="object-contain"
              quality={100}
            />
          </div>

          {/* Navigation in Full Screen */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Thumbnail Navigation at Bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-screen-lg overflow-x-auto px-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-white transition-all ${
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
        </div>
      )}
    </div>
  );
}