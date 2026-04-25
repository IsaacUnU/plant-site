import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeLabel?: string;
  homeHref?: string;
}

export default function Breadcrumb({ items, homeLabel = 'Home', homeHref = '/' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li>
          <Link href={homeHref} className="text-[#64748b] hover:text-[#15803D] transition-colors duration-200 cursor-pointer">
            {homeLabel}
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
            {item.href ? (
              <Link href={item.href} className="text-[#64748b] hover:text-[#15803D] transition-colors duration-200 cursor-pointer">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[#0F172A]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
