#!/usr/bin/env node
/**
 * Fix duplicate images across articles and plants.
 *
 * Steps:
 *   1. Extract all photo IDs from existing plant images → seed registry
 *   2. Find article images that are duplicates (same photo ID used 2+ times)
 *   3. Clear those duplicate image fields so fetch-article-images.js re-fetches them
 *
 * Usage:
 *   node scripts/fix-duplicate-images.js          → dry run (shows what would change)
 *   node scripts/fix-duplicate-images.js --apply  → actually clears duplicates
 */

const fs     = require('fs');
const path   = require('path');
const matter = require('gray-matter');

const PLANTS_DIR    = path.join(__dirname, '..', 'content', 'plants');
const ARTICLES_DIR  = path.join(__dirname, '..', 'content', 'articles');
const USED_IDS_FILE = path.join(__dirname, 'used-photo-ids.json');

const DRY_RUN = !process.argv.includes('--apply');

// Extract Unsplash photo ID from a URL like:
// https://images.unsplash.com/photo-XXXXX?ixid=...
function extractPhotoId(url) {
  if (!url) return null;
  const match = url.match(/unsplash\.com\/photo-([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function readMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const mdPath = path.join(dir, f);
      const raw = fs.readFileSync(mdPath, 'utf8');
      const { data: fields, content } = matter(raw);
      return { slug: f.replace(/\.md$/, ''), mdPath, fields, content };
    });
}

function clearImageFields(entry) {
  delete entry.fields.image;
  delete entry.fields.imageAlt;
  delete entry.fields.imageCredit;
  delete entry.fields.imageCreditUrl;
  fs.writeFileSync(entry.mdPath, matter.stringify(entry.content, entry.fields));
}

function saveUsedIds(usedIds) {
  fs.writeFileSync(USED_IDS_FILE, JSON.stringify([...usedIds], null, 2));
}

function main() {
  console.log(DRY_RUN ? '=== DRY RUN (pass --apply to make changes) ===' : '=== APPLYING CHANGES ===');
  console.log();

  // 1. Seed registry from plant images
  const plants   = readMdFiles(PLANTS_DIR);
  const usedIds  = new Set();
  let plantCount = 0;

  for (const p of plants) {
    const id = extractPhotoId(p.fields.image);
    if (id) { usedIds.add(id); plantCount++; }
  }
  console.log(`Plants: ${plantCount} photo IDs collected into registry`);

  // 2. Scan articles, group by photo ID to find duplicates
  const articles    = readMdFiles(ARTICLES_DIR);
  const idToSlugs   = {};   // photoId → [slug, ...]

  for (const a of articles) {
    const id = extractPhotoId(a.fields.image);
    if (!id) continue;
    if (!idToSlugs[id]) idToSlugs[id] = [];
    idToSlugs[id].push(a.slug);
  }

  const duplicateIds = Object.entries(idToSlugs).filter(([, slugs]) => slugs.length > 1);
  console.log(`Articles: ${articles.length} total, ${duplicateIds.length} duplicate photo IDs found`);
  console.log();

  if (!duplicateIds.length) {
    console.log('No duplicate article images. All good!');
  } else {
    for (const [id, slugs] of duplicateIds) {
      console.log(`  Photo ${id} used by ${slugs.length} articles:`);
      slugs.forEach(s => console.log(`    - ${s}`));
    }
    console.log();
  }

  // 3. Also find articles with NO image
  const noImage = articles.filter(a => !a.fields.image);
  if (noImage.length) {
    console.log(`Articles with NO image (${noImage.length}):`);
    noImage.forEach(a => console.log(`  - ${a.slug}`));
    console.log();
  }

  if (DRY_RUN) {
    const toReset = new Set();
    for (const [, slugs] of duplicateIds) {
      // Keep first, clear the rest
      slugs.slice(1).forEach(s => toReset.add(s));
    }
    console.log(`Would clear image from ${toReset.size} duplicate articles.`);
    console.log('Run with --apply to actually clear them, then run: npm run article-images');
    return;
  }

  // Apply: seed registry, clear duplicates
  if (!DRY_RUN) {
    // Add non-duplicate article IDs to registry too (keep unique ones)
    for (const [id, slugs] of Object.entries(idToSlugs)) {
      if (slugs.length === 1) usedIds.add(id);
    }
    saveUsedIds(usedIds);
    console.log(`Registry saved with ${usedIds.size} IDs`);
  }

  let cleared = 0;
  for (const [, slugs] of duplicateIds) {
    // Keep first occurrence, clear the rest
    const toClear = slugs.slice(1);
    for (const slug of toClear) {
      const entry = articles.find(a => a.slug === slug);
      if (entry) {
        clearImageFields(entry);
        console.log(`  Cleared image from: ${slug}`);
        cleared++;
      }
    }
  }

  console.log();
  console.log(`Done. Cleared ${cleared} duplicate article images.`);
  console.log('Now run: npm run article-images');
  console.log('(or: node scripts/fetch-article-images.js)');
}

main();
