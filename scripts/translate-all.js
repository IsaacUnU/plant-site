#!/usr/bin/env node
/**
 * Plant Care Central — Batch Spanish Translator
 * Translates ALL existing EN plant + article markdown files to Spanish.
 *
 * Usage:
 *   node scripts/translate-all.js              → translates plants + articles
 *   node scripts/translate-all.js --plants     → only plants
 *   node scripts/translate-all.js --articles   → only articles
 *
 * Env vars required:
 *   OPENROUTER_API_KEY  (preferred — no daily limit)
 *   GROQ_API_KEY        (fallback)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OR_MODEL = 'openai/gpt-oss-20b:free';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const BATCH_SIZE = 1;        // sequential — free tier is rate limited by RPM
const DELAY_BETWEEN_FILES_MS = 6000; // 6s between calls (~10 req/min, safe for free tier)

const EN_PLANTS_DIR = path.join(__dirname, '..', 'content', 'plants');
const ES_PLANTS_DIR = path.join(__dirname, '..', 'content', 'es', 'plants');
const EN_ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const ES_ARTICLES_DIR = path.join(__dirname, '..', 'content', 'es', 'articles');

// --- API helper (OpenRouter preferred, Groq fallback) ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseRetryAfter(errText) {
  const match = errText.match(/try again in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 2000 : 10000;
}

async function callLLM(prompt, retries = 3) {
  const orKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const useOR = orKey && orKey.startsWith('sk-or-');

  const apiUrl = useOR ? OPENROUTER_API_URL : GROQ_API_URL;
  const model  = useOR ? OR_MODEL : GROQ_MODEL;
  const apiKey = useOR ? orKey : groqKey;

  if (!apiKey) throw new Error('Set OPENROUTER_API_KEY or GROQ_API_KEY in .env.local');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    ...(useOR && { 'HTTP-Referer': 'https://plantcarecentral.com', 'X-Title': 'PlantCare Central' }),
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }

    const errText = await response.text();
    if (response.status === 429 && attempt < retries) {
      const waitMs = parseRetryAfter(errText);
      console.log(`\n    ⏳ Rate limit — waiting ${(waitMs / 1000).toFixed(0)}s...`);
      await sleep(waitMs);
      continue;
    }
    throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`);
  }
}

// --- Plant translation ---

function buildPlantTranslationPrompt(enMarkdown) {
  return `Translate the following plant care guide from English to Spanish for the website PlantCare Central.

RULES (must follow exactly):
1. Translate ALL text content to Spanish
2. Keep these YAML frontmatter values in English (do NOT translate): category, difficulty, light, water, humidity, toxicity, growthRate, slug, datePublished, dateModified, image, imageAlt, imageCredit, imageCreditUrl, secondaryFunctions values
3. Translate: title, commonName (use the Spanish common name if it exists), description, tags, and ALL body content
4. Keep scientificName in Latin (unchanged)
5. Keep all markdown formatting (##, **, -, numbered lists) exactly
6. Keep all URLs/links unchanged
7. The title should be natural Spanish, e.g. "Guía Completa de Cuidado de la Monstera Deliciosa"
8. Tags should be translated to Spanish (e.g. "easy care" → "fácil cuidado")
9. Return ONLY the translated markdown. No explanations.

ENGLISH CONTENT TO TRANSLATE:
---
${enMarkdown}`;
}

function buildArticleTranslationPrompt(enMarkdown) {
  return `Translate the following houseplant care article from English to Spanish for the website PlantCare Central.

RULES (must follow exactly):
1. Translate ALL text content to Spanish
2. Keep these YAML frontmatter values in English (do NOT translate): type, category, slug, datePublished, dateModified, image, imageAlt, imageCredit, imageCreditUrl, featuredPlants
3. Translate: title, description, tags, and ALL body content (headings, paragraphs, lists, Q&A)
4. Keep all markdown formatting (##, ###, **, -, numbered lists) exactly
5. Keep all URLs/links unchanged
6. The title should be natural Spanish
7. Tags should be translated to Spanish
8. Return ONLY the translated markdown. No explanations.

ENGLISH CONTENT TO TRANSLATE:
---
${enMarkdown}`;
}

// --- Parallel batch processor ---

async function processBatch(items, processFunc, label) {
  const results = { ok: 0, skipped: 0, failed: 0 };
  const total = items.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(total / BATCH_SIZE);
    console.log(`\n[${label}] batch ${batchNum}/${totalBatches}: ${batch.map(b => b.slug).join(', ')}`);

    const settled = await Promise.allSettled(batch.map(processFunc));
    settled.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        if (r.value === 'skipped') { process.stdout.write('→ skip  '); results.skipped++; }
        else { process.stdout.write('✓ done  '); results.ok++; }
      } else {
        process.stdout.write(`✗ fail  `);
        console.error(`\n  Error [${batch[idx].slug}]: ${r.reason?.message}`);
        results.failed++;
      }
    });
    console.log();
    if (i + BATCH_SIZE < total) await sleep(DELAY_BETWEEN_FILES_MS);
  }
  return results;
}

// --- Plant translator ---

async function translatePlant({ slug, enPath, esPath }) {
  if (fs.existsSync(esPath)) return 'skipped';

  const enMarkdown = fs.readFileSync(enPath, 'utf8');
  const prompt = buildPlantTranslationPrompt(enMarkdown);
  const translated = await callLLM(prompt);

  // Validate: must parse as valid YAML frontmatter
  let fm;
  try {
    fm = matter(translated).data;
  } catch (e) {
    throw new Error(`Invalid YAML in translation: ${e.message}`);
  }

  if (!fm.slug) {
    // Inject slug from EN if missing
    const enFm = matter(enMarkdown).data;
    const { data: tFm, content: tBody } = matter(translated);
    tFm.slug = enFm.slug || slug;
    const fixed = matter.stringify(tBody, tFm);
    fs.writeFileSync(esPath, fixed.trim() + '\n');
  } else {
    fs.writeFileSync(esPath, translated.trim() + '\n');
  }
  return 'ok';
}

// --- Article translator ---

async function translateArticle({ slug, enPath, esPath }) {
  if (fs.existsSync(esPath)) return 'skipped';

  const enMarkdown = fs.readFileSync(enPath, 'utf8');
  const prompt = buildArticleTranslationPrompt(enMarkdown);
  const translated = await callLLM(prompt);

  try {
    matter(translated).data; // validate YAML
  } catch (e) {
    throw new Error(`Invalid YAML in article translation: ${e.message}`);
  }

  fs.writeFileSync(esPath, translated.trim() + '\n');
  return 'ok';
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const onlyPlants = args.includes('--plants');
  const onlyArticles = args.includes('--articles');
  const doPlants = !onlyArticles;
  const doArticles = !onlyPlants;

  fs.mkdirSync(ES_PLANTS_DIR, { recursive: true });
  fs.mkdirSync(ES_ARTICLES_DIR, { recursive: true });

  let totalOk = 0, totalSkipped = 0, totalFailed = 0;

  // --- Plants ---
  if (doPlants) {
    const plantFiles = fs.readdirSync(EN_PLANTS_DIR).filter(f => f.endsWith('.md'));
    const plantItems = plantFiles.map(f => ({
      slug: f.replace(/\.md$/, ''),
      enPath: path.join(EN_PLANTS_DIR, f),
      esPath: path.join(ES_PLANTS_DIR, f),
    }));

    const delayMin = ((plantItems.length * DELAY_BETWEEN_FILES_MS) / 60000).toFixed(0);
    console.log(`\n━━━ PLANTS: ${plantItems.length} files to process (~${delayMin} min) ━━━`);
    const r = await processBatch(plantItems, translatePlant, 'Plant');
    totalOk += r.ok; totalSkipped += r.skipped; totalFailed += r.failed;
  }

  // --- Articles ---
  if (doArticles) {
    const articleFiles = fs.readdirSync(EN_ARTICLES_DIR).filter(f => f.endsWith('.md'));
    const articleItems = articleFiles.map(f => ({
      slug: f.replace(/\.md$/, ''),
      enPath: path.join(EN_ARTICLES_DIR, f),
      esPath: path.join(ES_ARTICLES_DIR, f),
    }));

    const delayMin = ((articleItems.length * DELAY_BETWEEN_FILES_MS) / 60000).toFixed(0);
    console.log(`\n━━━ ARTICLES: ${articleItems.length} files to process (~${delayMin} min) ━━━`);
    const r = await processBatch(articleItems, translateArticle, 'Article');
    totalOk += r.ok; totalSkipped += r.skipped; totalFailed += r.failed;
  }

  console.log(`\n━━━ DONE ━━━`);
  console.log(`  ✓ Translated: ${totalOk}`);
  console.log(`  → Skipped:   ${totalSkipped}`);
  console.log(`  ✗ Failed:    ${totalFailed}`);
  if (totalFailed > 0) {
    console.log('\nRe-run to retry failed items (skips already-done files).');
  }
}

main().catch(err => {
  console.error('[translate-all] FATAL:', err.message);
  process.exit(1);
});
