import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, FileText, List } from 'lucide-react';
import { ArticleCardData } from '@/types/article';

interface ArticleCardProps {
  article: ArticleCardData;
  className?: string;
}

export default function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <article className={`plant-card group relative bg-white rounded-3xl border border-[#E2EFE7] overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1${className ? ` ${className}` : ''}`}>
        
        {/* Cover Image */}
        <div className="relative h-56 w-full shrink-0 bg-[#F0FDF4] overflow-hidden">
          <Link href={`/articles/${article.slug}`} className="block relative h-full w-full" aria-label={`Read guide: ${article.title}`}>
            {article.image ? (
              <Image
                src={article.image}
                alt={article.imageAlt || article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"></div>
                <div className="text-[#15803D]/20 group-hover:scale-110 group-hover:text-[#15803D]/30 transition-all duration-500">
                  {article.type === 'listicle' ? <List className="w-24 h-24" /> : <FileText className="w-24 h-24" />}
                </div>
              </div>
            )}
          </Link>
          
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            <span className="bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold text-[#15803D] px-2.5 py-1.5 rounded-md shadow-sm">
              {article.type}
            </span>
            <span className="bg-[#15803D]/90 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold text-white px-2.5 py-1.5 rounded-md shadow-sm">
              {article.category}
            </span>
          </div>
          
          {/* Subtle overlay for contrast */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-[11px] text-[#94a3b8] mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(article.datePublished).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <Link href={`/articles/${article.slug}`} className="hover:no-underline">
            <h2 
              className="font-bold text-xl text-[#0F172A] group-hover:text-[#15803D] transition-colors duration-200 leading-tight mb-3 after:absolute after:inset-0 after:z-10"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {article.title}
            </h2>
          </Link>

          <p className="text-sm text-[#475569] leading-relaxed flex-1 line-clamp-3 mb-6">
            {article.description}
          </p>

          <div 
            className="flex items-center text-sm font-bold text-[#15803D] group-hover:gap-2 gap-1 transition-all duration-200 mt-auto"
            aria-hidden="true"
          >
            Explore Guide <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </article>
    );
}
