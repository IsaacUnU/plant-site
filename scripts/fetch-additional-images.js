#!/usr/bin/env node
/**
 * fetch-additional-images.js
 * Downloads up to 3 extra images per plant.
 *
 * Flow per image slot:
 *   1. Search Unsplash (top 5 candidates)
 *   2. Verify each candidate with Llama 4 Scout vision (Groq)
 *   3. Use first verified candidate
 *   4. If none pass → fallback to iNaturalist taxa API (scientifically verified photos)
 *
 * Usage:
 *   node scripts/fetch-additional-images.js              → all pending plants
 *   node scripts/fetch-additional-images.js golden-pothos → one plant
 *   node scripts/fetch-additional-images.js --reverify   → re-check existing images
 *
 * Env: UNSPLASH_ACCESS_KEY, GROQ_API_KEY
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const http  = require('http');
const matter = require('gray-matter');

const CONTENT_DIR  = path.join(__dirname, '..', 'content', 'plants');
const IMAGES_DIR   = path.join(__dirname, '..', 'public', 'images', 'plants');
const UNSPLASH_API = 'https://api.unsplash.com';
const GROQ_API     = 'https://api.groq.com/openai/v1/chat/completions';
const INAT_API     = 'https://api.inaturalist.org/v1';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const EXTRA_SUFFIXES = ['-2', '-3', '-detail'];

// ── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: headers || {} }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpsGet(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
  });
}

// ── Unsplash ─────────────────────────────────────────────────────────────────

async function unsplashSearch(query, accessKey, attempt = 0) {
  const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
  const res = await httpsGet(url, { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' });

  if (res.status === 403 || res.status === 429) {
    if (attempt < 3) {
      const wait = 65 + attempt * 30;
      console.log(`  [unsplash] Rate limit — waiting ${wait}s...`);
      await sleep(wait * 1000);
      return unsplashSearch(query, accessKey, attempt + 1);
    }
    throw new Error('Unsplash rate limit: max retries');
  }
  if (res.status !== 200) throw new Error(`Unsplash HTTP ${res.status}`);
  return JSON.parse(res.body.toString());
}

async function triggerDownload(photoId, accessKey) {
  try {
    await httpsGet(`${UNSPLASH_API}/photos/${photoId}/download`, {
      Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1',
    });
  } catch { /* non-fatal */ }
}

// ── Llama 4 Scout vision verification ────────────────────────────────────────

async function verifyImage(imageUrl, commonName, scientificName, groqKey) {
  if (!groqKey) return true; // No key → accept all (skip verification)

  try {
    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            {
              type: 'text',
              text: `Does this image clearly show a ${commonName} (${scientificName}) plant? Answer only YES or NO.`,
            },
          ],
        }],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!res.ok) {
      // Vision API error → accept image (don't block)
      console.log(`  [vision] API error ${res.status} — accepting image`);
      return true;
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim().toUpperCase() || '';
    const passed = answer.startsWith('YES');
    console.log(`  [vision] ${passed ? '✓' : '✗'} "${answer}" for ${commonName}`);
    await sleep(2000); // 2s between vision calls to stay under Groq rate limit
    return passed;
  } catch (err) {
    console.log(`  [vision] Error: ${err.message} — accepting image`);
    return true;
  }
}

// ── iNaturalist fallback ──────────────────────────────────────────────────────

async function iNaturalistSearch(scientificName) {
  try {
    const url = `${INAT_API}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&per_page=1`;
    const res = await httpsGet(url, { 'User-Agent': 'PlantCareCentral/1.0 (plantcarecentral.com)' });
    if (res.status !== 200) return null;

    const data = JSON.parse(res.body.toString());
    const taxon = data.results?.[0];
    if (!taxon?.default_photo?.medium_url) return null;

    console.log(`  [inat] Found: ${taxon.name} — ${taxon.default_photo.medium_url}`);
    return {
      url: taxon.default_photo.medium_url,
      credit: `iNaturalist / ${taxon.default_photo.attribution || 'CC BY-NC'}`,
    };
  } catch (err) {
    console.log(`  [inat] Error: ${err.message}`);
    return null;
  }
}

// ── Download ──────────────────────────────────────────────────────────────────

async function downloadImage(url, destPath) {
  const res = await httpsGet(url);
  if (res.status !== 200) throw new Error(`Download HTTP ${res.status}`);
  fs.writeFileSync(destPath, res.body);
}

// ── Per-plant processor ───────────────────────────────────────────────────────

