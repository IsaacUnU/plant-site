import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSecondaryFunctions } from '@/lib/plants';
import Breadcrumb from '@/components/Breadcrumb';
import AdSlot from '@/components/AdSlot';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Usos y Beneficios de las Plantas',
  description:
    'Descubre plantas de interior por sus beneficios secundarios — desde purificar el aire y aumentar la humedad hasta repeler insectos y ofrecer remedios naturales.',
  alternates: {
    canonical: `${SITE_URL}/es/uses`,
    languages: {
      'en': `${SITE_URL}/uses`,
      'es': `${SITE_URL}/es/uses`,
    },
  },
};

export default function EsUsesPage() {
  const functions = getAllSecondaryFunctions();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: 'Usos y Beneficios' }]} homeLabel="Inicio" homeHref="/es" />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Usos y Beneficios de las Plantas</h1>
        <p className="text-gray-500 max-w-2xl">
          Las plantas hacen mucho más que embellecer. Descubre qué plantas de interior pueden mejorar
          la calidad del aire, regular la humedad, mantener los insectos a raya o incluso ofrecer
          remedios naturales.
        </p>
      </div>

      <AdSlot slot="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {functions.map((fn) => (
          <Link
            key={fn.slug}
            href={`/es/uses/${fn.slug}`}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-[#E2EFE7] bg-white hover:border-[#15803D] hover:shadow-md transition-all duration-200"
          >
            <div className="text-4xl">{fn.emoji}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#15803D] transition-colors">
                {fn.nameEs ?? fn.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{fn.descriptionEs ?? fn.description}</p>
            </div>
            <p className="text-xs font-medium text-[#15803D] mt-auto">
              {fn.count} planta{fn.count !== 1 ? 's' : ''} &rarr;
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
