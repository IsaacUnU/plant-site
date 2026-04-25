import { SecondaryFunction } from '@/types/plant';

export interface SecondaryFunctionMeta {
  slug: SecondaryFunction;
  name: string;
  nameEs?: string;
  emoji: string;
  description: string;
  descriptionEs?: string;
  longDescription: string;
  longDescriptionEs?: string;
}

export const SECONDARY_FUNCTION_META: Record<SecondaryFunction, SecondaryFunctionMeta> = {
  'humidity-boosting': {
    slug: 'humidity-boosting',
    name: 'Humidity Boosting',
    nameEs: 'Aumenta la Humedad',
    emoji: '💧',
    description: 'Plants that naturally increase moisture in the air through transpiration.',
    descriptionEs: 'Plantas que aumentan naturalmente la humedad del ambiente mediante la transpiración.',
    longDescription:
      'These plants release water vapour from their leaves, raising indoor humidity levels. Great for combating dry air in heated or air-conditioned rooms.',
    longDescriptionEs:
      'Estas plantas liberan vapor de agua desde sus hojas, elevando los niveles de humedad interior. Ideal para combatir el aire seco en habitaciones con calefacción o aire acondicionado.',
  },
  'air-purifying': {
    slug: 'air-purifying',
    name: 'Air Purifying',
    nameEs: 'Purifica el Aire',
    emoji: '🌬️',
    description: 'Plants known to filter toxins and improve indoor air quality.',
    descriptionEs: 'Plantas que filtran toxinas y mejoran la calidad del aire interior.',
    longDescription:
      'Certain houseplants absorb volatile organic compounds (VOCs) like formaldehyde, benzene, and xylene through their leaves and roots. A natural way to freshen your home.',
    longDescriptionEs:
      'Ciertas plantas de interior absorben compuestos orgánicos volátiles (COV) como formaldehído, benceno y xileno a través de sus hojas y raíces. Una forma natural de renovar el aire de tu hogar.',
  },
  'insect-repelling': {
    slug: 'insect-repelling',
    name: 'Insect Repelling',
    nameEs: 'Repele Insectos',
    emoji: '🦟',
    description: 'Plants with natural compounds that deter common household insects.',
    descriptionEs: 'Plantas con compuestos naturales que ahuyentan los insectos domésticos más comunes.',
    longDescription:
      'These plants produce aromatic oils or chemicals that mosquitoes, flies, and other pests find unpleasant. Keep them near windows or entrances for a natural barrier.',
    longDescriptionEs:
      'Estas plantas producen aceites aromáticos o sustancias químicas que los mosquitos, moscas y otras plagas encuentran desagradables. Colócalas cerca de ventanas o entradas como barrera natural.',
  },
  'pleasant-scent': {
    slug: 'pleasant-scent',
    name: 'Pleasant Scent',
    nameEs: 'Aroma Agradable',
    emoji: '🌸',
    description: 'Plants with natural fragrances that subtly perfume your living space.',
    descriptionEs: 'Plantas con fragancias naturales que perfuman sutilmente tu espacio de vida.',
    longDescription:
      'From soft floral notes to fresh green aromas, these plants add a sensory dimension to your indoor garden — no synthetic air fresheners needed.',
    longDescriptionEs:
      'Desde notas florales suaves hasta aromas frescos y verdes, estas plantas añaden una dimensión sensorial a tu jardín interior — sin necesidad de ambientadores sintéticos.',
  },
  medicinal: {
    slug: 'medicinal',
    name: 'Medicinal',
    nameEs: 'Medicinal',
    emoji: '🌿',
    description: 'Plants with well-known traditional or evidence-based health uses.',
    descriptionEs: 'Plantas con usos terapéuticos tradicionales o respaldados por evidencia científica.',
    longDescription:
      'These plants have been used for centuries for their healing properties — from soothing minor burns to supporting skin health. Always consult a professional before internal use.',
    longDescriptionEs:
      'Estas plantas se han utilizado durante siglos por sus propiedades curativas — desde aliviar quemaduras leves hasta cuidar la salud de la piel. Consulta siempre a un profesional antes de usarlas internamente.',
  },
  'pet-safe': {
    slug: 'pet-safe',
    name: 'Pet Safe',
    nameEs: 'Segura para Mascotas',
    emoji: '🐾',
    description: 'Non-toxic plants safe to keep around cats and dogs.',
    descriptionEs: 'Plantas no tóxicas, seguras para convivir con gatos y perros.',
    longDescription:
      'If your furry friends like to chew on leaves, these plants are the smart choice. They are classified as non-toxic by the ASPCA and safe for curious pets.',
    longDescriptionEs:
      'Si tus mascotas tienen tendencia a morder las hojas, estas plantas son la elección inteligente. Están clasificadas como no tóxicas por la ASPCA y son seguras para animales curiosos.',
  },
};
