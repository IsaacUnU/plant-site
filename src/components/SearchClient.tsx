'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { Search, X, Leaf, BookOpen, Sun, Droplets, ArrowRight, Sparkles } from 'lucide-react';
import type { PlantCardData } from '@/types/plant';
import type { ArticleCardData } from '@/types/article';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_LABELS_ES,
  DIFFICULTY_STYLES_CLIENT,
  LIGHT_LABELS,
  LIGHT_LABELS_ES,
  WATER_LABELS,
  WATER_LABELS_ES,
} from '@/lib/utils';

type TabFilter = 'all' | 'plants' | 'articles';

interface SearchClientProps {
  plants: PlantCardData[];
  articles: ArticleCardData[];
  hrefBase?: string;
  articleHrefBase?: string;
  lang?: 'en' | 'es';
}

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const ARTICLE_TYPE_STYLES: Record<string, { bg: string; text: string; label: string; labelEs: string }> = {
  listicle: { bg: 'bg-violet-50',  text: 'text-violet-700', label: 'Listicle',  labelEs: 'Lista'    },
  guide:    { bg: 'bg-sky-50',     text: 'text-sky-700',    label: 'Guide',     labelEs: 'Guía'     },
  tutorial: { bg: 'bg-amber-50',   text: 'text-amber-700',  label: 'Tutorial',  labelEs: 'Tutorial' },
};

const UI = {
  en: {
    placeholder:       "Search plants & guides — try 'monstera', 'propagation', 'low light'...",
    clearLabel:        'Clear',
    tabAll:            'All',
    tabPlants:         'Plants',
    tabArticles:       'Articles',
    noResultsTitle:    (q: string) => `No results for "${q}"`,
    noResultsHint:     'Try a different name, topic, or care level.',
    quickFiltersLabel: 'Try searching for',
    quickFilters: [
      { label: '🌿 Easy care',     query: 'easy'        },
      { label: '🌑 Low light',     query: 'low light'   },
      { label: '🐾 Pet safe',      query: 'pet safe'    },
      { label: '🪴 Beginners',     query: 'beginner'    },
      { label: '🌱 Propagation',   query: 'propagation' },
      { label: '🐛 Pests & bugs',  query: 'pests'       },
      { label: '💧 Watering tips', query: 'watering'    },
      { label: '🌴 Tropical',      query: 'tropical'    },
    ],
    resultsLabel: (plants: number, articles: number) => {
      const parts = [];
      if (plants > 0)   parts.push(`${plants} plant${plants !== 1 ? 's' : ''}`);
      if (articles > 0) parts.push(`${articles} article${articles !== 1 ? 's' : ''}`);
      return parts.join(' · ');
    },
    readMore: 'Read guide',
    viewAll:  (n: number) => `Showing 8 of ${n} — type to filter`,
  },
  es: {
    placeholder:       "Busca plantas y guías — prueba 'monstera', 'propagación', 'poca luz'...",
    clearLabel:        'Limpiar',
    tabAll:            'Todo',
    tabPlants:         'Plantas',
    tabArticles:       'Artículos',
    noResultsTitle:    (q: string) => `Sin resultados para "${q}"`,
    noResultsHint:     'Prueba con otro nombre, tema o nivel de cuidado.',
    quickFiltersLabel: 'Prueba buscar',
    quickFilters: [
      { label: '🌿 Fácil cuidado',   query: 'fácil'        },
      { label: '🌑 Poca luz',        query: 'poca luz'     },
      { label: '🐾 Mascotas',        query: 'mascotas'     },
      { label: '🪴 Principiantes',   query: 'principiante' },
      { label: '🌱 Propagación',     query: 'propagación'  },
      { label: '🐛 Plagas',          query: 'plagas'       },
      { label: '💧 Riego',           query: 'riego'        },
      { label: '🌴 Tropical',        query: 'tropical'     },
    ],
    resultsLabel: (plants: number, articles: number) => {
      const parts = [];
      if (plants > 0)   parts.push(`${plants} planta${plants !== 1 ? 's' : ''}`);
      if (articles > 0) parts.push(`${articles} artículo${articles !== 1 ? 's' : ''}`);
      return parts.join(' · ');
    },
    readMore: 'Leer guía',
    viewAll:  (n: number) => `Mostrando 8 de ${n} — escribe para filtrar`,
  },
} as const;

