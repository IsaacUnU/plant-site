import type { Metadata } from 'next';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Guide';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about ${SITE_NAME} — our mission to make plant care accessible to everyone.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About PlantCare Guide</h1>

      <div className="prose max-w-none">
        <p>
          Welcome to <strong>PlantCare Guide</strong> — your trusted source for houseplant care
          information. We believe that anyone can become a confident plant parent with the right
          knowledge and guidance.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our goal is simple: provide clear, accurate, and actionable plant care guides for every
          common houseplant. Whether you&apos;re a first-time plant owner wondering why your
          pothos is drooping, or an experienced collector looking after a rare aroid, we&apos;ve got you covered.
        </p>

        <h2>What We Cover</h2>
        <ul>
          <li>Watering schedules and techniques</li>
          <li>Light requirements for every plant type</li>
          <li>Soil, fertilizer, and repotting guides</li>
          <li>Common problems and how to fix them</li>
          <li>Pet safety and toxicity information</li>
          <li>Propagation methods</li>
        </ul>

        <h2>Our Approach</h2>
        <p>
          Every guide on this site is carefully researched and reviewed. We combine horticultural
          expertise with practical, real-world advice that works for home growers — not just greenhouse
          professionals.
        </p>

        <h2>Contact Us</h2>
        <p>
          Have a question or suggestion? We&apos;d love to hear from you.{' '}
          <a href="/contact">Get in touch here</a>.
        </p>
      </div>
    </div>
  );
}
