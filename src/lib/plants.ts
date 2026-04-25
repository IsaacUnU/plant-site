import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import readingTime from 'reading-time';
import { Plant, PlantCardData, PlantFrontmatter, SecondaryFunction } from '@/types/plant';
import { SECONDARY_FUNCTION_META } from '@/lib/secondaryFunctions';

import {
  DIFFICULTY_LABELS,
  HUMIDITY_LABELS,
  LIGHT_LABELS,
  TOXICITY_LABELS,
  WATER_LABELS,
} from '@/lib/utils';

const VALID_SECONDARY_FUNCTIONS = new Set<string>(Object.keys(SECONDARY_FUNCTION_META));

export type Lang = 'en' | 'es';

function getPlantsDir(lang: Lang = 'en'): string {
  if (lang === 'es') return path.join(process.cwd(), 'content', 'es', 'plants');
  return path.join(process.cwd(), 'content', 'plants');
}

function normalizeSearchValue(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDerivedSearchTerms(fm: PlantFrontmatter): string[] {
  const terms = new Set<string>();
  const add = (...values: (string | undefined | null)[]) => {
    values
      .map(normalizeSearchValue)
      .filter(Boolean)
      .forEach((value) => terms.add(value));
  };

  add(
    fm.commonName,
    fm.scientificName,
    fm.category,
    fm.slug,
    fm.description,
    fm.difficulty,
    DIFFICULTY_LABELS[fm.difficulty],
    fm.light,
    LIGHT_LABELS[fm.light],
    fm.water,
    WATER_LABELS[fm.water],
    fm.humidity,
    HUMIDITY_LABELS[fm.humidity],
    fm.toxicity,
    TOXICITY_LABELS[fm.toxicity],
    fm.growthRate,
    `${fm.growthRate} growing`,
    `${fm.growthRate} grower`
  );

  (fm.tags ?? []).forEach((tag) => add(tag));

  switch (fm.difficulty) {
    case 'easy':
      add('easy care', 'easy to care for', 'beginner', 'beginner friendly');
      break;
    case 'medium':
      add('moderate care', 'intermediate');
      break;
    case 'hard':
      add('expert', 'advanced', 'difficult');
      break;
  }

  switch (fm.light) {
    case 'low':
      add('low light', 'shade tolerant', 'shade');
      break;
    case 'indirect':
      add('medium light', 'indirect light');
      break;
    case 'indirect-bright':
      add('bright indirect', 'bright indirect light', 'bright light');
      break;
    case 'direct':
      add('direct sun', 'full sun', 'sunny');
      break;
  }

  switch (fm.toxicity) {
    case 'non-toxic':
      add('pet safe', 'safe for pets', 'non toxic');
      break;
    case 'mildly-toxic':
      add('mildly toxic');
      break;
    case 'toxic-to-pets':
      add('toxic to pets', 'not pet safe', 'unsafe for pets');
      break;
    case 'toxic':
      add('toxic');
      break;
  }

  return Array.from(terms);
}

export function getAllPlantSlugs(lang: Lang = 'en'): string[] {
  const dir = getPlantsDir(lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPlants(lang: Lang = 'en'): PlantCardData[] {
  const slugs = getAllPlantSlugs(lang);
  return slugs
    .map((slug) => {
      try {
        return getPlantCard(slug, lang);
      } catch (err) {
        console.warn(`[plants] Skipping ${slug}.md — parse error:`, err);
        return null;
      }
    })
    .filter((p): p is PlantCardData => p !== null)
    .sort((a, b) => (a.commonName ?? '').localeCompare(b.commonName ?? ''));
}

export function getPlantCard(slug: string, lang: Lang = 'en'): PlantCardData | null {
  const filePath = path.join(getPlantsDir(lang), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, 'utf8'));
  const fm = data as PlantFrontmatter;
  const searchTerms = getDerivedSearchTerms(fm);

  return {
    title: fm.title,
    slug: fm.slug || slug,
    commonName: fm.commonName,
    scientificName: fm.scientificName,
    category: fm.category,
    tags: fm.tags ?? [],
    difficulty: fm.difficulty,
    light: fm.light,
    water: fm.water,
    humidity: fm.humidity,
    toxicity: fm.toxicity,
    growthRate: fm.growthRate,
    description: fm.description,
    searchTerms,
    searchText: searchTerms.join(' '),
    image: fm.image,
    imageAlt: fm.imageAlt,
    imageCredit: fm.imageCredit,
    imageCreditUrl: fm.imageCreditUrl,
    secondaryFunctions: (fm.secondaryFunctions ?? []).filter(
      (fn): fn is SecondaryFunction => VALID_SECONDARY_FUNCTIONS.has(fn)
    ),
  };
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

export async function getPlant(slug: string, lang: Lang = 'en'): Promise<Plant | null> {
  const filePath = path.join(getPlantsDir(lang), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const processed = await remark().use(remarkHtml).process(content);
    const stats = readingTime(content);
    const faqs = extractFaqs(content);
    return {
      ...(data as PlantFrontmatter),
      content: processed.toString(),
      readingTime: `${Math.ceil(stats.minutes)} min ${lang === 'es' ? 'de lectura' : 'read'}`,
      faqs: faqs.length > 0 ? faqs : undefined,
    };
  } catch (err) {
    console.warn(`[plants] Skipping ${slug}.md — parse error:`, err);
    return null;
  }
}

export function getPlantsByCategory(category: string | undefined, lang: Lang = 'en'): PlantCardData[] {
  if (!category) return [];
  return getAllPlants(lang).filter(
    (p) => p.category?.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): { name: string; slug: string; count: number }[] {
  const plants = getAllPlants();
  const map = new Map<string, number>();
  plants.forEach((p) => {
    if (!p.category) return;
    map.set(p.category, (map.get(p.category) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count,
  }));
}

export function getPlantsBySecondaryFunction(slug: SecondaryFunction | string, lang: Lang = 'en'): PlantCardData[] {
  return getAllPlants(lang).filter((p) =>
    (p.secondaryFunctions ?? []).includes(slug as SecondaryFunction)
  );
}

export function getAllSecondaryFunctions(): { slug: SecondaryFunction; name: string; nameEs?: string; emoji: string; description: string; descriptionEs?: string; count: number }[] {
  const plants = getAllPlants();
  return (Object.keys(SECONDARY_FUNCTION_META) as SecondaryFunction[]).map((slug) => {
    const count = plants.filter((p) =>
      (p.secondaryFunctions ?? []).includes(slug)
    ).length;
    const meta = SECONDARY_FUNCTION_META[slug];
    return { slug, name: meta.name, nameEs: meta.nameEs, emoji: meta.emoji, description: meta.description, descriptionEs: meta.descriptionEs, count };
  });
}

export function autoLinkPlantNames(htmlContent: string, currentSlug: string, lang: Lang = 'en'): string {
  // 1. Get all plant names and slugs
  const plants = getAllPlants(lang);

  // Sort by name length descending so 'Snake Plant' matches before 'Snake'
  const sortedPlants = [...plants].sort((a, b) => b.commonName.length - a.commonName.length);

  let linkedHtml = htmlContent;
  const linkBase = lang === 'es' ? '/es/plants' : '/plants';

  for (const plant of sortedPlants) {
    if (plant.slug === currentSlug) continue; // Don't link to self

    const escapedName = plant.commonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const makeLink = (name: string) =>
      `<a href="${linkBase}/${plant.slug}" class="text-[#15803D] font-semibold hover:underline">${name}</a>`;

    // Pass 2: link first occurrence per H2 section in body text.
    // Each H2 is a distinct subtopic, so the first mention per section is natural
    // and consistent — avoids the intro-paragraph "used up" problem.
    const bodyRegex = new RegExp(`(?<!href="[^"]*|>)(\\b${escapedName}\\b)(?![^<]*?<\\/a>)`, 'gi');
    const sections = linkedHtml.split(/(?=<h2[\s>])/i);
    linkedHtml = sections.map(section => {
      let sectionFound = false;
      return section.replace(bodyRegex, (match) => {
        if (sectionFound) return match;
        sectionFound = true;
        return makeLink(match);
      });
    }).join('');
  }

  return linkedHtml;
}
