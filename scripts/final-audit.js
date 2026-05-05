const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const plantDir = path.join(__dirname, '..', 'content/plants');
const articleDir = path.join(__dirname, '..', 'content/articles');

const plants = fs.readdirSync(plantDir).filter(f => f.endsWith('.md'));
const articles = fs.readdirSync(articleDir).filter(f => f.endsWith('.md'));

console.log('=== FINAL AdSENSE AUDIT ===\n');

// 1. Content count
console.log('1. CONTENT FILES:');
console.log(`   Plants: ${plants.length}`);
console.log(`   Articles: ${articles.length}`);
console.log(`   Total: ${plants.length + articles.length}`);

// 2. Author check across all
let authorCount = 0;
let dateModDiffCount = 0;
let allWordCounts = [];

plants.forEach(f => {
  const raw = fs.readFileSync(path.join(plantDir, f), 'utf8');
  const { data: fm, content: body } = matter(raw);
  if (fm.author === 'Sarah Mitchell') authorCount++;
  if (fm.dateModified && fm.dateModified !== fm.datePublished) dateModDiffCount++;
  const words = body.replace(/[#*`>_\[\]]/g, '').split(/\s+/).filter(Boolean).length;
  allWordCounts.push(words);
});

articles.forEach(f => {
  const raw = fs.readFileSync(path.join(articleDir, f), 'utf8');
  const { data: fm, content: body } = matter(raw);
  if (fm.author === 'Sarah Mitchell') authorCount++;
  if (fm.dateModified && fm.dateModified !== fm.datePublished) dateModDiffCount++;
  const words = body.replace(/[#*`>_\[\]]/g, '').split(/\s+/).filter(Boolean).length;
  allWordCounts.push(words);
});

console.log(`\n2. AUTHOR: "${authorCount}/${plants.length + articles.length}" have author: "Sarah Mitchell"`);
console.log(`   Missing: ${plants.length + articles.length - authorCount}`);

// 3. Tables "Care at a Glance"
let careAtGlance = 0;
plants.forEach(f => {
  const raw = fs.readFileSync(path.join(plantDir, f), 'utf8');
  if (raw.includes('Care at a Glance')) careAtGlance++;
});
console.log(`\n3. "CARE AT A GLANCE" TABLE: ${careAtGlance}/${plants.length} plants`);

// 4. dateModified check
console.log(`\n4. dateModified != datePublished: ${dateModDiffCount}/${plants.length + articles.length}`);

// 5. Word count
const minWords = Math.min(...allWordCounts);
const avgWords = Math.round(allWordCounts.reduce((a, b) => a + b, 0) / allWordCounts.length);
const maxWords = Math.max(...allWordCounts);
console.log(`\n5. WORD COUNTS (ALL FILES):`);
console.log(`   Min: ${minWords}`);
console.log(`   Avg: ${avgWords}`);
console.log(`   Max: ${maxWords}`);
console.log(`   Files <800 words: ${allWordCounts.filter(w => w < 800).length}`);

// 6. Legal pages check (count files)
const hasPrivacy = fs.existsSync(path.join(__dirname, '..', 'src/app/privacy-policy/page.tsx'));
const hasPrivacyEs = fs.existsSync(path.join(__dirname, '..', 'src/app/es/privacy-policy/page.tsx'));
const hasTerms = fs.existsSync(path.join(__dirname, '..', 'src/app/terms/page.tsx'));
const hasTermsEs = fs.existsSync(path.join(__dirname, '..', 'src/app/es/terms/page.tsx'));
const hasAbout = fs.existsSync(path.join(__dirname, '..', 'src/app/about/page.tsx'));
const hasContact = fs.existsSync(path.join(__dirname, '..', 'src/app/contact/page.tsx'));

console.log(`\n6. LEGAL PAGES:`);
console.log(`   Privacy (EN): ${hasPrivacy ? '✓' : '✗'}`);
console.log(`   Privacy (ES): ${hasPrivacyEs ? '✓' : '✗'}`);
console.log(`   Terms (EN): ${hasTerms ? '✓' : '✗'}`);
console.log(`   Terms (ES): ${hasTermsEs ? '✓' : '✗'}`);
console.log(`   About: ${hasAbout ? '✓' : '✗'}`);
console.log(`   Contact: ${hasContact ? '✓' : '✗'}`);

// 7. AdSense check
const adsFileContent = fs.readFileSync(path.join(__dirname, '..', 'public/ads.txt'), 'utf8');
const hasPublisherId = adsFileContent.includes('pub-7863265866651285');
console.log(`\n7. ads.txt WITH PUBLISHER ID: ${hasPublisherId ? '✓' : '✗'}`);

// 8. Schema & components
const schemaFile = fs.readFileSync(path.join(__dirname, '..', 'src/lib/schema.ts'), 'utf8');
const hasPersonSchema = schemaFile.includes("'@type': 'Person'");
const authorBoxFile = fs.existsSync(path.join(__dirname, '..', 'src/components/AuthorBox.tsx'));
const consentFile = fs.existsSync(path.join(__dirname, '..', 'src/components/ConsentScripts.tsx'));
const cookieFile = fs.existsSync(path.join(__dirname, '..', 'src/components/CookieBanner.tsx'));

console.log(`\n8. TECHNICAL:`);
console.log(`   schema.ts has Person author: ${hasPersonSchema ? '✓' : '✗'}`);
console.log(`   AuthorBox.tsx exists: ${authorBoxFile ? '✓' : '✗'}`);
console.log(`   ConsentScripts.tsx exists: ${consentFile ? '✓' : '✗'}`);
console.log(`   CookieBanner.tsx exists: ${cookieFile ? '✓' : '✗'}`);

// 9. Pipeline & validation
const pipelineFile = fs.existsSync(path.join(__dirname, '..', '.github/workflows/pipeline.yml'));
const validateFile = fs.existsSync(path.join(__dirname, '..', 'scripts/validate-post.js'));
console.log(`\n9. PIPELINE:`);
console.log(`   pipeline.yml exists: ${pipelineFile ? '✓' : '✗'}`);
console.log(`   validate-post.js exists: ${validateFile ? '✓' : '✗'}`);

// 10. robots.ts & sitemap.ts
const robotsFile = fs.existsSync(path.join(__dirname, '..', 'src/app/robots.ts'));
const sitemapFile = fs.existsSync(path.join(__dirname, '..', 'src/app/sitemap.ts'));
console.log(`\n10. SEO:`)
console.log(`   robots.ts: ${robotsFile ? '✓' : '✗'}`);
console.log(`   sitemap.ts: ${sitemapFile ? '✓' : '✗'}`);

// 11. Redirects in next.config.ts
const configFile = fs.readFileSync(path.join(__dirname, '..', 'next.config.ts'), 'utf8');
const has301Redirects = configFile.includes('permanent: true');
console.log(`\n11. NEXT.CONFIG REDIRECTS:`);
console.log(`   Has 301 redirects: ${has301Redirects ? '✓' : '✗'}`);

console.log('\n=== SUMMARY ===');
const ready = authorCount > 90 && dateModDiffCount > 90 && minWords >= 800 && hasPrivacy && hasTerms && hasAbout && hasContact && hasPersonSchema && hasPublisherId;
console.log(`Ready for AdSense: ${ready ? '✓ YES' : '✗ NO'}`);
