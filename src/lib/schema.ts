import { Article } from '@/types/article';
import { Plant } from '@/types/plant';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'PlantCare Central';

export function articleSchema(plant: Plant) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: plant.title,
    description: plant.description,
    datePublished: plant.datePublished,
    dateModified: plant.dateModified || plant.datePublished,
    author: {
      '@type': 'Person',
      name: 'Sarah Mitchell',
      jobTitle: 'Certified Plant Specialist',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(plant.image && {
      image: {
        '@type': 'ImageObject',
        url: `${SITE_URL}${plant.image}`,
        description: plant.imageAlt ?? plant.commonName,
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/plants/${plant.slug}`,
    },
  };
}

export function articleContentSchema(article: Article, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: 'Sarah Mitchell',
      jobTitle: 'Certified Plant Specialist',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(article.image && {
      image: {
        '@type': 'ImageObject',
        url: article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`,
        description: article.imageAlt ?? article.title,
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${path}`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function howToSchema(plant: Plant) {
  const steps = [
    {
      name: 'Watering',
      text: `Water ${plant.commonName} ${(plant.water ?? '').replace(/-/g, ' ')}. Allow the top inch of soil to dry between waterings and use room-temperature water.`,
    },
    {
      name: 'Light',
      text: `Provide ${(plant.light ?? '').replace(/-/g, ' ')} for ${plant.commonName}. Avoid direct harsh sun unless the species is adapted to it.`,
    },
    {
      name: 'Humidity',
      text: `Maintain ${plant.humidity ?? 'moderate'} humidity. Group plants together or use a pebble tray with water to raise ambient humidity.`,
    },
    {
      name: 'Fertilizing',
      text: `Feed ${plant.commonName} with balanced liquid fertilizer every 2–4 weeks during spring and summer. Do not fertilize in winter.`,
    },
    {
      name: 'Repotting',
      text: `Repot ${plant.commonName} every 1–2 years or when roots emerge from drainage holes. Choose a pot 1–2 inches larger than the current one.`,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Care for ${plant.commonName} (${plant.scientificName})`,
    description: plant.description,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
