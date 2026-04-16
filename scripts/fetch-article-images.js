#!/usr/bin/env node
/**
 * Article Image Fetcher — obtiene URLs de Unsplash para artículos (listicles/guides)
 * 
 * Env: UNSPLASH_ACCESS_KEY
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
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

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');
const UNSPLASH_API = 'https://api.unsplash.com';

// ── Helpers ──────────────────────────────────────────────────

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
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

async function processArticle(slug, accessKey) {
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.log(`[article-images] ⚠ Not found: ${slug}.md`);
    return;
  }

  const raw = fs.readFileSync(mdPath, 'utf8');
  const { data: fields, content } = matter(raw);

  if (fields.image) {
    console.log(`[article-images] ✓ Already has image: ${slug}`);
    return;
  }

  // Optimize query: use title and first few tags
  const tagsQuery = (fields.tags || []).slice(0, 2).join(' ');
  const query = `${fields.title} ${tagsQuery} houseplant indoor garden lifestyle`.trim();
  
  console.log(`[article-images] Searching for: "${fields.title}"...`);

  const data = await unsplashGet(
    `/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
    accessKey
  );

  if (!data.results?.length) {
    console.log(`[article-images] ✗ No results for query. Trying simpler search...`);
    const simpleQuery = "houseplants indoor garden";
    const fallbackData = await unsplashGet(
      `/search/photos?query=${encodeURIComponent(simpleQuery)}&per_page=1&orientation=landscape`,
      accessKey
    );
    if (!fallbackData.results?.length) return;
    data.results = fallbackData.results;
  }

  // Pick the best image (prefer those from professional photographers or good orientation)
  const photo = data.results[0];
  const imageUrl = `${photo.urls.raw}&w=1200&q=80&auto=format&fit=crop`;
  const creditName = photo.user?.name ?? 'Unsplash';
  const creditUrl = photo.user?.links?.html
    ? `${photo.user.links.html}?utm_source=plantcare_guide&utm_medium=referral`
    : '';

  await triggerDownload(photo.id, accessKey);

  fields.image = imageUrl;
  fields.imageAlt = fields.title;
  fields.imageCredit = creditName;
  fields.imageCreditUrl = creditUrl;

  fs.writeFileSync(mdPath, matter.stringify(content, fields));
  console.log(`[article-images] ✓ ${slug} — photo by ${creditName}`);
}

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey === 'your_unsplash_access_key_here') {
    console.error('[article-images] ERROR: UNSPLASH_ACCESS_KEY not set');
    process.exit(1);
  }

  const specificSlug = process.argv[2];
  if (specificSlug) {
    await processArticle(specificSlug, accessKey);
    return;
  }

  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  console.log(`[article-images] Checking ${slugs.length} articles...`);
  for (const slug of slugs) {
    await processArticle(slug, accessKey);
  }
  console.log('[article-images] Done.');
}

main().catch((err) => {
  console.error('[article-images] ERROR:', err.message);
  process.exit(1);
});
