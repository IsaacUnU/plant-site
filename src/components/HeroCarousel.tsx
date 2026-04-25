'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sun, Droplets, Leaf } from 'lucide-react';
import type { Difficulty, Light, WaterFrequency } from '@/types/plant';
import { DIFFICULTY_LABELS, DIFFICULTY_LABELS_ES, DIFFICULTY_STYLES_CLIENT, LIGHT_LABELS, LIGHT_LABELS_ES, WATER_LABELS, WATER_LABELS_ES } from '@/lib/utils';

export interface HeroPlant {
  slug: string;
  commonName: string;
  scientificName: string;
  difficulty: Difficulty;
  light: Light;
  water: WaterFrequency;
  image?: string;
  imageAlt?: string;
}

export default function HeroCarousel({ plants, hrefBase = '/plants', lang = 'en' }: { plants: HeroPlant[]; hrefBase?: string; lang?: 'en' | 'es' }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const items = plants.slice(0, 5);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((i) => (i + 1) % items.length);
        setVisible(true);
      }, 300);
    }, 3800);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const plant = items[current];
  const diff = DIFFICULTY_STYLES_CLIENT[plant.difficulty] ?? DIFFICULTY_STYLES_CLIENT.easy;

  const diffLabel = lang === 'es' ? (DIFFICULTY_LABELS_ES[plant.difficulty] ?? DIFFICULTY_LABELS[plant.difficulty]) : DIFFICULTY_LABELS[plant.difficulty];
  const lightLabel = lang === 'es' ? (LIGHT_LABELS_ES[plant.light] ?? LIGHT_LABELS[plant.light]) : LIGHT_LABELS[plant.light];
  const waterLabel = lang === 'es' ? (WATER_LABELS_ES[plant.water] ?? WATER_LABELS[plant.water]) : WATER_LABELS[plant.water];

  function goTo(i: number) {
    if (i === current) return;
    setVisible(false);
    setTimeout(() => {
      setCurrent(i);
      setVisible(true);
    }, 300);
  }

  return (
    <div className="relative w-72 mx-auto">
      {/* Depth layers behind the card */}
      <div className="absolute inset-0 translate-x-5 translate-y-5 rounded-3xl bg-[#dcfce7]" />
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-3xl bg-[#bbf7d0]" />

      <div
        className="relative rounded-3xl bg-white border border-[#E2EFE7] overflow-hidden"
        style={{
          boxShadow: '0 20px 60px rgba(21,128,61,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          transition: 'opacity 300ms ease, transform 300ms ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0px)' : 'translateY(8px)',
        }}
      >
          {/* Image area */}
          <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 to-green-200">
          <Link href={`${hrefBase}/${plant.slug}`} className="block relative h-full w-full" aria-label={`View ${plant.commonName}`}>
            {plant.image ? (
              <Image
                src={plant.image}
                alt={plant.imageAlt ?? `${plant.commonName} houseplant`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-16 h-16 text-emerald-300" />
              </div>
            )}
          </Link>
            {/* Difficulty badge */}
            <span
              className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${diff.bg} ${diff.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {diffLabel}
            </span>
          </div>

          {/* Card content */}
          <div className="p-4">
          <Link href={`${hrefBase}/${plant.slug}`} className="hover:no-underline">
            <h3
              className="font-bold text-[#0F172A] text-base leading-snug after:absolute after:inset-0 after:z-10"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {plant.commonName}
            </h3>
          </Link>
          <p className="text-xs text-slate-600 italic mt-0.5 mb-3">{plant.scientificName}</p>

            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-2.5 py-1">
                <Sun className="w-3 h-3 text-[#D97706]" />
                {lightLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-2.5 py-1">
                <Droplets className="w-3 h-3 text-[#0ea5e9]" />
                {waterLabel}
              </span>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {items.map((item, i) => (
            <button
              key={item.slug}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? 'w-5 h-2 bg-[#15803D]'
                  : 'w-2 h-2 bg-[#E2EFE7] hover:bg-[#86efac]'
              }`}
              aria-label={`Show ${item.commonName}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
