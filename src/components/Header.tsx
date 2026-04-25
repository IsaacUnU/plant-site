import Link from 'next/link';
import { Search } from 'lucide-react';
import { headers } from 'next/headers';
import { LogoMark } from './Logo';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import { getAllCategories } from '@/lib/plants';
import { CATEGORY_LABELS_ES } from '@/lib/utils';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';

export default async function Header() {
  const pathname = (await headers()).get('x-pathname') || '/';
  const isEs = pathname.startsWith('/es');
  const prefix = isEs ? '/es' : '';

  // Dynamic: top 2 categories sorted by plant count
  const topCategories = getAllCategories()
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((cat) => ({
      href: `${prefix}/category/${cat.slug}`,
      label: isEs
        ? (CATEGORY_LABELS_ES[cat.slug] ?? cat.name.charAt(0).toUpperCase() + cat.name.slice(1))
        : cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
    }));

  const navLinks = isEs
    ? [
        { href: '/es/plants', label: 'Todas las Plantas' },
        ...topCategories,
        { href: '/es/uses', label: 'Usos y Beneficios' },
        { href: '/es/articles', label: 'Guías de Cuidado' },
      ]
    : [
        { href: '/plants', label: 'All Plants' },
        ...topCategories,
        { href: '/uses', label: 'Uses & Benefits' },
        { href: '/articles', label: 'Care Guides' },
      ];

  const searchHref = isEs ? '/es/search' : '/search';
  const logoHref = isEs ? '/es' : '/';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2EFE7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href={logoHref} className="flex items-center group cursor-pointer" aria-label={SITE_NAME}>
            <LogoMark size={36} className="group-hover:scale-105 transition-transform duration-200" />
            <span className="sr-only">{SITE_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#475569] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-colors duration-300 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={searchHref}
              className="ml-1 p-2 rounded-lg text-[#475569] hover:bg-[#F0FDF4] hover:text-[#15803D] transition-colors duration-300 cursor-pointer"
              aria-label="Search plants"
            >
              <Search className="w-5 h-5" />
            </Link>
            <LanguageSwitcher />
          </nav>

          {/* Mobile: search icon + hamburger */}
          <div className="flex items-center gap-1">
            <Link
              href={searchHref}
              className="md:hidden p-2 rounded-lg text-[#475569] hover:bg-[#F0FDF4] hover:text-[#15803D] transition-colors duration-300 cursor-pointer"
              aria-label="Search plants"
            >
              <Search className="w-5 h-5" />
            </Link>
            <MobileMenu navLinks={navLinks} searchHref={searchHref} />
          </div>
        </div>
      </div>
    </header>
  );
}
