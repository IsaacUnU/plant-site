import Image from 'next/image';
import { Leaf } from 'lucide-react';

interface PlantImageProps {
  src?: string;
  alt: string;
  commonName: string;
  category?: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  credit?: string;
  creditUrl?: string;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  tropical:    'from-emerald-100 to-green-200',
  succulents:  'from-lime-100 to-yellow-100',
  'low-light': 'from-slate-100 to-green-100',
  flowering:   'from-pink-100 to-rose-100',
  herbs:       'from-green-100 to-teal-100',
  ferns:       'from-teal-100 to-emerald-100',
  cacti:       'from-amber-100 to-lime-100',
  vines:       'from-green-100 to-emerald-200',
};

export default function PlantImage({
  src,
  alt,
  commonName,
  category = 'tropical',
  fill = false,
  className = '',
  priority = false,
  sizes,
  credit,
  creditUrl,
}: PlantImageProps) {
  const gradient = CATEGORY_GRADIENTS[category] ?? 'from-green-100 to-emerald-200';

  // ── Placeholder ──────────────────────────────────────────────
  if (!src) {
    // fill mode → stretch to parent (parent must be relative + have dimensions)
    const placeholderClass = fill
      ? `absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center ${className}`
      : `relative bg-gradient-to-br ${gradient} flex flex-col items-center justify-center ${className}`;

    return (
      <div className={placeholderClass}>
        <Leaf className="w-10 h-10 text-green-400 opacity-50" />
        <span className="mt-2 text-xs text-green-600 font-medium opacity-50 text-center px-2 line-clamp-1">
          {commonName}
        </span>
      </div>
    );
  }

  // ── Real image ───────────────────────────────────────────────
  // fill mode → wrapper is absolute inset-0 so it expands to the nearest
  //             positioned ancestor (the parent container), then Image fills it
  if (fill) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          priority={priority}
        />
        {credit && (
          <p className="absolute bottom-1 right-1.5 text-[9px] text-white/30 leading-none select-none">
            {creditUrl ? (
              <a href={creditUrl} target="_blank" rel="noopener noreferrer">
                {credit}
              </a>
            ) : credit}
          </p>
        )}
      </div>
    );
  }

  // fixed size mode
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={500}
        className="w-full h-full object-cover"
        sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        priority={priority}
      />
      {credit && (
        <p className="absolute bottom-1 right-1.5 text-[9px] text-white/30 leading-none select-none">
          {creditUrl ? (
            <a href={creditUrl} target="_blank" rel="noopener noreferrer">
              {credit}
            </a>
          ) : credit}
        </p>
      )}
    </div>
  );
}
