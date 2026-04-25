'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const isEs = pathname.startsWith('/es');

  const enHref = isEs ? pathname.replace(/^\/es/, '') || '/' : pathname;
  const esHref = isEs ? pathname : `/es${pathname}`;

  return (
    <div className="flex items-center gap-0.5 ml-1 border border-[#E2EFE7] rounded-lg overflow-hidden text-xs font-bold">
      <Link
        href={enHref}
        className={`px-2.5 py-1.5 transition-colors duration-200 ${
          !isEs
            ? 'bg-[#15803D] text-white'
            : 'text-[#64748b] hover:bg-[#F0FDF4] hover:text-[#15803D]'
        }`}
        aria-label="Switch to English"
      >
        EN
      </Link>
      <Link
        href={esHref}
        className={`px-2.5 py-1.5 transition-colors duration-200 ${
          isEs
            ? 'bg-[#15803D] text-white'
            : 'text-[#64748b] hover:bg-[#F0FDF4] hover:text-[#15803D]'
        }`}
        aria-label="Cambiar a español"
      >
        ES
      </Link>
    </div>
  );
}
