import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlantSlugs, getPlant, getPlantsByCategory, autoLinkPlantNames } from '@/lib/plants';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import CareTable from '@/components/CareTable';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';
import PlantImage from '@/components/PlantImage';
import PlantCard from '@/components/PlantCard';
import { Calendar, Clock, Leaf } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export async function generateStaticParams() {
  return getAllPlantSlugs('es').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlant(slug, 'es');
  if (!plant) return {};
  return {
    title: plant.title,
    description: plant.description,
    alternates: {
      canonical: `${SITE_URL}/es/plants/${plant.slug}`,
      languages: {
        'en': `${SITE_URL}/plants/${plant.slug}`,
        'es': `${SITE_URL}/es/plants/${plant.slug}`,
      },
    },
    openGraph: {
      title: plant.title,
      description: plant.description,
      type: 'article',
      publishedTime: plant.datePublished,
      modifiedTime: plant.dateModified,
      url: `${SITE_URL}/es/plants/${plant.slug}`,
      ...(plant.image && { images: [{ url: `${SITE_URL}${plant.image}`, alt: plant.imageAlt }] }),
    },
  };
}

export default async function EsPlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlant(slug, 'es');
  if (!plant) notFound();

  const related = getPlantsByCategory(plant.category, 'es')
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const linkedDescription = autoLinkPlantNames(plant.description, slug, 'es');
  const linkedContent = autoLinkPlantNames(plant.content, slug, 'es');

  const jsonLd: any[] = [
    articleSchema(plant),
    breadcrumbSchema([
      { name: 'Inicio', url: SITE_URL },
      { name: 'Plantas', url: `${SITE_URL}/es/plants` },
      { name: plant.commonName, url: `${SITE_URL}/es/plants/${plant.slug}` },
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
            { label: 'Plantas', href: '/es/plants' },
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
                alt={plant.imageAlt ?? `${plant.commonName} planta de interior`}
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
              <p className="text-[#475569] leading-relaxed" dangerouslySetInnerHTML={{ __html: linkedDescription }} />

              <div className="flex items-center gap-5 mt-5 text-xs text-[#94a3b8]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(plant.datePublished).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {plant.readingTime}
                </span>
              </div>
            </header>

            {/* Editorial note */}
            <div className="flex items-start gap-3 bg-[#F0FDF4] border border-[#E2EFE7] rounded-2xl px-4 py-3 mb-8">
              <Leaf className="w-4 h-4 text-[#15803D] mt-0.5 shrink-0" />
              <p className="text-sm text-[#475569] leading-snug">
                Nuestras guías de plantas están estructuradas en torno a datos hortícolas verificados: medidas de luz (lux/foot-candles), rangos de temperatura (°C/°F), calendarios de riego estacionales y proporciones de composición del sustrato.
              </p>
            </div>

            <AdSlot slot="in-content" className="mb-8" />

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: linkedContent }}
            />

            <AdSlot slot="in-content" className="mt-10" />
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1 space-y-6">
            <CareTable plant={plant} lang="es" />
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
              Más Plantas{plant.category ? ` de ${plant.category.charAt(0).toUpperCase() + plant.category.slice(1)}` : ' Relacionadas'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
              {related.map((p) => (
                <PlantCard key={p.slug} plant={p} hrefBase="/es/plants" lang="es" className="animate-fade-in-up" />
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
