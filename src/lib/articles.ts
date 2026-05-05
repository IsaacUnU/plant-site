import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import readingTime from 'reading-time';
import { Article, ArticleCardData, ArticleFrontmatter } from '@/types/article';

import type { Lang } from '@/lib/plants';

function getArticlesDir(lang: Lang = 'en'): string {
  if (lang === 'es') return path.join(process.cwd(), 'content', 'es', 'articles');
  return path.join(process.cwd(), 'content', 'articles');
}

function extractFaqs(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const faqSectionMatch = content.match(/## Frequently Asked Questions([\s\S]*?)(?=##|$)/i);
  if (faqSectionMatch) {
    const faqBody = faqSectionMatch[1];
    const qaRegex = /\*\*(.*?)\*\*[\s\r\n]*([\s\S]*?)(?=\*\*|$)/g;
    let match;
    while ((match = qaRegex.exec(faqBody)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  }
  return faqs;
}

export function getAllArticleSlugs(lang: Lang = 'en'): string[] {
  const dir = getArticlesDir(lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllArticles(lang: Lang = 'en'): ArticleCardData[] {
  const slugs = getAllArticleSlugs(lang);
  return slugs
    .map((slug) => {
      try {
        return getArticleCard(slug, lang);
      } catch (err) {
        console.warn(`[articles] Skipping ${slug}.md — parse error:`, err);
        return null;
      }
    })
    .filter((a): a is ArticleCardData => a !== null)
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
}

export function getArticleCard(slug: string, lang: Lang = 'en'): ArticleCardData | null {
  const filePath = path.join(getArticlesDir(lang), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, 'utf8'));
  const fm = data as ArticleFrontmatter;

  return {
    title: fm.title,
    slug: fm.slug || slug,
    type: fm.type || 'listicle',
    category: fm.category || 'guides',
    tags: fm.tags ?? [],
    description: fm.description,
    featuredPlants: fm.featuredPlants,
    datePublished: fm.datePublished,
    dateModified: fm.dateModified,
    image: fm.image,
    imageAlt: fm.imageAlt,
  };
}

export async function getArticle(slug: string, lang: Lang = 'en'): Promise<Article | null> {
  const filePath = path.join(getArticlesDir(lang), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
    const stats = readingTime(content);
    const faqs = extractFaqs(content);
    return {
      ...(data as ArticleFrontmatter),
      content: processed.toString(),
      readingTime: `${Math.ceil(stats.minutes)} min read`,
      faqs: faqs.length > 0 ? faqs : undefined,
    };
  } catch (err) {
    console.warn(`[articles] Skipping ${slug}.md — parse error:`, err);
    return null;
  }
}
