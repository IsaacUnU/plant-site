'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
}

export default function MobileMenu({ navLinks, searchHref = '/search' }: { navLinks: NavLink[]; searchHref?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2 rounded-lg text-[#475569] hover:bg-[#F0FDF4] hover:text-[#15803D] transition-colors duration-200 cursor-pointer"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#E2EFE7] shadow-lg z-40 animate-fade-in">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-[#475569] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={searchHref}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-[#475569] hover:text-[#15803D] hover:bg-[#F0FDF4] transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
