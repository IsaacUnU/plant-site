import Link from 'next/link';
import { Sun, Droplets } from 'lucide-react';
import { PlantCardData } from '@/types/plant';
import { DIFFICULTY_LABELS, LIGHT_LABELS, WATER_LABELS } from '@/lib/utils';
import PlantImage from './PlantImage';

interface PlantCardProps {
  plant: PlantCardData;
  className?: string;
}

const DIFFICULTY_STYLES = {
  easy:   { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  medium: { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  hard:   { dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     },
};

export default function PlantCard({ plant, className }: PlantCardProps) {
  const diff = DIFFICULTY_STYLES[plant.difficulty] ?? DIFFICULTY_STYLES.easy;

  return (
    <Link href={`/plants/${plant.slug}`} className={`group block cursor-pointer${className ? ` ${className}` : ''}`}>
      <article className="plant-card bg-white rounded-3xl border border-[#E2EFE7] overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1">

        {/* Image */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          <PlantImage
            src={plant.image}
            alt={plant.imageAlt ?? `${plant.commonName} care guide`}
            commonName={plant.commonName}
            category={plant.category}
            fill
            className="group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Difficulty badge over image */}
          <span className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${diff.bg} ${diff.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {DIFFICULTY_LABELS[plant.difficulty]}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <h2
              className="font-semibold text-[1.05rem] text-[#0F172A] group-hover:text-[#15803D] transition-colors duration-200 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {plant.commonName}
            </h2>
            <p className="text-xs text-[#94a3b8] italic mt-0.5">{plant.scientificName}</p>
          </div>

          <p className="text-sm text-[#475569] leading-relaxed flex-1 line-clamp-2 mb-4">
            {plant.description}
          </p>

          {/* Care row */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F0F7F3]">
            <span className="flex items-center gap-1.5 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-3 py-1.5">
              <Sun className="w-3.5 h-3.5 text-[#D97706]" />
              {LIGHT_LABELS[plant.light]}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-3 py-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#0ea5e9]" />
              {WATER_LABELS[plant.water]}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
