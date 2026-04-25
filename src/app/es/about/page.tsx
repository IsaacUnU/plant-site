import type { Metadata } from 'next';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: `${SITE_NAME} publica guías de cuidado de plantas precisas y basadas en mediciones — volúmenes exactos de riego, lecturas reales de luz y horarios específicos para cada planta de interior común.`,
  alternates: {
    canonical: `${SITE_URL}/es/about`,
    languages: {
      'en': `${SITE_URL}/about`,
      'es': `${SITE_URL}/es/about`,
    },
  },
};

export default function EsAboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre {SITE_NAME}</h1>

      <div className="prose max-w-none">
        <p>
          La mayoría de los consejos de cuidado de plantas te dicen que &ldquo;riega cuando el
          centímetro superior del sustrato se sienta seco&rdquo; o &ldquo;coloca en luz brillante
          e indirecta.&rdquo; Ese tipo de orientación parece razonable hasta que tu Ficus Lyrata
          pierde todas sus hojas y te das cuenta de que no tenías ni idea de qué significa
          realmente &ldquo;luz indirecta brillante&rdquo; en foot-candles.
        </p>

        <p>
          <strong>{SITE_NAME}</strong> fue creado para solucionar eso. Cada guía que publicamos
          reemplaza las instrucciones vagas con medidas exactas: volúmenes específicos de riego
          por tamaño de maceta, niveles de luz expresados en lux y foot-candles, proporciones de
          dilución de fertilizante y calendarios estacionales vinculados al calendario, no a
          sensaciones.
        </p>

        <h2>Nuestra Misión</h2>
        <p>
          Creemos que el cuidado de las plantas no fracasa porque la gente sea descuidada, sino
          porque la información con la que comienzan es demasiado imprecisa para actuar. Nuestra
          misión es publicar las guías de plantas de interior más específicas y fundamentadas en
          investigación disponibles — guías que te dan un número al que apuntar, un horario que
          seguir y un diagnóstico claro cuando algo sale mal.
        </p>
        <p>
          Ya sea que estés manteniendo viva una Monstera en un apartamento orientado al norte o
          ajustando la humedad para una colección de Calatheas, nuestro objetivo es el mismo:
          darte la información exacta que necesitas, ni más ni menos.
        </p>

        <h2>Nuestros Estándares Editoriales</h2>
        <p>
          Cada guía en {SITE_NAME} está estructurada en torno a cinco requisitos fundamentales
          antes de su publicación:
        </p>
        <ol>
          <li>
            <strong>Medidas específicas sobre generalidades.</strong> Los consejos de riego
            incluyen volumen por tamaño de maceta y frecuencia por temporada. Los consejos de
            luz incluyen rangos en lux y equivalentes prácticos (ej. &ldquo;60 cm de una ventana
            orientada al este&rdquo;).
          </li>
          <li>
            <strong>Respaldado por literatura hortícola.</strong> Los parámetros de cuidado se
            contrastan con publicaciones de extensión universitaria, bases de datos de jardines
            botánicos e investigación hortícola revisada por pares cuando está disponible.
          </li>
          <li>
            <strong>Verificado contra modos de fallo comunes.</strong> Cada guía incluye una
            sección de resolución de problemas construida a partir de los problemas más
            frecuentemente reportados para esa especie, no una lista genérica de problemas de
            plantas de interior copiada en cada página.
          </li>
          <li>
            <strong>Seguridad para mascotas e infantes divulgada prominentemente.</strong> La
            información de toxicidad proviene de la ASPCA y literatura veterinaria revisada por
            pares, y se muestra en la parte superior de cada guía, no al final.
          </li>
          <li>
            <strong>Contexto estacional incluido.</strong> Las plantas se comportan de manera
            diferente en invierno que en verano. Las guías indican cuándo reducir el riego,
            cuándo suspender el fertilizante y cuándo esperar una pausa en el crecimiento.
          </li>
        </ol>

        <h2>Qué Cubrimos</h2>
        <p>
          {SITE_NAME} publica dos tipos de contenido: guías de cuidado individual de plantas y
          artículos por temática.
        </p>
        <p>
          Las guías de cuidado cubren más de 50 de las plantas de interior más populares — desde
          especies fáciles de cuidar como la Sansevieria y el Pothos hasta aroides más exigentes
          como las Calatheas y los Anthuriums. Cada guía cubre riego, luz, humedad, temperatura,
          mezcla de sustrato, calendario de fertilización, indicadores de trasplante, métodos de
          propagación, plagas comunes y toxicidad.
        </p>
        <p>
          Los artículos temáticos profundizan en habilidades universales: cómo leer las
          condiciones de luz sin un medidor, cuándo el exceso y la falta de riego producen los
          mismos síntomas visibles y cómo distinguirlos, cómo preparar una mezcla de sustrato que
          drene correctamente para tu clima y cómo tratar la pudrición de raíces antes de que
          mate la planta. No son artículos de resumen — son referencias prácticas diseñadas para
          resolver un problema específico.
        </p>

        <h2>Contacto</h2>
        <p>
          ¿Tienes una corrección, una pregunta sobre una planta específica o una solicitud de
          guía?{' '}
          <a href="/es/contact">Contáctanos aquí</a>.
        </p>
      </div>
    </div>
  );
}