export default function SearchClient({
  plants,
  articles,
  hrefBase = '/plants',
  articleHrefBase,
  lang = 'en',
}: SearchClientProps) {
  const t      = UI[lang];
  const artBase = articleHrefBase ?? hrefBase.replace('/plants', '/articles');

  const [query,          setQuery]          = useState('');
  const [tab,            setTab]            = useState<TabFilter>('all');
  const [plantResults,   setPlantResults]   = useState<PlantCardData[]>([]);
  const [articleResults, setArticleResults] = useState<ArticleCardData[]>([]);
  const [hasSearched,    setHasSearched]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fusePlants = useRef(
    new Fuse(plants, {
      keys: [
        { name: 'commonName',     weight: 0.30 },
        { name: 'scientificName', weight: 0.18 },
        { name: 'category',       weight: 0.12 },
        { name: 'difficulty',     weight: 0.12 },
        { name: 'tags',           weight: 0.14 },
        { name: 'searchTerms',    weight: 0.18 },
        { name: 'description',    weight: 0.06 },
        { name: 'light',          weight: 0.08 },
        { name: 'growthRate',     weight: 0.10 },
        { name: 'toxicity',       weight: 0.06 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })
  );

  const fuseArticles = useRef(
    new Fuse(articles, {
      keys: [
        { name: 'title',       weight: 0.40 },
        { name: 'description', weight: 0.30 },
        { name: 'category',    weight: 0.15 },
        { name: 'tags',        weight: 0.15 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })
  );

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      const nq = normalizeQuery(value);

      if (!nq) {
        setPlantResults([]);
        setArticleResults([]);
        setHasSearched(false);
        return;
      }

      setHasSearched(true);

      // Plants: token match merged with fuse
      const tokens     = nq.split(' ').filter(Boolean);
      const tokenPlants = plants.filter(p => tokens.every(tok => p.searchText.includes(tok)));
      const fusedPlants = fusePlants.current.search(nq).map(r => r.item);
      setPlantResults(
        Array.from(new Map([...tokenPlants, ...fusedPlants].map(p => [p.slug, p])).values())
      );

      // Articles: fuse only
      setArticleResults(fuseArticles.current.search(nq).map(r => r.item));
    },
    [plants, articles]
  );

  const clearSearch = () => {
    setQuery('');
    setPlantResults([]);
    setArticleResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  useEffect(() => { inputRef.current?.focus(); }, []);

  const displayPlants   = tab === 'articles' ? [] : (hasSearched ? plantResults   : plants.slice(0, 8));
  const displayArticles = tab === 'plants'   ? [] : (hasSearched ? articleResults : articles.slice(0, 8));
  const isEmpty = hasSearched && displayPlants.length === 0 && displayArticles.length === 0;

  const tabCounts = {
    all:      hasSearched ? plantResults.length + articleResults.length : plants.length + articles.length,
    plants:   hasSearched ? plantResults.length   : plants.length,
    articles: hasSearched ? articleResults.length : articles.length,
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#15803D]/10 to-[#34d399]/10 blur-xl -z-10" />
        <div className="relative flex items-center bg-white border border-[#D1FAE5] rounded-2xl shadow-[0_4px_24px_rgba(21,128,61,0.10)] overflow-hidden focus-within:border-[#15803D] focus-within:shadow-[0_4px_32px_rgba(21,128,61,0.18)] transition-all duration-300">
          <Search className="shrink-0 ml-5 w-5 h-5 text-[#15803D]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent px-4 py-5 text-[#0F172A] text-base placeholder:text-[#94a3b8] focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              onClick={clearSearch}
              className="shrink-0 mr-4 flex items-center gap-1.5 text-xs font-medium text-[#64748b] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label={t.clearLabel}
            >
              <X className="w-3.5 h-3.5" />
              {t.clearLabel}
            </button>
          ) : (
            <kbd className="shrink-0 mr-5 hidden sm:flex items-center gap-1 text-[10px] font-medium text-[#94a3b8] border border-[#E2EFE7] rounded-md px-1.5 py-0.5">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 bg-[#F8FAFC] border border-[#E2EFE7] rounded-xl p-1 w-fit">
        {(['all', 'plants', 'articles'] as TabFilter[]).map(t2 => (
          <button
            key={t2}
            onClick={() => setTab(t2)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              tab === t2
                ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2EFE7]'
                : 'text-[#64748b] hover:text-[#0F172A]'
            }`}
          >
            {t2 === 'all'      && <Sparkles className="w-3.5 h-3.5" />}
            {t2 === 'plants'   && <Leaf      className="w-3.5 h-3.5 text-[#15803D]" />}
            {t2 === 'articles' && <BookOpen  className="w-3.5 h-3.5 text-[#6366f1]" />}
            {t2 === 'all' ? t.tabAll : t2 === 'plants' ? t.tabPlants : t.tabArticles}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              tab === t2 ? 'bg-[#F0FDF4] text-[#15803D] font-semibold' : 'bg-[#E2E8F0] text-[#94a3b8]'
            }`}>
              {tabCounts[t2]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Result count ───────────────────────────────────────── */}
      {hasSearched && !isEmpty && (
        <p className="text-sm text-[#64748b] mb-5">
          {t.resultsLabel(
            tab === 'articles' ? 0 : plantResults.length,
            tab === 'plants'   ? 0 : articleResults.length
          )}
          {query && (
            <span className="ml-1">
              for <span className="font-semibold text-[#0F172A]">&ldquo;{query}&rdquo;</span>
            </span>
          )}
        </p>
      )}

      {/* ── Quick filters ──────────────────────────────────────── */}
      {!hasSearched && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8] mb-3">
            {t.quickFiltersLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.quickFilters.map(f => (
              <button
                key={f.query}
                onClick={() => handleSearch(f.query)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-[#E2EFE7] text-[#475569] hover:border-[#6ee7b7] hover:text-[#059669] hover:bg-[#F0FDF4] transition-all duration-150 cursor-pointer shadow-sm"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────── */}
      {isEmpty && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#F0FDF4] border border-[#D1FAE5] rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Search className="w-7 h-7 text-[#86efac]" />
          </div>
          <p className="text-[#0F172A] font-semibold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {t.noResultsTitle(query)}
          </p>
          <p className="text-sm text-[#64748b]">{t.noResultsHint}</p>
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────── */}
      {!isEmpty && (displayPlants.length > 0 || displayArticles.length > 0) && (
        <div className="space-y-8">

          {/* Plants */}
          {displayPlants.length > 0 && (
            <section>
              {tab === 'all' && (
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-4 h-4 text-[#15803D]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#64748b]">{t.tabPlants}</span>
                  <div className="flex-1 h-px bg-[#E2EFE7]" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayPlants.map(plant => (
                  <PlantCard key={plant.slug} plant={plant} hrefBase={hrefBase} lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Articles */}
          {displayArticles.length > 0 && (
            <section>
              {tab === 'all' && (
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-[#6366f1]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#64748b]">{t.tabArticles}</span>
                  <div className="flex-1 h-px bg-[#E2EFE7]" />
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {displayArticles.map(article => (
                  <ArticleCard key={article.slug} article={article} hrefBase={artBase} lang={lang} readMoreLabel={t.readMore} />
                ))}
              </div>
            </section>
          )}

          {/* Show-all hint */}
          {!hasSearched && (
            <p className="text-center text-sm text-[#94a3b8] pb-4">
              {t.viewAll(
                tab === 'articles' ? articles.length
                : tab === 'plants' ? plants.length
                : plants.length + articles.length
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Plant card ──────────────────────────────────────────────────────────────
function PlantCard({ plant, hrefBase, lang }: { plant: PlantCardData; hrefBase: string; lang: 'en' | 'es' }) {
  const diff       = DIFFICULTY_STYLES_CLIENT[plant.difficulty] ?? DIFFICULTY_STYLES_CLIENT.easy;
  const diffLabel  = lang === 'es' ? (DIFFICULTY_LABELS_ES[plant.difficulty] ?? DIFFICULTY_LABELS[plant.difficulty]) : DIFFICULTY_LABELS[plant.difficulty];
  const lightLabel = lang === 'es' ? (LIGHT_LABELS_ES[plant.light]  ?? LIGHT_LABELS[plant.light])  : LIGHT_LABELS[plant.light];
  const waterLabel = lang === 'es' ? (WATER_LABELS_ES[plant.water]  ?? WATER_LABELS[plant.water])  : WATER_LABELS[plant.water];

  return (
    <Link
      href={`${hrefBase}/${plant.slug}`}
      className="group flex items-center gap-4 bg-white rounded-2xl border border-[#E2EFE7] p-4 hover:border-[#6ee7b7] hover:shadow-[0_6px_24px_rgba(21,128,61,0.10)] transition-all duration-200"
    >
      <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[#F0FDF4] flex items-center justify-center border border-[#D1FAE5]">
        {plant.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plant.image} alt={plant.imageAlt ?? plant.commonName} className="w-full h-full object-cover" />
        ) : (
          <Leaf className="w-6 h-6 text-[#86efac]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="font-semibold text-[#0F172A] text-sm leading-tight group-hover:text-[#15803D] transition-colors truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {plant.commonName}
            </p>
            <p className="text-xs text-[#94a3b8] italic truncate">{plant.scientificName}</p>
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>
            {diffLabel}
          </span>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs text-[#64748b]">
            <Sun className="w-3 h-3 text-[#f59e0b]" />{lightLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#64748b]">
            <Droplets className="w-3 h-3 text-[#38bdf8]" />{waterLabel}
          </span>
        </div>
      </div>

      <ArrowRight className="shrink-0 w-4 h-4 text-[#cbd5e1] group-hover:text-[#15803D] group-hover:translate-x-0.5 transition-all duration-200" />
    </Link>
  );
}

// ── Article card ────────────────────────────────────────────────────────────
function ArticleCard({ article, hrefBase, lang, readMoreLabel }: { article: ArticleCardData; hrefBase: string; lang: 'en' | 'es'; readMoreLabel: string }) {
  const typeStyle = ARTICLE_TYPE_STYLES[article.type] ?? ARTICLE_TYPE_STYLES.guide;
  const typeLabel = lang === 'es' ? typeStyle.labelEs : typeStyle.label;

  return (
    <Link
      href={`${hrefBase}/${article.slug}`}
      className="group flex items-start gap-4 bg-white rounded-2xl border border-[#E2EFE7] p-5 hover:border-[#a5b4fc] hover:shadow-[0_6px_24px_rgba(99,102,241,0.08)] transition-all duration-200"
    >
      <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center border border-indigo-100">
        <BookOpen className="w-5 h-5 text-[#6366f1]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text}`}>
            {typeLabel}
          </span>
          {article.category && (
            <span className="text-xs text-[#94a3b8] capitalize">{article.category}</span>
          )}
        </div>
        <p className="font-semibold text-[#0F172A] text-sm leading-snug group-hover:text-[#4f46e5] transition-colors mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {article.title}
        </p>
        {article.description && (
          <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">{article.description}</p>
        )}
      </div>

      <ArrowRight className="shrink-0 mt-1 w-4 h-4 text-[#cbd5e1] group-hover:text-[#6366f1] group-hover:translate-x-0.5 transition-all duration-200" />
    </Link>
  );
}
