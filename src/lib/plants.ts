import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import readingTime from 'reading-time';
import { Plant, PlantCardData, PlantFrontmatter } from '@/types/plant';
import {
  DIFFICULTY_LABELS,
  HUMIDITY_LABELS,
  LIGHT_LABELS,
  TOXICITY_LABELS,
  WATER_LABELS,
} from '@/lib/utils';

const PLANTS_DIR = path.join(process.cwd(), 'content', 'plants');

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDerivedSearchTerms(fm: PlantFrontmatter): string[] {
  const terms = new Set<string>();
  const add = (...values: string[]) => {
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

  fm.tags.forEach((tag) => add(tag));

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

export function getAllPlantSlugs(): string[] {
  if (!fs.existsSync(PLANTS_DIR)) return [];
  return fs
    .readdirSync(PLANTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPlants(): PlantCardData[] {
  const slugs = getAllPlantSlugs();
  return slugs
    .map((slug) => getPlantCard(slug))
    .filter((p): p is PlantCardData => p !== null)
    .sort((a, b) => a.commonName.localeCompare(b.commonName));
}

export function getPlantCard(slug: string): PlantCardData | null {
  const filePath = path.join(PLANTS_DIR, `${slug}.md`);
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
    tags: fm.tags,
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
  };
}

export async function getPlant(slug: string): Promise<Plant | null> {
  const filePath = path.join(PLANTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  const processed = await remark().use(remarkHtml).process(content);
  const stats = readingTime(content);
  return {
    ...(data as PlantFrontmatter),
    content: processed.toString(),
    readingTime: `${Math.ceil(stats.minutes)} min read`,
  };
}

export function getPlantsByCategory(category: string): PlantCardData[] {
  return getAllPlants().filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): { name: string; slug: string; count: number }[] {
  const plants = getAllPlants();
  const map = new Map<string, number>();
  plants.forEach((p) => {
    map.set(p.category, (map.get(p.category) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count,
  }));
}
