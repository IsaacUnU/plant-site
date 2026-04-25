import Link from 'next/link';
import { Sun, Droplets } from 'lucide-react';
import { PlantCardData } from '@/types/plant';
import {
  DIFFICULTY_LABELS, LIGHT_LABELS, WATER_LABELS,
  DIFFICULTY_LABELS_ES, LIGHT_LABELS_ES, WATER_LABELS_ES,
} from '@/lib/utils';
import type { Lang } from '@/lib/plants';
import PlantImage from './PlantImage';

interface PlantCardProps {
  plant: PlantCardData;
  className?: string;
  priority?: boolean;
  hrefBase?: string;
  lang?: Lang;
}

const DIFFICULTY_STYLES = {
  easy:   { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  medium: { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  hard:   { dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     },
};

export default function PlantCard({ plant, className, priority = false, hrefBase = '/plants', lang = 'en' }: PlantCardProps) {
  const diff = DIFFICULTY_STYLES[plant.difficulty] ?? DIFFICULTY_STYLES.easy;
  const href = `${hrefBase}/${plant.slug}`;
  const diffLabel = lang === 'es' ? (DIFFICULTY_LABELS_ES[plant.difficulty] ?? DIFFICULTY_LABELS[plant.difficulty]) : DIFFICULTY_LABELS[plant.difficulty];
  const lightLabel = lang === 'es' ? (LIGHT_LABELS_ES[plant.light] ?? LIGHT_LABELS[plant.light]) : LIGHT_LABELS[plant.light];
  const waterLabel = lang === 'es' ? (WATER_LABELS_ES[plant.water] ?? WATER_LABELS[plant.water]) : WATER_LABELS[plant.water];

  return (
    <article className={`plant-card group relative bg-white rounded-3xl border border-[#E2EFE7] overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1${className ? ` ${className}` : ''}`}>

        {/* Image */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          <Link href={href} className="block relative h-full w-full" aria-label={`View ${plant.commonName} care guide`}>
            <PlantImage
              src={plant.image}
              alt={plant.imageAlt ?? `${plant.commonName} care guide`}
              commonName={plant.commonName}
              category={plant.category}
              fill
              className="group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
            />
          </Link>

          {/* Difficulty badge over image */}
          <span className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm bg-white/90 backdrop-blur-md border border-white/50 ${diff.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {diffLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <Link href={href} className="hover:no-underline">
              <h2
                className="font-semibold text-[1.05rem] text-[#0F172A] group-hover:text-[#15803D] transition-colors duration-200 leading-snug after:absolute after:inset-0 after:z-10"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {plant.commonName}
              </h2>
            </Link>
            <p className="text-xs text-slate-600 italic mt-0.5">{plant.scientificName}</p>
          </div>

          <p className="text-sm text-[#475569] leading-relaxed flex-1 line-clamp-2 mb-4">
            {plant.description}
          </p>

          {/* Care row */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F0F7F3]">
            <span className="flex items-center gap-1.5 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-3 py-1.5">
              <Sun className="w-3.5 h-3.5 text-[#D97706]" />
              {lightLabel}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-3 py-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#0ea5e9]" />
              {waterLabel}
            </span>
          </div>
      </div>
    </article>
  );
}
