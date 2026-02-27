#!/usr/bin/env node
/**
 * Generiert Markdown-Dateien für alle Seiten aus den gescrapten Full-JSONs.
 * Ersetzt externe Bild-URLs durch lokale Pfade.
 * Ersetzt interne Links (https://www.microvista.de/...) durch relative Links.
 *
 * Ausgabe:
 * - src/data/static-pages/[slug].md  (für loadStaticPage())
 * - src/data/pruefaufgaben/[slug].md (für Prüfaufgaben-Seiten)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FULL_DIR = join(__dirname, '..', 'scraped-content', 'full');
const STATIC_DIR = join(__dirname, '..', 'src', 'data', 'static-pages');
const IMAGE_MAP = JSON.parse(readFileSync(join(FULL_DIR, '_image-map.json'), 'utf8'));

// Erstelle Ausgabe-Verzeichnis
mkdirSync(STATIC_DIR, { recursive: true });

function processMarkdown(markdown) {
  if (!markdown) return '';

  // 1. Externe Bild-URLs → lokale Pfade
  let md = markdown;
  for (const [extUrl, localPath] of Object.entries(IMAGE_MAP)) {
    md = md.replaceAll(extUrl, localPath);
  }

  // 2. Verbleibende externe microvista Bild-URLs generisch ersetzen
  md = md.replace(
    /https:\/\/www\.microvista\.de\/wp-content\/uploads\/([^)\s"']+)/g,
    '/images/wp/$1'
  );

  // 3. Interne Links umschreiben (microvista.de → relativ)
  md = md.replace(
    /https:\/\/www\.microvista\.de\/(kontakt|impressum|datenschutzerklaerung|agb|team|faq|newsroom|zertifizierungen|beitraege|newsletter)\//g,
    '/$1/'
  );
  md = md.replace(
    /https:\/\/www\.microvista\.de\//g,
    '/'
  );

  // 4. Mehrfache Leerzeilen
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

// Alle Dateien landen in src/data/static-pages/ mit eindeutigen Namen
// Naming-Convention:
//   Hauptseiten:      faq-de.md, team-de.md, etc.
//   Dienstleistungen: dienstleistung-ct-labor.md, etc.
//   Prüfaufgaben:     pruefaufgabe-porositatsanalyse.md, etc.
const PAGE_MAP = [
  // Statische Hauptseiten
  { slug: 'index', outFile: 'index-homepage.md' },
  { slug: 'faq', outFile: 'faq-de.md' },
  { slug: 'team', outFile: 'team-de.md' },
  { slug: 'kontakt', outFile: 'kontakt-de.md' },
  { slug: 'zertifizierungen', outFile: 'zertifizierungen-de.md' },
  { slug: 'newsroom', outFile: 'newsroom-de.md' },
  { slug: 'agb', outFile: 'agb.md' },
  { slug: 'datenschutz', outFile: 'datenschutz.md' },
  { slug: 'impressum', outFile: 'impressum.md' },
  { slug: 'serienpruefung', outFile: 'zerstoerungsfreie-serienpruefung-de.md' },
  { slug: 'end-of-line-test', outFile: 'end-of-line-test-de.md' },
  // Dienstleistungen
  { slug: 'dienstleistungen', outFile: 'dienstleistung-index.md' },
  { slug: 'ct-labor', outFile: 'dienstleistung-ct-labor.md' },
  { slug: 'ct-datenauswertung', outFile: 'dienstleistung-ct-datenauswertung.md' },
  { slug: 'scanexpress', outFile: 'dienstleistung-scanexpress.md' },
  // Prüfaufgaben
  { slug: 'prufaufgaben', outFile: 'pruefaufgabe-index.md' },
  { slug: 'porositatsanalyse', outFile: 'pruefaufgabe-porositatsanalyse.md' },
  { slug: 'messung-wandstaerken', outFile: 'pruefaufgabe-messung-wandstaerken.md' },
  { slug: 'cad-soll-ist-vergleich', outFile: 'pruefaufgabe-cad-soll-ist-vergleich.md' },
  { slug: 'reverse-engineering', outFile: 'pruefaufgabe-reverse-engineering.md' },
  { slug: 'grat-kernreste-spaene', outFile: 'pruefaufgabe-grat-kernreste-spaene.md' },
  { slug: 'hairpin-statoren', outFile: 'pruefaufgabe-hairpin-statoren.md' },
  { slug: 'montage-fugekontrolle', outFile: 'pruefaufgabe-montage-fugekontrolle.md' },
  { slug: 'erstmusterpruefbericht', outFile: 'pruefaufgabe-erstmusterpruefbericht.md' },
  { slug: 'laminographie', outFile: 'pruefaufgabe-laminographie.md' },
  { slug: 'schweissnahtpruefung', outFile: 'pruefaufgabe-schweissnahtpruefung.md' },
  { slug: 'form-und-lagetoleranzen', outFile: 'pruefaufgabe-form-und-lagetoleranzen.md' },
  { slug: '3d-vermessung', outFile: 'pruefaufgabe-3d-vermessung.md' },
];

let ok = 0;
let fail = 0;

for (const { slug, outFile } of PAGE_MAP) {
  const jsonPath = join(FULL_DIR, `${slug}.json`);
  let data;
  try {
    data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch {
    console.log(`  FEHLT: ${slug}.json`);
    fail++;
    continue;
  }

  const processed = processMarkdown(data.markdown);
  const outPath = join(STATIC_DIR, outFile);
  writeFileSync(outPath, processed, 'utf8');

  const chars = processed.length;
  console.log(`✓ ${outFile} (${chars} Zeichen)`);
  ok++;
}

console.log(`\n=== Ergebnis: ${ok} OK, ${fail} Fehler ===`);
