import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCategories, getPlantsByCategory } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';
import { CATEGORY_DESCRIPTIONS } from '@/lib/utils';

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
  return {
    title: `${capitalized} Plants`,
    description:
      CATEGORY_DESCRIPTIONS[slug] ||
      `Browse all ${capitalized} houseplant care guides.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const plants = getPlantsByCategory(slug);
  if (plants.length === 0) notFound();

  const name = slug.replace(/-/g, ' ');
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const description = CATEGORY_DESCRIPTIONS[slug] || `All ${capitalized} plant care guides.`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: 'Plants', href: '/plants' }, { label: capitalized }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{capitalized} Plants</h1>
        <p className="text-gray-500">{description}</p>
        <p className="text-sm text-gray-400 mt-1">{plants.length} guide{plants.length !== 1 ? 's' : ''}</p>
      </div>

      <AdSlot slot="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plants.map((plant, index) => (
          <PlantCard key={plant.slug} plant={plant} priority={index < 3} />
        ))}
      </div>
    </div>
  );
}
