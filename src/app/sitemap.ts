import { MetadataRoute } from 'next';
import { getAllPlantSlugs, getAllCategories, getPlant } from '@/lib/plants';
import { getAllArticles } from '@/lib/articles';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = getAllPlantSlugs();
  const categories = getAllCategories();
  const articles = getAllArticles();
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/plants`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const plantData = await Promise.all(slugs.map((slug) => getPlant(slug)));
  const plantPages: MetadataRoute.Sitemap = slugs.map((slug, i) => ({
    url: `${SITE_URL}/plants/${slug}`,
    lastModified: plantData[i]?.dateModified ?? now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.dateModified ?? article.datePublished ?? now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticPages, ...plantPages, ...categoryPages, ...articlePages];
}
