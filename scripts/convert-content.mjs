#!/usr/bin/env node
/**
 * Convert scraped WordPress content into Astro Content Collections
 *
 * - Blog posts → src/content/magazin/{de,en}/*.mdx
 * - Press releases → src/content/magazin/{de,en}/*.mdx (category: news)
 * - Prüfaufgaben-Seiten → src/content/pruefaufgaben/*.yaml
 * - Branchen-Seiten → src/content/branchen/*.yaml
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// YAML wird manuell als String geschrieben

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRAPED_DIR = join(__dirname, '..', 'scraped-content');
const CONTENT_DIR = join(__dirname, '..', 'src', 'content');

// Kategorie-Mapping für Blog-Posts
function guessCategory(title, slug, markdown) {
  const text = `${title} ${slug} ${markdown}`.toLowerCase();
  if (text.includes('presse') || text.includes('press') || slug.includes('presse')) return 'news';
  if (text.includes('case study') || text.includes('kundeneinsatz') || text.includes('hairpin') || text.includes('zylinderkopf')) return 'case-studies';
  if (text.includes('markttrend') || text.includes('market trend') || text.includes('insights') || text.includes('einblicke')) return 'technologie';
  if (text.includes('automobilindustrie') || text.includes('automotive') || text.includes('pharma') || text.includes('batterie')) return 'branchen';
  if (text.includes('ablauf') || text.includes('steps') || text.includes('überblick') || text.includes('vergleich') || text.includes('methods')) return 'tipps';
  return 'news';
}

// Slug aus URL-Pfad ableiten (nur den letzten Teil)
function cleanSlug(slug) {
  // "beitraege/palaeontologie-trifft-industrielle-ct" → "palaeontologie-trifft-industrielle-ct"
  // "en/posts/palaeontology-meets-industrial-ct" → "palaeontology-meets-industrial-ct"
  const parts = slug.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
}

// Datum aus gescraptem Content oder Fallback
function getPublishDate(item) {
  // Aus den posts_full.json bekannten Daten oder Fallback
  return '2024-01-01';
}

// Bild-URLs auf lokale Pfade umschreiben
function rewriteImageUrls(markdown) {
  return markdown.replace(
    /https:\/\/www\.microvista\.de\/wp-content\/uploads\//g,
    '/images/wp/'
  );
}

function convertPosts() {
  console.log('\n--- Blog-Posts konvertieren ---\n');

  const postsDir = join(SCRAPED_DIR, 'posts');
  const pressDir = join(SCRAPED_DIR, 'press');
  const allPostFiles = [
    ...readdirSync(postsDir).map(f => join(postsDir, f)),
    ...readdirSync(pressDir).map(f => join(pressDir, f)),
  ].filter(f => f.endsWith('.json'));

  // Versuche Datumsinformationen aus posts_full.json zu laden
  let dateMap = {};
  try {
    const postsFull = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'blog', 'posts_full.json'), 'utf-8'));
    for (const p of postsFull) {
      const s = cleanSlug(p.slug);
      dateMap[s] = p.date;
    }
  } catch { /* OK, Fallback-Daten verwenden */ }

  let deCount = 0;
  let enCount = 0;

  for (const file of allPostFiles) {
    const item = JSON.parse(readFileSync(file, 'utf-8'));
    if (item.error || !item.markdown || item.markdownLength < 50) continue;

    const slug = cleanSlug(item.slug);
    const lang = item.lang;
    const category = guessCategory(item.title, item.slug, item.markdown);

    // Datum aus dateMap oder Fallback
    const dateStr = dateMap[slug] || '2024-06-01 12:00:00';
    let publishDate = new Date(dateStr.replace(' ', 'T') + 'Z');
    if (isNaN(publishDate.getTime())) publishDate = new Date('2024-06-01');

    // Markdown mit lokalen Bild-URLs
    const markdown = rewriteImageUrls(item.markdown);

    // Featured Image
    let imageBlock = '';
    if (item.ogImage) {
      const localOgImage = item.ogImage.replace('https://www.microvista.de/wp-content/uploads/', '/images/wp/');
      imageBlock = `image:\n  src: "${localOgImage}"\n  alt: "${item.title.replace(/"/g, '\\"')}"`;
    }

    // MDX Frontmatter
    const frontmatter = [
      '---',
      `title: "${item.title.replace(/"/g, '\\"')}"`,
      `description: "${(item.metaDescription || item.title).replace(/"/g, '\\"')}"`,
      `publishDate: ${publishDate.toISOString().split('T')[0]}`,
      `author: "Microvista Team"`,
      `category: "${category}"`,
      imageBlock,
      `draft: false`,
      '---',
    ].filter(Boolean).join('\n');

    const mdxContent = `${frontmatter}\n\n${markdown}\n`;

    // Ausgabepfad
    const outputDir = join(CONTENT_DIR, 'magazin', lang);
    mkdirSync(outputDir, { recursive: true });
    const outputFile = join(outputDir, `${slug}.mdx`);
    writeFileSync(outputFile, mdxContent);

    if (lang === 'de') deCount++;
    else enCount++;
  }

  console.log(`Blog-Posts: ${deCount} DE, ${enCount} EN`);
}

