#!/usr/bin/env node
/**
 * Microvista Full Content Scraper
 *
 * Extrahiert den vollständigen Inhalt aller DE-Seiten von microvista.de
 * Nutzt <main> als Content-Container (Elementor SSR)
 * Konvertiert HTML → Markdown mit TurndownService
 */

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'scraped-content', 'full');

// Alle DE-Hauptseiten
const PAGES = [
  { url: 'https://www.microvista.de/', slug: 'index' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/', slug: 'dienstleistungen' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ct-labor/', slug: 'ct-labor' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ct-datenauswertung/', slug: 'ct-datenauswertung' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/dienstleistungen/scanexpress-mobiles-industrielles-ct/', slug: 'scanexpress' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/', slug: 'prufaufgaben' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/porositatsanalyse/', slug: 'porositatsanalyse' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/messung-wandstaerken/', slug: 'messung-wandstaerken' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/cad-soll-ist-vergleich/', slug: 'cad-soll-ist-vergleich' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/reverse-engineering/', slug: 'reverse-engineering' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/grat-kernreste-spaene/', slug: 'grat-kernreste-spaene' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/qualitatssicherung-bei-hairpin-statoren/', slug: 'hairpin-statoren' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/montage-fugekontrolle/', slug: 'montage-fugekontrolle' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/erstmusterpruefbericht/', slug: 'erstmusterpruefbericht' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/laminographie/', slug: 'laminographie' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/schweissnahtpruefung/', slug: 'schweissnahtpruefung' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/form-und-lagetoleranzen/', slug: 'form-und-lagetoleranzen' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/prufaufgaben/3d-vermessung/', slug: '3d-vermessung' },
  { url: 'https://www.microvista.de/end-of-line-test/', slug: 'end-of-line-test' },
  { url: 'https://www.microvista.de/zerstoerungsfreie-serienpruefung/', slug: 'serienpruefung' },
  { url: 'https://www.microvista.de/industrielle-computertomographie/faq/', slug: 'faq' },
  { url: 'https://www.microvista.de/team/', slug: 'team' },
  { url: 'https://www.microvista.de/kontakt/', slug: 'kontakt' },
  { url: 'https://www.microvista.de/zertifizierungen/', slug: 'zertifizierungen' },
  { url: 'https://www.microvista.de/newsroom/', slug: 'newsroom' },
  { url: 'https://www.microvista.de/agb/', slug: 'agb' },
  { url: 'https://www.microvista.de/datenschutzerklaerung/', slug: 'datenschutz' },
  { url: 'https://www.microvista.de/impressum/', slug: 'impressum' },
];

// TurndownService konfigurieren
const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Bilder behalten
td.addRule('img', {
  filter: 'img',
  replacement: (_, node) => {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
    if (!src || src.includes('pixel') || src.length < 10) return '';
    return `![${alt}](${src})`;
  }
});

// iframes entfernen
td.addRule('iframe', { filter: 'iframe', replacement: () => '' });

// Leere Anker entfernen
td.addRule('emptyAnchors', {
  filter: (n) => n.nodeName === 'A' && !n.textContent.trim() && !n.querySelector('img'),
  replacement: () => ''
});

// Tabellen-Wrapper
td.addRule('tableWrapper', {
  filter: 'table',
  replacement: (content) => '\n\n' + content + '\n\n'
});

async function fetchPage(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) return await res.text();
      if (res.status === 404) { console.log('  → 404'); return null; }
      console.warn(`  → HTTP ${res.status}, retry ${i + 1}/3`);
    } catch (err) {
      console.warn(`  → Fehler: ${err.message}, retry ${i + 1}/3`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return null;
}

function extractContent(html, url) {
  const $ = cheerio.load(html);

  // Meta-Daten
  const title = $('title').text().replace(/ [-–|] Microvista.*$/i, '').trim();
  const metaDesc = $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // Header, Footer, Nav, Cookie-Banner entfernen
  $('header, footer, nav, .cookie-notice, #cookie-notice').remove();
  $('.elementor-location-header, .elementor-location-footer').remove();
  $('[class*="header"], [class*="footer"], [class*="nav-menu"]').filter((_, el) => {
    const cls = $(el).attr('class') || '';
    return cls.includes('elementor-location');
  }).remove();
  $('script, style, noscript').remove();

  // Elementor-Widget-Spacer entfernen (leerer Abstand)
  $('.elementor-widget-spacer').remove();

  // Hauptinhalt: <main> bevorzugen
  let mainEl = $('main');
  let mainHtml = '';

  if (mainEl.length && mainEl.html()?.trim().length > 200) {
    mainHtml = mainEl.html();
  } else {
    // Fallback: .site-main, #content, .elementor (direkt unter body)
    const fallbackSelectors = ['.site-main', '#content', '.elementor-main', '#main'];
    for (const sel of fallbackSelectors) {
      const el = $(sel);
      if (el.length && el.html()?.trim().length > 200) {
        mainHtml = el.html();
        break;
      }
    }
    // Letzter Fallback: body
    if (!mainHtml) {
      $('body header, body footer, body nav').remove();
      mainHtml = $('body').html() || '';
    }
  }

  // Bilder-URLs sammeln (nur microvista.de)
  const images = new Set();
  const tempDom = cheerio.load('<div>' + mainHtml + '</div>');
  tempDom('img').each((_, img) => {
    const src = tempDom(img).attr('src') || tempDom(img).attr('data-src') || '';
    const srcset = tempDom(img).attr('srcset') || '';
    if (src && src.includes('microvista.de')) images.add(src.split('?')[0]);
    srcset.split(',').forEach(s => {
      const u = s.trim().split(' ')[0];
      if (u && u.includes('microvista.de')) images.add(u.split('?')[0]);
    });
  });
  // Background images
  tempDom('[style*="background"]').each((_, el) => {
    const style = tempDom(el).attr('style') || '';
    const m = style.match(/url\(['"]?(https?:\/\/[^'")\s]+microvista\.de[^'")\s]*)['"]?\)/);
    if (m) images.add(m[1].split('?')[0]);
  });

  // Markdown konvertieren
  let markdown = '';
  try {
    markdown = td.turndown(mainHtml);
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
  } catch (err) {
    console.warn('  → Markdown-Fehler:', err.message);
    markdown = mainHtml;
  }

  return {
    url,
    title,
    metaDescription: metaDesc,
    ogImage,
    markdown,
    images: [...images],
    htmlLength: mainHtml.length,
    markdownLength: markdown.length,
    scrapedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log('=== Microvista Full Content Scraper ===\n');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = [];
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < PAGES.length; i++) {
    const { url, slug } = PAGES[i];
    process.stdout.write(`[${i + 1}/${PAGES.length}] ${slug} ... `);

    const html = await fetchPage(url);
    if (!html) {
      console.log('FEHLER');
      fail++;
      continue;
    }

    const data = extractContent(html, url);
    data.slug = slug;

    const outPath = join(OUTPUT_DIR, `${slug}.json`);
    writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`OK (${data.markdownLength} Zeichen, ${data.images.length} Bilder)`);
    results.push({ slug, markdownLength: data.markdownLength, images: data.images.length });
    ok++;

    // Rate limiting
    await new Promise(r => setTimeout(r, 800));
  }

  // Alle Bilder sammeln
  const allImages = new Set();
  results.forEach(r => {
    const d = require(join(OUTPUT_DIR, `${r.slug}.json`));
    d.images.forEach(img => allImages.add(img));
  });

  writeFileSync(
    join(OUTPUT_DIR, '_all-images.json'),
    JSON.stringify([...allImages].sort(), null, 2),
    'utf8'
  );

  console.log(`\n=== Ergebnis ===`);
  console.log(`OK: ${ok} | Fehler: ${fail}`);
  console.log(`Bilder gesamt: ${allImages.size}`);
  console.log(`Ausgabe: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
