#!/usr/bin/env node
/**
 * fix-credentials.js
 *
 * Removes "As a certified horticulturist, I..." phrases from all
 * existing article content files and replaces with brand voice.
 *
 * Usage: node scripts/fix-credentials.js [--dry-run]
 */

const fs   = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');

// Ordered replacements — more specific patterns first
const REPLACEMENTS = [
  // Intro openers
  [
    /As a certified horticulturist,\s+I['']ve seen many (plant enthusiasts|beginners|people)/gi,
    'Many plant enthusiasts'
  ],
  [
    /As a certified horticulturist,\s+I['']ve seen (firsthand |many |numerous )?/gi,
    'In practice, '
  ],
  [
    /As a certified horticulturist,\s+I['']ve worked with (numerous |a wide range of |various )?/gi,
    'Working with '
  ],
  [
    /As a certified horticulturist,\s+I['']ve spent years (studying|perfecting|learning|researching)/gi,
    (_, verb) => `Years of research into plant care ${verb === 'perfecting' ? 'has refined' : 'has shown'}`
  ],
  [
    /As a certified horticulturist,\s+I can attest (to |that )?/gi,
    'The evidence shows '
  ],
  [
    /As a certified horticulturist,\s+I recommend\b/gi,
    'The recommendation here'
  ],
  [
    /As a certified horticulturist,\s+I highly recommend\b/gi,
    'The recommendation'
  ],
  [
    /As a certified horticulturist,\s+I['']m (excited|confident|here) (to share|that)\b/gi,
    (_, adj, verb) => verb === 'to share' ? 'This guide shares' : 'The guidance here confirms'
  ],
  [
    /As a certified horticulturist,\s+I (know|understand|believe)\b/gi,
    'Plant care research shows'
  ],
  // Trailing sign-off patterns (end of paragraph)
  [
    /\.\s+As a certified horticulturist,\s+I (recommend|suggest) (taking|staying|investing)/gi,
    (_, verb, gerund) => `. The best approach is ${gerund}`
  ],
  [
    /\.\s+As a certified horticulturist,\s+I['']m confident that/gi,
    '. The good news is that'
  ],
  [
    /\.\s+As a certified horticulturist,\s+I can (attest|confirm) that/gi,
    '. Experience confirms that'
  ],
  // Fallback: any remaining instance
  [
    /As a certified horticulturist,\s+I/gi,
    'At PlantCare Central, we'
  ],
  // Also clean "As a fellow plant lover, I..."
  [
    /As a fellow plant lover,\s+I\b/gi,
    'As a plant enthusiast, you'
  ],
  // Clean possessive "my expertise"
  [
    /I['']ll share my expertise with you[,.]/gi,
    'this guide covers the details.'
  ],
  [
    /\bmy expertise\b/gi,
    'the research'
  ],
  // Clean first-person "I've been there"
  [
    /I['']ve been there[^.]*\./gi,
    'This is a common experience.'
  ],
];

function applyReplacements(text) {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    if (typeof replacement === 'function') {
      result = result.replace(pattern, replacement);
    } else {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
let changed = 0;

for (const file of files) {
  const filePath = path.join(ARTICLES_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');

  // Only process the content body (after frontmatter) to avoid touching YAML
  const fmMatch = original.match(/^---\n[\s\S]*?\n---\n/);
  if (!fmMatch) continue;

  const frontmatter = fmMatch[0];
  const body = original.slice(frontmatter.length);
  const fixedBody = applyReplacements(body);

  if (fixedBody !== body) {
    changed++;
    const finalContent = frontmatter + fixedBody;
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
    }
    console.log(`${DRY_RUN ? '[DRY RUN] Would fix' : 'Fixed'}: ${file}`);
  }
}

console.log(`\n${DRY_RUN ? '[DRY RUN] Would update' : 'Updated'} ${changed}/${files.length} article files.`);
if (DRY_RUN) console.log('Run without --dry-run to apply changes.');
