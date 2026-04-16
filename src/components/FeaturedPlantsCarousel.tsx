'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PlantCard from './PlantCard';

export default function FeaturedPlantsCarousel({ plants }: { plants: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Desplazamos exactamente el ancho de una tarjeta (320px) + gap (24px)
      const scrollAmount = 344; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Botones de navegación (solo se muestran al pasar el ratón en escritorio) */}
      <button 
        onClick={() => scroll('left')}
        aria-label="Previous plants"
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 bg-[#15803D] text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-2 border-white p-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex hover:scale-110 hover:bg-[#166534] cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll('right')}
        aria-label="Next plants"
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 bg-[#15803D] text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-2 border-white p-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex hover:scale-110 hover:bg-[#166534] cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Contenedor de Scroll */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-2 pt-2"
      >
        {plants.map((plant: any) => (
          <div 
            key={plant.slug} 
            className="min-w-[280px] sm:min-w-[320px] max-w-[320px] flex-none snap-start hover:-translate-y-2 transition-transform duration-300 relative z-0"
          >
            <PlantCard plant={plant} />
          </div>
        ))}
      </div>
    </div>
  );
}
