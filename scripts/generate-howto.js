#!/usr/bin/env node
/**
 * How-To Article Generator — AI Content Pipeline
 * Generates comprehensive how-to/informational articles about plant care.
 *
 * Usage:
 *   node scripts/generate-howto.js                          → generates next pending topic
 *   node scripts/generate-howto.js how-to-water-houseplants → generates a specific topic
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
  envFile.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Ensure articles directory exists
if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

// --- How-To Topics ---

const HOWTO_TOPICS = [
  {
    slug: 'how-to-water-houseplants',
    title: 'How to Water Houseplants: The Complete Guide',
  },
  {
    slug: 'why-are-my-plant-leaves-turning-yellow',
    title: 'Why Are Plant Leaves Turning Yellow? (9 Causes + Fixes)',
  },
  {
    slug: 'how-to-repot-a-houseplant',
    title: 'How to Repot a Houseplant Step by Step',
  },
  {
    slug: 'how-to-increase-humidity-for-plants',
    title: 'How to Increase Humidity for Indoor Plants',
  },
  {
    slug: 'how-to-propagate-houseplants',
    title: 'How to Propagate Houseplants: 5 Easy Methods',
  },
  {
    slug: 'how-to-fertilize-houseplants',
    title: 'How and When to Fertilize Houseplants',
  },
  {
    slug: 'common-houseplant-pests',
    title: 'Common Houseplant Pests: How to Identify and Treat Them',
  },
  {
    slug: 'how-to-save-a-dying-plant',
    title: 'How to Save a Dying Plant (Step-by-Step Revival Guide)',
  },
  {
    slug: 'best-pots-for-houseplants',
    title: 'Best Pots for Houseplants: Terracotta vs Plastic vs Ceramic',
  },
  {
    slug: 'how-to-clean-plant-leaves',
    title: 'How to Clean Houseplant Leaves (And Why It Matters)',
  },
  {
    slug: 'overwatering-vs-underwatering',
    title: 'Overwatering vs Underwatering: How to Tell the Difference',
  },
  {
    slug: 'best-soil-for-houseplants',
    title: 'Best Potting Soil for Houseplants: A Complete Guide',
  },
  {
    slug: 'how-to-treat-root-rot',
    title: 'How to Treat Root Rot and Save Your Plant',
  },
  {
    slug: 'natural-fertilizers-for-plants',
    title: 'Natural Fertilizers for Houseplants: DIY and Store-Bought',
  },
  {
    slug: 'how-to-debug-houseplant-problems',
    title: 'Houseplant Troubleshooting: Fix Any Plant Problem Fast',
  },
  {
    slug: 'when-to-repot-houseplants',
    title: 'When Should You Repot a Houseplant? (5 Clear Signs)',
  },
  {
    slug: 'how-to-prune-houseplants',
    title: 'How to Prune Houseplants for Fuller, Healthier Growth',
  },
  {
    slug: 'tap-water-vs-filtered-water-plants',
    title: "Tap Water vs Filtered Water for Plants: What's Best?",
  },
  {
    slug: 'how-to-revive-overwatered-plant',
    title: 'How to Revive an Overwatered Plant (Quick Fix Guide)',
  },
  {
    slug: 'indoor-plant-light-guide',
    title: 'Indoor Plant Light Guide: What Every Grower Needs to Know',
  },
];

// --- Helpers ---

function getExistingArticleSlugs() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

function getNextTopic() {
  const existingSlugs = getExistingArticleSlugs();
  return HOWTO_TOPICS.find((t) => !existingSlugs.includes(t.slug)) || null;
}

function getTopicBySlug(slug) {
  return HOWTO_TOPICS.find((t) => t.slug === slug) || null;
}

// --- Prompt ---

function buildHowToPrompt(topic) {
  const today = new Date().toISOString().split('T')[0];

  return `You write for PlantCare Central, a houseplant reference built by enthusiasts who believe plant care advice should use exact numbers, not vague directions.
Write a comprehensive, authoritative how-to article on the topic: "${topic.title}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE STRUCTURE (follow this exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. INTRODUCTION (2-3 paragraphs): Open with the reader's pain point. Hook them immediately. Make them feel understood, then promise a clear solution.
2. MAIN BODY: Use H2 headings for major sections and H3 for sub-steps. Include:
   - Step-by-step instructions where relevant (numbered lists inside H2/H3 sections)
   - At least one "Pro Tip" callout per major H2 section, formatted as: **Pro Tip:** [tip text]
   - At least one "Common Mistake" callout per major H2 section, formatted as: **Common Mistake:** [mistake text]
   - Practical, specific advice — no vague platitudes
3. FAQ SECTION: End with an H2 "Frequently Asked Questions" section containing exactly 5 Q&A pairs formatted as:
   ### Question here?
   Answer here (2-4 sentences, direct and helpful).
4. EXPERT VERDICT: A short closing paragraph (3-5 sentences) with your expert summary and most important takeaway.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Return ONLY valid Markdown.
- You MUST start the response with YAML frontmatter exactly like this:

---
title: "${topic.title}"
slug: ${topic.slug}
type: "howto"
category: "care-guides"
tags:
  - houseplants
  - plant care
  - indoor gardening
description: "[Write a compelling 150-160 character meta description for this article]"
datePublished: ${today}
dateModified: ${today}
---

- Do NOT write any conversational text before the opening "---".
- Do NOT wrap the entire response in markdown code fences (\`\`\`).
- Word count: 1500–2000 words (body content, not counting frontmatter).
- Tone: authoritative, practical, first-person expert — as if you are personally advising a fellow plant lover.
- Use "I" and "we" naturally; avoid passive voice wherever possible.
- Do NOT use filler phrases like "In this article, we will..." or "As we can see...".
`;
}

// --- API Call ---

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error(
      'GROQ_API_KEY is not set. Add it to .env.local or as an environment variable.'
    );
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

// --- Validation ---

function validateHowToContent(content) {
  let cleanContent = content.trim();

  // Strip any garbage before the first YAML frontmatter block
  const firstDash = cleanContent.indexOf('---');
  if (firstDash !== -1) {
    cleanContent = cleanContent.substring(firstDash).trim();
  } else {
    console.log('[howto] DEBUG: NO FRONTMATTER FOUND. Raw AI response:\n', content);
    throw new Error('No frontmatter found in AI response.');
  }

  // Strip code block wrappers if AI wrapped the whole thing
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '').trim();
  }

  if (cleanContent.length < 1500) {
    throw new Error(`Content too short (${cleanContent.length} chars). Expected at least 1500.`);
  }

  let data;
  try {
    const parsed = matter(cleanContent);
    data = parsed.data;
  } catch (e) {
    console.log('[howto] DEBUG: Raw AI response below:\n', cleanContent);
    throw new Error(`Invalid YAML frontmatter: ${e.message}`);
  }

  const required = ['title', 'slug', 'type', 'description'];
  for (const field of required) {
    if (!data[field]) {
      console.log('[howto] DEBUG: Raw AI response below:\n', cleanContent);
      throw new Error(`Missing or empty frontmatter field: "${field}"`);
    }
  }

  return cleanContent;
}

// --- Save ---

function saveArticle(slug, content) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, content.trim() + '\n');
  return filePath;
}

// --- IndexNow ---

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
      console.log(`[indexnow] Submitted: ${url}`);
    } else {
      console.warn(`[indexnow] Status ${res.status} for ${url}`);
    }
  } catch (err) {
    console.warn(`[indexnow] Failed: ${err.message}`);
  }
}

// --- Main ---

async function main() {
  const specificSlug = process.argv[2];

  let topic;

  if (specificSlug) {
    topic = getTopicBySlug(specificSlug);
    if (!topic) {
      console.log(`[howto] Unknown topic slug: "${specificSlug}". Available topics:`);
      HOWTO_TOPICS.forEach((t) => console.log(`  - ${t.slug}`));
      process.exit(1);
    }
    console.log(`[howto] Generating specific topic: ${topic.title}`);
  } else {
    topic = getNextTopic();
    if (!topic) {
      console.log('[howto] All how-to topics already generated! Add new topics to HOWTO_TOPICS array.');
      process.exit(0);
    }
    console.log(`[howto] Next pending topic: ${topic.title}`);
  }

  const outputPath = path.join(ARTICLES_DIR, `${topic.slug}.md`);
  if (fs.existsSync(outputPath)) {
    console.log(`[howto] Already exists: ${topic.slug}.md — skipping`);
    process.exit(0);
  }

  console.log(`[howto] Calling Groq API (model: ${MODEL})...`);
  const prompt = buildHowToPrompt(topic);
  const rawContent = await callGroq(prompt);

  const cleanContent = validateHowToContent(rawContent);

  const filePath = saveArticle(topic.slug, cleanContent);
  console.log(`[howto] Saved: ${filePath}`);

  // Attempt to fetch a hero image for the article
  try {
    const { execSync } = require('child_process');
    execSync(`node scripts/fetch-article-images.js "${topic.slug}"`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err) {
    console.warn('[howto] Image fetch failed (non-fatal) — article saved without image');
  }

  // Ping IndexNow
  await pingIndexNow(topic.slug);
}

main().catch((err) => {
  console.error('[howto] ERROR:', err.message);
  process.exit(1);
});
