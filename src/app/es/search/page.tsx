import type { Metadata } from 'next';
import { getAllPlants } from '@/lib/plants';
import { getAllArticles } from '@/lib/articles';
import SearchClient from '@/components/SearchClient';
import { buildAlternates } from '@/lib/seo';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Buscar Plantas y Guías',
  description: 'Busca en nuestra biblioteca completa de guías de cuidado de plantas y artículos de expertos por nombre, tema o nivel de cuidado.',
  robots: { index: false, follow: true },
  alternates: buildAlternates('/es/search', { en: '/search', es: '/es/search' }),
};

export default function EsSearchPage() {
  const plants   = getAllPlants('es');
  const articles = getAllArticles('es');

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] to-white border-b border-[#E2EFE7]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(21,128,61,0.08),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 bg-white border border-[#D1FAE5] rounded-2xl flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(21,128,61,0.12)]">
              <Search className="w-6 h-6 text-[#15803D]" />
            </div>
            <h1
              className="text-4xl font-bold text-[#0F172A] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Encuentra Cualquier Cosa
            </h1>
            <p className="text-[#64748b] text-lg max-w-md">
              Busca entre{' '}
              <span className="font-semibold text-[#15803D]">{plants.length} guías de plantas</span>
              {' '}y{' '}
              <span className="font-semibold text-[#6366f1]">{articles.length} artículos</span>
            </p>
          </div>

          <SearchClient
            plants={plants}
            articles={articles}
            hrefBase="/es/plants"
            articleHrefBase="/es/articles"
            lang="es"
          />
        </div>
      </div>
    </div>
  );
}
