import Image from 'next/image';

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Use the light variant for dark backgrounds */
  variant?: 'default' | 'light';
}

/** Standalone logomark — monstera icon square */
export function LogoMark({ size = 34, className = '' }: LogoMarkProps) {
  return (
    <Image
      src="/images/logo/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      aria-hidden="true"
      priority
    />
  );
}

interface LogoImageProps {
  height?: number;
  className?: string;
}

/** Full horizontal logo — icon + wordmark, light backgrounds */
export function LogoFull({ height = 36, className = '' }: LogoImageProps) {
  return (
    <Image
      src="/images/logo/logo-full.png"
      alt="PlantCare Guide"
      width={0}
      height={height}
      sizes="100vw"
      className={`w-auto ${className}`}
      style={{ height }}
      priority
    />
  );
}

/** Full horizontal logo — dark variant, for dark/navy backgrounds */
export function LogoDark({ height = 36, className = '' }: LogoImageProps) {
  return (
    <Image
      src="/images/logo/logo-dark.png"
      alt="PlantCare Guide"
      width={0}
      height={height}
      sizes="100vw"
      className={`w-auto ${className}`}
      style={{ height }}
      priority
    />
  );
}

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  siteName?: string;
  /** Use 'light' for dark backgrounds (footer) */
  variant?: 'default' | 'light';
}

/** Full logo: mark + wordmark (legacy default export) */
export default function Logo({
  size = 32,
  showText = true,
  textClassName = '',
  siteName = 'PlantCare Guide',
  variant = 'default',
}: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#0F172A]';

  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} variant={variant} />
      {showText && (
        <span
          className={`font-semibold ${textColor} tracking-tight ${textClassName}`}
          style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.6 }}
        >
          {siteName}
        </span>
      )}
    </span>
  );
}
