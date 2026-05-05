/**
 * dup-check.js
 * Shared Jaccard shingling utility — used by audit-duplicates.js and validate-post.js.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const JACCARD_THRESHOLD = 0.50;

function getNgrams(text, n = 5) {
  const words = text.toLowerCase().replace(/[#*`>_\[\]]/g, '').split(/\s+/).filter(Boolean);
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

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * Checks if newContent (raw markdown string) is a duplicate of anything in contentDir.
 * Returns { isDuplicate, reason, matchedSlug, score }
 */
function checkDuplicate(newContent, contentDir, skipSlug = null) {
  const { data: newFm, content: newBody } = matter(newContent);
  const newNgrams = getNgrams(newBody);
  const newScientific = normalize(newFm.scientificName || '');
  const newCommon = normalize(newFm.commonName || '');

  if (!fs.existsSync(contentDir)) return { isDuplicate: false };

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  for (const filename of files) {
    const slug = filename.replace('.md', '');
    if (skipSlug && slug === skipSlug) continue;

    let existing;
    try {
      existing = matter(fs.readFileSync(path.join(contentDir, filename), 'utf8'));
    } catch {
      continue;
    }

    const { data: exFm, content: exBody } = existing;

    // Exact scientificName match
    if (newScientific && newScientific === normalize(exFm.scientificName || '')) {
      return { isDuplicate: true, reason: 'exact_scientific_name', matchedSlug: slug, score: 1.0 };
    }

    // Exact commonName match
    if (newCommon && newCommon === normalize(exFm.commonName || '')) {
      return { isDuplicate: true, reason: 'exact_common_name', matchedSlug: slug, score: 1.0 };
    }

    // Jaccard body similarity
    const exNgrams = getNgrams(exBody);
    const score = jaccard(newNgrams, exNgrams);
    if (score >= JACCARD_THRESHOLD) {
      return { isDuplicate: true, reason: 'content_similarity', matchedSlug: slug, score: Math.round(score * 100) / 100 };
    }
  }

  return { isDuplicate: false };
}

module.exports = { checkDuplicate, getNgrams, jaccard, normalize, JACCARD_THRESHOLD };
