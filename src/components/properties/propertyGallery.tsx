"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  images: string[];
  name: string;
}

const PropertyGallery: React.FC<Props> = ({ images, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [, setIsMobile] = useState(false);
  
  const visibleImages = images?.length > 0 ? images : ["/placeholder-property.jpg"];

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % visibleImages.length);
  }, [visibleImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + visibleImages.length) % visibleImages.length);
  }, [visibleImages.length]);

  const nextModalImage = useCallback(() => {
    if (selectedImage === null) return;
    setSelectedImage((selectedImage + 1) % visibleImages.length);
  }, [selectedImage, visibleImages.length]);

  const prevModalImage = useCallback(() => {
    if (selectedImage === null) return;
    setSelectedImage((selectedImage - 1 + visibleImages.length) % visibleImages.length);
  }, [selectedImage, visibleImages.length]);

  useEffect(() => {
    if (visibleImages.length <= 1 || selectedImage !== null) return;
    
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, visibleImages.length, selectedImage, nextImage]);


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      
      if (e.key === 'ArrowRight') nextModalImage();
      if (e.key === 'ArrowLeft') prevModalImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, nextModalImage, prevModalImage]);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  }, [touchStart, touchEnd, nextImage, prevImage]);

  const handleModalTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || selectedImage === null) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextModalImage();
    if (isRightSwipe) prevModalImage();
  }, [touchStart, touchEnd, selectedImage, nextModalImage, prevModalImage]);

  return (
    <>
      {/* Full Width Carousel */}
      <div className="w-full relative h-80 md:h-96 lg:h-[500px] bg-gray-200 rounded-2xl overflow-hidden">
        {/* Main Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full cursor-pointer"
          onClick={() => setSelectedImage(currentIndex)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={visibleImages[currentIndex]}
            alt={`${name} photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-property.jpg';
            }}
          />
          
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300" />
        </motion.div>

        {visibleImages.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 md:p-3"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 md:p-3"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}

        {visibleImages.length > 1 && (
          <div className="absolute top-4 right-4 z-10 text-white text-sm bg-black/50 rounded-full px-3 py-1">
            {currentIndex + 1} / {visibleImages.length}
          </div>
        )}

        {visibleImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {visibleImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {visibleImages.length > 1 && (
          <button
            className="absolute bottom-4 right-4 z-10 text-white text-sm bg-black/50 rounded-full px-3 py-1 hover:bg-black/70 transition-colors"
            onClick={() => setSelectedImage(currentIndex)}
          >
            Lihat Semua Foto
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 md:p-4"
            onClick={() => setSelectedImage(null)}
          >

            <button
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 md:p-3"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {visibleImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 md:p-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevModalImage();
                  }}
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 md:p-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextModalImage();
                  }}
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </>
            )}

            <div className="absolute top-4 left-4 z-10 text-white text-sm md:text-base bg-black/50 rounded-full px-3 py-2">
              {selectedImage + 1} / {visibleImages.length}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-6xl h-full max-h-[85vh] md:max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleModalTouchEnd}
            >
              <Image
                src={visibleImages[selectedImage]}
                alt={`${name} photo ${selectedImage + 1}`}
                fill
                className="object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-property.jpg';
                }}
              />
            </motion.div>

            {visibleImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
                {visibleImages.map((src, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    className={`relative rounded-lg overflow-hidden cursor-pointer border-2 min-w-16 h-16 ${
                      index === selectedImage ? 'border-white' : 'border-transparent'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-property.jpg';
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyGallery;