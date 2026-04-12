import type { Metadata } from 'next';
import { getAllPlants } from '@/lib/plants';
import SearchClient from '@/components/SearchClient';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search Plants',
  description: 'Search our complete library of houseplant care guides by name, category, or care level.',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  // Runs on the server — can use fs, reads all plant data
  const plants = getAllPlants();

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
          Find Your Plant
        </h1>
        <p className="text-[#64748b]">
          Search {plants.length} plant guides by name, type, or care level.
        </p>
      </div>

      {/* Client search — receives pre-loaded plant data */}
      <SearchClient plants={plants} />
    </div>
  );
}
