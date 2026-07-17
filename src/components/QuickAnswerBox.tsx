import {
  Sun,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Plant } from '@/types/plant';
import {
  LIGHT_LABELS,
  WATER_LABELS,
  HUMIDITY_LABELS,
  TOXICITY_LABELS,
  DIFFICULTY_LABELS,
} from '@/lib/utils';

interface QuickAnswerBoxProps {
  plant: Plant;
}

export default function QuickAnswerBox({ plant }: QuickAnswerBoxProps) {
  const isToxic =
    plant.toxicity === 'toxic' || plant.toxicity === 'toxic-to-pets';

  // Unconfirmed is not safe. Only a positive 'non-toxic' earns the green tick;
  // anything else warns.
  const isConfirmedSafe = plant.toxicity === 'non-toxic';

  const toxicityCellBg = isToxic
    ? 'bg-red-50'
    : isConfirmedSafe
      ? 'bg-[#F0FDF4]'
      : 'bg-amber-50';
  const toxicityIconColor = isToxic
    ? 'text-red-500'
    : isConfirmedSafe
      ? 'text-[#15803D]'
      : 'text-amber-600';

  const growthRateLabel =
    plant.growthRate
      ? plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1)
      : '—';

  const cells = [
    {
      icon: <Sun className="w-4 h-4 text-[#15803D]" />,
      label: 'Light',
      value: LIGHT_LABELS[plant.light] ?? plant.light,
      cellBg: 'bg-[#F0FDF4]',
    },
    {
      icon: <Droplets className="w-4 h-4 text-[#0ea5e9]" />,
      label: 'Water',
      value: WATER_LABELS[plant.water] ?? plant.water,
      cellBg: 'bg-[#F0FDF4]',
    },
    {
      icon: <Wind className="w-4 h-4 text-[#0d9488]" />,
      label: 'Humidity',
      value: HUMIDITY_LABELS[plant.humidity] ?? plant.humidity,
      cellBg: 'bg-[#F0FDF4]',
    },
    {
      icon: isConfirmedSafe
        ? <CheckCircle className={`w-4 h-4 ${toxicityIconColor}`} />
        : <AlertTriangle className={`w-4 h-4 ${toxicityIconColor}`} />,
      label: 'Toxicity',
      value: TOXICITY_LABELS[plant.toxicity] ?? plant.toxicity,
      cellBg: toxicityCellBg,
    },
    {
      icon: <Star className="w-4 h-4 text-[#d97706]" />,
      label: 'Difficulty',
      value: DIFFICULTY_LABELS[plant.difficulty] ?? plant.difficulty,
      cellBg: 'bg-[#F0FDF4]',
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-[#15803D]" />,
      label: 'Growth Rate',
      value: growthRateLabel,
      cellBg: 'bg-[#F0FDF4]',
    },
  ];

  return (
    <div className="bg-white border border-[#E2EFE7] rounded-3xl shadow-sm p-4">
      <p className="text-xs font-bold tracking-widest uppercase text-[#15803D]">
        Quick Care Summary
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={`flex items-start gap-3 ${cell.cellBg} rounded-2xl p-3`}
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
              {cell.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                {cell.label}
              </p>
              <p className="text-sm font-semibold text-[#0F172A] leading-snug">
                {cell.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
