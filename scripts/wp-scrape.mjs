#!/usr/bin/env node
/**
 * Microvista WordPress Content Scraper
 *
 * Scrapt alle Seiten von microvista.de und extrahiert:
 * - Seitentitel
 * - Main Content (HTML → Markdown)
 * - Bilder-URLs
 * - Meta-Beschreibungen
 * - Strukturierte Daten
 */

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'scraped-content');

// Alle URLs aus den Sitemaps (Stand 2026-02-26)
const POST_URLS = [
  // DE Beiträge
  'https://www.microvista.de/beitraege/palaeontologie-trifft-industrielle-ct/',
  'https://www.microvista.de/beitraege/qualitaetssicherung-pharmaindustrie/',
  'https://www.microvista.de/beitraege/inspecthub/',
  'https://www.microvista.de/beitraege/ct-inspektion-serienstart-whitepaper/',
  'https://www.microvista.de/beitraege/effiziente-fehleranalyse-express-service/',
  'https://www.microvista.de/beitraege/3d-ct-auswertung/',
  'https://www.microvista.de/beitraege/industrielle-ct-zylinderkopfpruefung/',
  'https://www.microvista.de/beitraege/ct-container-long-vs-compact/',
  'https://www.microvista.de/beitraege/mobiler-industrieller-computertomograph/',
  'https://www.microvista.de/beitraege/einblicke-in-trends-marktentwicklung-und-innovationen/',
  'https://www.microvista.de/beitraege/5-beliebte-zerstoerungsfreie-pruefverfahren-in-der-automobilindustrie/',
  'https://www.microvista.de/beitraege/zerstorungsfreie-prufung-von-eisenguss/',
  'https://www.microvista.de/beitraege/ppf-verfahren-optimierung-potenzialfreisetzung-durch-industrielle-ct-pruefung/',
  'https://www.microvista.de/beitraege/ablauf-industrielle-ct-pruefung/',
  'https://www.microvista.de/beitraege/scanexpress-eingetroffen/',
  'https://www.microvista.de/beitraege/mobiles-ct-auf-der-zielgeraden/',
  'https://www.microvista.de/beitraege/scanexpress-wie-funktioniert-das-mobile-ct/',
  'https://www.microvista.de/beitraege/mobiles-industrielles-ct-auf-der-zielgeraden/',
  'https://www.microvista.de/beitraege/erste-testscans-mit-dem-mobilen-ct/',
  'https://www.microvista.de/beitraege/industrielle-ct-die-beste-methode-fuer-zerstoerungsfreie-pruefung-von-gussteilen/',
  'https://www.microvista.de/beitraege/endspurt-nun-auch-beim-mobilen-ct-container/',
  'https://www.microvista.de/beitraege/ausschuss-automobilindustrie-mit-zerstoerungsfreier-pruefung-minimieren/',
  'https://www.microvista.de/beitraege/mobiles-ct-und-container-vereint-der-scanexpress-ist-fast-fertig/',
  'https://www.microvista.de/beitraege/microvista-erneut-zertifiziert/',
  'https://www.microvista.de/beitraege/archaeologie-mobiles-ct/',
  'https://www.microvista.de/beitraege/mobiles-ct-bei-der-vdi-tagung-giesstechnik-im-motorenbau/',
  'https://www.microvista.de/beitraege/innovative-methode-zur-auswertung-von-hairpin-stator-scans/',
  'https://www.microvista.de/beitraege/industrielle-rontgenprufung-vs-industrielle-computertomographie/',
  'https://www.microvista.de/beitraege/update-schnellere-ct-scans-hoehere-aufloesung-laminografie/',
  'https://www.microvista.de/beitraege/zerstorungfreie-prufung-von-leichtmetallguss/',
  'https://www.microvista.de/beitraege/zfp-automobilindustrie/',
  'https://www.microvista.de/beitraege/industrielle-ct-zur-prufung-additiv-gefertigter-bauteile/',
  'https://www.microvista.de/beitraege/zerstorungsfreie-prufung-von-batteriesystemen/',
  'https://www.microvista.de/beitraege/wanddickenmessung-im-uberblick/',
  'https://www.microvista.de/beitraege/3d-ct-metall-pruefung-waermemanagement/',
  'https://www.microvista.de/beitraege/erster-kundeneinsatz-des-scanexpress/',
  // EN Posts
  'https://www.microvista.de/en/posts/palaeontology-meets-industrial-ct/',
  'https://www.microvista.de/en/posts/ct-for-pharma/',
  'https://www.microvista.de/en/posts/inspecthub-cloudsolution/',
  'https://www.microvista.de/en/posts/temporary-ct-inspection-series-start-ups/',
  'https://www.microvista.de/en/posts/efficient-failure-analysis-for-blocked-batches-fast-decisions-with-our-express-service/',
  'https://www.microvista.de/en/posts/3d-ct-analysis-with-ai/',
  'https://www.microvista.de/en/posts/industrial-ct-cylinder-head-inspection/',
  'https://www.microvista.de/en/posts/ct-container-long-vs-compact-2/',
  'https://www.microvista.de/en/posts/scanning-artifacts-with-low-risk-using-mobile-industrial-ct/',
  'https://www.microvista.de/en/posts/mobile-industrial-ct-compact/',
  'https://www.microvista.de/en/posts/insights-into-trends-market-development-and-technological-innovations/',
  'https://www.microvista.de/en/posts/5-popular-methods-for-non-destructive-testing/',
  'https://www.microvista.de/en/posts/non-destructive-testing-of-cast-iron/',
  'https://www.microvista.de/en/posts/ppf-process-optimisation-industrial-ct-testing/',
  'https://www.microvista.de/en/posts/7-steps-of-industrial-ct-testing/',
  'https://www.microvista.de/en/posts/new-website-with-blog-newsletter-etc/',
  'https://www.microvista.de/en/posts/scanexpress-how-does-the-mobile-ct-work/',
  'https://www.microvista.de/en/posts/mobile-industrial-ct-on-the-home-straight/',
  'https://www.microvista.de/en/posts/first-test-scans-with-the-mobile-ct/',
  'https://www.microvista.de/en/posts/industrial-ct-the-best-method-for-non-destructive-testing-of-casting-parts/',
  'https://www.microvista.de/en/posts/final-spurt-now-also-for-the-mobile-ct-container/',
  'https://www.microvista.de/en/posts/minimise-rejects-in-the-automotive-industry-with-non-destructive-testing/',
  'https://www.microvista.de/en/posts/mobile-ct-container-united-the-scanexpress-almost-ready/',
  'https://www.microvista.de/en/posts/arrival-of-the-mobile-ct/',
  'https://www.microvista.de/en/posts/microvista-certified-once-again/',
  'https://www.microvista.de/en/posts/mobile-ct-at-the-vdi-conference-on-casting-technology-in-engine-construction/',
  'https://www.microvista.de/en/posts/hairpin-stator-crown/',
  'https://www.microvista.de/en/posts/industrial-x-ray-inspection-vs-industrial-computed-tomography/',
  'https://www.microvista.de/en/posts/update-faster-ct-scans-higher-resolution-laminography/',
  'https://www.microvista.de/en/posts/ndt-of-light-metal-castings/',
  'https://www.microvista.de/en/posts/ndt-for-the-automotive-industry/',
  'https://www.microvista.de/en/posts/industrial-ct-for-testing-additively-manufactured-components/',
  'https://www.microvista.de/en/posts/non-destructive-testing-of-battery-systems/',
  'https://www.microvista.de/en/posts/wall-thickness-measurement-your-options-at-a-glance/',
  'https://www.microvista.de/en/posts/3d-ct-metal-testing-components/',
  'https://www.microvista.de/en/posts/first-customer-use-of-the-scanexpress/',
  // DE Presse
  'https://www.microvista.de/presse/mobiles-ct-system-direkt-vor-ort/',
  'https://www.microvista.de/presse/promovierter-ingenieur-ergaenzt-unternehmensgruender-in-gemeinsamer-geschaeftsfuehrung-fuehrungsteam-legt-fokus-auf-mobile-ct-technologie-und-ki-gestuetzte-loesungen/',
  'https://www.microvista.de/presse/zerstoerungsfreie-bauteilpruefung-mit-mobilem-industriellem-ct-direkt-vor-ort/',
  'https://www.microvista.de/presse/qualitaetskontrolle-die-zur-produktion-rollt-flexibel-mietbares-ct-system/',
  // EN Press
  'https://www.microvista.de/en/presse-en/microvista-gmbh-strengthens-management-team-dr-robin-hohne-and-prof-dr-lutz-hagner-form-dual-leadership/',
];

