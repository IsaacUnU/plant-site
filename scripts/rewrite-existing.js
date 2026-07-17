#!/usr/bin/env node
/**
 * rewrite-existing.js
 * Rewrites and enriches existing plant .md files using Groq.
 * Preserves slug, scientificName, commonName, datePublished.
 * Adds dateModified, upgrades content to 1500+ words, adds new sections.
 *
 * Usage:
 *   node scripts/rewrite-existing.js                  → process next 2 from priority list
 *   node scripts/rewrite-existing.js golden-pothos    → rewrite specific slug
 *   node scripts/rewrite-existing.js --batch 5        → process 5 plants
 *
 * Env vars required:
 *   GROQ_API_KEY
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'plants');
const PRIORITY_FILE = path.join(__dirname, 'rewrite-queue.json');

// Backend: set USE_OLLAMA=true to use local Ollama instead of Groq
const USE_OLLAMA = process.env.USE_OLLAMA === 'true';
const GROQ_API_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const OLLAMA_URL    = process.env.OLLAMA_HOST
  ? `${process.env.OLLAMA_HOST}/v1/chat/completions`
  : 'http://127.0.0.1:11434/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b';
const MODEL = USE_OLLAMA ? OLLAMA_MODEL : GROQ_MODEL;

// Plants to prioritize — high traffic, thin content first
const DEFAULT_PRIORITY = [
  'golden-pothos',
  'monstera-deliciosa',
  'snake-plant',
  'aloe-vera',
  'peace-lily',
  'pothos',
  'spider-plant',
  'zz-plant',
  'rubber-plant',
  'philodendron',
];

function loadQueue() {
  if (!fs.existsSync(PRIORITY_FILE)) {
    const allSlugs = fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
    // Priority first, then rest alphabetically
    const rest = allSlugs.filter(s => !DEFAULT_PRIORITY.includes(s)).sort();
    const queue = { pending: [...DEFAULT_PRIORITY.filter(s => allSlugs.includes(s)), ...rest], completed: [] };
    fs.writeFileSync(PRIORITY_FILE, JSON.stringify(queue, null, 2));
    return queue;
  }
  return JSON.parse(fs.readFileSync(PRIORITY_FILE, 'utf8'));
}

function saveQueue(queue) {
  fs.writeFileSync(PRIORITY_FILE, JSON.stringify(queue, null, 2));
}

function buildRewritePrompt(plantName, existingContent) {
  const today = new Date().toISOString().split('T')[0];
  const { data: fm } = matter(existingContent);

  return `You write plant care guides for PlantCare Central. The guides stand out because:
- You give EXACT measurements, not vague ranges ("3 feet from an east window", not "bright indirect light")
- You write for real people, not search engines

NEVER claim personal experience, credentials, or first-hand observation. You have none.
Do not write "in my experience", "I've grown", "I've killed", or any first-person anecdote.

NEVER cite a study, organisation, or source unless it is supplied to you in this prompt.
Do not cite the NASA Clean Air Study. Do not cite ASPCA from memory. Fabricated citations
are worse than no citation.

You are enriching and expanding an existing plant care guide.

EXISTING GUIDE TO EXPAND:
---
${existingContent.slice(0, 3000)}
---

TASK: Rewrite this guide for "${plantName}" (${fm.scientificName || ''}) to be:
- Longer: minimum 1800 words of body content
- More specific: replace vague phrases like "bright indirect light" with measurements ("200-400 foot-candles, 3-5 feet from an east or south window")
- More unique: add personal growing observations ("In my experience growing this in a north-facing room...")
- More useful: add sections that the original lacks

REQUIRED SECTIONS (use descriptive H2s that answer a question, NOT generic labels):
## Quick Care Summary  ← 3-4 sentence self-contained care summary
## Where This Plant Comes From  ← origin, native habitat, why it looks the way it does
## Light: What Works and What Doesn't  ← specific measurements + window directions + photos/seasons
## Watering Without Overwatering  ← step-by-step, season differences, signs of trouble
## The Right Soil Mix  ← exact recipe with ratios
## Fertilizing Schedule  ← NPK, frequency, signs of deficiency
## Humidity and Temperature  ← exact numbers + 3-4 actionable tips
## Common Problems and Fixes  ← 5-6 specific issues with ### subheadings, each with symptom/cause/fix
## How to Propagate  ← numbered steps, timeline, success tips
## Toxicity and Pet Safety  ← exact toxicity level, which pets, what happens, ASPCA reference
## Buying Guide  ← what to look for at the nursery, signs of a healthy plant, red flags
## Frequently Asked Questions  ← exactly 5 Q&A pairs, bold questions, conversational answers

MANDATORY TABLES — include ALL THREE in the rewritten article:

TABLE 1 — "Care at a Glance" (place immediately after ## Quick Care Summary):
Use this EXACT format:
| Factor | Requirement | Pro Tip |
|--------|-------------|---------|
| Light | [exact measurement, e.g. "200–400 foot-candles"] | [specific actionable tip] |
| Water | [exact interval, e.g. "every 7–10 days"] | [how to test: finger depth, pot weight, etc.] |
| Humidity | [% range, e.g. "50–70%"] | [specific method: pebble tray, misting, humidifier] |
| Temperature | [°F and °C range] | [what specific event to avoid: heating vent, cold window] |
| Soil | [exact recipe: "60% potting mix + 30% perlite + 10% orchid bark"] | [pot material recommendation] |
| Fertilizer | [NPK ratio + frequency, e.g. "Balanced 10-10-10, monthly spring–summer"] | [dilute to half strength] |
| Toxicity | [exact: toxic/non-toxic to cats/dogs, per ASPCA] | [placement advice] |

TABLE 2 — "Common Problems Diagnosis" (inside ## Common Problems section, BEFORE the ### subheadings):
| Symptom | Most Likely Cause | Quick Fix | Prevention |
|---------|-------------------|-----------|------------|
[5 rows with SPECIFIC visual symptoms like "soft, mushy stem base" not just "wilting"]

TABLE 3 — "Is This Plant Right For You?" (place before ## Frequently Asked Questions):
| Perfect for you if... | Skip this plant if... |
|----------------------|----------------------|
| You travel and water inconsistently | You want fast, dramatic weekly growth |
| You have a dark bathroom or bedroom | You have cats or dogs that chew plants |
| You're a first-time plant parent | You want a plant that flowers indoors |

ANTI-BOILERPLATE RULES — REJECTION if you write any of these:
- "it's no wonder [plant] has become a staple" → DELETE
- "great for beginners" alone → REPLACE with specific reason ("tolerates 2-week drought" / "survives 50 foot-candles")
- "beautiful" as standalone descriptor → ADD what exactly is beautiful ("the deep burgundy undersides of each leaf")
- "perfect for any room" → DELETE, specify conditions
- "easy to care for" without WHY → always explain the specific tolerance
- "air-purifying" as a health claim → DELETE. Do not attribute air-cleaning benefits to this plant.
- "Research has shown..." / "Studies prove..." → DELETE. Never reference research you were not given.

STRICT RULES:
- Keep ALL frontmatter fields EXACTLY as they are (same slug, scientificName, commonName, category, difficulty, light, water, humidity, toxicity, growthRate, tags, secondaryFunctions, datePublished)
- Add dateModified: ${today}
- Title: use a fresh, descriptive title (not "X Complete Care Guide")
- Do NOT write placeholder text or [brackets]
- Do NOT wrap your response in \`\`\`markdown, \`\`\`yaml, or any code fence — output raw text only
- Your response must start with --- (the YAML frontmatter opening)
- Do NOT change frontmatter enum values (light/water/humidity/toxicity/difficulty/growthRate must remain exactly as in the original)
- Body must be at least 1800 words

Return ONLY the complete rewritten Markdown with YAML frontmatter.`;
}

async function callGroq(prompt) {
  let headers = { 'Content-Type': 'application/json' };

  if (USE_OLLAMA) {
    headers['Authorization'] = 'Bearer ollama';
  } else {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set');
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const timeoutMs = USE_OLLAMA ? 20 * 60 * 1000 : 60 * 1000; // 20 min Ollama, 1 min Groq
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    const start = Date.now();
    if (USE_OLLAMA) console.log(`[rewrite] Sending to Ollama (${MODEL}), timeout 20min...`);
    response = await fetch(USE_OLLAMA ? OLLAMA_URL : GROQ_API_URL, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.65,
        max_tokens: 6000,
      }),
    });
    if (USE_OLLAMA) console.log(`[rewrite] Ollama responded in ${Math.round((Date.now()-start)/1000)}s`);
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error(`Timeout after ${timeoutMs/60000} min`);
    throw err;
  }
  clearTimeout(timer);

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  return (await response.json()).choices[0].message.content;
}

function runQualityGate(filePath) {
  const { execSync } = require('child_process');
  try {
    execSync(`node "${path.join(__dirname, 'validate-post.js')}" "${filePath}"`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
    return true;
  } catch {
    return false;
  }
}

async function rewritePlant(slug) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`[rewrite] File not found: ${slug}.md`);
    return false;
  }

  const existing = fs.readFileSync(filePath, 'utf8');
  const { data: fm } = matter(existing);
  const wordsBefore = existing.split(/\s+/).filter(Boolean).length;

  console.log(`[rewrite] Processing: ${slug} (${wordsBefore} words currently)`);
  console.log(`[rewrite] Calling Groq API...`);

  let newContent;
  try {
    newContent = await callGroq(buildRewritePrompt(fm.commonName || slug.replace(/-/g, ' '), existing));
  } catch (err) {
    console.error(`[rewrite] API error: ${err.message}`);
    return false;
  }

  // Fix unquoted YAML title/description containing colons — gray-matter chokes on them
  newContent = newContent.replace(/^(title|description):\s*(.+)$/m, (match, key, val) => {
    val = val.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) return match;
    if (val.includes(':') || val.includes('#') || val.includes('{')) {
      return `${key}: "${val.replace(/"/g, '\\"')}"`;
    }
    return match;
  });

  // Preserve original frontmatter for locked fields, merge dateModified
  let parsedNew;
  try {
    parsedNew = matter(newContent);
  } catch (e) {
    console.error(`[rewrite] YAML parse error for ${slug}: ${e.message}`);
    return false;
  }
  const { data: newFm, content: newBody } = parsedNew;
  const merged = {
    ...newFm,
    slug: fm.slug || slug,
    scientificName: fm.scientificName,
    commonName: fm.commonName,
    category: fm.category,
    difficulty: fm.difficulty,
    light: fm.light,
    water: fm.water,
    humidity: fm.humidity,
    toxicity: fm.toxicity,
    growthRate: fm.growthRate,
    datePublished: fm.datePublished,
    dateModified: new Date().toISOString().split('T')[0],
    // Always preserve image fields from original
    ...(fm.image           && { image:           fm.image }),
    ...(fm.imageAlt        && { imageAlt:         fm.imageAlt }),
    ...(fm.imageCredit     && { imageCredit:      fm.imageCredit }),
    ...(fm.imageCreditUrl  && { imageCreditUrl:   fm.imageCreditUrl }),
    ...(fm.additionalImages && { additionalImages: fm.additionalImages }),
  };

  const finalContent = matter.stringify(newBody, merged).trim() + '\n';

  // Backup original
  fs.writeFileSync(`${filePath}.bak`, existing);

  // Write new
  fs.writeFileSync(filePath, finalContent);

  // Quality gate — Ollama: warn only (keep file and move on), Groq: strict reject
  const passed = runQualityGate(filePath);
  if (!passed) {
    if (USE_OLLAMA) {
      console.warn(`[rewrite] ⚠ Quality gate warning for ${slug} — keeping Ollama output anyway`);
    } else {
      fs.writeFileSync(filePath, existing);
      fs.unlinkSync(`${filePath}.bak`);
      console.error(`[rewrite] Quality gate failed for ${slug} — original restored.`);
      return false;
    }
  }

  // Remove backup on success
  if (fs.existsSync(`${filePath}.bak`)) fs.unlinkSync(`${filePath}.bak`);
  const wordsAfter = finalContent.split(/\s+/).filter(Boolean).length;
  console.log(`[rewrite] ✓ ${slug}: ${wordsBefore} → ${wordsAfter} words`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const batchArg = args.indexOf('--batch');
  const defaultBatch = USE_OLLAMA ? 999 : 2; // Ollama: process all, Groq: respect rate limits
  const batchSize = batchArg !== -1 ? parseInt(args[batchArg + 1]) || defaultBatch : defaultBatch;
  const excludeIndices = new Set(batchArg !== -1 ? [batchArg, batchArg + 1] : []);
  const specificSlug = args.find((a, i) => !a.startsWith('--') && !excludeIndices.has(i));

  if (USE_OLLAMA) {
    console.log(`[rewrite] Mode: Ollama (${OLLAMA_MODEL}) — no rate limits`);
  } else {
    console.log(`[rewrite] Mode: Groq — rate limit delays active`);
  }

  if (specificSlug) {
    const ok = await rewritePlant(specificSlug);
    process.exit(ok ? 0 : 1);
  }

  const queue = loadQueue();
  let processed = 0;

  for (const slug of [...queue.pending]) {
    if (processed >= batchSize) break;
    const ok = await rewritePlant(slug);

    if (ok) {
      queue.pending = queue.pending.filter(s => s !== slug);
      if (!queue.completed.includes(slug)) queue.completed.push(slug);
      saveQueue(queue);
      processed++;
    }

    // Rate limit delay only for Groq
    if (!USE_OLLAMA && processed < batchSize) {
      const waitTime = ok ? 65000 : 45000;
      console.log(`[rewrite] Waiting ${waitTime / 1000}s (Groq rate limit)...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  console.log(`\n[rewrite] Done. Processed ${processed} plants. ${queue.pending.length} remaining.`);
}

main().catch(err => { console.error(err); process.exit(1); });
