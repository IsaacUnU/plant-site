#!/usr/bin/env node
/**
 * IndexNow Bulk Submit
 * Submits all existing plants and articles to Bing/Yandex via IndexNow.
 *
 * Usage:
 *   node scripts/indexnow-bulk.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const KEY = process.env.INDEXNOW_KEY;

if (!KEY || !SITE_URL) {
  console.error('Missing INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL in .env.local');
  process.exit(1);
}

const PLANTS_DIR = path.join(__dirname, '..', 'content', 'plants');
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');

function getSlugsFromDir(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => `${SITE_URL}/${prefix}/${f.replace(/\.md$/, '')}`);
}

async function submitBulk(urls) {
  const host = new URL(SITE_URL).hostname;
  const body = {
    host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: urls,
  };

  console.log(`[indexnow] Submitting ${urls.length} URLs to IndexNow...`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`[indexnow] ✓ Submitted ${urls.length} URLs successfully`);
  } else {
    const text = await res.text();
    console.error(`[indexnow] ✗ Error ${res.status}: ${text}`);
  }
}

async function main() {
  const plantUrls = getSlugsFromDir(PLANTS_DIR, 'plants');
  const articleUrls = getSlugsFromDir(ARTICLES_DIR, 'articles');
  const staticUrls = ['/', '/plants', '/articles'].map(p => `${SITE_URL}${p}`);

  const allUrls = [...staticUrls, ...plantUrls, ...articleUrls];

  console.log(`[indexnow] Found ${plantUrls.length} plants + ${articleUrls.length} articles + ${staticUrls.length} static pages`);
  console.log(`[indexnow] Total: ${allUrls.length} URLs`);

  // IndexNow accepts max 10,000 URLs per request, chunk just in case
  const chunkSize = 500;
  for (let i = 0; i < allUrls.length; i += chunkSize) {
    await submitBulk(allUrls.slice(i, i + chunkSize));
  }
}

main().catch(err => {
  console.error('[indexnow] ERROR:', err.message);
  process.exit(1);
});
