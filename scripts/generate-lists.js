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
  const maxPlants = Math.min(matchingPlants.length, 10);
  const plantList = matchingPlants
    .slice(0, maxPlants)
    .map((p) => `- ${p.commonName} (${p.scientificName}) [SLUG: ${p.slug}] — ${p.difficulty} care, ${p.light} light, ${p.water} watering`)
    .join('\n');

  return `You are a certified horticulturist writing for PlantCare Central, a trusted online resource for indoor gardening.

Write a comprehensive listicle article: "Top ${maxPlants} ${topic.title}"

Here are the plants to feature (use ALL of them):
${plantList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write in English
- 1200–2000 words
- Authoritative yet approachable tone
- Use the EXACT slug provided in [SLUG: slug-name] for the internal links.
- For each plant, include a link in this exact format: [Read our full ${'{plantCommonName}'} care guide](/plants/${'{slug-name}'})
- Do NOT include placeholder text or [brackets] except the links above
- Do NOT use markdown code blocks in your response

Return ONLY valid Markdown with YAML frontmatter:

---
title: "Top ${maxPlants} ${topic.title} for Your Home"
slug: ${topic.slug}
type: listicle
category: guides
tags:
  - houseplants
  - indoor gardening
  - plant care
  - ${topic.description.split(' ').slice(0, 3).join(' ')}
description: "Discover the ${maxPlants} ${topic.description}. Expert picks with care tips, pros, cons, and links to full guides."
featuredPlants:
${matchingPlants.slice(0, maxPlants).map((p) => `  - ${p.slug}`).join('\n')}
datePublished: ${today}
dateModified: ${today}
---

## Introduction

Write 2–3 engaging paragraphs about why someone would want ${topic.description}. Address the reader's pain point (e.g. "Your apartment doesn't get much sunlight? These plants don't care."). Include a quick summary of what they'll find in the article.

Then for each plant, write a section using this structure:

## {number}. {Plant Common Name} ({Scientific Name})

A 2–3 paragraph expert review covering:
- Why this plant made the list
- Key care requirements (light, water, humidity) with specific numbers
- A pro tip or lesser-known fact
- Who this plant is best for

**Quick Stats:**
- **Light:** {specific light need}
- **Water:** {specific frequency}
- **Difficulty:** {easy/medium/hard}
- **Pet Safe:** {Yes/No}

[Read our full {Plant Name} care guide](/plants/{plant-slug})

---

After all plants, add:

## How We Chose These Plants

A short paragraph explaining the selection criteria (e.g. availability, ease of care, proven performance indoors).

## Frequently Asked Questions

Write 3 Q&A pairs using **bold** for questions. Questions should match what people actually search for about ${topic.description}.
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
  if (content.length < 1500) {
    throw new Error(`Content too short (${content.length} chars).`);
  }

  let fm;
  try {
    fm = matter(content).data;
  } catch (e) {
    console.log('[listicle] DEBUG: Raw AI Response below:\n', content);
    throw new Error(`Invalid YAML frontmatter: ${e.message}`);
  }

  const required = ['title', 'slug', 'type', 'description'];
  for (const field of required) {
    if (!fm[field]) {
      console.log('[listicle] DEBUG: Raw AI Response below:\n', content);
      throw new Error(`Missing or empty frontmatter field: "${field}"`);
    }
  }

  return true;
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
  const content = await callGroq(prompt);

  validateListContent(content);

  const filePath = saveArticle(topic.slug, content);
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
