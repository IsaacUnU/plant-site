'use client';

/**
 * AdSlot — renders AdSense ads in production, visual placeholders in dev.
 *
 * Required environment variables (set these once AdSense approves your site
 * and you create the ad units in the AdSense dashboard):
 *
 *   NEXT_PUBLIC_AD_SLOT_BANNER    — data-ad-slot value for the banner unit
 *   NEXT_PUBLIC_AD_SLOT_SIDEBAR   — data-ad-slot value for the sidebar unit
 *   NEXT_PUBLIC_AD_SLOT_INCONTENT — data-ad-slot value for the in-content unit
 *   NEXT_PUBLIC_AD_SLOT_FOOTER    — data-ad-slot value for the footer unit
 *
 * The AdSense script (publisher ID ca-pub-7863265866651285) must already be
 * loaded in layout.tsx — it is. Each slot will silently render nothing if its
 * env var has not been set yet, so unused slots never throw errors.
 */

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSlotProps {
  slot: 'banner' | 'sidebar' | 'in-content' | 'footer';
  className?: string;
}

const AD_SIZES: Record<AdSlotProps['slot'], string> = {
  banner: 'h-24 w-full',
  sidebar: 'h-64 w-full',
  'in-content': 'h-28 w-full',
  footer: 'h-24 w-full',
};

const AD_PUB = 'ca-pub-7863265866651285';

const AD_SLOT_IDS: Record<AdSlotProps['slot'], string | undefined> = {
  banner: process.env.NEXT_PUBLIC_AD_SLOT_BANNER,
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR,
  'in-content': process.env.NEXT_PUBLIC_AD_SLOT_INCONTENT,
  footer: process.env.NEXT_PUBLIC_AD_SLOT_FOOTER,
};

const IS_DEV = process.env.NODE_ENV === 'development';

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  const slotId = AD_SLOT_IDS[slot];

  // In dev: always show the visual placeholder
  if (IS_DEV) {
    return (
      <div
        className={`${AD_SIZES[slot]} ${className} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}
      >
        <span className="text-xs text-gray-400 font-mono">Ad — {slot}</span>
      </div>
    );
  }

  // In production: if the env var for this slot hasn't been set, render nothing
  if (!slotId) {
    return null;
  }

  return <AdUnit slotId={slotId} className={className} />;
}

// Separate client component so useEffect only runs for real ad units
function AdUnit({ slotId, className = '' }: { slotId: string; className?: string }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not yet available — the auto-ads script will handle it
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block' }}
      data-ad-client={AD_PUB}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
