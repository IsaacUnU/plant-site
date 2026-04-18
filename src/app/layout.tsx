import type { Metadata } from 'next';
import { Lora, Raleway } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
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
  alternates: {
    canonical: SITE_URL,
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KV3PNKPG');`,
          }}
        />
        {/* Google Analytics */}
        <Script
          id="ga-external"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-SHVPECMB4K"
        />
        <Script
          id="ga-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SHVPECMB4K');`,
          }}
        />
        {/* Google AdSense */}
        <Script
          id="adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7863265866651285"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${lora.variable} ${raleway.variable} font-body bg-[#F0FDF4] text-[#0F172A] antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KV3PNKPG" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
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
