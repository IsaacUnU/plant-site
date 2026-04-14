import { Sun, Droplets, Wind, Thermometer, Leaf, AlertTriangle, TrendingUp } from 'lucide-react';
import { Plant } from '@/types/plant';
import {
  DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  LIGHT_LABELS, WATER_LABELS,
  HUMIDITY_LABELS, TOXICITY_LABELS, TOXICITY_COLORS,
} from '@/lib/utils';

interface CareTableProps {
  plant: Plant;
}

export default function CareTable({ plant }: CareTableProps) {
  const rows = [
    {
      icon: <Sun className="w-4 h-4 text-[#D97706]" />,
      label: 'Light',
      value: LIGHT_LABELS[plant.light],
    },
    {
      icon: <Droplets className="w-4 h-4 text-[#0ea5e9]" />,
      label: 'Watering',
      value: WATER_LABELS[plant.water],
    },
    {
      icon: <Wind className="w-4 h-4 text-[#06b6d4]" />,
      label: 'Humidity',
      value: HUMIDITY_LABELS[plant.humidity],
    },
    {
      icon: <Thermometer className="w-4 h-4 text-[#f97316]" />,
      label: 'Temperature',
      value: plant.temperature,
    },
    {
      icon: <Leaf className="w-4 h-4 text-[#15803D]" />,
      label: 'Difficulty',
      value: (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[plant.difficulty]}`}>
          {DIFFICULTY_LABELS[plant.difficulty]}
        </span>
      ),
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-[#DC2626]" />,
      label: 'Toxicity',
      value: (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TOXICITY_COLORS[plant.toxicity]}`}>
          {TOXICITY_LABELS[plant.toxicity]}
        </span>
      ),
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />,
      label: 'Growth Rate',
      value: plant.growthRate ? plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1) : '—',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#E2EFE7] overflow-hidden"
      style={{ boxShadow: '0 2px 12px 0 rgba(21,128,61,0.07)' }}>

      {/* Header */}
      <div className="bg-[#15803D] px-5 py-4 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-white/80" />
        <h2
          className="text-white font-semibold text-sm tracking-wide"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Quick Care Guide
        </h2>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F0F7F3]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center px-5 py-3.5 gap-3 text-sm">
            <span className="shrink-0">{row.icon}</span>
            <span className="w-28 text-[#64748b] font-medium shrink-0 text-xs uppercase tracking-wide">
              {row.label}
            </span>
            <span className="text-[#0F172A] font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
