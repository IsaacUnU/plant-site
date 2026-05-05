#!/usr/bin/env node
/**
 * audit-duplicates.js
 * Scans content dirs for duplicate / near-duplicate plants and articles.
 * Groups by: exact scientificName, normalized commonName, Jaccard body similarity.
 * Output: audit-report.json (gitignored)
 *
 * Usage: node scripts/audit-duplicates.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.join(__dirname, '..');
const DIRS = {
  plantsEN:    path.join(ROOT, 'content', 'plants'),
  plantsES:    path.join(ROOT, 'content', 'es', 'plants'),
  articlesEN:  path.join(ROOT, 'content', 'articles'),
  articlesES:  path.join(ROOT, 'content', 'es', 'articles'),
};

// Normalize string for comparison: lowercase, strip accents, strip punctuation
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Build a set of 5-word shingles from body text
function getNgrams(text, n = 5) {
  const words = text.toLowerCase().replace(/[#*`>]/g, '').split(/\s+/).filter(Boolean);
  const grams = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    grams.add(words.slice(i, i + n).join(' '));
  }
  return grams;
}

function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection++;
  return intersection / (setA.size + setB.size - intersection);
}

function loadDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const filepath = path.join(dirPath, filename);
      const raw = fs.readFileSync(filepath, 'utf8');
      const { data: fm, content: body } = matter(raw);
      return {
        filename,
        filepath,
        slug: filename.replace('.md', ''),
        fm,
        body,
        ngrams: getNgrams(body),
        wordCount: body.split(/\s+/).filter(Boolean).length,
      };
    });
}

function findDuplicates(items) {
  const groups = [];
  const flagged = new Set();

  // 1. Group by exact scientificName
  const byScientific = {};
  for (const item of items) {
    const key = normalize(item.fm.scientificName || '');
    if (!key) continue;
    if (!byScientific[key]) byScientific[key] = [];
    byScientific[key].push(item);
  }
  for (const [key, group] of Object.entries(byScientific)) {
    if (group.length < 2) continue;
    // Rank by word count desc — longer = more content = KEEP
    const ranked = [...group].sort((a, b) => b.wordCount - a.wordCount);
    const keep = ranked[0].slug;
    const remove = ranked.slice(1).map(i => i.slug);
    groups.push({
      type: 'exact_scientific_name',
      scientificName: key,
      items: ranked.map(i => ({ slug: i.slug, words: i.wordCount })),
      keep,
      delete: remove,
      recommendation: `KEEP ${keep} (longest). DELETE: ${remove.join(', ')} + add 301 → ${keep}`,
    });
    group.forEach(i => flagged.add(i.slug));
  }

  // 2. Group by normalized commonName (only unflagged)
  const byCommon = {};
  for (const item of items) {
    if (flagged.has(item.slug)) continue;
    const key = normalize(item.fm.commonName || '');
    if (!key) continue;
    if (!byCommon[key]) byCommon[key] = [];
    byCommon[key].push(item);
  }
  for (const [key, group] of Object.entries(byCommon)) {
    if (group.length < 2) continue;
    const ranked = [...group].sort((a, b) => b.wordCount - a.wordCount);
    const keep = ranked[0].slug;
    const remove = ranked.slice(1).map(i => i.slug);
    groups.push({
      type: 'exact_common_name',
      commonName: key,
      items: ranked.map(i => ({ slug: i.slug, words: i.wordCount })),
      keep,
      delete: remove,
      recommendation: `KEEP ${keep} (longest). DELETE: ${remove.join(', ')} + add 301 → ${keep}`,
    });
    group.forEach(i => flagged.add(i.slug));
  }

  // 3. Jaccard similarity on unflagged items (threshold 0.55)
  const unflagged = items.filter(i => !flagged.has(i.slug));
  for (let i = 0; i < unflagged.length; i++) {
    for (let j = i + 1; j < unflagged.length; j++) {
      const a = unflagged[i];
      const b = unflagged[j];
      if (flagged.has(a.slug) || flagged.has(b.slug)) continue;
      const score = jaccard(a.ngrams, b.ngrams);
      if (score >= 0.55) {
        const keep = a.wordCount >= b.wordCount ? a.slug : b.slug;
        const del  = keep === a.slug ? b.slug : a.slug;
        groups.push({
          type: 'content_similarity',
          score: Math.round(score * 100) / 100,
          items: [
            { slug: a.slug, words: a.wordCount },
            { slug: b.slug, words: b.wordCount },
          ],
          keep,
          delete: [del],
          recommendation: score > 0.70
            ? `KEEP ${keep}, DELETE ${del} + 301 redirect`
            : `REVIEW: Jaccard ${score} — consider rewriting ${del} to differentiate`,
        });
        flagged.add(del);
      }
    }
  }

  return groups;
}

// --- Main ---

console.log('Scanning content directories for duplicates...\n');

const allGroups = {};
const allSlugsToDelete = { plantsEN: [], articlesEN: [] };

for (const [key, dir] of Object.entries(DIRS)) {
  const items = loadDir(dir);
  const groups = findDuplicates(items);
  allGroups[key] = groups;

  if (key === 'plantsEN' || key === 'articlesEN') {
    const toDelete = groups.flatMap(g => g.delete || []);
    allSlugsToDelete[key] = toDelete;
  }

  console.log(`${key}: ${items.length} files → ${groups.length} duplicate group(s)`);
  for (const g of groups) {
    console.log(`  [${g.type}] ${g.recommendation}`);
  }
}

// Cross-language: EN delete → also flag ES counterpart
const crossLang = {
  plants: allSlugsToDelete.plantsEN.filter(
    slug => fs.existsSync(path.join(DIRS.plantsES, `${slug}.md`))
  ),
  articles: allSlugsToDelete.articlesEN.filter(
    slug => fs.existsSync(path.join(DIRS.articlesES, `${slug}.md`))
  ),
};

// Build complete deletion list
const toDelete = {
  'content/plants':      allSlugsToDelete.plantsEN.map(s => `${s}.md`),
  'content/articles':    allSlugsToDelete.articlesEN.map(s => `${s}.md`),
  'content/es/plants':   crossLang.plants.map(s => `${s}.md`),
  'content/es/articles': crossLang.articles.map(s => `${s}.md`),
};

// Build redirects list
const redirects = [];
for (const [key, groups] of Object.entries(allGroups)) {
  for (const g of groups) {
    if (!g.delete || !g.keep) continue;
    const prefix = key.includes('articles') ? '/articles' : '/plants';
    const langPrefix = key.includes('ES') ? '/es' : '';
    for (const del of g.delete) {
      redirects.push({
        source: `${langPrefix}${prefix}/${del}`,
        destination: `${langPrefix}${prefix}/${g.keep}`,
        permanent: true,
      });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  summary: Object.fromEntries(
    Object.entries(allGroups).map(([key, groups]) => [
      key,
      {
        total: loadDir(DIRS[key]).length,
        duplicateGroups: groups.length,
        slugsToDelete: groups.flatMap(g => g.delete || []),
      },
    ])
  ),
  duplicates: allGroups,
  toDelete,
  redirects,
  crossLanguageDeletions: crossLang,
};

const outputPath = path.join(ROOT, 'audit-report.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log('\n=== Files to delete ===');
for (const [dir, files] of Object.entries(toDelete)) {
  if (files.length) console.log(`  ${dir}: ${files.join(', ')}`);
}
console.log('\n=== Redirects to add ===');
for (const r of redirects) {
  console.log(`  ${r.source} → ${r.destination}`);
}
console.log(`\nFull report: audit-report.json`);
console.log(`Total files to delete: ${Object.values(toDelete).flat().length}`);
