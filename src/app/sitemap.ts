import { MetadataRoute } from 'next';
import { getAllPlantSlugs, getAllCategories, getPlant, getAllSecondaryFunctions } from '@/lib/plants';
import { getAllArticles } from '@/lib/articles';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = getAllPlantSlugs();
  const esSlugs = getAllPlantSlugs('es');
  const categories = getAllCategories();
  const articles = getAllArticles();
  const esArticles = getAllArticles('es');
  const secondaryFunctions = getAllSecondaryFunctions();
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/plants`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/uses`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/es`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/es/plants`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/es/articles`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/es/uses`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${SITE_URL}/es/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/es/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const plantData = await Promise.all(slugs.map((slug) => getPlant(slug)));
  const plantPages: MetadataRoute.Sitemap = slugs.map((slug, i) => ({
    url: `${SITE_URL}/plants/${slug}`,
    lastModified: plantData[i]?.dateModified ?? now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const esPlantData = await Promise.all(esSlugs.map((slug) => getPlant(slug, 'es')));
  const esPlantPages: MetadataRoute.Sitemap = esSlugs.map((slug, i) => ({
    url: `${SITE_URL}/es/plants/${slug}`,
    lastModified: esPlantData[i]?.dateModified ?? now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const esCategoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/es/category/${cat.slug}`,
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

  const esArticlePages: MetadataRoute.Sitemap = esArticles.map((article) => ({
    url: `${SITE_URL}/es/articles/${article.slug}`,
    lastModified: article.dateModified ?? article.datePublished ?? now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const usesPages: MetadataRoute.Sitemap = secondaryFunctions.map((fn) => ({
    url: `${SITE_URL}/uses/${fn.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const esUsesPages: MetadataRoute.Sitemap = secondaryFunctions.map((fn) => ({
    url: `${SITE_URL}/es/uses/${fn.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...plantPages,
    ...esPlantPages,
    ...categoryPages,
    ...esCategoryPages,
    ...articlePages,
    ...esArticlePages,
    ...usesPages,
    ...esUsesPages,
  ];
}
