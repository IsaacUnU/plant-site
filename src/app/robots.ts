import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Do not disallow /_next/ — every image is served through /_next/image,
        // so blocking it hides the entire catalogue from Google Images and
        // blocks the CSS/JS Googlebot needs to render the page.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
