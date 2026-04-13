'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#0F172A] text-white rounded-2xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-slate-300 leading-relaxed flex-1">
          We use cookies to improve your experience and show relevant ads.{' '}
          <Link href="/privacy-policy" className="underline text-[#86efac] hover:text-white transition-colors">
            Privacy Policy
          </Link>
          {' '}·{' '}
          <Link href="/terms" className="underline text-[#86efac] hover:text-white transition-colors">
            Terms
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
