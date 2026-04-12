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
  return `You are an expert horticulturist writing a detailed, SEO-optimised houseplant care guide.

Write a complete plant care guide for: **${plantName}**

RULES:
- Write in English
- The guide must be genuinely helpful, accurate, and detailed (800–1200 words of content)
- Use a friendly, expert tone
- Include practical, actionable advice
- Do NOT include placeholder text or [brackets]
- Do NOT use markdown code blocks in your response

Return ONLY valid Markdown with YAML frontmatter. Use exactly this structure:

---
title: "[SEO title including plant name and 'care guide']"
slug: "${slugify(plantName)}"
commonName: "[most common English name]"
scientificName: "[full scientific name]"
category: "[one of: tropical, succulents, low-light, flowering, herbs, ferns, cacti, vines]"
tags: ["tag1", "tag2", "tag3", "tag4"]
difficulty: "[easy | medium | hard]"
light: "[low | indirect | indirect-bright | direct]"
water: "[daily | every-2-3-days | weekly | every-2-weeks | monthly]"
humidity: "[low | medium | high]"
temperature: "[e.g. 65–80°F (18–27°C)]"
toxicity: "[non-toxic | mildly-toxic | toxic-to-pets | toxic]"
growthRate: "[slow | moderate | fast]"
description: "[2 sentences, engaging, includes main benefit or characteristic]"
datePublished: "${today}"
dateModified: "${today}"
---

## Overview
[2–3 paragraphs covering origin, appearance, why it's popular]

## Light Requirements
[Detailed light needs with best spots and what to avoid]

## Watering
[Watering frequency, technique, and common mistakes]

## Soil and Potting
[Soil mix recommendation, repotting frequency]

## Fertilizing
[When and how to feed]

## Humidity and Temperature
[Ideal ranges and tips for achieving them]

## Common Problems
[4–5 common issues with causes and solutions, using ### headings]

## Propagation
[Step-by-step propagation method]

## Frequently Asked Questions
[3 Q&A pairs using **bold** for questions]
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
  const required = ['title:', 'slug:', 'commonName:', 'scientificName:', 'category:', 'difficulty:'];
  for (const field of required) {
    if (!content.includes(field)) {
      throw new Error(`Missing required frontmatter field: ${field}`);
    }
  }
  if (content.length < 1000) {
    throw new Error(`Content too short (${content.length} chars). Likely an API error.`);
  }
  return true;
}

function saveArticle(plantName, content) {
  const slug = slugify(plantName);
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, content.trim() + '\n');
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
