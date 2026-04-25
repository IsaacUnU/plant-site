import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllSecondaryFunctions, getPlantsBySecondaryFunction } from '@/lib/plants';
import { SECONDARY_FUNCTION_META } from '@/lib/secondaryFunctions';
import { SecondaryFunction } from '@/types/plant';
import PlantCard from '@/components/PlantCard';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const functions = getAllSecondaryFunctions();
  return functions.map((fn) => ({ slug: fn.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = SECONDARY_FUNCTION_META[slug as SecondaryFunction];
  if (!meta) return {};
  return {
    title: `Plantas ${meta.nameEs ?? meta.name}`,
    description: meta.longDescriptionEs ?? meta.longDescription,
    alternates: {
      canonical: `${SITE_URL}/es/uses/${slug}`,
      languages: {
        'en': `${SITE_URL}/uses/${slug}`,
        'es': `${SITE_URL}/es/uses/${slug}`,
      },
    },
  };
}

export default async function EsUsesFunctionPage({ params }: Props) {
  const { slug } = await params;
  const meta = SECONDARY_FUNCTION_META[slug as SecondaryFunction];
  if (!meta) notFound();

  const esPlants = getPlantsBySecondaryFunction(slug, 'es');
  const plants = esPlants.length > 0 ? esPlants : getPlantsBySecondaryFunction(slug);
  const hrefBase = esPlants.length > 0 ? '/es/plants' : '/plants';
  if (plants.length === 0) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb
        items={[
          { label: 'Usos y Beneficios', href: '/es/uses' },
          { label: meta.nameEs ?? meta.name },
        ]}
        homeLabel="Inicio"
        homeHref="/es"
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{meta.emoji}</span>
          <h1 className="text-3xl font-bold text-gray-900">Plantas {meta.nameEs ?? meta.name}</h1>
        </div>
        <p className="text-gray-500 max-w-2xl">{meta.longDescriptionEs ?? meta.longDescription}</p>
        <p className="text-sm text-gray-400 mt-2">
          {plants.length} planta{plants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <AdSlot slot="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} hrefBase={hrefBase} lang="es" />
        ))}
      </div>
    </div>
  );
}
