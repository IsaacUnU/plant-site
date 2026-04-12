import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import readingTime from 'reading-time';
import { Plant, PlantCardData, PlantFrontmatter } from '@/types/plant';

const PLANTS_DIR = path.join(process.cwd(), 'content', 'plants');

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
  return {
    title: fm.title,
    slug: fm.slug || slug,
    commonName: fm.commonName,
    scientificName: fm.scientificName,
    category: fm.category,
    difficulty: fm.difficulty,
    light: fm.light,
    water: fm.water,
    description: fm.description,
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
