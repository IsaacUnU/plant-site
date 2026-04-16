#!/usr/bin/env node
/**
 * Listicle Generator — AI Content Pipeline
 * Generates curated "Top N" list articles from existing plant data.
 *
 * Usage:
 *   node scripts/generate-lists.js              → generates one list from the queue
 *   node scripts/generate-lists.js "air-purifying"  → generates a specific list topic
 *
 * Env vars required:
 *   GROQ_API_KEY — from console.groq.com (free)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
// Load .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    // Basic parser for .env.local
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'plants');
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Ensure articles directory exists
if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

// --- Helpers ---

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getAllPlants() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
      const { data } = matter(raw);
      return data;
    })
    .filter((p) => p.commonName && p.slug);
}

function getExistingArticleSlugs() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

// --- List Topic Generation ---

const LIST_TOPICS = [
  {
    slug: 'best-low-light-houseplants',
    title: 'Best Low-Light Houseplants',
    filter: (p) => p.light === 'low' || p.light === 'indirect',
    description: 'plants that thrive in low-light conditions',
  },
  {
    slug: 'best-air-purifying-plants',
    title: 'Best Air-Purifying Indoor Plants',
    filter: (p) => (p.secondaryFunctions || []).includes('air-purifying'),
    description: 'plants proven to clean and purify indoor air',
  },
  {
    slug: 'best-pet-safe-houseplants',
    title: 'Best Pet-Safe Houseplants',
    filter: (p) => p.toxicity === 'non-toxic',
    description: 'non-toxic houseplants safe for cats and dogs',
  },
  {
    slug: 'easiest-houseplants-for-beginners',
    title: 'Easiest Houseplants for Beginners',
    filter: (p) => p.difficulty === 'easy',
    description: 'beginner-friendly plants that are almost impossible to kill',
  },
  {
    slug: 'best-tropical-houseplants',
    title: 'Best Tropical Houseplants',
    filter: (p) => p.category === 'tropical',
    description: 'stunning tropical plants for indoor growing',
  },
  {
    slug: 'best-succulents-for-indoors',
    title: 'Best Succulents for Indoor Growing',
    filter: (p) => p.category === 'succulents' || p.category === 'cacti',
    description: 'drought-tolerant succulents and cacti perfect for sunny windowsills',
  },
  {
    slug: 'best-humidity-boosting-plants',
    title: 'Best Humidity-Boosting Houseplants',
    filter: (p) => (p.secondaryFunctions || []).includes('humidity-boosting'),
    description: 'plants that naturally increase indoor humidity',
  },
  {
    slug: 'best-fast-growing-houseplants',
    title: 'Best Fast-Growing Houseplants',
    filter: (p) => p.growthRate === 'fast',
    description: 'fast-growing indoor plants that fill your space quickly',
  },
  {
    slug: 'best-hanging-trailing-plants',
    title: 'Best Hanging and Trailing Plants',
    filter: (p) => p.category === 'vines' || (p.tags || []).some((t) => /trail|hang|vine/i.test(t)),
    description: 'trailing and cascading plants perfect for hanging baskets',
  },
  {
    slug: 'best-plants-for-bathrooms',
    title: 'Best Plants for Bathrooms',
    filter: (p) => p.humidity === 'high' || (p.secondaryFunctions || []).includes('humidity-boosting'),
    description: 'humidity-loving plants that thrive in bathroom conditions',
  },
];

function getNextTopic(plants) {
  const existingSlugs = getExistingArticleSlugs();
  for (const topic of LIST_TOPICS) {
    if (existingSlugs.includes(topic.slug)) continue;
    const matching = plants.filter(topic.filter);
    if (matching.length >= 3) {
      return { ...topic, plants: matching };
    }
  }
  return null;
}

function getTopicBySlug(slug, plants) {
  const topic = LIST_TOPICS.find((t) => t.slug === slug);
  if (!topic) return null;
  return { ...topic, plants: plants.filter(topic.filter) };
}

// --- Prompt ---

function buildListPrompt(topic, matchingPlants) {
  const today = new Date().toISOString().split('T')[0];
  
  // Dynamic plant count (5-10) for variety
  const targetCount = Math.floor(Math.random() * 6) + 5; // 5 to 10
  const maxPlants = Math.min(matchingPlants.length, targetCount);
  
  // Catchy title patterns
  const titlePatterns = [
    `Top ${maxPlants} ${topic.title} for Your Home`,
    `${maxPlants} Essential ${topic.title} You Need Right Now`,
    `Expert's Choice: The ${maxPlants} Best ${topic.title}`,
    `The ${maxPlants} ${topic.title} Every Plant Lover Should Own`,
    `${maxPlants} Stunning ${topic.title} to Transform Your Space`,
    `Mastering Indoor Greenery: ${maxPlants} Best ${topic.title}`
  ];
  const selectedTitle = titlePatterns[Math.floor(Math.random() * titlePatterns.length)];

  const plantList = matchingPlants
    .slice(0, maxPlants)
    .map((p) => `- ${p.commonName} (${p.scientificName}) [SLUG: ${p.slug}] — ${p.difficulty} care, ${p.light} light, ${p.water} watering`)
    .join('\n');

  return `You are a certified horticulturist writing for PlantCare Central.
Write a high-converting, click-worthy listicle article: "${selectedTitle}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. INTRODUCTION: 2-3 engaging paragraphs addressing the reader's pain points.
2. PLANT LIST: For each of the ${maxPlants} plants below, write a 2-3 paragraph review with "Catchy" H2 headings (e.g. "{Name}: The low-light superstar").
3. QUICK STATS: Include Light, Water, Difficulty, and Pet Safe stats for each.
4. LINKS: Include [Read our full {Plant Name} care guide](/plants/{plant-slug}) for each.
5. CLOSING: "How We Chose These Plants" and "Frequently Asked Questions" (3 Q&A pairs).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANTS TO FEATURE (Use ALL of them)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${plantList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Return ONLY valid Markdown.
- You MUST start the response with YAML frontmatter exactly like this:

---
title: "${selectedTitle}"
slug: ${topic.slug}
type: listicle
category: guides
tags:
  - houseplants
  - indoor gardening
  - ${topic.slug.split('-').slice(-1)[0]}
description: "Discover the ${maxPlants} ${topic.description}. Expert picks with care tips, pros, cons, and links to full guides."
featuredPlants:
${matchingPlants.slice(0, maxPlants).map((p) => `  - ${p.slug}`).join('\n')}
datePublished: ${today}
dateModified: ${today}
---

- Do NOT write any conversational text before the "---".
- Do NOT use markdown code blocks ( \`\`\` ) to wrap the entire response.
- Word count: 1200–2000 words.
- Tone: Authoritative yet EXTREMELY engaging.
`;
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not set. Add it to .env.local or as an environment variable.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function validateListContent(content) {
  // Clean up AI response (strip garbage before frontmatter)
  let cleanContent = content.trim();
  
  // Find the first occurrence of --- (YAML start)
  const firstDash = cleanContent.indexOf('---');
  if (firstDash !== -1) {
    cleanContent = cleanContent.substring(firstDash).trim();
  } else {
    console.log('[listicle] DEBUG: NO FRONTMATTER FOUND. Raw AI Response follows:\n', content);
    throw new Error('No frontmatter found in AI response.');
  }

  // Also strip code blocks if AI wrapped the whole thing
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '').trim();
  }

  if (cleanContent.length < 1500) {
    throw new Error(`Content too short (${cleanContent.length} chars).`);
  }

  let data;
  try {
    const parsed = matter(cleanContent);
    data = parsed.data;
  } catch (e) {
    console.log('[listicle] DEBUG: Raw AI Response below:\n', cleanContent);
    throw new Error(`Invalid YAML frontmatter: ${e.message}`);
  }

  const required = ['title', 'slug', 'type', 'description'];
  for (const field of required) {
    if (!data[field]) {
      console.log('[listicle] DEBUG: Raw AI Response below:\n', cleanContent);
      throw new Error(`Missing or empty frontmatter field: "${field}"`);
    }
  }

  return cleanContent;
}

function saveArticle(slug, content) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, content.trim() + '\n');
  return filePath;
}

// --- Main ---

async function main() {
  const specificTopic = process.argv[2];
  const plants = getAllPlants();

  if (plants.length < 3) {
    console.log('[listicle] Not enough plants yet. Need at least 3 to generate a list.');
    process.exit(0);
  }

  console.log(`[listicle] Found ${plants.length} plants in content/plants/`);

  let topic;

  if (specificTopic) {
    topic = getTopicBySlug(slugify(specificTopic), plants);
    if (!topic) {
      console.log(`[listicle] Unknown topic: "${specificTopic}". Available topics:`);
      LIST_TOPICS.forEach((t) => console.log(`  - ${t.slug}`));
      process.exit(1);
    }
    console.log(`[listicle] Generating specific list: ${topic.title}`);
  } else {
    topic = getNextTopic(plants);
    if (!topic) {
      console.log('[listicle] All list topics already generated! Add new topics to LIST_TOPICS array.');
      process.exit(0);
    }
    console.log(`[listicle] Next list topic: ${topic.title} (${topic.plants.length} matching plants)`);
  }

  const matchingPlants = topic.plants || plants.filter(topic.filter);

  if (matchingPlants.length < 3) {
    console.log(`[listicle] Only ${matchingPlants.length} plants match this topic. Need at least 3. Skipping.`);
    process.exit(0);
  }

  const outputPath = path.join(ARTICLES_DIR, `${topic.slug}.md`);
  if (fs.existsSync(outputPath)) {
    console.log(`[listicle] Already exists: ${topic.slug}.md — skipping`);
    process.exit(0);
  }

  console.log(`[listicle] Calling Groq API...`);
  const prompt = buildListPrompt(topic, matchingPlants);
  const rawContent = await callGroq(prompt);

  const cleanContent = validateListContent(rawContent);

  const filePath = saveArticle(topic.slug, cleanContent);
  console.log(`[listicle] ✓ Saved: ${filePath}`);

  // Fetch image for the new listicle
  try {
    const { execSync } = require('child_process');
    execSync(`node scripts/fetch-article-images.js "${topic.slug}"`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err) {
    console.warn('[listicle] ⚠ Image fetch failed (non-fatal) — article saved without image');
  }

  // Ping IndexNow
  await pingIndexNow(topic.slug);
}

async function pingIndexNow(slug) {
  const key = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!key || !siteUrl || siteUrl.includes('yoursite')) {
    console.log('[indexnow] Skipped — INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL not configured');
    return;
  }
  const url = `${siteUrl}/articles/${slug}`;
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: [url],
      }),
    });
    if (res.ok || res.status === 202) {
      console.log(`[indexnow] ✓ Submitted: ${url}`);
    } else {
      console.warn(`[indexnow] ⚠ Status ${res.status} for ${url}`);
    }
  } catch (err) {
    console.warn(`[indexnow] ⚠ Failed: ${err.message}`);
  }
}

main().catch((err) => {
  console.error('[listicle] ERROR:', err.message);
  process.exit(1);
});
