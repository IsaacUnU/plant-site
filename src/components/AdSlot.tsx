'use client';

/**
 * AdSlot — placeholder listo para AdSense.
 * Cuando tengas aprobación de AdSense:
 * 1. Añade el script de AdSense en layout.tsx
 * 2. Reemplaza el contenido de este componente con <ins class="adsbygoogle" ...>
 * 3. Elimina el placeholder visual
 */

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

// Cambia a false cuando AdSense esté activo
const SHOW_PLACEHOLDER = process.env.NODE_ENV === 'development';

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  if (SHOW_PLACEHOLDER) {
    return (
      <div
        className={`${AD_SIZES[slot]} ${className} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}
      >
        <span className="text-xs text-gray-400 font-mono">Ad — {slot}</span>
      </div>
    );
  }

  // Producción: aquí va el código de AdSense
  return null;
}
