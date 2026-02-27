/**
 * Konvertiert scraped WP-Posts (JSON) → MDX-Dateien für Astro Content Collections
 *
 * DE: scraped-content/posts/beitraege__*.json → src/content/magazin/de/
 * EN: scraped-content/posts/en__posts__*.json → src/content/magazin/en/
 *
 * Ausführen: node scripts/convert-posts-to-mdx.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'scraped-content', 'posts');
const OUT_DE = join(ROOT, 'src', 'content', 'magazin', 'de');
const OUT_EN = join(ROOT, 'src', 'content', 'magazin', 'en');

mkdirSync(OUT_DE, { recursive: true });
mkdirSync(OUT_EN, { recursive: true });

/**
 * Kategorie anhand von Titel + Markdown bestimmen
 * Erlaubte Werte: technologie | branchen | case-studies | news | tipps
 */
function detectCategory(title, markdown) {
  const text = (title + ' ' + markdown).toLowerCase();

  // News / Firmen-News
  if (/newsroom|pressemitteilung|news|launch|einführung|stellt vor|trends \d{4}|marktentwicklung|ankündig|premiere/.test(text)) {
    return 'news';
  }
  // Case Studies / Erfahrungsberichte
  if (/case study|case-study|kundeneinsatz|erster einsatz|hairpin stator|scanexpress|mobiles ct|container|ergebnis bei|auswertung von|innovative methode/.test(text)) {
    return 'case-studies';
  }
  // Branchen
  if (/automobilindustrie|leichtmetallguss|eisenguss|batterie|aerospace|luft|raumfahrt|archaeologie|archäologie|medizin|medical|guss|casting/.test(text)) {
    return 'branchen';
  }
  // Tipps
  if (/tipps|tricks|leitfaden|guide|wie man|how to|schritt|checkliste|best practice|ablauf|vorteile|vergleich/.test(text)) {
    return 'tipps';
  }
  // Standard: Technologie
  return 'technologie';
}

/**
 * Datum aus scrapedAt extrahieren (oder Fallback auf groben Zeitpunkt)
 * Wenn kein scrapedAt, aus ogImage-URL versuchen (uploads/2024/06/...)
 */
function extractDate(post) {
  if (post.scrapedAt) {
    return post.scrapedAt.substring(0, 10); // YYYY-MM-DD
  }
  // Aus ogImage URL
  const match = post.ogImage?.match(/uploads\/(\d{4})\/(\d{2})\//);
  if (match) return `${match[1]}-${match[2]}-01`;
  return '2024-01-01';
}

/**
 * YAML-Strings korrekt escapen (für Frontmatter)
 * Löst Probleme mit Anführungszeichen, Doppelpunkten etc.
 */
function yamlStr(str) {
  if (!str) return '""';
  // Ersetze problematische Zeichen
  const escaped = String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Markdown-Inhalt bereinigen:
 * - WordPress-Abfragestring aus Bild-URLs entfernen
 * - Interne microvista.de Links auf relativen Pfad ändern
 */
function cleanMarkdown(markdown) {
  if (!markdown) return '';

  let md = markdown;

  // Interne Links: https://www.microvista.de/beitraege/slug/ → /magazin/slug
  md = md.replace(
    /https?:\/\/(?:www\.)?microvista\.de\/beitraege\/([^/\s)]+)\/?/g,
    '/magazin/$1'
  );
  // Interne Links: https://www.microvista.de/kontakt/ → /kontakt
  md = md.replace(
    /https?:\/\/(?:www\.)?microvista\.de\/([^\s)"]+?)\/?(?=[\s)"#]|$)/g,
    '/$1'
  );

  return md;
}

// ─── DE Posts ───────────────────────────────────────────────────────────────
const deFiles = readdirSync(POSTS_DIR).filter(f => f.startsWith('beitraege__') && f.endsWith('.json'));

let deCount = 0;
for (const file of deFiles) {
  const post = JSON.parse(readFileSync(join(POSTS_DIR, file), 'utf8'));

  // Slug ableiten: beitraege/3d-ct-auswertung → 3d-ct-auswertung
  const rawSlug = post.slug || '';
  const slug = rawSlug.replace(/^beitraege\//, '');
  if (!slug) continue;

  const category = detectCategory(post.title, post.markdown);
  const publishDate = extractDate(post);
  const body = cleanMarkdown(post.markdown);

  const mdx = `---
title: ${yamlStr(post.title)}
description: ${yamlStr(post.metaDescription || post.title)}
publishDate: ${publishDate}
author: "Microvista Team"
category: "${category}"
${post.ogImage ? `image:\n  src: ${yamlStr(post.ogImage)}\n  alt: ${yamlStr(post.title)}` : ''}
featured: false
draft: false
---

${body}
`;

  writeFileSync(join(OUT_DE, `${slug}.mdx`), mdx, 'utf8');
  deCount++;
}

// ─── EN Posts ───────────────────────────────────────────────────────────────
const enFiles = readdirSync(POSTS_DIR).filter(f => f.startsWith('en__posts__') && f.endsWith('.json'));

let enCount = 0;
for (const file of enFiles) {
  const post = JSON.parse(readFileSync(join(POSTS_DIR, file), 'utf8'));

  // Slug ableiten: en/posts/3d-ct-analysis-with-ai → 3d-ct-analysis-with-ai
  const rawSlug = post.slug || '';
  const slug = rawSlug.replace(/^en\/posts\//, '');
  if (!slug) continue;

  const category = detectCategory(post.title, post.markdown);
  const publishDate = extractDate(post);
  const body = cleanMarkdown(post.markdown);

  const mdx = `---
title: ${yamlStr(post.title)}
description: ${yamlStr(post.metaDescription || post.title)}
publishDate: ${publishDate}
author: "Microvista Team"
category: "${category}"
${post.ogImage ? `image:\n  src: ${yamlStr(post.ogImage)}\n  alt: ${yamlStr(post.title)}` : ''}
featured: false
draft: false
---

${body}
`;

  writeFileSync(join(OUT_EN, `${slug}.mdx`), mdx, 'utf8');
  enCount++;
}

console.log(`✅ Konvertierung abgeschlossen:`);
console.log(`   DE: ${deCount} Posts → src/content/magazin/de/`);
console.log(`   EN: ${enCount} Posts → src/content/magazin/en/`);
