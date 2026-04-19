import Link from 'next/link';
import { Search } from 'lucide-react';
import { LogoMark } from './Logo';
import MobileMenu from './MobileMenu';
import { getAllCategories } from '@/lib/plants';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';

export default function Header() {
  // Dynamic: top 2 categories sorted by plant count (Vines replaced by Uses)
  const topCategories = getAllCategories()
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((cat) => ({
      href: `/category/${cat.slug}`,
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
    }));

  const navLinks = [
    { href: '/plants', label: 'All Plants' },
    ...topCategories,
    { href: '/uses', label: 'Uses & Benefits' },
    { href: '/articles', label: 'Care Guides' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2EFE7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center group cursor-pointer" aria-label={SITE_NAME}>
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
              href="/search"
              className="ml-1 p-2 rounded-lg text-[#475569] hover:bg-[#F0FDF4] hover:text-[#15803D] transition-colors duration-300 cursor-pointer"
              aria-label="Search plants"
            >
              <Search className="w-5 h-5" />
            </Link>
          </nav>

          {/* Mobile: search icon + hamburger */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="md:hidden p-2 rounded-lg text-[#475569] hover:bg-[#F0FDF4] hover:text-[#15803D] transition-colors duration-300 cursor-pointer"
              aria-label="Search plants"
            >
              <Search className="w-5 h-5" />
            </Link>
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
