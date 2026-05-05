#!/usr/bin/env node
/**
 * validate-post.js
 * Quality gate for AI-generated plant/article content.
 * Exits with code 1 if any check fails — blocks GitHub Action commit.
 *
 * Usage:
 *   node scripts/validate-post.js <filepath>
 *   node scripts/validate-post.js content/plants/golden-pothos.md
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { checkDuplicate } = require('./lib/dup-check');

const ROOT = path.join(__dirname, '..');

const RULES = {
  minWords:    1200,
  minH2:       5,
  minFaqPairs: 4,
};

function countWords(text) {
  return text.replace(/[#*`>_\[\]]/g, '').split(/\s+/).filter(Boolean).length;
}

function countH2(text) {
  return (text.match(/^##\s+\S/gm) || []).length;
}

function countFaqPairs(text) {
  // Bold question + answer on next line (existing pipeline format)
  const boldQ = (text.match(/\*\*[^*]+\*\*/g) || []).length;
  return boldQ;
}

function validate(filepath) {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(filepath)) {
    console.error(`[validate] File not found: ${filepath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filepath, 'utf8');
  const { data: fm, content: body } = matter(raw);
  const slug = path.basename(filepath, '.md');

  // 1 — Word count
  const words = countWords(body);
  if (words < RULES.minWords) {
    errors.push(`Word count too low: ${words} (minimum ${RULES.minWords})`);
  }

  // 2 — H2 count
  const h2s = countH2(body);
  if (h2s < RULES.minH2) {
    errors.push(`Too few H2 sections: ${h2s} (minimum ${RULES.minH2})`);
  }

  // 3 — FAQ pairs
  const faqPairs = countFaqPairs(body);
  if (faqPairs < RULES.minFaqPairs) {
    errors.push(`Too few FAQ bold Q&A pairs: ${faqPairs} (minimum ${RULES.minFaqPairs})`);
  }

  // 4 — Required frontmatter fields
  const required = ['title', 'slug', 'commonName', 'scientificName', 'description'];
  for (const field of required) {
    if (!fm[field]) errors.push(`Missing frontmatter field: "${field}"`);
  }

  // 5 — Title template variety check (warn if still "X Complete Care Guide")
  if (fm.title && /^.+Complete Care Guide$/i.test(fm.title.trim())) {
    warnings.push(`Title uses default template: "${fm.title}" — consider a more unique title`);
  }

  // 6 — Duplicate check against EN plants corpus
  const contentDir = path.join(ROOT, 'content', 'plants');
  if (filepath.includes('/plants/') || filepath.includes('\\plants\\')) {
    const dupResult = checkDuplicate(raw, contentDir, slug);
    if (dupResult.isDuplicate) {
      errors.push(
        `Duplicate detected: ${dupResult.reason} match with "${dupResult.matchedSlug}" (score: ${dupResult.score})`
      );
    }
  }

  // 7 — Description minimum length
  if (fm.description && fm.description.length < 80) {
    warnings.push(`Description too short: ${fm.description.length} chars (aim for 120-160)`);
  }

  // Report
  const status = errors.length === 0 ? '✓ PASS' : '✗ FAIL';
  console.log(`\n[validate] ${status}: ${path.basename(filepath)}`);
  console.log(`  Words: ${words} | H2s: ${h2s} | FAQ pairs: ${faqPairs}`);

  if (warnings.length) {
    for (const w of warnings) console.warn(`  ⚠ ${w}`);
  }

  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\n[validate] ${errors.length} error(s) — rejecting post.`);
    process.exit(1);
  }

  console.log(`[validate] All checks passed.\n`);
}

const filepath = process.argv[2];
if (!filepath) {
  console.error('Usage: node scripts/validate-post.js <filepath>');
  process.exit(1);
}

validate(path.resolve(filepath));
