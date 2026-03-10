/**
 * Fix image URLs in MDX files:
 * - https://www.microvista.de/wp-content/uploads/... → /images/wp/...
 * - /wp-content/uploads/... → /images/wp/...
 *
 * Uses image-url-map.json for exact matches, falls back to path rewriting.
 * Also checks if the local file actually exists.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

// Load URL map
const urlMap = JSON.parse(readFileSync(join(ROOT, 'scraped-content/image-url-map.json'), 'utf8'));

// Build lookup: remote URL → local path
const remoteToLocal = new Map();
for (const [remote, local] of Object.entries(urlMap)) {
  remoteToLocal.set(remote, local);
}

// Also build a filename-based fallback map
const filenameToLocal = new Map();
for (const [, local] of Object.entries(urlMap)) {
  const filename = local.split('/').pop();
  filenameToLocal.set(filename, local);
}

// Stats
let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;
let missingLocalFiles = [];

function processFile(filePath) {
  const original = readFileSync(filePath, 'utf8');
  let content = original;
  let replacements = 0;

  // Pattern 1: Absolute URLs → https://www.microvista.de/wp-content/uploads/...
  content = content.replace(
    /https?:\/\/(?:www\.)?microvista\.de\/wp-content\/uploads\/([^\s"')}\]]+)/g,
    (match, path) => {
      const localPath = remoteToLocal.get(match) || `/images/wp/${path}`;
      const fullLocalPath = join(ROOT, 'public', localPath);

      if (!existsSync(fullLocalPath)) {
        // Try filename fallback
        const filename = path.split('/').pop();
        const fallback = filenameToLocal.get(filename);
        if (fallback) {
          replacements++;
          return fallback;
        }
        missingLocalFiles.push({ file: filePath, url: match, attempted: localPath });
        // Still rewrite to local path (image may need to be downloaded)
      }
      replacements++;
      return localPath;
    }
  );

  // Pattern 2: Relative /wp-content/uploads/... paths
  content = content.replace(
    /(?<!=")\/wp-content\/uploads\/([^\s"')}\]]+)/g,
    (match, path) => {
      const localPath = `/images/wp/${path}`;
      const fullLocalPath = join(ROOT, 'public', localPath);

      if (!existsSync(fullLocalPath)) {
        const filename = path.split('/').pop();
        const fallback = filenameToLocal.get(filename);
        if (fallback) {
          replacements++;
          return fallback;
        }
        missingLocalFiles.push({ file: filePath, url: match, attempted: localPath });
      }
      replacements++;
      return localPath;
    }
  );

  // Also catch src: "/wp-content/... in frontmatter
  content = content.replace(
    /(?<=src:\s*["'])\/wp-content\/uploads\/([^\s"']+)/g,
    (match, path) => {
      const localPath = `/images/wp/${path}`;
      replacements++;
      return localPath;
    }
  );

  totalFiles++;

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    totalReplacements += replacements;
    console.log(`  ✓ ${filePath.replace(ROOT, '')} — ${replacements} Ersetzungen`);
  }
}

// Process all MDX files
console.log('=== Bild-URLs umschreiben: WP → lokal ===\n');

const dirs = [
  join(ROOT, 'src/content/magazin/de'),
  join(ROOT, 'src/content/magazin/en'),
];

for (const dir of dirs) {
  if (!existsSync(dir)) continue;
  console.log(`Verarbeite: ${dir.replace(ROOT, '')}`);
  for (const f of readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
    processFile(join(dir, f));
  }
}

// Also process data markdown files
const dataDirs = [
  join(ROOT, 'src/data/static-pages'),
  join(ROOT, 'src/data/pruefaufgaben'),
  join(ROOT, 'src/data/dienstleistungen'),
];

for (const dir of dataDirs) {
  if (!existsSync(dir)) continue;
  console.log(`Verarbeite: ${dir.replace(ROOT, '')}`);
  for (const f of readdirSync(dir).filter(f => f.endsWith('.md'))) {
    processFile(join(dir, f));
  }
}

console.log(`\n=== ERGEBNIS ===`);
console.log(`Dateien geprüft:    ${totalFiles}`);
console.log(`Dateien geändert:   ${modifiedFiles}`);
console.log(`URLs umgeschrieben: ${totalReplacements}`);

if (missingLocalFiles.length > 0) {
  console.log(`\n⚠ ${missingLocalFiles.length} Bilder lokal nicht gefunden:`);
  const unique = [...new Set(missingLocalFiles.map(m => m.attempted))];
  for (const p of unique.slice(0, 20)) {
    console.log(`  FEHLT: ${p}`);
  }
  if (unique.length > 20) console.log(`  ... und ${unique.length - 20} weitere`);
}
