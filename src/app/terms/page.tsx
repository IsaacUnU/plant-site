import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Terms and conditions for using ${SITE_NAME}.`,
  alternates: buildAlternates('/terms', {
    en: '/terms',
    es: '/es/terms',
  }),
};

export default function TermsPage() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: {today}</p>

      <div className="prose max-w-none">
        <p>
          By accessing and using <strong>{SITE_NAME}</strong> ({SITE_URL}), you agree to be bound
          by these Terms and Conditions. Please read them carefully before using the site.
        </p>

        <h2>1. Use of the Site</h2>
        <p>
          {SITE_NAME} provides informational plant care guides for personal, non-commercial use.
          You may not reproduce, distribute, or republish any content from this site without
          prior written permission.
        </p>

        <h2>2. Accuracy of Information</h2>
        <p>
          While we strive to provide accurate and up-to-date plant care information, we make no
          warranties or representations of any kind, express or implied, about the completeness,
          accuracy, or suitability of the information provided. Always consult a qualified
          horticulturist for specific plant care concerns.
        </p>

        <h2>3. Advertising</h2>
        <p>
          This site may display advertisements served by Google AdSense and other third-party
          ad networks. These networks may use cookies to serve ads based on your prior visits
          to this or other websites. You can opt out of personalised advertising by visiting
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer"> Google Ad Settings</a>.
        </p>

        <h2>4. Third-Party Links</h2>
        <p>
          Our site may contain links to external websites. These links are provided for your
          convenience. We have no control over the content of those sites and accept no
          responsibility for them or for any loss or damage that may arise from your use of them.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          All content on this site, including text, images, logos, and graphics, is the property
          of {SITE_NAME} or its content suppliers and is protected by copyright law. Unauthorised
          use is prohibited.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          {SITE_NAME} shall not be liable for any direct, indirect, incidental, consequential,
          or punitive damages arising from your use of, or inability to use, this site or its
          content.
        </p>

        <h2>7. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms and Conditions at any time. Changes will
          be effective immediately upon posting to the site. Your continued use of the site
          constitutes acceptance of the revised terms.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These Terms and Conditions are governed by applicable law. Any disputes arising
          from use of this site shall be subject to the exclusive jurisdiction of the
          competent courts.
        </p>

        <h2>9. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact us via our{' '}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
