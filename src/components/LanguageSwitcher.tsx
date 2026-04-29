'use client';

import { usePathname, useRouter } from 'next/navigation';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setLangCookie(lang: 'en' | 'es') {
  document.cookie = `lang=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const isEs = pathname.startsWith('/es');

  const enHref = isEs ? pathname.replace(/^\/es/, '') || '/' : pathname;
  const esHref = isEs ? pathname : `/es${pathname}`;

  function switchTo(lang: 'en' | 'es') {
    setLangCookie(lang);
    router.push(lang === 'es' ? esHref : enHref);
  }

  return (
    <div className="flex items-center gap-0.5 ml-1 border border-[#E2EFE7] rounded-lg overflow-hidden text-xs font-bold">
      <button
        onClick={() => switchTo('en')}
        className={`px-2.5 py-1.5 transition-colors duration-200 cursor-pointer ${
          !isEs
            ? 'bg-[#15803D] text-white'
            : 'text-[#64748b] hover:bg-[#F0FDF4] hover:text-[#15803D]'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchTo('es')}
        className={`px-2.5 py-1.5 transition-colors duration-200 cursor-pointer ${
          isEs
            ? 'bg-[#15803D] text-white'
            : 'text-[#64748b] hover:bg-[#F0FDF4] hover:text-[#15803D]'
        }`}
        aria-label="Cambiar a español"
      >
        ES
      </button>
    </div>
  );
}
