#!/usr/bin/env node
/**
 * fix-codeblock-wrapping.js
 * Fixes plant .md files where qwen2.5:7b wrapped its response in ```markdown...``` blocks.
 * Extracts the real content, re-parses YAML, merges with locked frontmatter fields.
 *
 * Usage: node scripts/fix-codeblock-wrapping.js
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'plants');

function stripCodeBlock(raw) {
  // Match ```markdown, ```yaml, ```md, or plain ``` at the start
  const match = raw.match(/^```(?:markdown|yaml|md|)?\r?\n([\s\S]*?)```\s*$/);
  if (match) return match[1].trim();
  // Also handle if only the opening fence exists (no closing)
  const openOnly = raw.match(/^```(?:markdown|yaml|md|)?\r?\n([\s\S]*)$/);
  if (openOnly) return openOnly[1].trim();
  return null;
}

const LOCKED_FIELDS = [
  'slug', 'scientificName', 'commonName', 'category',
  'difficulty', 'light', 'water', 'humidity', 'toxicity',
  'growthRate', 'tags', 'secondaryFunctions', 'datePublished',
  'image', 'imageAlt', 'imageCredit', 'imageCreditUrl', 'additionalImages',
];

let fixed = 0;
let skipped = 0;
let errors = 0;

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

for (const filename of files) {
  const filePath = path.join(CONTENT_DIR, filename);
  const slug = filename.replace('.md', '');

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    errors++;
    continue;
  }

  // Parse current file to get locked frontmatter
  let original;
  try {
    original = matter(raw);
  } catch {
    console.log(`[fix] YAML error reading original: ${slug}`);
    errors++;
    continue;
  }

  const body = original.content.trim();

  // Check if body starts with a code block
  if (!body.startsWith('```')) {
    skipped++;
    continue;
  }

  const extracted = stripCodeBlock(body);
  if (!extracted) {
    console.log(`[fix] Could not extract from code block: ${slug}`);
    errors++;
    continue;
  }

  // Parse the extracted content as a full markdown document with frontmatter
  let parsed;
  try {
    parsed = matter(extracted);
  } catch (e) {
    // Try fixing colon-in-title issue before giving up
    const fixedYaml = extracted.replace(/^(title|description):\s*(.+)$/m, (match, key, val) => {
      val = val.trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) return match;
      if (val.includes(':') || val.includes('#')) return `${key}: "${val.replace(/"/g, '\\"')}"`;
      return match;
    });
    try {
      parsed = matter(fixedYaml);
    } catch (e2) {
      console.log(`[fix] YAML parse failed after fix attempt: ${slug} — ${e2.message}`);
      errors++;
      continue;
    }
  }

  // Merge: locked fields from original, everything else from parsed (new content)
  const merged = { ...parsed.data };
  for (const field of LOCKED_FIELDS) {
    if (original.data[field] !== undefined) {
      merged[field] = original.data[field];
    }
  }

  // Ensure title and description exist
  if (!merged.title) {
    merged.title = parsed.data.title || `${original.data.commonName} Care Guide`;
  }
  if (!merged.description) {
    // Extract first sentence of body as description
    const firstSentence = parsed.content.replace(/^#+.*\n/m, '').replace(/\|.*\|/g, '').trim().split(/\.\s/)[0];
    merged.description = firstSentence ? `${firstSentence.slice(0, 155)}.` : `Complete care guide for ${original.data.commonName}.`;
  }

  const finalContent = matter.stringify(parsed.content.trim(), merged).trim() + '\n';

  fs.writeFileSync(filePath, finalContent);
  console.log(`[fix] ✓ Fixed: ${slug} (extracted from code block)`);
  fixed++;
}

console.log(`\n[fix] Done. Fixed: ${fixed} | Already clean: ${skipped} | Errors: ${errors}`);
