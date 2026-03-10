import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const html = readFileSync(join(ROOT, 'docs/content-audit.html'), 'utf8');
const match = html.match(/const DATA = (\[[\s\S]*?\]);\n/);
const data = JSON.parse(match[1]);

const problems = data.filter(d => d.status !== 'complete');
problems.sort((a, b) => a.overlap - b.overlap);

console.log('=== PROBLEMATISCHE EINTRÄGE (' + problems.length + ') ===\n');

for (const d of problems) {
  console.log('--- ' + d.status.toUpperCase() + ' | ' + d.lang.toUpperCase() + ' | ' + d.type + ' ---');
  console.log('  Slug:     ' + d.oldSlug);
  console.log('  Titel:    ' + d.title);
  console.log('  Overlap:  ' + d.overlap + '%');
  console.log('  Wörter:   WP=' + d.wpWordCount + ' Astro=' + d.astroWordCount);
  console.log('  Bilder:   WP=' + d.wpImageCount + ' Astro=' + d.astroImageCount + ' fehlend=' + d.missingImages.length);
  console.log('  Match:    ' + (d.matchKey || 'KEIN MATCH'));
  if (d.missingWords.length > 0) {
    console.log('  Keywords: ' + d.missingWords.slice(0, 15).join(', '));
  }
  console.log('');
}

// Group analysis
console.log('\n=== KATEGORIEN ===');

const categories = {
  'EN Pages ohne Match': problems.filter(d => d.lang === 'en' && d.status === 'missing'),
  'EN Pages schwach (<30%)': problems.filter(d => d.lang === 'en' && d.status === 'weak'),
  'EN Pages teilweise (30-84%)': problems.filter(d => d.lang === 'en' && d.status === 'partial'),
  'DE Pages schwach (<30%)': problems.filter(d => d.lang === 'de' && d.status === 'weak'),
  'DE Pages teilweise (30-84%)': problems.filter(d => d.lang === 'de' && d.status === 'partial'),
  'FR Pages': problems.filter(d => d.lang === 'fr'),
};

for (const [cat, items] of Object.entries(categories)) {
  if (items.length === 0) continue;
  console.log('\n' + cat + ' (' + items.length + '):');
  for (const d of items) {
    console.log('  ' + d.overlap + '% | ' + d.oldSlug + ' → ' + (d.matchKey || '???'));
  }
}

// Image analysis
console.log('\n\n=== BILDER-ANALYSE ===');
const totalWpImgs = data.reduce((s, d) => s + d.wpImageCount, 0);
const totalMissingImgs = data.reduce((s, d) => s + d.missingImages.length, 0);
const pagesWithMissingImgs = data.filter(d => d.missingImages.length > 0);
console.log('WP Bilder gesamt: ' + totalWpImgs);
console.log('Fehlende Bilder gesamt: ' + totalMissingImgs);
console.log('Seiten mit fehlenden Bildern: ' + pagesWithMissingImgs.length);

console.log('\nTop 20 Seiten mit meisten fehlenden Bildern:');
pagesWithMissingImgs
  .sort((a, b) => b.missingImages.length - a.missingImages.length)
  .slice(0, 20)
  .forEach(d => {
    console.log('  ' + d.missingImages.length + ' fehlend | ' + d.oldSlug + ' (' + d.title.substring(0, 50) + ')');
  });

// Word count analysis
console.log('\n\n=== WORT-DIFFERENZ ===');
console.log('Seiten wo Astro deutlich weniger Wörter hat als WP:');
data
  .filter(d => d.wpWordCount > 50 && d.astroWordCount > 0)
  .map(d => ({ ...d, diff: d.wpWordCount - d.astroWordCount, ratio: d.astroWordCount / d.wpWordCount }))
  .filter(d => d.ratio < 0.7)
  .sort((a, b) => a.ratio - b.ratio)
  .slice(0, 20)
  .forEach(d => {
    console.log('  ' + Math.round(d.ratio * 100) + '% | WP=' + d.wpWordCount + ' Astro=' + d.astroWordCount + ' | ' + d.oldSlug);
  });

// Detect content that's in WP markdown but NOT anywhere in Astro
console.log('\n\n=== DETAILVERGLEICH: FEHLENDE ABSÄTZE (Top 10 worst) ===');

const wpAll = JSON.parse(readFileSync(join(ROOT, 'scraped-content/all-content.json'), 'utf8'));

// For the 10 worst non-missing entries, show which paragraphs are missing
const worst = problems
  .filter(d => d.status !== 'missing' && d.matchKey)
  .sort((a, b) => a.overlap - b.overlap)
  .slice(0, 10);

for (const d of worst) {
  const wpEntry = wpAll.find(w => w.slug === d.oldSlug);
  if (!wpEntry) continue;

  console.log('\n--- ' + d.oldSlug + ' (Overlap: ' + d.overlap + '%) ---');

  // Split WP content into paragraphs
  const wpParagraphs = wpEntry.markdown
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30 && !p.startsWith('![')); // skip images and short lines

  // Read astro file
  let astroContent = '';
  if (d.matchPath) {
    try {
      astroContent = readFileSync(d.matchPath, 'utf8').toLowerCase();
    } catch(e) {
      // try with forward slashes
      const fixedPath = d.matchPath.replace(/\\/g, '/');
      try { astroContent = readFileSync(fixedPath, 'utf8').toLowerCase(); } catch(e2) {}
    }
  }

  let foundCount = 0;
  let missingParas = [];

  for (const para of wpParagraphs) {
    // Extract key phrases (first 40 chars without markdown)
    const clean = para.replace(/\*\*/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();
    const snippet = clean.substring(0, 60).toLowerCase();

    if (snippet.length < 15) continue;

    if (astroContent.includes(snippet)) {
      foundCount++;
    } else {
      missingParas.push(clean.substring(0, 120) + (clean.length > 120 ? '...' : ''));
    }
  }

  console.log('  Absätze: ' + wpParagraphs.length + ' gesamt, ' + foundCount + ' gefunden, ' + missingParas.length + ' fehlen');
  for (const p of missingParas.slice(0, 5)) {
    console.log('    FEHLT: "' + p + '"');
  }
}
