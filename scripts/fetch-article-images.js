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

const CONTENT_DIR   = path.join(__dirname, '..', 'content', 'articles');
const UNSPLASH_API  = 'https://api.unsplash.com';
const USED_IDS_FILE = path.join(__dirname, 'used-photo-ids.json');

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

// Pick first result not already used globally
function pickUnusedPhoto(results, usedIds) {
  return results.find(p => !usedIds.has(p.id)) ?? results[0];
}

// Extract topic keywords from title for a better fallback query
function buildFallbackQueries(fields) {
  const title = (fields.title || '').toLowerCase();
  const tags  = (fields.tags || []).slice(0, 3);

  // Detect topic area from title for targeted fallbacks
  if (title.includes('water') || title.includes('watering'))
    return ['watering houseplants indoor', 'plant watering can', 'indoor plant care'];
  if (title.includes('light') || title.includes('sun'))
    return ['houseplant window sunlight', 'indoor plant light', 'plant near window'];
  if (title.includes('propagat'))
    return ['plant propagation cuttings', 'houseplant propagation', 'plant cutting water glass'];
  if (title.includes('repot') || title.includes('pot'))
    return ['repotting houseplant soil', 'plant repotting', 'houseplant new pot'];
  if (title.includes('prune') || title.includes('trim'))
    return ['pruning houseplant scissors', 'plant trimming leaves', 'indoor plant care'];
  if (title.includes('soil') || title.includes('fertili'))
    return ['houseplant soil potting mix', 'fertilizing plants', 'plant soil hands'];
  if (title.includes('pest') || title.includes('bug') || title.includes('insect'))
    return ['plant pests leaves close up', 'houseplant disease', 'plant leaf damage'];
  if (title.includes('humidity') || title.includes('mist'))
    return ['plant misting humidity', 'tropical houseplant humidity', 'plant spray bottle'];
  if (title.includes('dead') || title.includes('dying') || title.includes('reviv') || title.includes('save'))
    return ['wilting houseplant revival', 'drooping plant leaves', 'overwatered plant'];
  if (title.includes('air') || title.includes('purif'))
    return ['air purifying plants indoor', 'clean air houseplants', 'indoor plants shelf'];
  if (title.includes('low light') || title.includes('shade'))
    return ['low light houseplant dark room', 'shade tolerant plant indoor', 'plant dim light'];

  // Generic fallback using tags
  if (tags.length) return [`${tags.join(' ')} houseplant`, 'indoor plants home', 'houseplant care'];
  return ['indoor houseplants care', 'plant care home', 'green indoor plants'];
}

// ── Core logic ───────────────────────────────────────────────

async function processArticle(slug, accessKey, usedIds) {
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

  const tagsQuery = (fields.tags || []).slice(0, 2).join(' ');
  const primaryQuery = `${fields.title} ${tagsQuery} houseplant indoor`.trim();
  const fallbackQueries = buildFallbackQueries(fields);

  const queries = [primaryQuery, ...fallbackQueries];

  let photo = null;
  for (const query of queries) {
    console.log(`[article-images] Searching: "${query}"...`);
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
      console.log(`[article-images] ⚠  Query failed: ${err.message}`);
    }
  }

  if (!photo) {
    console.log(`[article-images] ✗ No photo found for "${slug}"`);
    return;
  }

  const imageUrl   = `${photo.urls.raw}&w=1200&q=80&auto=format&fit=crop`;
  const creditName = photo.user?.name ?? 'Unsplash';
  const creditUrl  = photo.user?.links?.html
    ? `${photo.user.links.html}?utm_source=plantcare_guide&utm_medium=referral`
    : '';

  await triggerDownload(photo.id, accessKey);

  usedIds.add(photo.id);
  saveUsedIds(usedIds);

  fields.image         = imageUrl;
  fields.imageAlt      = fields.title;
  fields.imageCredit   = creditName;
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

  const usedIds = loadUsedIds();
  console.log(`[article-images] ${usedIds.size} photo IDs already in use registry`);

  const specificSlug = process.argv[2];
  if (specificSlug) {
    await processArticle(specificSlug, accessKey, usedIds);
    return;
  }

  const slugs = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

  console.log(`[article-images] Checking ${slugs.length} articles...`);
  for (const slug of slugs) {
    await processArticle(slug, accessKey, usedIds);
  }
  console.log('[article-images] Done.');
}

main().catch((err) => {
  console.error('[article-images] ERROR:', err.message);
  process.exit(1);
});
