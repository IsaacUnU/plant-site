import type { Metadata } from 'next';
import { getAllPlants, getAllCategories } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { CATEGORY_LABELS_ES } from '@/lib/utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Todas las Plantas de Interior',
  description: 'Explora nuestra colección completa de guías de cuidado de plantas de interior. Encuentra la planta perfecta y aprende a mantenerla en óptimas condiciones.',
  alternates: {
    canonical: `${SITE_URL}/es/plants`,
    languages: {
      'en': `${SITE_URL}/plants`,
      'es': `${SITE_URL}/es/plants`,
    },
  },
};

export default function EsPlantsPage() {
  const plants = getAllPlants('es');
  const categories = getAllCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Todas las Plantas de Interior</h1>
        <p className="text-gray-500">
          {plants.length} guía{plants.length !== 1 ? 's' : ''} de plantas y contando.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/es/plants"
            className="bg-green-700 text-white rounded-full px-4 py-1.5 text-sm font-medium"
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/es/category/${cat.slug}`}
              className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              {CATEGORY_LABELS_ES[cat.slug] ?? cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </Link>
          ))}
        </div>
      )}

      <AdSlot slot="banner" className="mb-8" />

      {plants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plants.map((plant, index) => (
            <PlantCard key={plant.slug} plant={plant} hrefBase="/es/plants" priority={index < 3} lang="es" />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🌱</p>
          <p className="text-gray-500">Aún no hay plantas. ¡El contenido está en camino!</p>
        </div>
      )}
    </div>
  );
}
