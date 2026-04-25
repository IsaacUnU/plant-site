import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Guías de Cuidado de Plantas de Interior — PlantCare Central',
    template: '%s | PlantCare Central',
  },
  description: 'Guías expertas de cuidado para todas tus plantas de interior. Aprende a regar, abonar y cultivar plantas sanas en casa.',
};

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
