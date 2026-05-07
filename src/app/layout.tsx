import type { Metadata } from 'next';
import { Lora, Raleway } from 'next/font/google';
import { headers } from 'next/headers';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import ConsentScripts from '@/components/ConsentScripts';
import { websiteSchema } from '@/lib/schema';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';
const SITE_DESCRIPTION =
  'Expert plant care guides for every houseplant. Learn how to water, feed, and grow healthy plants indoors.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Houseplant Care Guides — ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'houseplant care',
    'indoor plant care guide',
    'how to care for houseplants',
    'plant watering tips',
    'best indoor plants',
    'low light houseplants',
    'succulent care',
    'monstera care',
    'pothos care',
    'fiddle leaf fig care',
    'snake plant care',
    'peace lily care',
    'plant care for beginners',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Houseplant Care Guides`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Houseplant Care Guides`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const lang = pathname.startsWith('/es') ? 'es' : 'en';

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${lora.variable} ${raleway.variable} font-body bg-[#F0FDF4] text-[#0F172A] antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <ConsentScripts />
        <Analytics />
        <script
          key="ldjson-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
      </body>
    </html>
  );
}
