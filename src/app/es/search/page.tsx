import type { Metadata } from 'next';
import { getAllPlants } from '@/lib/plants';
import SearchClient from '@/components/SearchClient';
import { Search } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Buscar Plantas',
  description: 'Busca en nuestra biblioteca completa de guías de cuidado de plantas de interior por nombre, categoría o nivel de cuidado.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/es/search`,
    languages: {
      'en': `${SITE_URL}/search`,
      'es': `${SITE_URL}/es/search`,
    },
  },
};

export default function EsSearchPage() {
  const plants = getAllPlants('es');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-12 h-12 bg-[#F0FDF4] border border-[#E2EFE7] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-5 h-5 text-[#15803D]" />
        </div>
        <h1
          className="text-3xl font-bold text-[#0F172A] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Encuentra Tu Planta
        </h1>
        <p className="text-[#64748b]">
          Busca entre {plants.length} guías de plantas por nombre, tipo o nivel de cuidado.
        </p>
      </div>

      {/* Client search — receives pre-loaded plant data */}
      <SearchClient plants={plants} hrefBase="/es/plants" lang="es" />
    </div>
  );
}
