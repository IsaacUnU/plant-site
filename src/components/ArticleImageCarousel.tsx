'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

export default function ArticleImageCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;
  
  if (images.length === 1) {
    return (
      <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden mb-8 border border-[#E2EFE7]">
        <Image src={images[0].src} alt={images[0].alt} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
        {images[0].caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0F2922]/80 to-transparent pt-12 pb-4 px-6 text-white text-sm font-medium">
            {images[0].caption}
          </div>
        )}
      </div>
    );
  }

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden mb-8 border border-[#E2EFE7] group">
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority={i === 0} />
          {img.caption && (
             <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0F2922]/80 to-transparent pt-16 pb-6 px-6">
                <p className="text-white font-medium text-sm drop-shadow-md">{img.caption}</p>
             </div>
          )}
        </div>
      ))}
      
      <button 
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={next}
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all rounded-full cursor-pointer shadow-sm ${i === current ? 'bg-white w-6 h-1.5' : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
}
