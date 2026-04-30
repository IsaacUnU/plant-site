import type { Metadata } from 'next';
import ContactForm from './ContactForm';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the PlantCare Central team.',
  alternates: buildAlternates('/contact', {
    en: '/contact',
    es: '/es/contact',
  }),
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Have a question, spotted an error, or want to suggest a plant we should cover?
        We&apos;d love to hear from you.
      </p>
      <ContactForm />

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Follow us on Social Media</p>
        <a 
          href="https://www.instagram.com/plant_care_central/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#15803D] text-white rounded-2xl font-bold shadow-lg hover:bg-[#166534] hover:-translate-y-0.5 transition-all duration-300 border border-[#E2EFE7]/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          @plant_care_central
        </a>
      </div>
    </div>
  );
}
