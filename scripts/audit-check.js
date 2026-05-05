const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Get random plant articles
const plantDir = path.join(__dirname, '..', 'content/plants');
const articleDir = path.join(__dirname, '..', 'content/articles');

const plants = fs.readdirSync(plantDir).filter(f => f.endsWith('.md'));
const articles = fs.readdirSync(articleDir).filter(f => f.endsWith('.md'));

// Pick 5 random plants + 2 random articles
const randomPlants = plants.sort(() => Math.random() - 0.5).slice(0, 5);
const randomArticles = articles.sort(() => Math.random() - 0.5).slice(0, 2);

function countWords(text) {
  return text.replace(/[#*`>_\[\]]/g, '').split(/\s+/).filter(Boolean).length;
}

console.log('=== WORD COUNT & AUTHOR AUDIT ===\n');

const allFiles = [
  ...randomPlants.map(f => ({ type: 'plant', name: f, path: path.join(plantDir, f) })),
  ...randomArticles.map(f => ({ type: 'article', name: f, path: path.join(articleDir, f) }))
];

let totalWords = 0;
let totalFiles = allFiles.length;
let authorsOk = 0;
let tablesOk = 0;
let dateModOk = 0;
let filesUnder800 = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file.path, 'utf8');
  const { data: fm, content: body } = matter(content);
  const words = countWords(body);
  
  totalWords += words;
  
  // Check author
  if (fm.author === 'Sarah Mitchell') authorsOk++;
  
  // Check tables
  const tableCount = (body.match(/\|.*\|/g) || []).length;
  if (tableCount >= 1) tablesOk++;
  
  // Check dateModified
  if (fm.dateModified && fm.dateModified !== fm.datePublished) dateModOk++;
  
  // Track under 800
  if (words < 800) filesUnder800.push({ file: file.name, words });
  
  console.log(`${file.type.toUpperCase()}: ${file.name}`);
  console.log(`  Words: ${words} | Tables: ${tableCount} | Author: ${fm.author || 'MISSING'}`);
  console.log(`  dateModified: ${fm.dateModified || 'MISSING'} | datePublished: ${fm.datePublished}`);
});

console.log('\n=== SUMMARY ===');
console.log(`Total files checked: ${totalFiles}`);
console.log(`Average words: ${Math.round(totalWords / totalFiles)}`);
console.log(`Author "Sarah Mitchell": ${authorsOk}/${totalFiles}`);
console.log(`Has >=1 table: ${tablesOk}/${totalFiles}`);
console.log(`dateModified != datePublished: ${dateModOk}/${totalFiles}`);
console.log(`Files <800 words: ${filesUnder800.length}`);
if (filesUnder800.length > 0) {
  filesUnder800.forEach(f => console.log(`  - ${f.file}: ${f.words} words`));
}

// Quick check for files under 800 across ALL files
let allUnder800 = [];
plants.forEach(f => {
  const content = fs.readFileSync(path.join(plantDir, f), 'utf8');
  const { content: body } = matter(content);
  const words = countWords(body);
  if (words < 800) allUnder800.push({ file: f, words });
});

articles.forEach(f => {
  const content = fs.readFileSync(path.join(articleDir, f), 'utf8');
  const { content: body } = matter(content);
  const words = countWords(body);
  if (words < 800) allUnder800.push({ file: f, words });
});

console.log(`\nCHECK: All files <800 words: ${allUnder800.length} files`);
if (allUnder800.length > 0) {
  allUnder800.slice(0, 10).forEach(f => console.log(`  ${f.file}: ${f.words}`));
  if (allUnder800.length > 10) console.log(`  ... and ${allUnder800.length - 10} more`);
}
