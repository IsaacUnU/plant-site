import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: `Política de privacidad de ${SITE_NAME}.`,
  robots: { index: true, follow: true },
  alternates: buildAlternates('/es/privacy-policy', {
    en: '/privacy-policy',
    es: '/es/privacy-policy',
  }),
};

export default function PrivacyPolicyEsPage() {
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-400 mb-8">Última actualización: {today}</p>

      <div className="prose max-w-none">
        <p>
          Esta Política de Privacidad describe cómo <strong>{SITE_NAME}</strong> (&quot;nosotros&quot;)
          recopila, utiliza y comparte información cuando visitas {SITE_URL} (&quot;el Sitio&quot;).
        </p>

        <h2>Información que Recopilamos</h2>
        <p>
          No recopilamos información personal directamente. Sin embargo, los servicios de terceros
          que utilizamos pueden recopilar datos automáticamente:
        </p>
        <ul>
          <li>
            <strong>Google AdSense</strong>: Muestra anuncios y puede usar cookies para mostrar
            publicidad personalizada basada en tus visitas a este y otros sitios.
          </li>
          <li>
            <strong>Google Analytics</strong> (si está activado): Recopila datos anónimos sobre
            el tráfico y los patrones de uso.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Nuestro sitio utiliza cookies colocadas por redes publicitarias de terceros (incluido
          Google AdSense) para mostrar anuncios relevantes. Puedes desactivar la publicidad
          personalizada visitando la{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Configuración de Anuncios de Google
          </a>.
        </p>
        <p>
          Al continuar usando este sitio, consientes el uso de cookies de acuerdo con esta política.
        </p>

        <h2>Consentimiento y Tus Derechos (RGPD)</h2>
        <p>
          Si te encuentras en el Espacio Económico Europeo (EEE), tienes derechos sobre tus datos
          personales, incluidos los derechos de acceso, rectificación y eliminación. Para ejercer
          estos derechos, contáctanos a través de la página de{' '}
          <a href="/es/contact">Contacto</a>.
        </p>
        <p>
          Antes de cargar cookies no esenciales, solicitamos tu consentimiento explícito mediante
          nuestro aviso de cookies. Puedes revocar tu consentimiento en cualquier momento borrando
          las cookies de tu navegador.
        </p>

        <h2>Enlaces a Terceros</h2>
        <p>
          Este sitio puede contener enlaces a sitios web de terceros. No somos responsables de las
          prácticas de privacidad de esos sitios y te recomendamos revisar sus políticas.
        </p>

        <h2>Cambios en Esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad de vez en cuando. Los cambios se
          publicarán en esta página con una fecha actualizada.
        </p>

        <h2>Contacto</h2>
        <p>
          Para preguntas relacionadas con la privacidad, utiliza nuestra{' '}
          <a href="/es/contact">página de Contacto</a>.
        </p>
      </div>
    </div>
  );
}
