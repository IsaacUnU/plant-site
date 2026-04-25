import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf, ArrowRight, Sun, Droplets, BookOpen, Clock } from 'lucide-react';
import { getAllPlants, getAllCategories } from '@/lib/plants';
import { CATEGORY_LABELS_ES } from '@/lib/utils';
import PlantCard from '@/components/PlantCard';
import AdSlot from '@/components/AdSlot';
import HeroCarousel, { type HeroPlant } from '@/components/HeroCarousel';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Guías Expertas de Cuidado de Plantas de Interior',
  description: 'Domina el cuidado de tus plantas con nuestras guías profesionales. Desde plantas araña fáciles hasta tropicales exóticas, descubre cómo hacer prosperar cada planta de interior.',
  alternates: {
    canonical: `${SITE_URL}/es`,
    languages: {
      'en': `${SITE_URL}/`,
      'es': `${SITE_URL}/es`,
    },
  },
};

export default function EsHomePage() {
  const allPlants = getAllPlants('es');
  const plants = allPlants.slice(0, 6);
  const categories = getAllCategories();

  const carouselPlants: HeroPlant[] = getAllPlants('es')
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
                  Guías de Cuidado de Plantas
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] mb-6 animate-fade-in-up"
                style={{ fontFamily: 'var(--font-display)', animationDelay: '80ms' }}
              >
                Guías Expertas de<br />
                <span className="text-[#15803D] italic">Plantas para Tu Hogar.</span>
              </h1>

              <p className="text-lg text-[#475569] leading-relaxed mb-8 max-w-xl animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                Guías de cuidado experto para cada planta de interior — desde pothos ideales para principiantes
                hasta exigentes ficus lyrata. Cultiva con confianza.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                <Link
                  href="/es/plants"
                  className="inline-flex items-center gap-2 bg-[#15803D] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#166534] transition-colors duration-200 cursor-pointer"
                >
                  Ver Todas las Plantas
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/es/category/tropical"
                  className="inline-flex items-center gap-2 bg-white border border-[#E2EFE7] text-[#0F172A] px-6 py-3 rounded-2xl font-semibold hover:border-[#86efac] hover:text-[#15803D] transition-all duration-200 cursor-pointer"
                >
                  Explorar Tropicales
                </Link>
              </div>
            </div>

            {/* Right: plant carousel (desktop only) */}
            {carouselPlants.length > 0 && (
              <div className="hidden lg:flex justify-center items-center py-6">
                <HeroCarousel plants={carouselPlants} hrefBase="/es/plants" lang="es" />
              </div>
            )}

          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <AdSlot slot="banner" className="mb-14" />

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 stagger-children">
          {[
            { icon: <BookOpen className="w-5 h-5 text-[#15803D]" />, value: `${getAllPlants().length + 26}+`, label: 'Guías' },
            { icon: <Sun className="w-5 h-5 text-[#D97706]" />,      value: `${categories.length || 8}`,     label: 'Categorías' },
            { icon: <Droplets className="w-5 h-5 text-[#0ea5e9]" />, value: '100%',      label: 'Gratuito' },
            { icon: <Clock className="w-5 h-5 text-[#8B5CF6]" />,    value: 'Semanal',   label: 'Nuevas Guías' },
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
              Explorar por Categoría
            </h2>
            <div className="flex flex-wrap gap-2.5 stagger-children">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/es/category/${cat.slug}`}
                  className="bg-white border border-[#E2EFE7] rounded-2xl px-5 py-2.5 text-sm font-semibold text-[#475569] hover:border-[#86efac] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all duration-200 cursor-pointer animate-fade-in-up"
                >
                  {CATEGORY_LABELS_ES[cat.slug] ?? cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
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
                Plantas Populares
              </h2>
              <Link
                href="/es/plants"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#15803D] hover:text-[#166534] transition-colors cursor-pointer"
              >
                Ver todas
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
              {plants.map((plant) => (
                <PlantCard key={plant.slug} plant={plant} hrefBase="/es/plants" lang="es" className="animate-fade-in-up" />
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
              Preparando el jardín...
            </h2>
            <p className="text-[#475569]">Las guías de plantas están en preparación. ¡Vuelve pronto!</p>
          </div>
        )}

        {/* ── Why section ────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#E2EFE7] p-8 sm:p-12"
          style={{ boxShadow: '0 2px 12px 0 rgba(21,128,61,0.06)' }}>
          <h2
            className="text-2xl font-bold text-[#0F172A] mb-10 text-center"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ¿Por qué PlantCare Central?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 stagger-children">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-[#15803D]" />,
                title: 'Datos Exactos, No Consejos Vagos',
                desc: 'Cada guía incluye medidas específicas: luz en foot-candles, temperatura en °C y °F, frecuencia de riego por temporada.',
              },
              {
                icon: <Sun className="w-6 h-6 text-[#D97706]" />,
                title: 'Marco de Cuidado Estructurado',
                desc: 'Cada guía cubre 8 temas principales: luz, agua, sustrato, fertilizante, humedad, temperatura, problemas comunes y propagación.',
              },
              {
                icon: <Leaf className="w-6 h-6 text-[#059669]" />,
                title: 'Biblioteca en Crecimiento',
                desc: 'Nuevas guías de plantas y tutoriales añadidos semanalmente, cubriendo plantas comunes y especies raras por igual.',
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

        {/* ── SEO Content Section ───────────────────────────────── */}
        <section className="mt-20 border-t border-[#E2EFE7] pt-16">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl font-bold text-[#0F172A] mb-8 text-center"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Domina el Arte del Cuidado de Plantas de Interior: Una Guía Completa
            </h2>

            <div className="prose prose-slate max-w-none text-[#475569] leading-relaxed space-y-6">
              <p>
                Bienvenido a <strong>PlantCare Central</strong>, tu destino principal para guías de
                cuidado de <em>plantas de interior</em> de alta calidad y respaldadas por expertos.
                Ya seas un principiante buscando tu primera suculenta de bajo mantenimiento o un
                coleccionista experimentado buscando consejos para especies tropicales delicadas,
                comprender los fundamentos de la jardinería interior es la clave para un jardín
                doméstico próspero.
              </p>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Cómo Entender los Requisitos de Luz</h3>
              <p>
                La luz es el factor más crítico para la supervivencia de las plantas. La mayoría de las
                plantas de interior se clasifican en tres categorías: <strong>Luz Baja</strong>,{' '}
                <strong>Luz Indirecta Brillante</strong> y <strong>Luz Solar Directa</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Luz Baja:</strong> Ideal para ventanas orientadas al norte o rincones alejados de fuentes de luz. Plantas como la Sansevieria y la ZZ son maestras en estas condiciones.</li>
                <li><strong>Luz Indirecta Brillante:</strong> El &ldquo;punto ideal&rdquo; para la mayoría de las plantas de interior. La planta está en una habitación luminosa pero los rayos del sol no tocan las hojas directamente.</li>
                <li><strong>Luz Directa:</strong> Reservada para plantas amantes del sol como los Cactus y ciertas Suculentas. Generalmente se encuentra justo en ventanas orientadas al sur.</li>
              </ul>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Mejores Prácticas de Riego: La Ciencia del Sustento</h3>
              <p>
                El exceso de riego es la causa número uno de la muerte de plantas de interior. En PlantCare
                Central, recomendamos la &ldquo;Prueba del Dedo&rdquo; en lugar de un calendario estricto.
                Antes de regar, introduce el dedo unos cinco centímetros en el sustrato. Si se siente seco,
                es hora de regar. Si está húmedo, espera unos días más. El drenaje adecuado también es
                esencial: asegúrate siempre de que tus macetas tengan agujeros en la base para prevenir la
                pudrición de raíces.
              </p>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Humedad, Sustrato y Nutrición</h3>
              <p>
                Las plantas tropicales a menudo tienen dificultades con el aire seco del interior,
                especialmente durante los meses de invierno cuando la calefacción está activa. Agrupar
                plantas juntas o usar un humidificador puede marcar una gran diferencia. Además, usar la
                mezcla de sustrato correcta —típicamente una mezcla bien drenante de turba, perlita y
                corteza de pino— garantiza que las raíces puedan respirar. No olvides fertilizar durante
                la temporada de crecimiento (primavera y verano) para proporcionar los macro y
                micronutrientes que tus plantas necesitan para producir nuevas hojas.
              </p>

              <h3 className="text-xl font-bold text-[#15803D] mt-8 mb-4">Problemas Comunes y Soluciones</h3>
              <p>
                ¿Hojas amarillas? Puede ser una señal de exceso de riego o deficiencia de nutrientes.
                ¿Bordes marrones y crujientes? Probablemente falta de humedad o riego insuficiente.
                Nuestras guías individuales profundizan en síntomas específicos de cada especie,
                ayudándote a diagnosticar y tratar los problemas antes de que sean irreversibles. Desde
                tratar plagas comunes como los mosquitos del sustrato y los ácaros hasta aprender los
                secretos de la poda adecuada, nuestra misión es empoderarte con <strong>guías expertas
                de cuidado de plantas</strong> que realmente funcionan.
              </p>

              <p className="pt-4 font-medium italic border-t border-[#E2EFE7]">
                ¿Listo para encontrar tu próxima planta? Explora nuestras categorías arriba o usa nuestra
                función de búsqueda para encontrar la guía de cuidado exacta que necesitas para un jardín
                interior sano y vibrante.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
