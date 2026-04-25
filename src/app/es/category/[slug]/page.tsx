import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCategories, getPlantsByCategory } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';
import { CATEGORY_DESCRIPTIONS, CATEGORY_DESCRIPTIONS_ES, CATEGORY_LABELS_ES } from '@/lib/utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ');
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const displayName = CATEGORY_LABELS_ES[slug] ?? capitalized;
  return {
    title: `Plantas ${displayName}`,
    description:
      CATEGORY_DESCRIPTIONS_ES[slug] ||
      CATEGORY_DESCRIPTIONS[slug] ||
      `Explora todas las guías de cuidado de plantas ${displayName}.`,
    alternates: {
      canonical: `${SITE_URL}/es/category/${slug}`,
      languages: {
        'en': `${SITE_URL}/category/${slug}`,
        'es': `${SITE_URL}/es/category/${slug}`,
      },
    },
  };
}

export default async function EsCategoryPage({ params }: Props) {
  const { slug } = await params;
  const plants = getPlantsByCategory(slug, 'es');

  // Fall back to EN plants if no ES-specific ones exist for this category
  const displayPlants = plants.length > 0 ? plants : getPlantsByCategory(slug);
  if (displayPlants.length === 0) notFound();

  const hrefBase = plants.length > 0 ? '/es/plants' : '/plants';

  const name = slug.replace(/-/g, ' ');
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const displayName = CATEGORY_LABELS_ES[slug] ?? capitalized;
  const description = CATEGORY_DESCRIPTIONS_ES[slug] || CATEGORY_DESCRIPTIONS[slug] || `Todas las guías de cuidado de plantas ${displayName}.`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb
        items={[{ label: 'Plantas', href: '/es/plants' }, { label: displayName }]}
        homeLabel="Inicio"
        homeHref="/es"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plantas {displayName}</h1>
        <p className="text-gray-500">{description}</p>
        <p className="text-sm text-gray-400 mt-1">
          {displayPlants.length} guía{displayPlants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <AdSlot slot="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayPlants.map((plant, index) => (
          <PlantCard key={plant.slug} plant={plant} priority={index < 3} hrefBase={hrefBase} lang={plants.length > 0 ? 'es' : 'en'} />
        ))}
      </div>
    </div>
  );
}
