#!/usr/bin/env node
/**
 * Plant Care Guide — AI Content Pipeline
 * Generates one plant care article per run using Groq API.
 *
 * Usage:
 *   node scripts/pipeline.js              → generates next plant from queue
 *   node scripts/pipeline.js "ZZ Plant"   → generates specific plant
 *
 * Env vars required:
 *   GROQ_API_KEY — from console.groq.com (free)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const QUEUE_FILE = path.join(__dirname, 'plants-queue.json');
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'plants');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// --- Helpers ---

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function loadQueue() {
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function buildPrompt(plantName) {
  const today = new Date().toISOString().split('T')[0];
  return `You write for PlantCare Central, a houseplant reference built by enthusiasts who believe plant care advice should use exact numbers, not vague directions.

Write a comprehensive, authoritative plant care guide for: **${plantName}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DECIDE secondaryFunctions FIRST (do this before writing anything else)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST assign at least one value to secondaryFunctions. There are exactly 6 allowed values:

  "air-purifying"     → virtually ALL houseplants qualify; include this unless the plant is known NOT to filter air
  "humidity-boosting" → ferns, tropical broad-leaf plants, peace lily, boston fern, monstera-type plants
  "insect-repelling"  → lavender, citronella, basil, snake plant, lemongrass, rosemary, marigold, aloe, ivy
  "pleasant-scent"    → jasmine, gardenia, lavender, scented geranium, peace lily, citrus plants
  "medicinal"         → aloe vera, calendula, chamomile, lavender, echinacea, holy basil, tea tree
  "pet-safe"          → ONLY if this plant's toxicity is non-toxic (ASPCA safe). Never combine with mildly-toxic/toxic.

Pick every value that honestly applies. MINIMUM: always include "air-purifying".
The field format is: secondaryFunctions: ["value1", "value2"]
NEVER write: secondaryFunctions: undefined
NEVER write: secondaryFunctions: []
NEVER omit this field.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — WRITE THE ARTICLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Write in English
- 1400–1800 words of content (longer = better for SEO and AI citations)
- Authoritative yet approachable tone — like a knowledgeable friend who happens to be a botanist
- Include at least 3 specific data points such as exact temperature ranges (e.g. "65–80°F / 18–27°C"), foot-candle measurements (e.g. "200–400 foot-candles"), soil mix ratios (e.g. "2 parts peat, 1 part perlite"), or precise watering intervals (e.g. "every 7–10 days in summer, every 14 days in winter")
- Do NOT include placeholder text or [brackets]
- Do NOT use markdown code blocks in your response

Return ONLY valid Markdown with YAML frontmatter. Use EXACTLY this structure:

---
title: "${plantName} Complete Care Guide"
slug: ${slugify(plantName)}
commonName: "Most Common English Name Here"
scientificName: "Genus species here"
category: tropical
tags:
  - houseplant
  - easy care
  - low maintenance
  - indoor
secondaryFunctions: ["air-purifying"]
difficulty: easy
light: indirect
water: weekly
humidity: medium
temperature: "65-80°F (18-27°C)"
toxicity: non-toxic
growthRate: moderate
description: "Two engaging sentences about this plant and its main benefit or characteristic."
datePublished: ${today}
dateModified: ${today}
---

CRITICAL YAML RULES — your response will be rejected if you break these:
- title, commonName, scientificName, description, temperature MUST be wrapped in double quotes
- category: one word or hyphenated word (tropical, succulents, low-light, ferns, cacti, vines, palms…). No quotes.
- difficulty: exactly one of: easy, medium, hard
- light: exactly one of: low, indirect, indirect-bright, direct
- water: exactly one of: daily, every-2-3-days, weekly, every-2-weeks, monthly
- humidity: exactly one of: low, medium, high
- toxicity: exactly one of: non-toxic, mildly-toxic, toxic-to-pets, toxic
- growthRate: exactly one of: slow, moderate, fast
- tags: YAML block list with "  - item" format. NOT inline ["a","b"]
- secondaryFunctions: inline array ["a","b"]. Only from the 6 values above. MINIMUM ["air-purifying"].

HEADING RULES (strictly required):
- Use descriptive H2 headings that tell the reader what they will learn (e.g. "## Why African Violets Struggle With Tap Water" not "## Watering")
- NEVER use ALL_CAPS headings
- NEVER use generic headings: INTRODUCTION, EXPERT VERDICT, CONCLUSION, OVERVIEW, SUMMARY
- Each H2 must be unique — no two H2s on the page should be identical
- H2 headings should read as mini-answers or questions (e.g. "## The Right Soil Mix Makes Root Rot Rare")

## Quick Care Summary

Write a concise summary paragraph (3–4 sentences) that directly and clearly answers: "How do I care for ${plantName}?" This summary must be self-contained — someone reading ONLY this paragraph should know the basics. Include: light preference, watering frequency, ideal temperature range, and difficulty level in plain language. This is the single most important paragraph for AI search engine citations.

## Overview
2–3 paragraphs covering origin, native habitat, appearance, and why it's popular as a houseplant. Include the scientific name naturally in the text.

## Pros and Cons

List 4 pros and 2–3 cons in this exact format:
**Pros:**
- Pro 1
- Pro 2
- Pro 3
- Pro 4

**Cons:**
- Con 1
- Con 2
- Con 3

## Light Requirements
Detailed light needs: best window direction, distance from window, signs of too much/too little light. Use specific measurements when possible (e.g. "200–400 foot-candles").

## Watering
Step-by-step watering method. Include: how to check soil moisture (finger test depth), watering frequency by season, signs of over- and under-watering, and water quality tips.

## Soil and Potting
Recommended soil mix recipe (e.g. "2 parts peat, 1 part perlite, 1 part orchid bark"). Pot type recommendation. Repotting frequency and signs that repotting is needed.

## Fertilizing
When and how to feed. Specific NPK ratios if relevant. Seasonal schedule.

## Humidity and Temperature
Ideal ranges with specific numbers. 3–4 actionable tips for achieving the right humidity indoors (e.g. pebble tray, grouping plants, humidifier).

## Common Problems
5–6 common issues. Use ### subheadings for each problem. For each: describe the symptom, the cause, and the fix in clear, actionable steps.

## Propagation
Step-by-step propagation guide using numbered steps (1. Cut a stem… 2. Remove lower leaves… etc.). Include best time of year to propagate and expected rooting timeline.

## Expert Verdict

Write 2–3 opinionated sentences as a plant care expert. Rate the plant on a scale from 1 to 5 for beginners. State who this plant is best for and who should avoid it. Example tone: "If you're a first-time plant parent looking for a forgiving plant, this is your best bet. I'd rate it a 4 out of 5 for beginners."

## Frequently Asked Questions

Write 5 Q&A pairs. Use **bold** for questions, answer on the next line. Questions should be phrased exactly as someone would type them into Google or ask an AI assistant. Examples of good question formats:
- **How often should I water my ${plantName}?**
- **Is ${plantName} toxic to cats and dogs?**
- **Why are the leaves on my ${plantName} turning yellow?**
- **Can ${plantName} grow in low light?**
- **How big does ${plantName} get indoors?**
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
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function validateContent(content) {
  if (content.length < 1000) {
    throw new Error(`Content too short (${content.length} chars). Likely an API error.`);
  }

  // Step 1: Parse with gray-matter — catches ALL YAML syntax errors (unquoted colons, etc.)
  let fm;
  try {
    fm = matter(content).data;
  } catch (e) {
    throw new Error(`Invalid YAML frontmatter: ${e.message}`);
  }

  // Step 2: Check required fields are present and non-empty
  const required = ['title', 'slug', 'commonName', 'scientificName', 'category', 'difficulty', 'light', 'water', 'humidity', 'toxicity', 'growthRate'];
  for (const field of required) {
    if (!fm[field]) throw new Error(`Missing or empty frontmatter field: "${field}"`);
  }

  // Step 3: tags must be an array with at least one item
  if (!Array.isArray(fm.tags) || fm.tags.length === 0) {
    throw new Error('Field "tags" must be a YAML list with at least one item');
  }

  // Step 3b: secondaryFunctions — sanitise and auto-fix rather than reject
  const validFunctions = ['humidity-boosting', 'air-purifying', 'insect-repelling', 'pleasant-scent', 'medicinal', 'pet-safe'];
  if (!Array.isArray(fm.secondaryFunctions) || fm.secondaryFunctions.length === 0) {
    console.warn('[pipeline] ⚠ "secondaryFunctions" missing/empty — will be auto-set to ["air-purifying"] before saving');
  } else {
    const invalid = fm.secondaryFunctions.filter((fn) => !validFunctions.includes(fn));
    if (invalid.length > 0) {
      console.warn(`[pipeline] ⚠ Unknown secondaryFunctions values (will be stripped): ${invalid.join(', ')}`);
    }
  }

  // Step 4: Validate enum fields
  const valid = {
    difficulty: ['easy', 'medium', 'hard'],
    light: ['low', 'indirect', 'indirect-bright', 'direct'],
    water: ['daily', 'every-2-3-days', 'weekly', 'every-2-weeks', 'monthly'],
    humidity: ['low', 'medium', 'high'],
    toxicity: ['non-toxic', 'mildly-toxic', 'toxic-to-pets', 'toxic'],
    growthRate: ['slow', 'moderate', 'fast'],
  };
  for (const [field, allowed] of Object.entries(valid)) {
    if (!allowed.includes(fm[field])) {
      throw new Error(`Invalid value for "${field}": "${fm[field]}". Must be one of: ${allowed.join(', ')}`);
    }
  }

  return true;
}

const VALID_FUNCTIONS = ['humidity-boosting', 'air-purifying', 'insect-repelling', 'pleasant-scent', 'medicinal', 'pet-safe'];

/**
 * Ensures secondaryFunctions in the raw markdown content is valid.
 * - Strips unknown values
 * - Falls back to ["air-purifying"] if nothing valid remains or field is missing
 */
