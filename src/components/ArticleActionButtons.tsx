'use client';

import { Share2, Printer } from 'lucide-react';

export default function ArticleActionButtons() {
  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        aria-label="Share this article"
        className="p-2 rounded-full hover:bg-[#F0FDF4] transition-colors text-[#64748B] hover:text-[#15803D]"
      >
        <Share2 className="w-4 h-4" />
      </button>
      <button
        aria-label="Print this article"
        onClick={() => window.print()}
        className="p-2 rounded-full hover:bg-[#F0FDF4] transition-colors text-[#64748B] hover:text-[#15803D]"
      >
        <Printer className="w-4 h-4" />
      </button>
    </div>
  );
}
