import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.join(import.meta.dirname, '..'));
const STATIC_PAGES_DIR = path.join(ROOT, 'src', 'data', 'static-pages');
const DEFAULT_LOCALES = ['de', 'en'];

const localesEnv = process.env.ENABLED_LOCALES?.trim();
const enabledLocales = localesEnv
  ? Array.from(new Set(localesEnv.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)))
  : DEFAULT_LOCALES;

const requiredSlugs = ['agb', 'datenschutz', 'impressum', 'faq', 'team', 'zertifizierungen'];

function existsAny(candidates) {
  return candidates.some((candidate) => fs.existsSync(path.join(STATIC_PAGES_DIR, candidate)));
}

function candidatesFor(slug, locale) {
  const list = [`${slug}.${locale}.md`, `${slug}-${locale}.md`];
  if (locale === 'de') {
    list.push(`${slug}.md`);
  }
  return list;
}

const missing = [];

for (const slug of requiredSlugs) {
  for (const locale of enabledLocales) {
    const candidates = candidatesFor(slug, locale);
    if (existsAny(candidates)) continue;
    missing.push({ slug, locale, candidates });
  }
}

if (missing.length > 0) {
  console.error('Missing static-page translations:');
  for (const item of missing) {
    console.error(`- ${item.slug} (${item.locale}) -> ${item.candidates.join(', ')}`);
  }
  process.exit(1);
}

console.log(`OK: static-page translations complete for locales: ${enabledLocales.join(', ')}`);