const PAGE_URLS = [
  // Hauptseiten
  'https://www.microvista.de/',
  'https://www.microvista.de/kontakt/',
  'https://www.microvista.de/impressum/',
  'https://www.microvista.de/datenschutzerklaerung/',
  'https://www.microvista.de/agb/',
  'https://www.microvista.de/cookie-richtlinie-eu/',
  'https://www.microvista.de/team/',
  'https://www.microvista.de/newsletter/',
  'https://www.microvista.de/beitraege/',
  'https://www.microvista.de/bonusprogramm/',
  'https://www.microvista.de/live-demo-scanexpress/',
  'https://www.microvista.de/newsroom/',
  'https://www.microvista.de/pressemitteilungen/',
  'https://www.microvista.de/mediathek/',
  'https://www.microvista.de/fragebogen/',
  'https://www.microvista.de/zertifizierungen/',
  'https://www.microvista.de/forschung-entwicklung/',
  'https://www.microvista.de/umweltallianz-sachen-anhalt/',
  'https://www.microvista.de/test/',
  'https://www.microvista.de/end-of-line-test/',
  // Dienstleistungen
  'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/',
  'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ct-labor/',
  'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ct-datenauswertung/',
  'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/scanexpress-mobiles-industrielles-ct/',
  // Prüfaufgaben
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/porositatsanalyse/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/messung-wandstaerken/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/cad-soll-ist-vergleich/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/reverse-engineering/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/grat-kernreste-spaene/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/qualitatssicherung-bei-hairpin-statoren/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/montage-fugekontrolle/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/erstmusterpruefbericht/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/laminographie/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/schweissnahtpruefung/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/form-und-lagetoleranzen/',
  'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/3d-vermessung/',
  // Branchen-Seiten
  'https://www.microvista.de/zerstoerungsfreie-pruefung-automobilindustrie/',
  'https://www.microvista.de/zerstoerungsfreie-pruefung-leichtmetallguss/',
  'https://www.microvista.de/zerstorungsfreie-prufung-von-eisenguss/',
  'https://www.microvista.de/zerstoerungsfreie-pruefung-batteriesystemen/',
  'https://www.microvista.de/pruefung-additiv-gefertigter-bauteile/',
  'https://www.microvista.de/zfp-archaeologie/',
  'https://www.microvista.de/zerstoerungsfreie-werkstoffpruefung/',
  'https://www.microvista.de/zerstoerungsfreie-serienpruefung/',
  // FAQ
  'https://www.microvista.de/industrielle-computertomographie/faq/',
  // EN Pages
  'https://www.microvista.de/en/contact/',
  'https://www.microvista.de/en/imprint/',
  'https://www.microvista.de/en/data-privacy/',
  'https://www.microvista.de/en/cookie-policy/',
  'https://www.microvista.de/en/employees/',
  'https://www.microvista.de/en/posts/',
  'https://www.microvista.de/en/press-releases/',
  'https://www.microvista.de/en/media-library/',
  'https://www.microvista.de/en/news-center/',
  'https://www.microvista.de/en/certificates/',
  'https://www.microvista.de/en/reward-program/',
  'https://www.microvista.de/en/questionnaire/',
  'https://www.microvista.de/en/research-development/',
  'https://www.microvista.de/en/environmental-alliance-saxony-anhalt/',
  'https://www.microvista.de/en/general-terms-and-conditions/',
  'https://www.microvista.de/en/serial-testing/',
  'https://www.microvista.de/en/registration-live-demo-scanexpress/',
  'https://www.microvista.de/en/industrial-computed-tomography/services/',
  'https://www.microvista.de/en/industrial-computed-tomography/services/ct-laboratory/',
  'https://www.microvista.de/en/industrial-computed-tomography/services/ct-data-analysis/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/porosity-analysis/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/wall-thickness-measurement/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/assembly-and-joining-inspection/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/burr-core-residues-and-chips/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/quality-assurance-for-hairpin-stators/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/reverse-engineerin/',
  'https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/initial-sample-inspection-report/',
  'https://www.microvista.de/en/industrial-computed-tomography/faq-2/',
  'https://www.microvista.de/en/cad-target-actual-comparison/',
  'https://www.microvista.de/en/drive-efficiency-eliminate-scrap-see-the-power-of-mobile-industrial-ct/',
  'https://www.microvista.de/en/measuring-geometric-tolerances-gdt-methods-and-procedures/',
  'https://www.microvista.de/en/non-destructive-weld-testing-methods-procedures-and-techniques/',
  // FR Pages
  'https://www.microvista.de/fr/impression/',
  'https://www.microvista.de/fr/declaration-de-confidentialite-ue/',
  'https://www.microvista.de/fr/clause-de-non-responsabilite/',
  'https://www.microvista.de/fr/politique-en-matiere-de-cookies/',
];

