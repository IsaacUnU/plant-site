import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlantSlugs, getPlant, getPlantsByCategory } from '@/lib/plants';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import CareTable from '@/components/CareTable';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';
import PlantImage from '@/components/PlantImage';
import PlantCard from '@/components/PlantCard';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPlantSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlant(slug);
  if (!plant) return {};
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';
  return {
    title: plant.title,
    description: plant.description,
    openGraph: {
      title: plant.title,
      description: plant.description,
      type: 'article',
      publishedTime: plant.datePublished,
      modifiedTime: plant.dateModified,
      url: `${SITE_URL}/plants/${plant.slug}`,
      ...(plant.image && { images: [{ url: `${SITE_URL}${plant.image}`, alt: plant.imageAlt }] }),
    },
  };
}

export default async function PlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlant(slug);
  if (!plant) notFound();

  const related = getPlantsByCategory(plant.category)
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';

  const jsonLd: any[] = [
    articleSchema(plant),
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Plants', url: `${SITE_URL}/plants` },
      { name: plant.commonName, url: `${SITE_URL}/plants/${plant.slug}` },
    ]),
  ];

  if (plant.faqs) {
    jsonLd.push(faqSchema(plant.faqs));
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
          items={[
            { label: 'Plants', href: '/plants' },
            { label: plant.commonName },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Main content ── */}
          <div className="lg:col-span-2">

            {/* Hero image */}
            <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 border border-[#E2EFE7]">
              <PlantImage
                src={plant.image}
                alt={plant.imageAlt ?? `${plant.commonName} houseplant`}
                commonName={plant.commonName}
                category={plant.category}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                credit={plant.imageCredit}
                creditUrl={plant.imageCreditUrl}
              />
            </div>

            {/* Article header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#E2EFE7] px-3 py-1 rounded-full capitalize">
                  {plant.category}
                </span>
                {plant.tags?.map((tag) => (
                  <span key={tag} className="text-xs text-[#64748b] bg-[#F0F7F3] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <h1
                className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {plant.title}
              </h1>
              <p
                className="text-lg text-[#64748b] italic mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {plant.scientificName}
              </p>
              <p className="text-[#475569] leading-relaxed">{plant.description}</p>

              <div className="flex items-center gap-5 mt-5 text-xs text-[#94a3b8]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(plant.datePublished)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {plant.readingTime}
                </span>
              </div>
            </header>

            <AdSlot slot="in-content" className="mb-8" />

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: plant.content }}
            />

            <AdSlot slot="in-content" className="mt-10" />
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1 space-y-6">
            <CareTable plant={plant} />
            <AdSlot slot="sidebar" />
          </aside>
        </div>

        {/* ── Related Plants ── */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#E2EFE7]">
            <h2
              className="text-2xl font-bold text-[#0F172A] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              More {plant.category ? plant.category.charAt(0).toUpperCase() + plant.category.slice(1) : 'Related'} Plants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
              {related.map((p) => (
                <PlantCard key={p.slug} plant={p} className="animate-fade-in-up" />
              ))}
            </div>
          </section>
        )}
      </div>

      {jsonLd.map((schema, i) => (
        <script
          key={`ldjson-${schema['@type']}-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
