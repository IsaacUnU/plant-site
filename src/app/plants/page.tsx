import type { Metadata } from 'next';
import { getAllPlants, getAllCategories } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Houseplants',
  description: 'Browse our complete collection of houseplant care guides. Find the perfect plant and learn how to keep it thriving.',
};

export default function PlantsPage() {
  const plants = getAllPlants();
  const categories = getAllCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">All Houseplants</h1>
        <p className="text-gray-500">
          {plants.length} plant guide{plants.length !== 1 ? 's' : ''} and counting.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/plants"
            className="bg-green-700 text-white rounded-full px-4 py-1.5 text-sm font-medium"
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </Link>
          ))}
        </div>
      )}

      <AdSlot slot="banner" className="mb-8" />

      {plants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plants.map((plant, index) => (
            <PlantCard key={plant.slug} plant={plant} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🌱</p>
          <p className="text-gray-500">No plants yet. The pipeline is warming up!</p>
        </div>
      )}
    </div>
  );
}