// Turndown konfigurieren
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Tabellen-Support
turndown.addRule('table', {
  filter: 'table',
  replacement: (content, node) => {
    return '\n\n' + content + '\n\n';
  }
});

// Bilder mit Alt-Text
turndown.addRule('img', {
  filter: 'img',
  replacement: (content, node) => {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
    if (!src) return '';
    return `![${alt}](${src})`;
  }
});

// iframes ignorieren
turndown.addRule('iframe', {
  filter: 'iframe',
  replacement: () => ''
});

// Leere Links entfernen
turndown.addRule('emptyLinks', {
  filter: (node) => node.nodeName === 'A' && !node.textContent.trim(),
  replacement: () => ''
});

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) return await res.text();
      console.warn(`  HTTP ${res.status} for ${url}`);
      if (res.status === 404) return null;
    } catch (err) {
      console.warn(`  Retry ${i + 1}/${retries} for ${url}: ${err.message}`);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

function extractContent(html, url) {
  const $ = cheerio.load(html);

  // Meta-Daten extrahieren
  const title = $('title').text().replace(/ [-–|] Microvista.*$/i, '').trim();
  const metaDesc = $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || url;

  // Sprache erkennen
  const lang = url.includes('/en/') ? 'en' : url.includes('/fr/') ? 'fr' : 'de';

  // Typ bestimmen
  let type = 'page';
  if (url.includes('/beitraege/') || url.includes('/en/posts/')) type = 'post';
  if (url.includes('/presse/') || url.includes('/presse-en/')) type = 'press';
  if (url.includes('/prufaufgaben/') || url.includes('/inspection-tasks/')) type = 'pruefaufgabe';
  if (url.includes('/dienstleistungen/') || url.includes('/services/')) type = 'dienstleistung';

  // Elementor-Widgets und unnötige Elemente entfernen
  $('script, style, noscript, .elementor-widget-spacer, .e-con-inner > .e-con-inner:empty').remove();
  $('nav, header, footer, .cookie-notice, #cookie-notice, .elementor-location-header, .elementor-location-footer').remove();
  $('.elementor-widget-theme-site-logo, .elementor-widget-nav-menu').remove();

  // Hauptinhalt finden
  let mainContent = '';

  // Versuche verschiedene Content-Container
  const selectors = [
    'article .entry-content',
    '.elementor-widget-theme-post-content',
    'main .elementor-section',
    '.site-main .elementor',
    'article',
    'main',
    '.entry-content',
    '#content',
    '.site-content',
  ];

  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 50) {
      mainContent = el.html();
      break;
    }
  }

  // Fallback: ganzer Body
  if (!mainContent) {
    $('body header, body footer, body nav').remove();
    mainContent = $('body').html() || '';
  }

  // Bilder-URLs sammeln
  const images = new Set();
  $('img').each((_, img) => {
    const src = $(img).attr('src') || $(img).attr('data-src') || '';
    if (src && src.includes('microvista.de')) {
      images.add(src.split('?')[0]); // Query-Parameter entfernen
    }
    // srcset
    const srcset = $(img).attr('srcset') || '';
    srcset.split(',').forEach(s => {
      const imgUrl = s.trim().split(' ')[0];
      if (imgUrl && imgUrl.includes('microvista.de')) {
        images.add(imgUrl.split('?')[0]);
      }
    });
  });

  // Background images
  $('[style*="background"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/);
    if (match && match[1].includes('microvista.de')) {
      images.add(match[1].split('?')[0]);
    }
  });

  // HTML zu Markdown konvertieren
  let markdown = '';
  try {
    markdown = turndown.turndown(mainContent);
    // Mehrfache Leerzeilen auf max 2 reduzieren
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    // Führende/trailing whitespace
    markdown = markdown.trim();
  } catch (err) {
    console.warn(`  Markdown-Konvertierung fehlgeschlagen für ${url}`);
    markdown = mainContent;
  }

  // Slug aus URL ableiten
  const urlObj = new URL(url);
  let slug = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!slug) slug = 'index';

  return {
    url,
    slug,
    title,
    type,
    lang,
    metaDescription: metaDesc,
    ogImage,
    canonical,
    markdown,
    htmlLength: mainContent.length,
    markdownLength: markdown.length,
    images: [...images],
    scrapedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log('=== Microvista Content Scraper ===\n');

  // Output-Ordner erstellen
  mkdirSync(join(OUTPUT_DIR, 'posts'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'pages'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'press'), { recursive: true });

  const allUrls = [...POST_URLS, ...PAGE_URLS];
  const results = [];
  const allImages = new Set();
  let success = 0;
  let failed = 0;

  console.log(`Scrape ${allUrls.length} URLs...\n`);

  // Sequentiell scrapen (Rate Limiting respektieren)
  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    const progress = `[${i + 1}/${allUrls.length}]`;
    process.stdout.write(`${progress} ${url.replace('https://www.microvista.de', '')} ... `);

    const html = await fetchWithRetry(url);
    if (!html) {
      console.log('FEHLER');
      failed++;
      results.push({ url, error: 'Fetch failed', slug: '', type: 'unknown', lang: 'de' });
      continue;
    }

    const data = extractContent(html, url);
    results.push(data);
    data.images.forEach(img => allImages.add(img));
    success++;

    console.log(`OK (${data.markdownLength} chars, ${data.images.length} imgs)`);

    // Rate limit: 200ms Pause
    await new Promise(r => setTimeout(r, 200));
  }

  // Ergebnisse speichern
  console.log('\n--- Ergebnisse speichern ---\n');

  // Einzelne Dateien pro Seite
  for (const item of results) {
    if (item.error) continue;

    const dir = item.type === 'post' ? 'posts' : item.type === 'press' ? 'press' : 'pages';
    const filename = item.slug.replace(/\//g, '__') + '.json';
    writeFileSync(join(OUTPUT_DIR, dir, filename), JSON.stringify(item, null, 2));
  }

  // Gesamtübersicht
  writeFileSync(join(OUTPUT_DIR, 'all-content.json'), JSON.stringify(results, null, 2));

  // Alle Bilder-URLs
  const imageList = [...allImages].sort();
  writeFileSync(join(OUTPUT_DIR, 'all-images.json'), JSON.stringify(imageList, null, 2));

  console.log(`\n=== FERTIG ===`);
  console.log(`Erfolgreich: ${success}`);
  console.log(`Fehlgeschlagen: ${failed}`);
  console.log(`Gesamt URLs: ${allUrls.length}`);
  console.log(`Unique Bilder: ${imageList.length}`);
  console.log(`\nOutput: ${OUTPUT_DIR}`);
}

main().catch(console.error);
