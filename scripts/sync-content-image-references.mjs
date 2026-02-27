#!/usr/bin/env node
/**
 * Ensure all /images/wp/* references used in content files exist locally.
 * Strategy:
 * 1) Try downloading missing files from microvista.de uploads path.
 * 2) If download fails, try common fallback URL variants.
 * 3) If still missing, copy a local file with the same basename.
 */

import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicWpDir = path.join(projectRoot, 'public', 'images', 'wp');
const scanDirs = [
  path.join(projectRoot, 'src', 'content'),
  path.join(projectRoot, 'src', 'data', 'static-pages'),
];

function walkFiles(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function collectImageRefs() {
  const fileList = scanDirs
    .flatMap((dir) => (existsSync(dir) ? walkFiles(dir) : []))
    .filter((f) => /\.(md|mdx|yaml)$/i.test(f));

  const re = /\/images\/wp\/[A-Za-z0-9_\-./]+/g;
  const refs = new Set();

  for (const file of fileList) {
    const content = readFileSync(file, 'utf8');
    const matches = content.match(re) || [];
    for (const m of matches) {
      refs.add(m.replace(/[)\]"`,]+$/g, ''));
    }
  }

  return [...refs];
}

function localPathFromRef(ref) {
  return path.join(projectRoot, 'public', ref.replace(/^\//, ''));
}

function uploadPathFromRef(ref) {
  return ref.replace(/^\/images\/wp\//, '');
}

async function download(url, targetPath) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(path.dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, buf);
    return true;
  } catch {
    return false;
  }
}

function unique(values) {
  return [...new Set(values)];
}

function fallbackUploadPaths(uploadPath) {
  const out = [uploadPath];

  // Remove size suffix -NNNxNNN before extension.
  out.push(uploadPath.replace(/-\d+x\d+(\.\w+)$/i, '$1'));

  // Normalize odd elementor location with date folders.
  out.push(uploadPath.replace(/^\d{4}\/\d{2}\/(?=elementor\/thumbs\/)/, ''));

  // Combination.
  out.push(
    uploadPath
      .replace(/^\d{4}\/\d{2}\/(?=elementor\/thumbs\/)/, '')
      .replace(/-\d+x\d+(\.\w+)$/i, '$1')
  );

  // Try common extension swaps.
  const ext = path.extname(uploadPath).toLowerCase();
  const baseNoExt = uploadPath.slice(0, -ext.length);
  if (ext) {
    for (const altExt of ['.webp', '.jpg', '.jpeg', '.png']) {
      if (altExt !== ext) out.push(`${baseNoExt}${altExt}`);
    }
  }

  return unique(out).filter(Boolean);
}

function buildBasenameIndex() {
  const files = walkFiles(publicWpDir).filter((f) => /\.(webp|png|jpe?g|gif|svg)$/i.test(f));
  const map = new Map();
  for (const file of files) {
    const name = path.basename(file).toLowerCase();
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(file);
  }
  return map;
}

async function main() {
  if (!existsSync(publicWpDir)) {
    throw new Error(`Missing directory: ${publicWpDir}`);
  }

  const refs = collectImageRefs();
  const missing = refs.filter((ref) => !existsSync(localPathFromRef(ref)));
  console.log(`Content image refs: ${refs.length}`);
  console.log(`Missing local files: ${missing.length}`);

  if (missing.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let downloaded = 0;
  let copied = 0;
  const unresolved = [];
  const basenameIndex = buildBasenameIndex();

  for (const ref of missing) {
    const targetPath = localPathFromRef(ref);
    const uploadPath = uploadPathFromRef(ref);
    const candidates = fallbackUploadPaths(uploadPath).map(
      (p) => `https://www.microvista.de/wp-content/uploads/${p}`
    );

    let ok = false;
    for (const candidateUrl of candidates) {
      ok = await download(candidateUrl, targetPath);
      if (ok) {
        downloaded++;
        break;
      }
    }

    if (ok) continue;

    const basename = path.basename(targetPath).toLowerCase();
    const localCandidates = basenameIndex.get(basename) || [];
    if (localCandidates.length > 0) {
      mkdirSync(path.dirname(targetPath), { recursive: true });
      copyFileSync(localCandidates[0], targetPath);
      copied++;
      continue;
    }

    unresolved.push(ref);
  }

  console.log(`Downloaded: ${downloaded}`);
  console.log(`Copied by basename: ${copied}`);
  console.log(`Unresolved: ${unresolved.length}`);
  for (const ref of unresolved.slice(0, 50)) {
    console.log(`  ${ref}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

