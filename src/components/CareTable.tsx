import { Sun, Droplets, Wind, Thermometer, Leaf, AlertTriangle, TrendingUp } from 'lucide-react';
import { Plant } from '@/types/plant';
import type { Lang } from '@/lib/plants';
import {
  DIFFICULTY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS_ES,
  LIGHT_LABELS, LIGHT_LABELS_ES,
  WATER_LABELS, WATER_LABELS_ES,
  HUMIDITY_LABELS, HUMIDITY_LABELS_ES,
  TOXICITY_LABELS, TOXICITY_LABELS_ES, TOXICITY_COLORS,
} from '@/lib/utils';

const GROWTH_RATE_ES: Record<string, string> = { slow: 'Lento', moderate: 'Moderado', fast: 'Rápido' };

interface CareTableProps {
  plant: Plant;
  lang?: Lang;
}

export default function CareTable({ plant, lang = 'en' }: CareTableProps) {
  const es = lang === 'es';
  const L = {
    title: es ? 'Resumen de Cuidados' : 'Quick Care Guide',
    light: es ? 'Luz' : 'Light',
    watering: es ? 'Riego' : 'Watering',
    humidity: es ? 'Humedad' : 'Humidity',
    temperature: es ? 'Temperatura' : 'Temperature',
    difficulty: es ? 'Dificultad' : 'Difficulty',
    toxicity: es ? 'Toxicidad' : 'Toxicity',
    growth: es ? 'Crecimiento' : 'Growth Rate',
    caption: es ? 'Resumen de requisitos de cuidado' : 'Care requirements summary',
  };

  const rows = [
    {
      icon: <Sun className="w-4 h-4 text-[#D97706]" />,
      label: L.light,
      value: es ? LIGHT_LABELS_ES[plant.light] : LIGHT_LABELS[plant.light],
    },
    {
      icon: <Droplets className="w-4 h-4 text-[#0ea5e9]" />,
      label: L.watering,
      value: es ? WATER_LABELS_ES[plant.water] : WATER_LABELS[plant.water],
    },
    {
      icon: <Wind className="w-4 h-4 text-[#06b6d4]" />,
      label: L.humidity,
      value: es ? HUMIDITY_LABELS_ES[plant.humidity] : HUMIDITY_LABELS[plant.humidity],
    },
    {
      icon: <Thermometer className="w-4 h-4 text-[#f97316]" />,
      label: L.temperature,
      value: plant.temperature,
    },
    {
      icon: <Leaf className="w-4 h-4 text-[#15803D]" />,
      label: L.difficulty,
      value: (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[plant.difficulty]}`}>
          {es ? DIFFICULTY_LABELS_ES[plant.difficulty] : DIFFICULTY_LABELS[plant.difficulty]}
        </span>
      ),
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-[#DC2626]" />,
      label: L.toxicity,
      value: (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TOXICITY_COLORS[plant.toxicity]}`}>
          {es ? TOXICITY_LABELS_ES[plant.toxicity] : TOXICITY_LABELS[plant.toxicity]}
        </span>
      ),
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />,
      label: L.growth,
      value: plant.growthRate
        ? es ? (GROWTH_RATE_ES[plant.growthRate] ?? plant.growthRate) : plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1)
        : '—',
    },
  ];

  return (
    <div
      className="bg-white rounded-3xl border border-[#E2EFE7] overflow-hidden"
      style={{ boxShadow: '0 2px 12px 0 rgba(21,128,61,0.07)' }}
    >
      <div className="bg-[#15803D] px-5 py-4 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-white/80" />
        <h2
          className="text-white font-semibold text-sm tracking-wide"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {L.title}
        </h2>
      </div>

      <table role="table" className="w-full border-collapse">
        <caption className="sr-only">{L.caption}</caption>
        <tbody className="divide-y divide-[#F0F7F3]">
          {rows.map((row) => (
            <tr key={row.label} className="flex items-center px-5 py-3.5 gap-3 text-sm">
              <td className="shrink-0">{row.icon}</td>
              <th
                scope="row"
                className="w-28 text-[#64748b] font-medium shrink-0 text-xs uppercase tracking-wide text-left"
              >
                {row.label}
              </th>
              <td className="text-[#0F172A] font-medium">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
