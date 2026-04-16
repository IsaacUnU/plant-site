import React from 'react';
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Plant Care Guides & Expert Tips',
  description: 'In-depth plant care guides, expert tips, and curated plant lists to help you grow a thriving indoor garden.',
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#2c3e50]">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 
          className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Care Guides & Tips
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Expert-written guides, curated Top 10 lists, and practical tips to help you master the art of indoor gardening.
        </p>
      </div>

      <AdSlot slot="banner" className="mb-12" />

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <React.Fragment key={article.slug}>
              <ArticleCard article={article} />
              {(index + 1) % 6 === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-4">
                  <AdSlot slot="in-content" className="!h-32" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-green-50 rounded-[3rem] border-2 border-dashed border-green-200">
          <p className="text-6xl mb-6">📚</p>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Guides are blooming...</h2>
          <p className="text-gray-500">Check back soon for expert plant care advice and curated lists.</p>
        </div>
      )}

      {/* Growth hook: Instagram CTA */}
      <div className="mt-20 group">
        <a 
          href="https://www.instagram.com/plant_care_central/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative p-10 bg-[#0F2922] rounded-[3rem] text-white text-center overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
            <LogoMark size={300} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Want daily plant inspo?</h2>
            <p className="text-green-50/80 max-w-xl mx-auto mb-8 text-lg">
              Join our community on Instagram for the best plant hacks, rare finds, and beautiful indoor garden setups.
            </p>
            <div className="inline-block px-10 py-4 bg-[#15803D] text-white font-bold rounded-2xl shadow-lg hover:bg-[#166534] transition-colors border border-white/20">
              Follow @plant_care_central
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

// Minimal LogoMark import for the CTA
import { LogoMark } from '@/components/Logo';
