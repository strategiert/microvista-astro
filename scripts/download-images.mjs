#!/usr/bin/env node
/**
 * Download all scraped images from microvista.de
 * Saves to public/images/wp/ preserving the upload path structure
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
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

async function main() {
  const images = JSON.parse(readFileSync(IMAGES_FILE, 'utf-8'));

  // Nur die größten Versionen behalten (ohne -NNNxNNN Suffixe)
  const uniqueImages = [...new Set(images.map(url => {
    // Entferne Größen-Suffixe wie -768x1024, -225x300, -1024x768 etc.
    return url.replace(/-\d+x\d+(\.\w+)$/, '$1');
  }))];

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
      const urlPath = new URL(url).pathname;
      // /wp-content/uploads/2025/10/file.webp → 2025/10/file.webp
      const relativePath = urlPath.replace(/^\/wp-content\/uploads\//, '');
      const filepath = join(OUTPUT_DIR, relativePath);

      if (existsSync(filepath)) {
        skipped++;
        return;
      }

      const ok = await downloadImage(url, filepath);
      if (ok) {
        success++;
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
  for (const url of uniqueImages) {
    const urlPath = new URL(url).pathname;
    const relativePath = urlPath.replace(/^\/wp-content\/uploads\//, '');
    urlMap[url] = `/images/wp/${relativePath}`;
  }
  writeFileSync(join(__dirname, '..', 'scraped-content', 'image-url-map.json'), JSON.stringify(urlMap, null, 2));
  console.log(`URL-Map gespeichert: scraped-content/image-url-map.json`);
}

main().catch(console.error);
