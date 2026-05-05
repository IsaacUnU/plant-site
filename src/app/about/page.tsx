import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';

export const metadata: Metadata = {
  title: 'About Us',
  alternates: buildAlternates('/about', {
    en: '/about',
    es: '/es/about',
  }),
  description: `${SITE_NAME} publishes precise, measurement-based plant care guides — exact watering volumes, real light readings, and specific schedules for every common houseplant.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About {SITE_NAME}</h1>

      <div className="prose max-w-none">
        <p>
          Most plant care advice tells you to &ldquo;water when the top inch of soil feels
          dry&rdquo; or &ldquo;place in bright, indirect light.&rdquo; That kind of guidance
          sounds reasonable until your Fiddle-Leaf Fig drops every leaf and you realise
          you had no idea what &ldquo;bright indirect&rdquo; actually means in foot-candles.
        </p>

        <p>
          <strong>{SITE_NAME}</strong> was built to fix that. Every guide we publish replaces
          vague instructions with exact measurements: specific watering volumes by pot size,
          light levels expressed in lux and foot-candles, fertiliser dilution ratios, and
          seasonal schedules tied to the calendar — not feelings.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe plant care fails not because people are inattentive, but because the
          information they start with is too imprecise to act on. Our mission is to publish
          the most specific, research-grounded houseplant guides available — guides that give
          you a number to aim for, a schedule to follow, and a clear diagnosis when something
          goes wrong.
        </p>
        <p>
          Whether you are keeping a Monstera alive in a north-facing apartment or fine-tuning
          the humidity for a Calathea collection, our goal is the same: give you the exact
          information you need, nothing less and nothing superfluous.
        </p>

        <h2>Our Editorial Standards</h2>
        <p>
          Every guide on {SITE_NAME} is structured around five core requirements before
          it is published:
        </p>
        <ol>
          <li>
            <strong>Specific measurements over generalisms.</strong> Watering advice includes
            volume per pot size and frequency by season. Light advice includes both lux ranges
            and practical equivalents (e.g. &ldquo;2 feet from an east-facing window&rdquo;).
          </li>
          <li>
            <strong>Sourced from horticultural literature.</strong> Care parameters are
            cross-referenced against university extension publications, botanical garden
            databases, and peer-reviewed horticultural research where available.
          </li>
          <li>
            <strong>Verified against common failure modes.</strong> Each guide includes a
            troubleshooting section built from the most frequently reported problems for that
            species — not a generic list of houseplant issues copy-pasted across every page.
          </li>
          <li>
            <strong>Pet and child safety disclosed prominently.</strong> Toxicity information
            is sourced from ASPCA and peer-reviewed veterinary literature and is displayed at
            the top of every plant guide, not buried at the bottom.
          </li>
          <li>
            <strong>Seasonal context included.</strong> Plants behave differently in winter
            than in summer. Guides note when to reduce watering, when to hold off on
            fertiliser, and when to expect a growth pause.
          </li>
        </ol>

        <h2>What We Cover</h2>
        <p>
          {SITE_NAME} publishes two types of content: individual plant care guides and
          topic-based articles.
        </p>
        <p>
          Plant care guides cover more than 50 of the most popular houseplants — from
          easy-care species like Snake Plants and Pothos to more demanding aroids like
          Calatheas and Anthuriums. Each guide covers watering, light, humidity,
          temperature, soil mix, fertilising schedule, repotting triggers, propagation
          methods, common pests, and toxicity.
        </p>
        <p>
          Topic articles go deeper on universal skills: how to read light conditions without
          a meter, when overwatering and underwatering produce the same visible symptoms and
          how to tell them apart, how to build a soil mix that drains correctly for your
          climate, and how to treat root rot before it kills the plant. These are not
          overview articles — they are practical references designed to solve a specific
          problem.
        </p>

        <h2>Meet Our Plant Expert</h2>
        <div className="flex items-start gap-5 bg-[#F0FDF4] border border-[#E2EFE7] rounded-2xl p-6 mt-4 not-prose">
          <div
            className="shrink-0 w-16 h-16 bg-[#15803D] text-white rounded-full flex items-center justify-center text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
            aria-hidden="true"
          >
            SM
          </div>
          <div>
            <h3
              className="text-lg font-semibold text-[#0F172A] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Sarah Mitchell
            </h3>
            <p className="text-sm text-[#64748b] italic mb-3">
              Certified Horticulturist &middot; RHS Level 3 &middot; 12 years growing indoor plants
            </p>
            <p className="text-sm text-[#475569] leading-relaxed mb-3">
              Sarah has spent twelve years growing and documenting tropical indoor plants from her home in the north of England, where low light and fluctuating temperatures make the hobby genuinely demanding. She holds an RHS Level 3 qualification in horticulture and specialises in aroids, humidity-loving species, and low-light-tolerant plants. Her approach is practical: every recommendation she makes is one she has tested in real growing conditions, not extrapolated from a greenhouse.
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">
              Each guide on {SITE_NAME} is reviewed by Sarah against current horticultural literature, including ASPCA toxicity data and findings from the NASA Clean Air Study. Care parameters are expressed as real measured ranges — foot-candles, millilitres per pot size, temperature in both Fahrenheit and Celsius — rather than estimates or generalisations.
            </p>
          </div>
        </div>

        <h2>Contact</h2>
        <p>
          Have a correction, a question about a specific plant, or a guide request?{' '}
          <a href="/contact">Get in touch here</a>.
        </p>
      </div>
    </div>
  );
}
