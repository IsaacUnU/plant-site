import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: `Términos y condiciones de uso de ${SITE_NAME}.`,
  alternates: buildAlternates('/es/terms', {
    en: '/terms',
    es: '/es/terms',
  }),
};

export default function TermsEsPage() {
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-gray-400 mb-8">Última actualización: {today}</p>

      <div className="prose max-w-none">
        <p>
          Al acceder y utilizar <strong>{SITE_NAME}</strong> ({SITE_URL}), aceptas estar vinculado
          por estos Términos y Condiciones. Por favor, léelos detenidamente antes de usar el sitio.
        </p>

        <h2>1. Uso del Sitio</h2>
        <p>
          {SITE_NAME} proporciona guías informativas de cuidado de plantas para uso personal y no
          comercial. No puedes reproducir, distribuir ni republicar ningún contenido de este sitio
          sin permiso previo por escrito.
        </p>

        <h2>2. Exactitud de la Información</h2>
        <p>
          Aunque nos esforzamos por proporcionar información precisa y actualizada sobre el cuidado
          de plantas, no ofrecemos garantías de ningún tipo sobre la integridad, exactitud o
          idoneidad de la información proporcionada. Consulta siempre a un horticultor cualificado
          para preocupaciones específicas.
        </p>

        <h2>3. Publicidad</h2>
        <p>
          Este sitio puede mostrar anuncios de Google AdSense y otras redes publicitarias de
          terceros. Estas redes pueden usar cookies para mostrar anuncios basados en tus visitas
          previas a este u otros sitios web. Puedes desactivar la publicidad personalizada en la{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Configuración de Anuncios de Google
          </a>.
        </p>

        <h2>4. Enlaces a Terceros</h2>
        <p>
          Nuestro sitio puede contener enlaces a sitios externos. Estos enlaces se proporcionan
          para tu conveniencia. No tenemos control sobre el contenido de esos sitios y no aceptamos
          responsabilidad por ellos.
        </p>

        <h2>5. Propiedad Intelectual</h2>
        <p>
          Todo el contenido de este sitio, incluidos textos, imágenes, logotipos y gráficos, es
          propiedad de {SITE_NAME} o sus proveedores de contenido y está protegido por la ley de
          derechos de autor. El uso no autorizado está prohibido.
        </p>

        <h2>6. Limitación de Responsabilidad</h2>
        <p>
          {SITE_NAME} no será responsable de ningún daño directo, indirecto, incidental, consecuente
          o punitivo que surja del uso o la incapacidad de usar este sitio o su contenido.
        </p>

        <h2>7. Cambios en Estos Términos</h2>
        <p>
          Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento.
          Los cambios serán efectivos inmediatamente después de su publicación en el sitio.
          El uso continuado del sitio constituye la aceptación de los términos revisados.
        </p>

        <h2>8. Ley Aplicable</h2>
        <p>
          Estos Términos y Condiciones se rigen por la legislación aplicable. Cualquier disputa
          que surja del uso de este sitio estará sujeta a la jurisdicción exclusiva de los
          tribunales competentes.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Si tienes preguntas sobre estos Términos, contáctanos a través de nuestra{' '}
          <a href="/es/contact">página de Contacto</a>.
        </p>
      </div>
    </div>
  );
}
