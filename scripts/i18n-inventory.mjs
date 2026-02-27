import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.join(import.meta.dirname, '..'));
const SRC = path.join(ROOT, 'src');
const PAGES_DIR = path.join(SRC, 'pages');
const STATIC_PAGES_DIR = path.join(SRC, 'data', 'static-pages');

const HARD_CODE_PATTERNS = [
  { key: "locale === 'en'", regex: /locale\s*===\s*'en'/g },
  { key: "locale === 'de'", regex: /locale\s*===\s*'de'/g },
  { key: "as 'de' | 'en'", regex: /as\s*'de'\s*\|\s*'en'/g },
  { key: 'hardcoded /en/', regex: /["'`]\/en\//g },
];

function walk(dir, predicate) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, predicate));
      continue;
    }
    if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

const astroPages = walk(PAGES_DIR, (filePath) => filePath.endsWith('.astro'));
const staticPages = walk(STATIC_PAGES_DIR, (filePath) => filePath.endsWith('.md'));

const hardcodedHits = [];
for (const filePath of astroPages) {
  const content = read(filePath);
  for (const pattern of HARD_CODE_PATTERNS) {
    const matches = content.match(pattern.regex);
    if (!matches?.length) continue;
    hardcodedHits.push({
      file: relative(filePath),
      pattern: pattern.key,
      count: matches.length,
    });
  }
}

const staticByLocale = { de: 0, en: 0, fr: 0, es: 0, it: 0, legacy: 0 };
for (const filePath of staticPages) {
  const filename = path.basename(filePath);
  if (/\.(de|en|fr|es|it)\.md$/i.test(filename)) {
    const locale = filename.match(/\.(de|en|fr|es|it)\.md$/i)[1].toLowerCase();
    staticByLocale[locale] += 1;
    continue;
  }
  if (/-((de|en|fr|es|it))\.md$/i.test(filename)) {
    const locale = filename.match(/-((de|en|fr|es|it))\.md$/i)[1].toLowerCase();
    staticByLocale[locale] += 1;
    continue;
  }
  staticByLocale.legacy += 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  astroPageCount: astroPages.length,
  staticPageCount: staticPages.length,
  staticByLocale,
  hardcodedHits,
};

console.log(JSON.stringify(report, null, 2));