function sanitizeSecondaryFunctions(content) {
  const { data: fm, content: body } = matter(content);

  let fns = Array.isArray(fm.secondaryFunctions) ? fm.secondaryFunctions : [];
  fns = fns.filter((fn) => VALID_FUNCTIONS.includes(fn));
  if (fns.length === 0) fns = ['air-purifying'];

  fm.secondaryFunctions = fns;
  return matter.stringify(body, fm);
}

function saveArticle(plantName, content) {
  const slug = slugify(plantName);
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const sanitized = sanitizeSecondaryFunctions(content);
  fs.writeFileSync(filePath, sanitized.trim() + '\n');
  return filePath;
}

// --- Main ---

async function main() {
  const specificPlant = process.argv[2];
  const queue = loadQueue();

  let plantName;

  if (specificPlant) {
    plantName = specificPlant;
    console.log(`[pipeline] Generating specific plant: ${plantName}`);
  } else {
    if (queue.pending.length === 0) {
      console.log('[pipeline] Queue is empty. Add more plants to plants-queue.json');
      process.exit(0);
    }
    plantName = queue.pending[0];
    console.log(`[pipeline] Next in queue: ${plantName} (${queue.pending.length} remaining)`);
  }

  const slug = slugify(plantName);
  const outputPath = path.join(CONTENT_DIR, `${slug}.md`);

  if (fs.existsSync(outputPath)) {
    console.log(`[pipeline] Already exists: ${slug}.md — skipping`);
    if (!specificPlant) {
      queue.pending = queue.pending.filter((p) => p !== plantName);
      if (!queue.completed.includes(plantName)) queue.completed.push(plantName);
      saveQueue(queue);
    }
    process.exit(0);
  }

  console.log(`[pipeline] Calling Groq API for: ${plantName}...`);
  const prompt = buildPrompt(plantName);
  const content = await callGroq(prompt);

  validateContent(content);

  const filePath = saveArticle(plantName, content);
  console.log(`[pipeline] ✓ Saved: ${filePath}`);

  // Fetch image for the new article
  try {
    const { execSync } = require('child_process');
    execSync(`node scripts/fetch-images.js "${slug}"`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn('[pipeline] ⚠ Image fetch failed (non-fatal) — article saved without image');
  }

  if (!specificPlant) {
    queue.pending = queue.pending.filter((p) => p !== plantName);
    if (!queue.completed.includes(plantName)) queue.completed.push(plantName);
    saveQueue(queue);
    console.log(`[pipeline] Queue updated: ${queue.pending.length} plants remaining`);
  }

  // Ping IndexNow so Bing/Yandex index the new page fast
  await pingIndexNow(slug);
}

async function pingIndexNow(slug) {
  const key = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!key || !siteUrl || siteUrl.includes('yoursite')) {
    console.log('[indexnow] Skipped — INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL not configured');
    return;
  }
  const url = `${siteUrl}/plants/${slug}`;
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
  console.error('[pipeline] ERROR:', err.message);
  process.exit(1);
});
