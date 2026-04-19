#!/usr/bin/env node
/**
 * Plant Image Fetcher — Unsplash first, fal.ai FLUX as fallback generator
 *
 * Priority:
 *   1. Unsplash: search by plant name / scientific name (exact match)
 *   2. fal.ai:   generate photorealistic image if Unsplash has nothing specific
 *      Generated images saved to public/images/generated/{slug}.jpg
 *
 * Usage:
 *   node scripts/fetch-images.js                → todas las plantas sin imagen
 *   node scripts/fetch-images.js monstera-deliciosa  → slug específico
 *
 * Env: UNSPLASH_ACCESS_KEY, FAL_KEY (optional — enables AI generation)
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');
const matter = require('gray-matter');

// Load .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
}

const CONTENT_DIR    = path.join(__dirname, '..', 'content', 'plants');
const GENERATED_DIR  = path.join(__dirname, '..', 'public', 'images', 'generated');
const UNSPLASH_API   = 'https://api.unsplash.com';
const FAL_API        = 'https://fal.run/fal-ai/flux/schnell';
const USED_IDS_FILE  = path.join(__dirname, 'used-photo-ids.json');

// ── Used photo registry ───────────────────────────────────────

function loadUsedIds() {
  if (fs.existsSync(USED_IDS_FILE)) {
    try { return new Set(JSON.parse(fs.readFileSync(USED_IDS_FILE, 'utf8'))); }
    catch { return new Set(); }
  }
  return new Set();
}

function saveUsedIds(usedIds) {
  fs.writeFileSync(USED_IDS_FILE, JSON.stringify([...usedIds], null, 2));
}

// ── Helpers ──────────────────────────────────────────────────

function writeMarkdown(mdPath, data, content) {
  fs.writeFileSync(mdPath, matter.stringify(content, data));
}

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpsGet(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({ status: res.statusCode, body: Buffer.concat(chunks) })
      );
    });
    req.on('error', reject);
  });
}

function httpsPost(url, headers, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(bodyObj);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers },
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function unsplashGet(endpoint, accessKey) {
  const url = `${UNSPLASH_API}${endpoint}`;
  const res = await httpsGet(url, {
    Authorization: `Client-ID ${accessKey}`,
    'Accept-Version': 'v1',
  });
  if (res.status !== 200) {
    throw new Error(`Unsplash ${endpoint} → HTTP ${res.status}: ${res.body.toString()}`);
  }
  return JSON.parse(res.body.toString());
}

async function triggerDownload(photoId, accessKey) {
  try {
    await httpsGet(`${UNSPLASH_API}/photos/${photoId}/download`, {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    });
  } catch {
    // Non-fatal
  }
}

// Pick first result not already used globally
function pickUnusedPhoto(results, usedIds) {
  return results.find(p => !usedIds.has(p.id)) ?? results[0];
}

// ── fal.ai image generation ───────────────────────────────────

function buildGenerationPrompt(fields) {
  const name      = fields.commonName || '';
  const scientific = fields.scientificName || '';
  const light     = fields.light || '';
  const category  = fields.category || 'houseplant';

  const lightDesc = {
    'low':            'low light conditions',
    'indirect':       'bright indirect light',
    'indirect-bright':'bright indirect light near window',
    'direct':         'direct sunlight near window',
  }[light] || 'indoor natural light';

  return `Professional botanical plant photography of ${name} (${scientific}), ` +
    `a ${category}, potted in a decorative ceramic pot, ` +
    `${lightDesc}, shallow depth of field, soft natural lighting, ` +
    `clean white or light gray background, high resolution, photorealistic, ` +
    `no text, no watermarks, studio quality`;
}

async function generateWithFal(slug, fields, falKey) {
  console.log(`[images] 🤖 Generating AI image for "${fields.commonName}"...`);

  const prompt = buildGenerationPrompt(fields);
  console.log(`[images]    Prompt: "${prompt.slice(0, 80)}..."`);

  const res = await httpsPost(
    FAL_API,
    { Authorization: `Key ${falKey}` },
    { prompt, image_size: 'landscape_4_3', num_images: 1, num_inference_steps: 4 }
  );

  if (res.status !== 200) {
    throw new Error(`fal.ai → HTTP ${res.status}: ${res.body}`);
  }

  const result = JSON.parse(res.body);
  const imageUrl = result?.images?.[0]?.url;
  if (!imageUrl) throw new Error('fal.ai returned no image URL');

  // Download and save locally to avoid Next.js remote domain issues
  if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const localPath = path.join(GENERATED_DIR, `${slug}.jpg`);
  const imgRes = await httpsGet(imageUrl);
  fs.writeFileSync(localPath, imgRes.body);

  console.log(`[images] ✓  AI image saved: public/images/generated/${slug}.jpg`);
  return `/images/generated/${slug}.jpg`;
}

// ── Core logic ───────────────────────────────────────────────

async function processPlant(slug, accessKey, falKey, usedIds) {
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.log(`[images] ⚠  Not found: ${slug}.md`);
    return;
  }

  const raw = fs.readFileSync(mdPath, 'utf8');
  const { data: fields, content } = matter(raw);

  if (fields.image) {
    console.log(`[images] ✓  Already has image: ${slug}`);
    return;
  }

  const plantName      = fields.commonName || slug.replace(/-/g, ' ');
  const scientificName = fields.scientificName || '';
  const genus          = scientificName ? scientificName.split(' ')[0] : '';

  // Specific Unsplash queries — exact plant name first, genus last
  const specificQueries = [
    `${plantName} houseplant indoor`,
    `${plantName} plant`,
    scientificName ? `${scientificName} plant` : null,
    genus && genus.toLowerCase() !== plantName.toLowerCase() ? `${genus} plant indoor` : null,
  ].filter(Boolean);

  let photo = null;

  for (const query of specificQueries) {
    console.log(`[images] Searching Unsplash: "${query}"...`);
    try {
      const data = await unsplashGet(
        `/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
        accessKey
      );
      if (data.results?.length) {
        photo = pickUnusedPhoto(data.results, usedIds);
        break;
      }
    } catch (err) {
      console.log(`[images] ⚠  Query failed: ${err.message}`);
    }
  }

  // If Unsplash found nothing specific → generate with fal.ai
  if (!photo) {
    if (falKey) {
      try {
        const generatedPath = await generateWithFal(slug, fields, falKey);
        fields.image          = generatedPath;
        fields.imageAlt       = `${plantName} houseplant`;
        fields.imageCredit    = 'AI Generated';
        fields.imageCreditUrl = '';
        writeMarkdown(mdPath, fields, content);
        return;
      } catch (err) {
        console.log(`[images] ⚠  AI generation failed: ${err.message}`);
      }
    } else {
      console.log(`[images] ✗  No Unsplash result for "${slug}". Set FAL_KEY in .env.local to enable AI generation.`);
      return;
    }
  }

  // Use Unsplash photo
  const imageUrl   = `${photo.urls.raw}&w=900&q=80&auto=format&fit=crop`;
  const creditName = photo.user?.name ?? 'Unknown';
  const creditUrl  = photo.user?.links?.html
    ? `${photo.user.links.html}?utm_source=plantcare_guide&utm_medium=referral`
    : '';

  await triggerDownload(photo.id, accessKey);
  usedIds.add(photo.id);
  saveUsedIds(usedIds);

  fields.image          = imageUrl;
  fields.imageAlt       = `${plantName} houseplant`;
  fields.imageCredit    = creditName;
  fields.imageCreditUrl = creditUrl;

  writeMarkdown(mdPath, fields, content);
  console.log(`[images] ✓  ${slug} — photo by ${creditName}`);
}

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey === 'your_unsplash_access_key_here') {
    console.error('[images] ERROR: UNSPLASH_ACCESS_KEY not set in .env.local');
    process.exit(1);
  }

  const falKey  = process.env.FAL_KEY || null;
  const usedIds = loadUsedIds();

  if (falKey) {
    console.log(`[images] fal.ai AI generation: ENABLED`);
  } else {
    console.log(`[images] fal.ai AI generation: DISABLED (add FAL_KEY to .env.local to enable)`);
  }
  console.log(`[images] ${usedIds.size} photo IDs in registry`);

  const specificSlug = process.argv[2];
  if (specificSlug) {
    await processPlant(specificSlug, accessKey, falKey, usedIds);
    return;
  }

  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  console.log(`[images] ${slugs.length} plants to check...`);
  for (const slug of slugs) {
    await processPlant(slug, accessKey, falKey, usedIds);
  }
  console.log('[images] Done.');
}

main().catch((err) => {
  console.error('[images] ERROR:', err.message);
  process.exit(1);
});
