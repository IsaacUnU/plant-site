#!/usr/bin/env node
/**
 * Pinterest Pin Creator — PlantCare Central
 * Creates Pinterest pins for each plant guide to drive traffic from Pinterest.
 *
 * Usage:
 *   node scripts/pinterest-pins.js              → pin next 5 unpinned plants
 *   node scripts/pinterest-pins.js --all        → pin all unpinned plants
 *   node scripts/pinterest-pins.js --slug golden-pothos → pin a specific plant
 *
 * Env vars required:
 *   PINTEREST_ACCESS_TOKEN — OAuth Bearer token from Pinterest Developer portal
 *   PINTEREST_BOARD_ID     — ID of the board to pin to (found in board URL)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GITHUB ACTIONS INTEGRATION
 * Add the following step to .github/workflows/pipeline.yml to run weekly:
 *
 * # Add this schedule to the top-level `on.schedule` array:
 * #   - cron: '0 11 * * 1'   # Every Monday at 11:00 UTC
 *
 *   - name: Create Pinterest pins (Weekly, Mondays only)
 *     if: github.event_name == 'schedule'
 *     run: node scripts/pinterest-pins.js
 *     env:
 *       PINTEREST_ACCESS_TOKEN: ${{ secrets.PINTEREST_ACCESS_TOKEN }}
 *       PINTEREST_BOARD_ID: ${{ secrets.PINTEREST_BOARD_ID }}
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ---------------------------------------------------------------------------
// Load .env.local (same pattern as generate-lists.js)
// ---------------------------------------------------------------------------
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'plants');
const PINNED_FILE = path.join(__dirname, 'pinterest-pinned.json');
const PINTEREST_API_URL = 'https://api.pinterest.com/v5/pins';
const SITE_URL = 'https://plantcarecentral.com';
const DEFAULT_BATCH_SIZE = 5;
const RATE_LIMIT_MS = 2000; // 2 seconds between pins

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadPinnedState() {
  if (!fs.existsSync(PINNED_FILE)) {
    return { pinned: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(PINNED_FILE, 'utf8'));
  } catch {
    console.warn('[pinterest] Warning: Could not parse pinterest-pinned.json — starting fresh.');
    return { pinned: [] };
  }
}

function savePinnedState(state) {
  fs.writeFileSync(PINNED_FILE, JSON.stringify(state, null, 2) + '\n');
}

function getAllPlants() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
      const { data } = matter(raw);
      return data;
    })
    .filter((p) => p.commonName && p.slug);
}

function buildPinPayload(plant, boardId) {
  return {
    board_id: boardId,
    title: `${plant.commonName} Care Guide: Everything You Need to Know`,
    description:
      `${plant.description}\n\n` +
      `✅ Light: ${plant.light}\n` +
      `💧 Water: ${plant.water}\n` +
      `⚠️ Toxicity: ${plant.toxicity}\n\n` +
      `Full care guide at PlantCare Central 🌿`,
    link: `${SITE_URL}/plants/${plant.slug}`,
    media_source: {
      source_type: 'image_url',
      url: plant.image,
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Pinterest API call
// ---------------------------------------------------------------------------

async function createPin(plant, accessToken, boardId) {
  const payload = buildPinPayload(plant, boardId);

  const response = await fetch(PINTEREST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Pinterest API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // --- Parse CLI args ---
  const args = process.argv.slice(2);
  const pinAll = args.includes('--all');
  const slugIndex = args.indexOf('--slug');
  const specificSlug = slugIndex !== -1 ? args[slugIndex + 1] : null;

  // --- Validate env vars ---
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  const boardId = process.env.PINTEREST_BOARD_ID;

  if (!accessToken || accessToken === 'your_pinterest_access_token_here') {
    console.error('[pinterest] ERROR: PINTEREST_ACCESS_TOKEN is not set. Add it to .env.local or as an environment variable.');
    process.exit(1);
  }
  if (!boardId || boardId === 'your_pinterest_board_id_here') {
    console.error('[pinterest] ERROR: PINTEREST_BOARD_ID is not set. Add it to .env.local or as an environment variable.');
    process.exit(1);
  }

  // --- Load state and plants ---
  const state = loadPinnedState();
  const allPlants = getAllPlants();

  if (allPlants.length === 0) {
    console.log('[pinterest] No plants found in content/plants/. Nothing to pin.');
    process.exit(0);
  }

  console.log(`[pinterest] Found ${allPlants.length} total plants.`);
  console.log(`[pinterest] Already pinned: ${state.pinned.length} plant(s).`);

  // --- Determine which plants to pin ---
  let plantsToPin;

  if (specificSlug) {
    // --slug mode: pin a single specific plant
    const found = allPlants.find((p) => p.slug === specificSlug);
    if (!found) {
      console.error(`[pinterest] ERROR: Plant with slug "${specificSlug}" not found in content/plants/.`);
      process.exit(1);
    }
    plantsToPin = [found];
    console.log(`[pinterest] Mode: single pin → ${found.commonName} (${specificSlug})`);
  } else {
    // Exclude already-pinned plants
    const unpinned = allPlants.filter((p) => !state.pinned.includes(p.slug));

    if (unpinned.length === 0) {
      console.log('[pinterest] All plants have already been pinned! Nothing left to do.');
      process.exit(0);
    }

    plantsToPin = pinAll ? unpinned : unpinned.slice(0, DEFAULT_BATCH_SIZE);
    const mode = pinAll ? '--all' : `next ${DEFAULT_BATCH_SIZE}`;
    console.log(`[pinterest] Mode: ${mode} → ${plantsToPin.length} plant(s) to pin.`);
  }

  // --- Process each plant ---
  let pinned = 0;
  let skipped = 0;
  let failed = 0;

  for (const plant of plantsToPin) {
    const label = `${plant.commonName} (${plant.slug})`;

    // Skip plants without an image
    if (!plant.image || plant.image.trim() === '') {
      console.warn(`[pinterest] SKIP — no image: ${label}`);
      skipped++;
      continue;
    }

    // Skip if already pinned (applies when using --slug on an already-pinned plant)
    if (state.pinned.includes(plant.slug)) {
      console.warn(`[pinterest] SKIP — already pinned: ${label}`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`[pinterest] Pinning: ${label} ... `);
      const result = await createPin(plant, accessToken, boardId);
      const pinId = result.id || 'unknown';
      console.log(`OK (pin ID: ${pinId})`);

      // Record as pinned
      state.pinned.push(plant.slug);
      savePinnedState(state);
      pinned++;

      // Rate limit — wait before next request (skip wait after the last plant)
      const isLast = plantsToPin.indexOf(plant) === plantsToPin.length - 1;
      if (!isLast) {
        await sleep(RATE_LIMIT_MS);
      }
    } catch (err) {
      console.log(`FAILED`);
      console.error(`[pinterest]   └─ Error for ${label}: ${err.message}`);
      failed++;
    }
  }

  // --- Summary ---
  console.log('');
  console.log('[pinterest] ─── Summary ──────────────────────────────────');
  console.log(`[pinterest]   Pinned:  ${pinned}`);
  console.log(`[pinterest]   Skipped: ${skipped}`);
  console.log(`[pinterest]   Failed:  ${failed}`);
  console.log(`[pinterest]   Total pinned to date: ${state.pinned.length}`);
  console.log('[pinterest] ─────────────────────────────────────────────');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[pinterest] FATAL:', err.message);
  process.exit(1);
});
