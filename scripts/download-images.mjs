#!/usr/bin/env node
/**
 * Download all scraped images from microvista.de
 * Saves to public/images/wp/ preserving the upload path structure
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_FILE = join(__dirname, '..', 'scraped-content', 'all-images.json');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images', 'wp');

async function downloadImage(url, filepath) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(filepath), { recursive: true });
    writeFileSync(filepath, buffer);
    return true;
  } catch {
    return false;
  }
}

function unique(values) {
  return [...new Set(values)];
}

function getRelativePathFromUrl(url) {
  const urlPath = new URL(url).pathname;
  let relativePath = urlPath.replace(/^\/wp-content\/uploads\//, '');

  // Fallback für inkonsistente Alt-URLs:
  // /wp-content/uploads/YYYY/MM/elementor/thumbs/... -> /wp-content/uploads/elementor/thumbs/...
  relativePath = relativePath.replace(/^\d{4}\/\d{2}\/(?=elementor\/thumbs\/)/, '');

  return relativePath;
}

function buildFallbackCandidates(url) {
  const candidates = [url];
  const parsed = new URL(url);

  // Fallback 1: Elementor-Thumbs ohne YYYY/MM-Verzeichnis.
  if (/^\/wp-content\/uploads\/\d{4}\/\d{2}\/elementor\/thumbs\//.test(parsed.pathname)) {
    const alt = new URL(url);
    alt.pathname = alt.pathname.replace(/^\/wp-content\/uploads\/\d{4}\/\d{2}\//, '/wp-content/uploads/');
    candidates.push(alt.toString());
  }

  // Fallback 2: Größensuffix entfernen (z. B. -768x432.webp -> .webp).
  if (/-\d+x\d+(\.\w+)$/i.test(parsed.pathname)) {
    const alt = new URL(url);
    alt.pathname = alt.pathname.replace(/-\d+x\d+(\.\w+)$/i, '$1');
    candidates.push(alt.toString());
  }

  // Fallback 3: Kombination aus beiden (Elementor + Größensuffix).
  if (
    /^\/wp-content\/uploads\/\d{4}\/\d{2}\/elementor\/thumbs\//.test(parsed.pathname) &&
    /-\d+x\d+(\.\w+)$/i.test(parsed.pathname)
  ) {
    const alt = new URL(url);
    alt.pathname = alt.pathname
      .replace(/^\/wp-content\/uploads\/\d{4}\/\d{2}\//, '/wp-content/uploads/')
      .replace(/-\d+x\d+(\.\w+)$/i, '$1');
    candidates.push(alt.toString());
  }

  return unique(candidates);
}

async function main() {
  const images = JSON.parse(readFileSync(IMAGES_FILE, 'utf-8'));

  // Alle referenzierten Bild-URLs importieren (inkl. Größenvarianten),
  // damit jede im Content verwendete URL lokal auflösbar ist.
  const uniqueImages = unique(images);

  console.log(`=== Microvista Image Downloader ===`);
  console.log(`Total Bild-URLs: ${images.length}`);
  console.log(`Unique (ohne Größenvarianten): ${uniqueImages.length}\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  let failed = 0;
  let skipped = 0;

  // Download in Batches von 5 parallel
  const BATCH_SIZE = 5;

  for (let i = 0; i < uniqueImages.length; i += BATCH_SIZE) {
    const batch = uniqueImages.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (url) => {
      // Pfad aus URL ableiten
      const relativePath = getRelativePathFromUrl(url);
      const filepath = join(OUTPUT_DIR, relativePath);

      if (existsSync(filepath)) {
        skipped++;
        return;
      }

      const candidates = buildFallbackCandidates(url);
      let ok = false;
      let successfulUrl = url;
      for (const candidate of candidates) {
        ok = await downloadImage(candidate, filepath);
        if (ok) {
          successfulUrl = candidate;
          break;
        }
      }

      if (ok) {
        success++;
        if (successfulUrl !== url) {
          console.warn(`  FALLBACK: ${url} -> ${successfulUrl}`);
        }
      } else {
        failed++;
        console.warn(`  FEHLER: ${url}`);
      }
    });

    await Promise.all(promises);

    const done = Math.min(i + BATCH_SIZE, uniqueImages.length);
    process.stdout.write(`\r[${done}/${uniqueImages.length}] ${success} OK, ${failed} Fehler, ${skipped} übersprungen`);
  }

  console.log(`\n\n=== FERTIG ===`);
  console.log(`Heruntergeladen: ${success}`);
  console.log(`Fehler: ${failed}`);
  console.log(`Übersprungen: ${skipped}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  // URL-Mapping speichern für spätere Content-Anpassung
  const urlMap = {};
  for (const url of images) {
    const relativePath = getRelativePathFromUrl(url);
    urlMap[url] = `/images/wp/${relativePath}`;
  }
  writeFileSync(join(__dirname, '..', 'scraped-content', 'image-url-map.json'), JSON.stringify(urlMap, null, 2));
  console.log(`URL-Map gespeichert: scraped-content/image-url-map.json`);
}

main().catch(console.error);
