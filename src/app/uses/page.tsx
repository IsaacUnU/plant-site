import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSecondaryFunctions } from '@/lib/plants';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Plant Uses & Benefits',
  description:
    'Discover houseplants by their secondary benefits — from purifying the air and boosting humidity to repelling insects and healing minor ailments.',
};

export default function UsesPage() {
  const functions = getAllSecondaryFunctions();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: 'Uses & Benefits' }]} />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Plant Uses & Benefits</h1>
        <p className="text-gray-500 max-w-2xl">
          Plants do more than look beautiful. Discover which houseplants can improve your air quality,
          regulate humidity, keep insects at bay, or even offer natural remedies.
        </p>
      </div>

      <AdSlot slot="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {functions.map((fn) => (
          <Link
            key={fn.slug}
            href={`/uses/${fn.slug}`}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-[#E2EFE7] bg-white hover:border-[#15803D] hover:shadow-md transition-all duration-200"
          >
            <div className="text-4xl">{fn.emoji}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#15803D] transition-colors">
                {fn.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{fn.description}</p>
            </div>
            <p className="text-xs font-medium text-[#15803D] mt-auto">
              {fn.count} plant{fn.count !== 1 ? 's' : ''} &rarr;
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
