#!/usr/bin/env node
/**
 * Generates a Tailwind-compatible CSV for bulk Pinterest pin import.
 * Usage: node scripts/generate-pinterest-csv.js
 * Output: scripts/pinterest-pins.csv
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantcarecentral.com';
const PLANTS_DIR = path.join(__dirname, '..', 'content', 'plants');

function getAllPlants() {
  return fs.readdirSync(PLANTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(PLANTS_DIR, f), 'utf8');
      const { data } = matter(raw);
      return data;
    })
    .filter(p => p.commonName && p.slug && p.image);
}

function escapeCsv(str) {
  if (!str) return '';
  return `"${String(str).replace(/"/g, '""')}"`;
}

function buildDescription(plant) {
  const icons = {
    easy: '🟢 Easy care',
    medium: '🟡 Moderate care',
    hard: '🔴 Advanced care',
  };
  const water = {
    daily: 'Daily',
    'every-2-3-days': 'Every 2-3 days',
    weekly: 'Weekly',
    'every-2-weeks': 'Every 2 weeks',
    monthly: 'Monthly',
  };
  return [
    plant.description,
    '',
    `${icons[plant.difficulty] || '🌿 Houseplant'}`,
    `💧 Water: ${water[plant.water] || plant.water}`,
    `☀️ Light: ${plant.light}`,
    `🐾 Pet safe: ${plant.toxicity === 'non-toxic' ? 'Yes ✅' : 'No ❌'}`,
    '',
    '🌿 Full care guide at PlantCare Central ↓',
  ].join('\n');
}

function main() {
  const plants = getAllPlants();
  console.log(`[csv] Found ${plants.length} plants with images`);

  const headers = ['Pin title', 'Pin description', 'Media URL', 'Website URL'];
  const rows = plants.map(plant => [
    escapeCsv(`${plant.commonName} Care Guide: How to Grow It Indoors`),
    escapeCsv(buildDescription(plant)),
    escapeCsv(plant.image),
    escapeCsv(`${SITE_URL}/plants/${plant.slug}`),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  const outPath = path.join(__dirname, 'pinterest-pins.csv');
  fs.writeFileSync(outPath, csv, 'utf8');
  console.log(`[csv] ✓ Saved: ${outPath}`);
  console.log(`[csv] ${plants.length} pins ready to import into Tailwind`);
}

main();