function convertPruefaufgaben() {
  console.log('\n--- Prüfaufgaben konvertieren ---\n');

  const pagesDir = join(SCRAPED_DIR, 'pages');
  const files = readdirSync(pagesDir).filter(f => f.endsWith('.json'));

  // Prüfaufgaben-Seiten identifizieren (DE nur)
  const pruefaufgabenFiles = files.filter(f =>
    f.includes('prufaufgaben__') && !f.startsWith('en__')
  );

  // Slug → Name Mapping
  const nameMap = {
    'porositatsanalyse': { name: 'Porositätsanalyse', slug: 'porositaetsanalyse' },
    'messung-wandstaerken': { name: 'Wanddickenmessung', slug: 'wanddickenmessung' },
    'cad-soll-ist-vergleich': { name: 'CAD Soll-Ist-Vergleich', slug: 'cad-soll-ist-vergleich' },
    'reverse-engineering': { name: 'Reverse Engineering', slug: 'reverse-engineering' },
    'grat-kernreste-spaene': { name: 'Grat, Kernreste & Späne', slug: 'grat-kernreste-spaene' },
    'qualitatssicherung-bei-hairpin-statoren': { name: 'Hairpin-Stator-Prüfung', slug: 'hairpin-stator-pruefung' },
    'montage-fugekontrolle': { name: 'Montage- & Fügekontrolle', slug: 'montage-fuegekontrolle' },
    'erstmusterpruefbericht': { name: 'Erstmusterprüfbericht (EMPB)', slug: 'erstmusterpruefbericht' },
    'laminographie': { name: 'Laminographie', slug: 'laminographie' },
    'schweissnahtpruefung': { name: 'Schweißnahtprüfung', slug: 'schweissnahtpruefung' },
    'form-und-lagetoleranzen': { name: 'Form- und Lagetoleranzen', slug: 'form-und-lagetoleranzen' },
    '3d-vermessung': { name: '3D-Vermessung', slug: '3d-vermessung' },
  };

  const outputDir = join(CONTENT_DIR, 'pruefaufgaben');
  mkdirSync(outputDir, { recursive: true });
  let count = 0;

  for (const file of pruefaufgabenFiles) {
    const item = JSON.parse(readFileSync(join(pagesDir, file), 'utf-8'));
    if (item.error) continue;

    // Slug aus Dateiname extrahieren
    const lastPart = file.replace('.json', '').split('__').pop();
    const mapping = nameMap[lastPart];
    if (!mapping) {
      console.warn(`  Unbekannte Prüfaufgabe: ${lastPart}`);
      continue;
    }

    // Content-Abschnitte aus Markdown extrahieren
    const sections = item.markdown.split(/\n## /);
    const mainContent = sections[0] || item.markdown;

    const yaml = {
      name: mapping.name,
      slug: mapping.slug,
      description: item.metaDescription || item.title,
      heroImage: item.ogImage ? item.ogImage.replace('https://www.microvista.de/wp-content/uploads/', '/images/wp/') : '/images/placeholder.jpg',
      whatIs: mainContent.substring(0, 500).trim(),
      howItWorks: sections.length > 1 ? sections[1]?.substring(0, 500).trim() || '' : '',
      benefits: ['Zerstörungsfreie Prüfung', 'Hochauflösende 3D-Daten', 'Schnelle Ergebnisse', 'ISO-konforme Auswertung'],
      applications: ['Automotive', 'Luftfahrt', 'Medizintechnik', 'Elektronik'],
      relatedBranchen: ['automotive'],
      relatedMaterialien: ['aluminium'],
      faq: [],
      seo: {
        title: item.title || mapping.name,
        description: item.metaDescription || `${mapping.name} — industrielle CT-Prüfung bei Microvista`,
      }
    };

    // YAML schreiben
    const yamlStr = [
      `name: "${yaml.name}"`,
      `slug: "${yaml.slug}"`,
      `description: "${yaml.description.replace(/"/g, '\\"')}"`,
      `heroImage: "${yaml.heroImage}"`,
      `whatIs: |`,
      ...yaml.whatIs.split('\n').map(l => `  ${l}`),
      `howItWorks: |`,
      ...yaml.howItWorks.split('\n').map(l => `  ${l}`),
      `benefits:`,
      ...yaml.benefits.map(b => `  - "${b}"`),
      `applications:`,
      ...yaml.applications.map(a => `  - "${a}"`),
      `relatedBranchen:`,
      ...yaml.relatedBranchen.map(b => `  - "${b}"`),
      `relatedMaterialien:`,
      ...yaml.relatedMaterialien.map(m => `  - "${m}"`),
      `faq: []`,
      `seo:`,
      `  title: "${yaml.seo.title.replace(/"/g, '\\"')}"`,
      `  description: "${yaml.seo.description.replace(/"/g, '\\"')}"`,
    ].join('\n');

    writeFileSync(join(outputDir, `${mapping.slug}.yaml`), yamlStr);
    count++;
  }

  console.log(`Prüfaufgaben: ${count} YAML-Dateien`);
}

function convertBranchen() {
  console.log('\n--- Branchen-Seiten konvertieren ---\n');

  const pagesDir = join(SCRAPED_DIR, 'pages');
  const files = readdirSync(pagesDir).filter(f => f.endsWith('.json'));

  // Branchen-Seiten identifizieren
  const branchenMap = {
    'zerstoerungsfreie-pruefung-automobilindustrie': { name: 'Automotive', slug: 'automotive' },
    'zerstoerungsfreie-pruefung-leichtmetallguss': { name: 'Leichtmetallguss', slug: 'leichtmetallguss' },
    'zerstorungsfreie-prufung-von-eisenguss': { name: 'Eisenguss', slug: 'eisenguss' },
    'zerstoerungsfreie-pruefung-batteriesystemen': { name: 'Batteriesysteme / E-Mobilität', slug: 'e-mobilitaet' },
    'pruefung-additiv-gefertigter-bauteile': { name: 'Additive Fertigung', slug: 'additive-fertigung' },
    'zfp-archaeologie': { name: 'Archäologie & Paläontologie', slug: 'archaeologie' },
    'zerstoerungsfreie-werkstoffpruefung': { name: 'Werkstoffprüfung', slug: 'werkstoffpruefung' },
  };

  const outputDir = join(CONTENT_DIR, 'branchen');
  mkdirSync(outputDir, { recursive: true });
  let count = 0;

  for (const [fileSlug, mapping] of Object.entries(branchenMap)) {
    const filename = `${fileSlug}.json`;
    const filepath = join(pagesDir, filename);

    let item;
    try {
      item = JSON.parse(readFileSync(filepath, 'utf-8'));
    } catch {
      console.warn(`  Datei nicht gefunden: ${filename}`);
      continue;
    }

    if (item.error) continue;

    // YAML-Content
    const yamlStr = [
      `name: "${mapping.name}"`,
      `slug: "${mapping.slug}"`,
      `description: "${(item.metaDescription || item.title).replace(/"/g, '\\"')}"`,
      `heroImage: "${item.ogImage ? item.ogImage.replace('https://www.microvista.de/wp-content/uploads/', '/images/wp/') : '/images/placeholder.jpg'}"`,
      `challenges:`,
      `  - title: "Qualitätssicherung"`,
      `    description: "Zuverlässige Fehlererkennung in der Produktion"`,
      `  - title: "Kosten & Effizienz"`,
      `    description: "Wirtschaftliche Prüflösungen für hohe Stückzahlen"`,
      `solutions:`,
      `  - title: "CT-Labor"`,
      `    description: "Hochauflösende 3D-Scans für detaillierte Analysen"`,
      `  - title: "Mobiles CT"`,
      `    description: "SCANEXPRESS direkt an Ihrer Produktionslinie"`,
      `useCases:`,
      `  - "Porositätsanalyse"`,
      `  - "Erstmusterprüfung"`,
      `  - "Wanddickenmessung"`,
      `  - "CAD Soll-Ist-Vergleich"`,
      `stats:`,
      `  - value: "<0.1mm"`,
      `    label: "Auflösung"`,
      `  - value: "24h"`,
      `    label: "Express-Service"`,
      `cta:`,
      `  title: "CT-Prüfung für ${mapping.name}"`,
      `  description: "Kontaktieren Sie uns für eine individuelle Beratung."`,
      `seo:`,
      `  title: "${item.title.replace(/"/g, '\\"')}"`,
      `  description: "${(item.metaDescription || `CT-Prüfung für ${mapping.name} — Microvista`).replace(/"/g, '\\"')}"`,
    ].join('\n');

    writeFileSync(join(outputDir, `${mapping.slug}.yaml`), yamlStr);
    count++;
  }

  console.log(`Branchen: ${count} YAML-Dateien`);
}

function convertStaticPages() {
  console.log('\n--- Statische Seiten konvertieren ---\n');

  const pagesDir = join(SCRAPED_DIR, 'pages');
  const files = readdirSync(pagesDir).filter(f => f.endsWith('.json'));

  // Legal pages → direkt als HTML-Snippets für die Astro-Seiten speichern
  const legalPages = {
    'impressum': 'impressum',
    'datenschutzerklaerung': 'datenschutz',
    'agb': 'agb',
    'cookie-richtlinie-eu': 'cookie-richtlinie',
  };

  const staticDir = join(__dirname, '..', 'src', 'data', 'static-pages');
  mkdirSync(staticDir, { recursive: true });
  let count = 0;

  for (const file of files) {
    const item = JSON.parse(readFileSync(join(pagesDir, file), 'utf-8'));
    if (item.error || !item.markdown || item.markdownLength < 20) continue;

    const slug = cleanSlug(item.slug);

    // Legal pages als separate Markdown-Dateien speichern
    if (legalPages[slug]) {
      const markdown = rewriteImageUrls(item.markdown);
      writeFileSync(join(staticDir, `${legalPages[slug]}.md`), markdown);
      count++;
      continue;
    }

    // FAQ page
    if (slug === 'faq' || item.slug.includes('/faq')) {
      const markdown = rewriteImageUrls(item.markdown);
      writeFileSync(join(staticDir, `faq-${item.lang}.md`), markdown);
      count++;
      continue;
    }

    // Team page
    if (slug === 'team' || slug === 'employees') {
      const markdown = rewriteImageUrls(item.markdown);
      writeFileSync(join(staticDir, `team-${item.lang}.md`), markdown);
      count++;
      continue;
    }

    // Zertifizierungen
    if (slug === 'zertifizierungen' || slug === 'certificates') {
      const markdown = rewriteImageUrls(item.markdown);
      writeFileSync(join(staticDir, `zertifizierungen-${item.lang}.md`), markdown);
      count++;
      continue;
    }

    // Sonstige wichtige Seiten
    const importantPages = ['newsroom', 'pressemitteilungen', 'mediathek', 'bonusprogramm',
      'forschung-entwicklung', 'newsletter', 'live-demo-scanexpress',
      'zerstoerungsfreie-serienpruefung', 'fragebogen'];

    if (importantPages.includes(slug)) {
      const markdown = rewriteImageUrls(item.markdown);
      writeFileSync(join(staticDir, `${slug}-${item.lang}.md`), markdown);
      count++;
    }
  }

  // EN-Seiten auch speichern
  for (const file of files) {
    const item = JSON.parse(readFileSync(join(pagesDir, file), 'utf-8'));
    if (item.error || item.lang !== 'en' || !item.markdown || item.markdownLength < 20) continue;

    const slug = cleanSlug(item.slug);
    const enLegalMap = {
      'imprint': 'impressum',
      'data-privacy': 'datenschutz',
      'general-terms-and-conditions': 'agb',
      'cookie-policy': 'cookie-richtlinie',
    };

    if (enLegalMap[slug]) {
      const markdown = rewriteImageUrls(item.markdown);
      writeFileSync(join(staticDir, `${enLegalMap[slug]}-en.md`), markdown);
      count++;
    }
  }

  console.log(`Statische Seiten: ${count} Markdown-Dateien`);
}

// Dienstleistungen-Seiten extrahieren
function convertDienstleistungen() {
  console.log('\n--- Dienstleistungen konvertieren ---\n');

  const pagesDir = join(SCRAPED_DIR, 'pages');
  const staticDir = join(__dirname, '..', 'src', 'data', 'static-pages');
  mkdirSync(staticDir, { recursive: true });

  const dlMap = {
    'industrielle-computertomographie__dienstleistungen__ct-labor': 'ct-labor',
    'industrielle-computertomographie__dienstleistungen__ct-datenauswertung': 'ct-datenauswertung',
    'industrielle-computertomographie__dienstleistungen__scanexpress-mobiles-industrielles-ct': 'scanexpress',
  };

  let count = 0;
  for (const [filename, slug] of Object.entries(dlMap)) {
    try {
      const item = JSON.parse(readFileSync(join(pagesDir, `${filename}.json`), 'utf-8'));
      if (!item.error && item.markdown) {
        const markdown = rewriteImageUrls(item.markdown);
        writeFileSync(join(staticDir, `dienstleistung-${slug}.md`), markdown);
        count++;
      }
    } catch {
      console.warn(`  Nicht gefunden: ${filename}`);
    }
  }

  console.log(`Dienstleistungen: ${count} Markdown-Dateien`);
}

// Main
console.log('=== Content Converter ===');
convertPosts();
convertPruefaufgaben();
convertBranchen();
convertStaticPages();
convertDienstleistungen();
console.log('\n=== FERTIG ===');
