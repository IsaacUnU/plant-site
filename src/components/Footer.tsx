import Link from 'next/link';
import { LogoMark } from './Logo';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#0F172A] text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4 cursor-pointer group w-fit" aria-label={SITE_NAME}>
              <LogoMark size={36} className="group-hover:scale-105 transition-transform duration-200" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              Expert plant care guides for every level of gardener.
              Grow with confidence — one plant at a time.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/plant_care_central/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-500 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Browse</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/plants', label: 'All Plants' },
                { href: '/category/tropical', label: 'Tropical Plants' },
                { href: '/category/succulents', label: 'Succulents' },
                { href: '/category/low-light', label: 'Low Light' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Info</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Making plant parents since {year}.
          </p>
        </div>
      </div>
    </footer>
  );
}
