#!/usr/bin/env node
/**
 * Plant Image Fetcher — obtiene URLs de Unsplash para cada planta
 *
 * Unsplash ToS: hotlink (usar la URL original, no descargar) + trigger download endpoint.
 * Las URLs se guardan en el frontmatter del .md; Next.js Image las optimiza en Vercel.
 *
 * Usage:
 *   node scripts/fetch-images.js                → todas las plantas sin imagen
 *   node scripts/fetch-images.js monstera-deliciosa  → slug específico
 *
 * Env: UNSPLASH_ACCESS_KEY
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const matter = require('gray-matter');

const CONTENT_DIR  = path.join(__dirname, '..', 'content', 'plants');
const UNSPLASH_API = 'https://api.unsplash.com';

// ── Helpers ──────────────────────────────────────────────────

function writeMarkdown(mdPath, data, content) {
  // matter.stringify handles all YAML types correctly (arrays, multiline, etc.)
  fs.writeFileSync(mdPath, matter.stringify(content, data));
}

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpsGet(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') })
      );
    });
    req.on('error', reject);
  });
}

async function unsplashGet(endpoint, accessKey) {
  const url = `${UNSPLASH_API}${endpoint}`;
  const res = await httpsGet(url, {
    Authorization: `Client-ID ${accessKey}`,
    'Accept-Version': 'v1',
  });
  if (res.status !== 200) {
    throw new Error(`Unsplash ${endpoint} → HTTP ${res.status}: ${res.body}`);
  }
  return JSON.parse(res.body);
}

// Unsplash ToS: must trigger download endpoint when photo is "used"
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

// ── Core logic ───────────────────────────────────────────────

async function processPlant(slug, accessKey) {
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

  const query = `${fields.commonName || slug.replace(/-/g, ' ')} houseplant indoor`;
  console.log(`[images] Searching: "${query}"...`);

  const data = await unsplashGet(
    `/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
    accessKey
  );

  if (!data.results?.length) {
    console.log(`[images] ✗  No results for "${query}"`);
    return;
  }

  const photo = data.results[0];
  // Hotlink: use Unsplash URL directly (w=900 for good quality, auto=format for WebP/AVIF)
  const imageUrl     = `${photo.urls.raw}&w=900&q=80&auto=format&fit=crop`;
  const creditName   = photo.user?.name ?? 'Unknown';
  const creditUrl    = photo.user?.links?.html
    ? `${photo.user.links.html}?utm_source=plantcare_guide&utm_medium=referral`
    : '';

  // Trigger download as required by Unsplash ToS
  await triggerDownload(photo.id, accessKey);

  fields.image          = imageUrl;
  fields.imageAlt       = `${fields.commonName || slug} houseplant`;
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

  const specificSlug = process.argv[2];
  if (specificSlug) {
    await processPlant(specificSlug, accessKey);
    return;
  }

  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  console.log(`[images] ${slugs.length} plants to check...`);
  for (const slug of slugs) {
    await processPlant(slug, accessKey);
  }
  console.log('[images] Done.');
}

main().catch((err) => {
  console.error('[images] ERROR:', err.message);
  process.exit(1);
});
