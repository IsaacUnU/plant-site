import type { Metadata } from 'next';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${SITE_NAME}.`,
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: {today}</p>

      <div className="prose max-w-none">
        <p>
          This Privacy Policy describes how <strong>{SITE_NAME}</strong> (&quot;we&quot;, &quot;us&quot;)
          collects, uses, and shares information when you visit {SITE_URL} (&quot;the Site&quot;).
        </p>

        <h2>Information We Collect</h2>
        <p>
          We do not collect personal information directly. However, third-party services we use
          may collect data automatically:
        </p>
        <ul>
          <li>
            <strong>Google AdSense</strong>: Displays ads and may use cookies to serve personalised
            advertising based on your visits to this and other sites.
          </li>
          <li>
            <strong>Google Analytics</strong> (if enabled): Collects anonymised data about traffic
            and usage patterns.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Our site uses cookies placed by third-party ad networks (including Google AdSense) to
          display relevant advertisements. You can opt out of personalised advertising by visiting
          Google&apos;s <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Ad Settings</a>.
        </p>
        <p>
          By continuing to use this site, you consent to the use of cookies in accordance with
          this policy.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          This site may contain links to third-party websites. We are not responsible for the
          privacy practices of those sites and encourage you to review their privacy policies.
        </p>

        <h2>Your Rights (GDPR)</h2>
        <p>
          If you are located in the European Economic Area (EEA), you have rights regarding your
          personal data, including the right to access, correct, or delete your data. To exercise
          these rights, contact us via the <a href="/contact">Contact</a> page.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated date.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, please use our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
