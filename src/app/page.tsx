import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf, ArrowRight, Sun, Droplets, BookOpen } from 'lucide-react';
import { getAllPlants, getAllCategories } from '@/lib/plants';
import PlantCard from '@/components/PlantCard';
import AdSlot from '@/components/AdSlot';
import HeroCarousel, { type HeroPlant } from '@/components/HeroCarousel';

export const metadata: Metadata = {
  title: 'Expert Houseplant Care Guides',
  description: 'Master houseplant care with our professional guides. From easy-care snake plants to exotic tropicals, discover how to make every indoor plant thrive.',
};

export default function HomePage() {
  const allPlants = getAllPlants();
  const plants = allPlants.slice(0, 6);
  const categories = getAllCategories();

  const carouselPlants: HeroPlant[] = allPlants
    .filter((p) => p.image)
    .slice(0, 5)
    .map((p) => ({
      slug: p.slug,
      commonName: p.commonName,
      scientificName: p.scientificName,
      difficulty: p.difficulty,
      light: p.light,
      water: p.water,
      image: p.image,
      imageAlt: p.imageAlt,
    }));

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-[#E2EFE7]">
        {/* Decorative background blob */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #15803D 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: text + CTAs */}
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-[#F0FDF4] border border-[#E2EFE7] rounded-full px-4 py-1.5 mb-6 animate-fade-in">
                <Leaf className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="text-xs font-semibold text-[#15803D] uppercase tracking-widest">
                  Plant Care Guides
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] mb-6 animate-fade-in-up"
                style={{ fontFamily: 'var(--font-display)', animationDelay: '80ms' }}
              >
                Expert Houseplant Care<br />
                <span className="text-[#15803D] italic">Guides for Success.</span>
              </h1>

              <p className="text-lg text-[#475569] leading-relaxed mb-8 max-w-xl animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                Expert care guides for every houseplant — from beginner-friendly pothos
                to demanding fiddle-leaf figs. Grow with confidence.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                <Link
                  href="/plants"
                  className="inline-flex items-center gap-2 bg-[#15803D] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#166534] transition-colors duration-200 cursor-pointer"
                >
                  Browse All Plants
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/plants"
                  className="inline-flex items-center gap-2 bg-white border border-[#E2EFE7] text-[#0F172A] px-6 py-3 rounded-2xl font-semibold hover:border-[#86efac] hover:text-[#15803D] transition-all duration-200 cursor-pointer"
                >
                  Start with Tropicals
                </Link>
              </div>
            </div>

            {/* Right: plant carousel (desktop only) */}
            {carouselPlants.length > 0 && (
              <div className="hidden lg:flex justify-center items-center py-6">
                <HeroCarousel plants={carouselPlants} />
              </div>
            )}

          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <AdSlot slot="banner" className="mb-14" />

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-16 stagger-children">
          {[
            { icon: <BookOpen className="w-5 h-5 text-[#15803D]" />, value: `${Math.max(plants.length, 5)}+`, label: 'Care Guides' },
            { icon: <Sun className="w-5 h-5 text-[#D97706]" />,     value: `${categories.length || 8}`,     label: 'Categories' },
            { icon: <Droplets className="w-5 h-5 text-[#0ea5e9]" />, value: '100%', label: 'Free' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-[#E2EFE7] px-5 py-5 text-center animate-scale-in"
              style={{ boxShadow: '0 2px 12px 0 rgba(21,128,61,0.06)' }}
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div
                className="text-2xl font-bold text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-[#64748b] font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Categories ─────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="mb-16">
            <h2
              className="text-2xl font-bold text-[#0F172A] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-2.5 stagger-children">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="bg-white border border-[#E2EFE7] rounded-2xl px-5 py-2.5 text-sm font-semibold text-[#475569] hover:border-[#86efac] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all duration-200 cursor-pointer animate-fade-in-up"
                >
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  <span className="ml-2 text-xs text-[#94a3b8]">{cat.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Featured plants ────────────────────────────────────── */}
        {plants.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold text-[#0F172A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Popular Plants
              </h2>
              <Link
                href="/plants"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#15803D] hover:text-[#166534] transition-colors cursor-pointer"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
              {plants.map((plant) => (
                <PlantCard key={plant.slug} plant={plant} className="animate-fade-in-up" />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {plants.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-[#F0FDF4] rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-[#15803D]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Growing our garden...
            </h2>
            <p className="text-[#475569]">Plant guides are being prepared. Check back soon!</p>
          </div>
        )}

        {/* ── Why section ────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#E2EFE7] p-8 sm:p-12"
          style={{ boxShadow: '0 2px 12px 0 rgba(21,128,61,0.06)' }}>
          <h2
            className="text-2xl font-bold text-[#0F172A] mb-10 text-center"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Why PlantCare Central?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 stagger-children">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-[#15803D]" />,
                title: 'Expert Guides',
                desc: 'Detailed, accurate care instructions researched by plant enthusiasts.',
              },
              {
                icon: <Sun className="w-6 h-6 text-[#D97706]" />,
                title: 'Clear & Actionable',
                desc: 'No fluff — just the watering schedules, light needs, and fixes you need.',
              },
              {
                icon: <Leaf className="w-6 h-6 text-[#059669]" />,
                title: 'Every Species',
                desc: 'Hundreds of species covered and growing every week.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-3 animate-fade-in-up">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] border border-[#E2EFE7] flex items-center justify-center">
                  {item.icon}
                </div>
                <h3
                  className="font-semibold text-[#0F172A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SEO Content Section: Comprehensive Houseplant Care ────────────────── */}
        <section className="mt-20 border-t border-[#E2EFE7] pt-16">
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-3xl font-bold text-[#0F172A] mb-8 text-center"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mastering the Art of Houseplant Care: A Comprehensive Guide
            </h2>
            
            <div className="prose prose-slate max-w-none text-[#475569] leading-relaxed space-y-6">
              <p>
                Welcome to <strong>PlantCare Central</strong>, your primary destination for high-quality, 
                expert-vetted <em>houseplant care guides</em>. Whether you are a beginner looking for 
                your first low-maintenance succulent or an experienced collector seeking tips for 
                delicate tropical species, understanding the fundamentals of indoor gardening is 
                the key to a thriving home jungle.
              </p>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Understanding Light Requirements</h3>
              <p>
                Light is the most critical factor for plant survival. Most indoor plants fall into 
                one of three categories: <strong>Low Light</strong>, <strong>Bright Indirect Light</strong>, 
                and <strong>Direct Sunlight</strong>. 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Low Light:</strong> Ideal for North-facing windows or corners far from light sources. Plants like Snake Plants and ZZ Plants are masters of these conditions.</li>
                <li><strong>Bright Indirect Light:</strong> The "sweet spot" for most houseplants. This means the plant is in a bright room but the sun's rays don't touch the leaves directly.</li>
                <li><strong>Direct Light:</strong> Reserved for sun-loving plants like Cacti and certain Succulents. Generally found right against South-facing windows.</li>
              </ul>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Watering Best Practices: The Science of Sustenance</h3>
              <p>
                Overwatering is the number one cause of houseplant death. At PlantCare Central, we 
                advocate for the "Finger Test" rather than a strict calendar schedule. Before 
                watering, stick your finger about two inches into the soil. If it feels dry, it's 
                time to water. If it's damp, wait a few more days. Proper drainage is also 
                essential—always ensure your pots have holes at the bottom to prevent root rot.
              </p>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Humidity, Soil, and Nutrition</h3>
              <p>
                Tropical plants often struggle in dry indoor air, especially during winter months when 
                heaters are active. Grouping plants together or using a humidifier can make a world 
                of difference. Furthermore, using the right potting mix—typically a well-draining 
                blend of peat moss, perlite, and pine bark—ensures that roots can breathe. Don't 
                forget to fertilize during the growing season (spring and summer) to provide the 
                macro and micronutrients your green friends need to push out new leaves.
              </p>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Common Issues and Troubleshooting</h3>
              <p>
                Yellowing leaves? It might be a sign of overwatering or a nutrient deficiency. 
                Brown, crispy edges? Likely a lack of humidity or underwatering. Our 
                individual plant guides delve deep into specific symptoms for each species, 
                helping you diagnose and treat issues before they become terminal. From dealing 
                with common pests like fungus gnats and spider mites to learning the secrets of 
                proper pruning, our mission is to empower you with <strong>expert houseplant 
                care guides</strong> that actually work.
              </p>
              
              <p className="pt-4 font-medium italic border-t border-[#E2EFE7]">
                Ready to find your next plant? Explore our categories above or use our search 
                feature to find the exact care guide you need for a healthy, vibrant indoor garden.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
