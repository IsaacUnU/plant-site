import { ImageResponse } from 'next/og';
import { getPlant, getAllPlantSlugs } from '@/lib/plants';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return getAllPlantSlugs().map((slug) => ({ slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plant = await getPlant(slug);

  const name        = plant?.commonName    ?? 'Plant Care Guide';
  const scientific  = plant?.scientificName ?? '';
  const category    = plant?.category       ?? 'houseplant';
  const description = plant?.description    ?? 'Expert care guide for healthy plants.';
  const difficulty  = plant?.difficulty     ?? 'easy';

  const diffColor = difficulty === 'easy' ? '#10b981' : difficulty === 'medium' ? '#f59e0b' : '#ef4444';
  const diffLabel = difficulty === 'easy' ? 'Easy Care' : difficulty === 'medium' ? 'Moderate' : 'Expert';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F0FDF4',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21,128,61,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.1) 0%, transparent 70%)',
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 80px', flex: 1 }}>

          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
            {/* SVG logomark inline */}
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="9" fill="#15803D" />
              <path d="M16 6C11 6 7 10 7 15c0 3.5 1.8 6.5 4.5 8.2V25h9v-1.8C23.2 21.5 25 18.5 25 15c0-5-4-9-9-9z" fill="white" fillOpacity="0.95" />
              <ellipse cx="12.5" cy="17" rx="1.8" ry="2.4" fill="#15803D" />
              <ellipse cx="19.5" cy="17" rx="1.8" ry="2.4" fill="#15803D" />
              <line x1="16" y1="8" x2="16" y2="23" stroke="#15803D" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
              PlantCare Central
            </span>
          </div>

          {/* Category + difficulty */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, color: '#15803D',
              background: '#dcfce7', borderRadius: 999, padding: '6px 16px',
              textTransform: 'capitalize',
            }}>
              {category}
            </span>
            <span style={{
              fontSize: 14, fontWeight: 600, color: diffColor,
              background: `${diffColor}18`, borderRadius: 999, padding: '6px 16px',
            }}>
              {diffLabel}
            </span>
          </div>

          {/* Plant name */}
          <div style={{
            fontSize: 72, fontWeight: 700, color: '#0F172A',
            lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 12,
          }}>
            {name}
          </div>

          {/* Scientific name */}
          <div style={{ fontSize: 24, color: '#64748b', fontStyle: 'italic', marginBottom: 28 }}>
            {scientific}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 22, color: '#475569', lineHeight: 1.5,
            maxWidth: 780,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {description}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          background: '#15803D', padding: '18px 80px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
            plantcarecentral.com
          </span>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
            Complete Care Guide →
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
