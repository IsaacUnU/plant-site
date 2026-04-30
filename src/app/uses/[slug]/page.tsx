import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllSecondaryFunctions, getPlantsBySecondaryFunction } from '@/lib/plants';
import { SECONDARY_FUNCTION_META } from '@/lib/secondaryFunctions';
import { SecondaryFunction } from '@/types/plant';
import PlantCard from '@/components/PlantCard';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';
import { buildAlternates } from '@/lib/seo';

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
    title: `${meta.name} Plants`,
    description: meta.longDescription,
    alternates: buildAlternates(`/uses/${slug}`, {
      en: `/uses/${slug}`,
      es: `/es/uses/${slug}`,
    }),
  };
}

export default async function UsesFunctionPage({ params }: Props) {
  const { slug } = await params;
  const meta = SECONDARY_FUNCTION_META[slug as SecondaryFunction];
  if (!meta) notFound();

  const plants = getPlantsBySecondaryFunction(slug);
  if (plants.length === 0) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb
        items={[
          { label: 'Uses & Benefits', href: '/uses' },
          { label: meta.name },
        ]}
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{meta.emoji}</span>
          <h1 className="text-3xl font-bold text-gray-900">{meta.name} Plants</h1>
        </div>
        <p className="text-gray-500 max-w-2xl">{meta.longDescription}</p>
        <p className="text-sm text-gray-400 mt-2">
          {plants.length} plant{plants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <AdSlot slot="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} />
        ))}
      </div>
    </div>
  );
}
