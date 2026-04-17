import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle, getAllArticleSlugs } from '@/lib/articles';
import { getPlantCard, autoLinkPlantNames } from '@/lib/plants';
import AdSlot from '@/components/AdSlot';
import FeaturedPlantsCarousel from '@/components/FeaturedPlantsCarousel';
import { Calendar, Clock, ArrowLeft, Share2, Printer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import ArticleImageCarousel, { CarouselImage } from '@/components/ArticleImageCarousel';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} | PlantCare Guide`,
    description: article.description,
    openGraph: {
      images: article.image ? [article.image] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const linkedDescription = autoLinkPlantNames(article.description, '');
  const linkedContent = autoLinkPlantNames(article.content, '');

  // Load featured plants if any
  const featuredPlants = article.featuredPlants 
    ? article.featuredPlants.map(slug => getPlantCard(slug)).filter((p): p is NonNullable<typeof p> => p !== null)
    : [];

  const carouselImages: CarouselImage[] = [];
  if (article.image) {
    carouselImages.push({ src: article.image, alt: article.imageAlt || article.title, caption: article.title });
  }
  featuredPlants.forEach(plant => {
    if (plant.image) {
      carouselImages.push({ 
        src: plant.image, 
        alt: plant.imageAlt || plant.commonName, 
        caption: `${plant.commonName} — ${plant.scientificName}` 
      });
    }
  });

  // Auto-inject beautiful plant photos directly into the HTML prose right under their H3 headings!
  let finalContent = linkedContent;
  featuredPlants.forEach(plant => {
    if (plant.image) {
      const escapedName = plant.commonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match the h3 tag, then inject the image right after it
      const regex = new RegExp(`(<h3[^>]*>.*?${escapedName}.*?</h3>)`, 'i');
      finalContent = finalContent.replace(regex, `$1\n<figure class="my-8 rounded-[2rem] overflow-hidden ring-1 ring-slate-100 shadow-xl bg-white"><img src="${plant.image}" alt="${plant.commonName}" class="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" /><figcaption class="p-4 text-center text-sm font-medium text-slate-500 bg-white">${plant.commonName} <span class="italic font-light opacity-80">— ${plant.scientificName}</span></figcaption></figure>`);
    }
  });

  // Split content for ad injection (after 4th paragraph)
  const paragraphs = finalContent.split('</p>');
  let contentBeforeAd = finalContent;
  let contentAfterAd = '';
  
  if (paragraphs.length > 6) {
    contentBeforeAd = paragraphs.slice(0, 4).join('</p>') + '</p>';
    contentAfterAd = paragraphs.slice(4).join('</p>');
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
          items={[
            { label: 'Guides', href: '/articles' },
            { label: article.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">
          {/* ── Main content ── */}
          <div className="lg:col-span-2">

            {/* Hero Carousel */}
            <ArticleImageCarousel images={carouselImages} />

            {/* Article header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#E2EFE7] px-3 py-1 rounded-full capitalize">
                  Expert {article.type || 'Guide'}
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {article.title}
              </h1>

              <div className="flex items-center gap-5 mt-5 text-sm text-[#64748B] border-b border-[#E2EFE7] pb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.datePublished).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {article.readingTime}
                </span>
              </div>
            </header>

            <article
              className="prose max-w-none"
            >
              <div dangerouslySetInnerHTML={{ __html: contentBeforeAd }} />
              
              {contentAfterAd && (
                <>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="my-12 py-8 border-y border-[#E2EFE7] bg-slate-50/50 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-xl">
                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-4 text-center">Sponsored Content</p>
                      <AdSlot slot="in-content" className="!h-32" />
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: contentAfterAd }} />
                </>
              )}
            </article>

            {/* Bottom Ad / Footer Slot */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-12 py-6 border-t border-[#E2EFE7]">
                <AdSlot slot="footer" className="!h-32 mb-4" />
                <p className="text-center text-[10px] text-slate-300 uppercase tracking-widest">Advertisement</p>
              </div>
            )}
          </div>
 
          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              <AdSlot slot="sidebar" className="mb-6" />
              
              {/* Social / Instagram CTA */}
              <a 
                href="https://www.instagram.com/plant_care_central/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block rounded-3xl p-[1px] relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-[#E2EFE7]"
              >
                <div className="bg-white rounded-[23px] p-6 h-full text-center flex flex-col items-center border border-white">
                  <div className="w-12 h-12 bg-[#F0FDF4] text-[#15803D] rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                    Daily Plant Inspo
                  </h3>
                  <p className="text-[#475569] text-sm mb-4 leading-relaxed">
                    Join our community on Instagram for daily plant tips, rare finds, and beautiful setups.
                  </p>
                  <span className="text-[#15803D] font-bold text-sm bg-[#F0FDF4] px-4 py-2 rounded-full group-hover:bg-[#DCFCE7] transition-colors border border-[#E2EFE7]">
                    Follow @plant_care_central
                  </span>
                </div>
              </a>

              {/* Sticky Sidebar Ad - Second slot for long content */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-6">
                  <AdSlot slot="sidebar" className="!h-[400px]" />
                  <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2 text-center">Advertisement</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ── Featured Plants Carousel ── */}
        {featuredPlants.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#E2EFE7] overflow-hidden">
            <div className="flex items-end justify-between mb-8 pr-4">
              <h2
                className="text-2xl lg:text-3xl font-bold text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Featured Plants<br/>In This Guide
              </h2>
              <span className="text-xs text-slate-400 font-bold tracking-widest uppercase hidden sm:block mb-2">
                Swipe to explore →
              </span>
            </div>
            
            {/* Native smooth horizontal scroll container with desktop buttons */}
            <FeaturedPlantsCarousel plants={featuredPlants} />
          </section>
        )}
      </div>
    </>
  );
}
