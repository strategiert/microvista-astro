#!/usr/bin/env node
/**
 * Lädt alle gescrapten Bilder von microvista.de lokal herunter.
 * Eingabe: scraped-content/full/_all-images.json
 * Ausgabe: public/images/wp/ (spiegelt die WP-Upload-Struktur)
 * Erzeugt: scraped-content/full/_image-map.json (original-URL → lokaler Pfad)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_JSON = join(__dirname, '..', 'scraped-content', 'full', '_all-images.json');
const OUT_BASE = join(__dirname, '..', 'public', 'images', 'wp');
const IMAGE_MAP_PATH = join(__dirname, '..', 'scraped-content', 'full', '_image-map.json');

const images = JSON.parse(readFileSync(IMAGES_JSON, 'utf8'));

// Filtere: nur die "canonical" Version (ohne -300x300, -150x150, -1024x etc.)
// Wir laden alle Varianten herunter für maximale Kompatibilität
function urlToLocalPath(url) {
  // https://www.microvista.de/wp-content/uploads/2022/06/file.jpg
  // → public/images/wp/2022/06/file.jpg
  const match = url.match(/microvista\.de\/wp-content\/uploads\/(.+)$/);
  if (match) return join(OUT_BASE, match[1].replace(/\//g, '/'));
  // Fallback
  return join(OUT_BASE, basename(url));
}

async function downloadImage(url, localPath) {
  if (existsSync(localPath)) return 'exists';

  const dir = dirname(localPath);
  mkdirSync(dir, { recursive: true });

  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        if (res.status === 404) return 'not-found';
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = await res.arrayBuffer();
      writeFileSync(localPath, Buffer.from(buffer));
      return 'downloaded';
    } catch (err) {
      if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      else return `error: ${err.message}`;
    }
  }
  return 'failed';
}

async function main() {
  console.log(`=== Image Downloader ===`);
  console.log(`${images.length} Bilder zu laden...\n`);

  mkdirSync(OUT_BASE, { recursive: true });

  const imageMap = {};
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const localPath = urlToLocalPath(url);
    // Lokaler Pfad relativ zu /public → für Astro = /images/wp/...
    const publicPath = '/images/wp/' + url.match(/microvista\.de\/wp-content\/uploads\/(.+)$/)?.[1];
    imageMap[url] = publicPath;

    const progress = `[${i + 1}/${images.length}]`;
    process.stdout.write(`${progress} ${basename(url)} ... `);

    const result = await downloadImage(url, localPath);
    if (result === 'downloaded') { console.log('✓'); downloaded++; }
    else if (result === 'exists') { console.log('bereits vorhanden'); skipped++; }
    else if (result === 'not-found') { console.log('404 - nicht gefunden'); skipped++; }
    else { console.log(result); failed++; }

    // Rate limiting
    if (result === 'downloaded') {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  writeFileSync(IMAGE_MAP_PATH, JSON.stringify(imageMap, null, 2), 'utf8');

  console.log(`\n=== Ergebnis ===`);
  console.log(`Heruntergeladen: ${downloaded}`);
  console.log(`Bereits vorhanden: ${skipped}`);
  console.log(`Fehler: ${failed}`);
  console.log(`Image Map: ${IMAGE_MAP_PATH}`);
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