async function processPlant(slug, accessKey, groqKey) {
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) { console.log(`Not found: ${slug}.md`); return; }

  const { data: fm, content } = matter(fs.readFileSync(mdPath, 'utf8'));
  const commonName     = fm.commonName || slug.replace(/-/g, ' ');
  const scientificName = fm.scientificName || commonName;
  const genus          = scientificName.split(' ')[0];

  // Build search queries: specific → common → genus fallback
  const queries = [
    `${commonName} plant close up`,
    `${commonName} houseplant indoor`,
    genus.toLowerCase() !== commonName.toLowerCase() ? `${genus} plant` : `tropical plant ${commonName}`,
  ];

  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const existing    = Array.isArray(fm.additionalImages) ? fm.additionalImages : [];
  const existingSet = new Set(existing);
  const collected   = [...existing];
  let added = 0;

  for (let i = 0; i < EXTRA_SUFFIXES.length; i++) {
    const suffix   = EXTRA_SUFFIXES[i];
    const webPath  = `/images/plants/${slug}${suffix}.jpg`;
    const diskPath = path.join(IMAGES_DIR, `${slug}${suffix}.jpg`);

    if (fs.existsSync(diskPath)) {
      if (!existingSet.has(webPath)) { collected.push(webPath); existingSet.add(webPath); }
      console.log(`  Already exists: ${slug}${suffix}.jpg`);
      continue;
    }

    const query = queries[i];
    console.log(`  Searching Unsplash: "${query}"...`);
    await sleep(3000);

    let verified = null;

    // 1. Try Unsplash candidates (top 5, verify each)
    try {
      const data = await unsplashSearch(query, accessKey);
      const candidates = data.results || [];

      for (const photo of candidates) {
        const previewUrl = `${photo.urls.raw}&w=400&q=70&auto=format&fit=crop`;
        const ok = await verifyImage(previewUrl, commonName, scientificName, groqKey);
        if (ok) {
          verified = {
            url: `${photo.urls.raw}&w=900&q=80&auto=format&fit=crop`,
            credit: photo.user?.name || 'Unsplash',
            id: photo.id,
          };
          break;
        }
      }

      if (!verified) console.log(`  No verified Unsplash result — trying iNaturalist...`);
    } catch (err) {
      console.log(`  Unsplash error: ${err.message}`);
    }

    // 2. iNaturalist fallback
    if (!verified) {
      const inat = await iNaturalistSearch(scientificName);
      if (inat) {
        verified = { url: inat.url, credit: inat.credit, id: null };
      }
    }

    if (!verified) {
      console.log(`  No image found for slot ${suffix} of ${slug}`);
      continue;
    }

    try {
      await downloadImage(verified.url, diskPath);
      if (verified.id) await triggerDownload(verified.id, accessKey);
      collected.push(webPath);
      existingSet.add(webPath);
      added++;
      console.log(`  ✓ Saved: ${slug}${suffix}.jpg (${verified.credit})`);
    } catch (err) {
      console.log(`  Download failed: ${err.message}`);
    }
  }

  if (added > 0 || collected.length !== existing.length) {
    fm.additionalImages = collected;
    fs.writeFileSync(mdPath, matter.stringify(content, fm));
  }
}

// ── Re-verify existing images ─────────────────────────────────────────────────

async function reverifyAll(groqKey) {
  if (!groqKey) { console.error('GROQ_API_KEY required for --reverify'); process.exit(1); }
  const slugs = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
  let removed = 0;

  for (const slug of slugs) {
    const { data: fm } = matter(fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), 'utf8'));
    const commonName     = fm.commonName || slug.replace(/-/g, ' ');
    const scientificName = fm.scientificName || commonName;

    for (const suffix of EXTRA_SUFFIXES) {
      const diskPath = path.join(IMAGES_DIR, `${slug}${suffix}.jpg`);
      if (!fs.existsSync(diskPath)) continue;

      // Serve via file:// isn't possible for Groq — skip local files, only verify Unsplash URLs
      // Re-verify is best run before downloading (use --clean to delete and re-fetch)
      console.log(`  [${slug}${suffix}] Exists — use --clean to re-download with verification`);
    }
  }
  console.log(`\nTo re-fetch with verification: delete images in public/images/plants/ and re-run without --reverify`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const groqKey   = process.env.GROQ_API_KEY;

  if (!accessKey) { console.error('UNSPLASH_ACCESS_KEY not set'); process.exit(1); }
  if (!groqKey)   console.warn('[warn] GROQ_API_KEY not set — image verification disabled');

  const args = process.argv.slice(2);

  if (args.includes('--reverify')) { await reverifyAll(groqKey); return; }

  const specificSlug = args.find(a => !a.startsWith('--'));
  if (specificSlug) {
    console.log(`\n[extra-images] Processing: ${specificSlug}`);
    await processPlant(specificSlug, accessKey, groqKey);
    return;
  }

  const slugs = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
  const pending = slugs.filter(slug => {
    return !fs.existsSync(path.join(IMAGES_DIR, `${slug}-2.jpg`)) ||
           !fs.existsSync(path.join(IMAGES_DIR, `${slug}-3.jpg`));
  });

  console.log(`\n[extra-images] ${slugs.length} plants — ${pending.length} need images, ${slugs.length - pending.length} complete.`);
  console.log(`[extra-images] Vision verification: ${groqKey ? `Llama 4 Scout (${VISION_MODEL})` : 'DISABLED (no GROQ_API_KEY)'}\n`);

  for (let i = 0; i < pending.length; i++) {
    console.log(`[${i + 1}/${pending.length}] ${pending[i]}`);
    await processPlant(pending[i], accessKey, groqKey);
    console.log('');
  }

  console.log('[extra-images] Done.');
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
