#!/usr/bin/env node
/**
 * verify-images.js
 * Checks all existing additional plant images with Llama 4 Scout vision.
 * Sends images as base64 so no public URL needed.
 *
 * Usage:
 *   node scripts/verify-images.js          → report only
 *   node scripts/verify-images.js --delete → delete bad images automatically
 */

const fs    = require('fs');
const path  = require('path');
const matter = require('gray-matter');

const CONTENT_DIR  = path.join(__dirname, '..', 'content', 'plants');
const IMAGES_DIR   = path.join(__dirname, '..', 'public', 'images', 'plants');
const GROQ_API     = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const SUFFIXES     = ['-2', '-3', '-detail'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function verifyImageBase64(imagePath, commonName, scientificName, groqKey, attempt = 0) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64  = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  try {
    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            {
              type: 'text',
              text: `Does this image show a ${commonName} (${scientificName}) plant? Answer only YES or NO.`,
            },
          ],
        }],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (res.status === 429 && attempt < 4) {
      const wait = 20 + attempt * 15; // 20s, 35s, 50s, 65s
      process.stdout.write(` [rate limit, waiting ${wait}s]`);
      await sleep(wait * 1000);
      return verifyImageBase64(imagePath, commonName, scientificName, groqKey, attempt + 1);
    }

    if (!res.ok) {
      const err = await res.text();
      return { ok: null, raw: `API ${res.status}: ${err.slice(0, 60)}` };
    }

    const data  = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim().toUpperCase() || 'UNKNOWN';
    return { ok: answer.startsWith('YES'), raw: answer };
  } catch (err) {
    return { ok: null, raw: err.message };
  }
}

async function main() {
  const groqKey   = process.env.GROQ_API_KEY;
  const doDelete  = process.argv.includes('--delete');

  if (!groqKey) { console.error('GROQ_API_KEY not set'); process.exit(1); }

  const slugs = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  const good = [], bad = [], skip = [];
  let checked = 0;

  for (const slug of slugs) {
    const { data: fm } = matter(fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), 'utf8'));
    const commonName     = fm.commonName || slug.replace(/-/g, ' ');
    const scientificName = fm.scientificName || commonName;

    for (const suffix of SUFFIXES) {
      const diskPath = path.join(IMAGES_DIR, `${slug}${suffix}.jpg`);
      if (!fs.existsSync(diskPath)) continue;

      process.stdout.write(`Checking ${slug}${suffix}.jpg... `);
      const result = await verifyImageBase64(diskPath, commonName, scientificName, groqKey);
      checked++;

      if (result.ok === true) {
        console.log(`✓ YES`);
        good.push(`${slug}${suffix}.jpg`);
      } else if (result.ok === false) {
        console.log(`✗ NO — WRONG IMAGE`);
        bad.push(`${slug}${suffix}.jpg`);
        if (doDelete) {
          fs.unlinkSync(diskPath);
          console.log(`  → Deleted`);
        }
      } else {
        console.log(`? (${result.raw}) — skipped`);
        skip.push(`${slug}${suffix}.jpg`);
      }

      await sleep(8000); // vision API has lower rate limit — 8s between calls
    }
  }

  console.log('\n══════════════════════════════');
  console.log(`Checked: ${checked} | ✓ Good: ${good.length} | ✗ Bad: ${bad.length} | ? Unknown: ${skip.length}`);

  if (bad.length > 0) {
    console.log('\n✗ WRONG IMAGES (need re-download):');
    bad.forEach(f => console.log(`  ${f}`));
    if (!doDelete) {
      console.log('\nRun with --delete to remove them automatically, then re-run fetch-additional-images.js');
    }
  } else {
    console.log('\nAll images verified correctly!');
  }
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
