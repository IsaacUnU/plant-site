#!/usr/bin/env node
/**
 * backdate-content.js
 *
 * Spreads datePublished / dateModified across the past ~10 weeks so that
 * Google does not see 72 files published on 2 days.
 *
 * Today: 2026-04-23
 * Window: 2026-02-12 → 2026-04-18  (70 days, ending 5 days ago)
 *
 * Usage:  node scripts/backdate-content.js
 * Dry-run: node scripts/backdate-content.js --dry-run
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ─── Configuration ──────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');

const CONTENT_DIRS = [
  path.join(__dirname, '..', 'content', 'plants'),
  path.join(__dirname, '..', 'content', 'articles'),
];

// Window boundaries (inclusive)
const START_DATE = new Date('2026-02-12T00:00:00.000Z'); // day 0
const END_DATE   = new Date('2026-04-18T00:00:00.000Z'); // day 65

// ─── Deterministic PRNG (seeded) ────────────────────────────────────────────
// Simple mulberry32 — fast, seeded, no dependencies.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z));
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// Seed chosen so the sequence is fixed across runs.
const rand = mulberry32(0xDEADBEEF);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Add `days` calendar days to a Date, return new Date. */
function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Day-of-week for a UTC date: 0 = Sunday, 6 = Saturday. */
function utcDow(date) {
  return date.getUTCDay();
}

/** Build a pool of publication slots across the window.
 *
 *  Rules:
 *    - Monday–Thursday : weight 3  → 3 tickets in the pool
 *    - Friday          : weight 2
 *    - Saturday–Sunday : weight 1
 *    - Skip ~20 % of weekdays randomly to leave gaps (0-post days)
 *
 *  We want at least 72 slots; if after pruning we have fewer we add extras.
 */
function buildDatePool(totalFiles) {
  const slots = [];
  const totalDays = Math.round((END_DATE - START_DATE) / 86400000) + 1; // inclusive

  for (let i = 0; i < totalDays; i++) {
    const d   = addDays(START_DATE, i);
    const dow = utcDow(d);

    let weight;
    if      (dow === 0 || dow === 6) weight = 1; // weekend
    else if (dow === 5)              weight = 2; // Friday
    else                             weight = 3; // Mon–Thu

    // Skip this day with probability based on day type
    const skipProb = (dow === 0 || dow === 6) ? 0.55 : 0.30;
    if (rand() < skipProb) continue;

    // Add `weight` copies to simulate days where 1-2 items publish
    for (let w = 0; w < weight; w++) {
      slots.push(d);
    }
  }

  // Ensure we have enough slots; pad with copies of existing slots if needed
  while (slots.length < totalFiles) {
    const pick = slots[Math.floor(rand() * slots.length)];
    slots.push(pick);
  }

  // Shuffle with Fisher-Yates using our seeded RNG
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  // Sort back to chronological — we'll assign in order
  slots.sort((a, b) => a - b);

  return slots;
}

/** Format a Date as an ISO-8601 string (UTC midnight). */
function toISO(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, '.000Z');
}

/** Collect + sort .md files from a directory. */
function collectFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => path.join(dir, f));
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  // 1. Collect all files (sorted alphabetically within each folder)
  const allFiles = [];
  for (const dir of CONTENT_DIRS) {
    allFiles.push(...collectFiles(dir));
  }

  console.log(`Found ${allFiles.length} markdown files.`);

  // 2. Build date pool
  const datePool = buildDatePool(allFiles.length);

  // 3. Take the first N dates (already sorted chronologically)
  const assignedDates = datePool.slice(0, allFiles.length);

  // 4. Assign dates and update frontmatter
  const MODIFY_PROB = 0.20; // ~20% of files get a later dateModified
  const summary = [];

  allFiles.forEach((filePath, idx) => {
    const published = assignedDates[idx];

    // dateModified: 20% chance it's 3–14 days after published
    let modified = published;
    if (rand() < MODIFY_PROB) {
      const extraDays = 3 + Math.floor(rand() * 12); // 3–14
      const candidate = addDays(published, extraDays);
      // Cap at END_DATE so we don't exceed the window
      modified = candidate <= END_DATE ? candidate : END_DATE;
    }

    const pubISO = toISO(published);
    const modISO = toISO(modified);

    const raw      = fs.readFileSync(filePath, 'utf8');
    const parsed   = matter(raw);
    const oldPub   = parsed.data.datePublished || '(none)';
    const oldMod   = parsed.data.dateModified  || '(none)';

    parsed.data.datePublished = pubISO;
    parsed.data.dateModified  = modISO;

    const updated = matter.stringify(parsed.content, parsed.data);
    const rel = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');

    summary.push({ file: rel, oldPub, oldMod, newPub: pubISO, newMod: modISO });

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  });

  // 5. Print summary
  const label = DRY_RUN ? '[DRY RUN] ' : '';
  console.log(`\n${label}Date assignment summary:\n`);
  console.log(
    `${'File'.padEnd(55)} ${'Old Published'.padEnd(32)} New Published              New Modified`
  );
  console.log('─'.repeat(140));

  for (const row of summary) {
    console.log(
      `${row.file.padEnd(55)} ${String(row.oldPub).padEnd(32)} ${row.newPub.padEnd(27)} ${row.newMod}`
    );
  }

  const modifiedCount = summary.filter(r => r.newPub !== r.newMod).length;
  console.log(`\n${label}Total files: ${summary.length}`);
  console.log(`${label}Files with later dateModified: ${modifiedCount}`);

  // Distribution report
  const dateCounts = {};
  for (const row of summary) {
    const day = row.newPub.slice(0, 10);
    dateCounts[day] = (dateCounts[day] || 0) + 1;
  }
  const days = Object.keys(dateCounts).sort();
  console.log(`\n${label}Publishing distribution (${days.length} unique days):`);
  for (const day of days) {
    const bar = '█'.repeat(dateCounts[day]);
    console.log(`  ${day}  ${bar} (${dateCounts[day]})`);
  }

  if (DRY_RUN) {
    console.log('\nDry run complete — no files were modified.');
  } else {
    console.log('\nAll files updated successfully.');
  }
}

main();
