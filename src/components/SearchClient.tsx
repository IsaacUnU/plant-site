'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { Search, X, Leaf, Sun, Droplets } from 'lucide-react';
import { PlantCardData } from '@/types/plant';
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES_CLIENT, LIGHT_LABELS, WATER_LABELS } from '@/lib/utils';

interface SearchClientProps {
  plants: PlantCardData[];
}

export default function SearchClient({ plants }: SearchClientProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlantCardData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useRef(
    new Fuse(plants, {
      keys: [
        { name: 'commonName',     weight: 0.4 },
        { name: 'scientificName', weight: 0.25 },
        { name: 'category',       weight: 0.15 },
        { name: 'description',    weight: 0.1  },
        { name: 'tags',           weight: 0.1  },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
    })
  );

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setHasSearched(true);
      if (!value.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      const found = fuse.current.search(value).map((r) => r.item);
      setResults(found);
    },
    []
  );

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showEmpty = hasSearched && results.length === 0;
  const showResults = results.length > 0;
  const showAll = !hasSearched;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search plants — try 'monstera', 'easy', 'low light'..."
          className="w-full bg-white border border-[#E2EFE7] rounded-2xl pl-12 pr-12 py-4 text-[#0F172A] text-base placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#15803D]/30 focus:border-[#15803D] transition-all duration-200"
          style={{ boxShadow: '0 2px 12px 0 rgba(21,128,61,0.07)' }}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#94a3b8] hover:text-[#475569] hover:bg-[#F0FDF4] transition-colors duration-200 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Result count */}
      {showResults && (
        <p className="text-sm text-[#64748b] mb-5 font-medium">
          {results.length} plant{results.length !== 1 ? 's' : ''} found
          {query && <span className="text-[#15803D]"> for &ldquo;{query}&rdquo;</span>}
        </p>
      )}

      {/* Empty state */}
      {showEmpty && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-[#F0FDF4] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-[#94a3b8]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            No plants found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-[#64748b]">Try a different name, category, or care level.</p>
        </div>
      )}

      {/* Default state — quick filters */}
      {showAll && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-3">Quick filters</p>
          <div className="flex flex-wrap gap-2">
            {['easy', 'low light', 'tropical', 'succulents', 'pet safe', 'fast growing'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-[#E2EFE7] text-[#475569] hover:border-[#86efac] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all duration-200 cursor-pointer capitalize"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      {(showResults || showAll) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(showResults ? results : plants.slice(0, 12)).map((plant) => {
            const diff = DIFFICULTY_STYLES_CLIENT[plant.difficulty];
            return (
              <Link
                key={plant.slug}
                href={`/plants/${plant.slug}`}
                className="group flex items-start gap-4 bg-white rounded-2xl border border-[#E2EFE7] p-4 hover:border-[#86efac] hover:shadow-[0_4px_20px_rgba(21,128,61,0.1)] transition-all duration-200 cursor-pointer"
              >
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#15803D]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className="font-semibold text-[#0F172A] text-sm group-hover:text-[#15803D] transition-colors leading-snug"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {plant.commonName}
                      </p>
                      <p className="text-xs text-[#94a3b8] italic truncate">{plant.scientificName}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>
                      {DIFFICULTY_LABELS[plant.difficulty]}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#64748b]">
                      <Sun className="w-3 h-3 text-[#D97706]" />
                      {LIGHT_LABELS[plant.light]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#64748b]">
                      <Droplets className="w-3 h-3 text-[#0ea5e9]" />
                      {WATER_LABELS[plant.water]}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Show more hint */}
      {showAll && plants.length > 12 && (
        <p className="text-center text-sm text-[#64748b] mt-6">
          Showing 12 of {plants.length} plants — search to filter
        </p>
      )}
    </div>
  );
}
