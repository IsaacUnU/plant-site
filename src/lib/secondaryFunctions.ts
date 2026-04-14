import { SecondaryFunction } from '@/types/plant';

export interface SecondaryFunctionMeta {
  slug: SecondaryFunction;
  name: string;
  emoji: string;
  description: string;
  longDescription: string;
}

export const SECONDARY_FUNCTION_META: Record<SecondaryFunction, SecondaryFunctionMeta> = {
  'humidity-boosting': {
    slug: 'humidity-boosting',
    name: 'Humidity Boosting',
    emoji: '💧',
    description: 'Plants that naturally increase moisture in the air through transpiration.',
    longDescription:
      'These plants release water vapour from their leaves, raising indoor humidity levels. Great for combating dry air in heated or air-conditioned rooms.',
  },
  'air-purifying': {
    slug: 'air-purifying',
    name: 'Air Purifying',
    emoji: '🌬️',
    description: 'Plants known to filter toxins and improve indoor air quality.',
    longDescription:
      'Certain houseplants absorb volatile organic compounds (VOCs) like formaldehyde, benzene, and xylene through their leaves and roots. A natural way to freshen your home.',
  },
  'insect-repelling': {
    slug: 'insect-repelling',
    name: 'Insect Repelling',
    emoji: '🦟',
    description: 'Plants with natural compounds that deter common household insects.',
    longDescription:
      'These plants produce aromatic oils or chemicals that mosquitoes, flies, and other pests find unpleasant. Keep them near windows or entrances for a natural barrier.',
  },
  'pleasant-scent': {
    slug: 'pleasant-scent',
    name: 'Pleasant Scent',
    emoji: '🌸',
    description: 'Plants with natural fragrances that subtly perfume your living space.',
    longDescription:
      'From soft floral notes to fresh green aromas, these plants add a sensory dimension to your indoor garden — no synthetic air fresheners needed.',
  },
  medicinal: {
    slug: 'medicinal',
    name: 'Medicinal',
    emoji: '🌿',
    description: 'Plants with well-known traditional or evidence-based health uses.',
    longDescription:
      'These plants have been used for centuries for their healing properties — from soothing minor burns to supporting skin health. Always consult a professional before internal use.',
  },
  'pet-safe': {
    slug: 'pet-safe',
    name: 'Pet Safe',
    emoji: '🐾',
    description: 'Non-toxic plants safe to keep around cats and dogs.',
    longDescription:
      'If your furry friends like to chew on leaves, these plants are the smart choice. They are classified as non-toxic by the ASPCA and safe for curious pets.',
  },
};
