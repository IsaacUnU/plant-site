import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Difficulty, Light, WaterFrequency, Humidity, ToxicityLevel } from '@/types/plant';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const DIFFICULTY_STYLES_CLIENT: Record<Difficulty, { dot: string; text: string; bg: string }> = {
  easy:   { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  medium: { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  hard:   { dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Moderate',
  hard: 'Expert',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export const LIGHT_LABELS: Record<Light, string> = {
  low: 'Low Light',
  indirect: 'Indirect Light',
  'indirect-bright': 'Bright Indirect',
  direct: 'Direct Sun',
};

export const LIGHT_ICONS: Record<Light, string> = {
  low: '🌑',
  indirect: '🌤',
  'indirect-bright': '🌤',
  direct: '☀️',
};

export const WATER_LABELS: Record<WaterFrequency, string> = {
  daily: 'Daily',
  'every-2-3-days': 'Every 2-3 days',
  weekly: 'Weekly',
  'every-2-weeks': 'Every 2 weeks',
  monthly: 'Monthly',
};

export const HUMIDITY_LABELS: Record<Humidity, string> = {
  low: 'Low (<40%)',
  medium: 'Medium (40-60%)',
  high: 'High (>60%)',
};

export const TOXICITY_LABELS: Record<ToxicityLevel, string> = {
  'non-toxic': 'Pet Safe',
  'mildly-toxic': 'Mildly Toxic',
  'toxic-to-pets': 'Toxic to Pets',
  toxic: 'Toxic',
};

export const TOXICITY_COLORS: Record<ToxicityLevel, string> = {
  'non-toxic': 'bg-green-100 text-green-800',
  'mildly-toxic': 'bg-yellow-100 text-yellow-800',
  'toxic-to-pets': 'bg-red-100 text-red-800',
  toxic: 'bg-red-100 text-red-800',
};

export const DIFFICULTY_LABELS_ES: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Moderado',
  hard: 'Experto',
};

export const LIGHT_LABELS_ES: Record<Light, string> = {
  low: 'Poca Luz',
  indirect: 'Luz Indirecta',
  'indirect-bright': 'Luz Brillante',
  direct: 'Luz Directa',
};

export const WATER_LABELS_ES: Record<WaterFrequency, string> = {
  daily: 'Diario',
  'every-2-3-days': 'Cada 2-3 días',
  weekly: 'Semanal',
  'every-2-weeks': 'Cada 2 semanas',
  monthly: 'Mensual',
};

export const HUMIDITY_LABELS_ES: Record<Humidity, string> = {
  low: 'Baja (<40%)',
  medium: 'Media (40-60%)',
  high: 'Alta (>60%)',
};

export const TOXICITY_LABELS_ES: Record<ToxicityLevel, string> = {
  'non-toxic': 'Segura para Mascotas',
  'mildly-toxic': 'Ligeramente Tóxica',
  'toxic-to-pets': 'Tóxica para Mascotas',
  toxic: 'Tóxica',
};

export const CATEGORY_LABELS_ES: Record<string, string> = {
  tropical: 'Tropical',
  succulents: 'Suculentas',
  cacti: 'Cactus',
  ferns: 'Helechos',
  'low-light': 'Poca Luz',
  vines: 'Trepadoras',
  palms: 'Palmeras',
  flowering: 'Flores',
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  tropical: 'Lush tropical plants that bring exotic beauty to any indoor space.',
  succulents: 'Drought-tolerant plants perfect for low-maintenance gardeners.',
  'low-light': 'Thriving plants that flourish in dim or shaded environments.',
  flowering: 'Colorful blooming plants that add vibrant color to your home.',
  herbs: 'Edible and aromatic plants for your kitchen garden.',
  ferns: 'Delicate, feathery plants that love moisture and shade.',
  cacti: 'Striking desert plants requiring minimal water and care.',
  vines: 'Trailing and climbing plants ideal for shelves and hanging baskets.',
};

export const CATEGORY_DESCRIPTIONS_ES: Record<string, string> = {
  tropical: 'Plantas tropicales exuberantes que aportan belleza exótica a cualquier espacio interior.',
  succulents: 'Plantas resistentes a la sequía, perfectas para quienes buscan bajo mantenimiento.',
  'low-light': 'Plantas que prosperan en ambientes con poca luz o semisombra.',
  flowering: 'Plantas con flores coloridas que añaden vivacidad a tu hogar.',
  herbs: 'Plantas comestibles y aromáticas para tu jardín de cocina.',
  ferns: 'Plantas delicadas y frondosas que aman la humedad y la sombra.',
  cacti: 'Plantas del desierto que requieren mínimo riego y cuidado.',
  vines: 'Plantas trepadoras y colgantes ideales para estantes y maceteros colgantes.',
};
