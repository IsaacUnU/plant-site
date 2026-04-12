/**
 * Generate favicon files from the logo icon PNG.
 * Creates: favicon.ico (32x32), apple-touch-icon.png (180x180), icon-192.png, icon-512.png
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'public', 'images', 'logo', 'logo-icon.png');
const APP_DIR = path.join(__dirname, '..', 'src', 'app');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function generate() {
  const input = sharp(SOURCE);

  // favicon.ico replacement — 32x32 PNG used as favicon  
  await input.clone().resize(32, 32, { fit: 'cover' }).png().toFile(path.join(APP_DIR, 'icon.png'));
  console.log('✓ icon.png (32x32) → src/app/');

  // Apple Touch Icon — 180x180
  await input.clone().resize(180, 180, { fit: 'cover' }).png().toFile(path.join(APP_DIR, 'apple-icon.png'));
  console.log('✓ apple-icon.png (180x180) → src/app/');

  // PWA icons
  await input.clone().resize(192, 192, { fit: 'cover' }).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  console.log('✓ icon-192.png (192x192) → public/');

  await input.clone().resize(512, 512, { fit: 'cover' }).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  console.log('✓ icon-512.png (512x512) → public/');

  // OG image placeholder — 1200x630 with the logo centered
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 240, g: 253, b: 244, alpha: 1 } // #F0FDF4
    }
  })
    .composite([{
      input: await input.clone().resize(300, 300, { fit: 'cover' }).png().toBuffer(),
      gravity: 'centre'
    }])
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log('✓ og-image.png (1200x630) → public/');

  console.log('\n🎉 All favicon/icon assets generated!');
}

generate().catch(console.error);
