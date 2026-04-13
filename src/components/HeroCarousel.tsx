'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Droplets, Leaf } from 'lucide-react';
import type { Difficulty, Light, WaterFrequency } from '@/types/plant';
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES_CLIENT, LIGHT_LABELS, WATER_LABELS } from '@/lib/utils';

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

export default function HeroCarousel({ plants }: { plants: HeroPlant[] }) {
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
  const diff = DIFFICULTY_STYLES_CLIENT[plant.difficulty];

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

      {/* Main card */}
      <Link href={`/plants/${plant.slug}`}>
        <div
          className="relative rounded-3xl bg-white border border-[#E2EFE7] overflow-hidden cursor-pointer"
          style={{
            boxShadow: '0 20px 60px rgba(21,128,61,0.15), 0 4px 16px rgba(0,0,0,0.08)',
            transition: 'opacity 300ms ease, transform 300ms ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0px)' : 'translateY(8px)',
          }}
        >
          {/* Image area */}
          <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 to-green-200">
            {plant.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={plant.image}
                alt={plant.imageAlt ?? `${plant.commonName} houseplant`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-16 h-16 text-emerald-300" />
              </div>
            )}
            {/* Difficulty badge */}
            <span
              className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${diff.bg} ${diff.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {DIFFICULTY_LABELS[plant.difficulty]}
            </span>
          </div>

          {/* Card content */}
          <div className="p-4">
            <h3
              className="font-bold text-[#0F172A] text-base leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {plant.commonName}
            </h3>
            <p className="text-xs text-[#94a3b8] italic mt-0.5 mb-3">{plant.scientificName}</p>

            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-2.5 py-1">
                <Sun className="w-3 h-3 text-[#D97706]" />
                {LIGHT_LABELS[plant.light]}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F0FDF4] rounded-xl px-2.5 py-1">
                <Droplets className="w-3 h-3 text-[#0ea5e9]" />
                {WATER_LABELS[plant.water]}
              </span>
            </div>
          </div>
        </div>
      </Link>

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
