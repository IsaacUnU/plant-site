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
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Expert plant care guides for every level of gardener.
              Grow with confidence — one plant at a time.
            </p>
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
