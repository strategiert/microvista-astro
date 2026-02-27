#!/usr/bin/env node
/**
 * Crawl internal pages and report broken image resources.
 *
 * Usage:
 *   node scripts/analyze-broken-images.mjs
 *   BASE_URL=http://127.0.0.1:4321 node scripts/analyze-broken-images.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs');
const outJson = path.join(docsDir, 'broken-images-report.json');
const outCsv = path.join(docsDir, 'broken-images-report.csv');
const outMd = path.join(docsDir, 'broken-images-report.md');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4321';
const base = new URL(baseUrl);

const startPaths = ['/', '/en', '/fr', '/es', '/it'];
const maxPages = Number(process.env.MAX_PAGES || 3000);
const pageTimeoutMs = Number(process.env.PAGE_TIMEOUT_MS || 20000);
const imageTimeoutMs = Number(process.env.IMAGE_TIMEOUT_MS || 15000);
const imageCheckConcurrency = Number(process.env.IMAGE_CONCURRENCY || 20);
const internalHostnames = new Set([
  base.hostname.toLowerCase(),
  'microvista.de',
  'www.microvista.de',
  'localhost',
  '127.0.0.1',
]);
const supportedLocales = new Set(['en', 'fr', 'es', 'it']);
const allowedTopLevelRoutes = new Set([
  '', // root
  'labor',
  'serie',
  'branchen',
  'pruefaufgaben',
  'dienstleistungen',
  'magazin',
  'wiki',
  'kontakt',
  'newsroom',
  'newsletter',
  'team',
  'zertifizierungen',
  'impressum',
  'datenschutz',
  'agb',
  'faq',
  'bonusprogramm',
  'fragebogen',
  'forschung-entwicklung',
  'live-demo-scanexpress',
  'mediathek',
  'pressemitteilungen',
  'zerstoerungsfreie-serienpruefung',
]);

function normalizePageUrl(input) {
  const u = new URL(input, base);
  u.hash = '';
  u.search = '';
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
}

function normalizeResourceUrl(input, currentPageUrl) {
  if (!input) return null;
  const raw = input.trim();
  if (!raw || raw.startsWith('data:') || raw.startsWith('blob:') || raw.startsWith('javascript:')) {
    return null;
  }
  try {
    const u = new URL(raw, currentPageUrl);
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

function parseSrcset(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(/\s+/)[0])
    .filter(Boolean);
}

function isInternalUrl(input) {
  try {
    const u = new URL(input);
    return internalHostnames.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function getCheckUrl(resourceUrl) {
  const parsed = new URL(resourceUrl);
  if (isInternalUrl(resourceUrl)) {
    return new URL(`${parsed.pathname}${parsed.search}`, base).toString();
  }
  return resourceUrl;
}

function shouldFollowLink(urlString) {
  const u = new URL(urlString);
  if (u.origin !== base.origin) return false;
  if (u.pathname.startsWith('/api/')) return false;
  // Skip non-document resources.
  if (/\.(?:png|jpe?g|webp|gif|svg|ico|pdf|xml|txt|css|js|map|woff2?|ttf|eot|mp4|webm|mp3|zip)$/i.test(u.pathname)) {
    return false;
  }
  if (!isInMicrovistaRouteScope(u.pathname)) return false;
  return true;
}

function isInMicrovistaRouteScope(pathname) {
  const cleanPath = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length === 0) return true;

  if (supportedLocales.has(segments[0])) {
    // Locale root e.g. /en
    if (segments.length === 1) return true;
    return allowedTopLevelRoutes.has(segments[1]);
  }

  return allowedTopLevelRoutes.has(segments[0]);
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function fetchText(urlString, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(urlString, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Microvista-Broken-Images-Audit/1.0' },
    });
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const text = contentType.includes('text/html') ? await res.text() : '';
    return { ok: res.ok, status: res.status, url: res.url, contentType, text, error: null };
  } catch (error) {
    return { ok: false, status: 0, url: urlString, contentType: '', text: '', error: String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkImage(urlString) {
  const checkUrl = getCheckUrl(urlString);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), imageTimeoutMs);
  try {
    let res = await fetch(checkUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Microvista-Broken-Images-Audit/1.0' },
    });

    // Some servers reject HEAD; fallback to GET.
    if (res.status === 405 || res.status === 403) {
      res = await fetch(checkUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Microvista-Broken-Images-Audit/1.0' },
      });
    }

    return {
      ok: res.status >= 200 && res.status < 400,
      status: res.status,
      finalUrl: res.url,
      checkedUrl: checkUrl,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: checkUrl,
      checkedUrl: checkUrl,
      error: String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;

  const runners = Array.from({ length: Math.max(1, limit) }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      // eslint-disable-next-line no-await-in-loop
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
}

async function crawl() {
  const queue = startPaths.map((p) => normalizePageUrl(new URL(p, base).toString()));
  const visitedPages = new Set();
  const pageResults = [];
  const imageRefs = new Map(); // imageUrl -> Set(pageUrl)

  while (queue.length > 0 && visitedPages.size < maxPages) {
    const currentPage = queue.shift();
    if (!currentPage || visitedPages.has(currentPage)) continue;
    visitedPages.add(currentPage);

    // eslint-disable-next-line no-await-in-loop
    const response = await fetchText(currentPage, pageTimeoutMs);
    pageResults.push({
      url: currentPage,
      status: response.status,
      ok: response.ok,
      error: response.error,
    });

    if (!response.ok || !response.contentType.includes('text/html') || !response.text) {
      continue;
    }

    const $ = load(response.text);

    // Images
    const pageImages = new Set();
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const srcset = $(el).attr('srcset');
      if (src) pageImages.add(src);
      for (const value of parseSrcset(srcset)) pageImages.add(value);
    });
    $('source').each((_, el) => {
      const src = $(el).attr('src');
      const srcset = $(el).attr('srcset');
      if (src) pageImages.add(src);
      for (const value of parseSrcset(srcset)) pageImages.add(value);
    });
    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content) pageImages.add(content);
    });
    $('link[rel="preload"][as="image"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) pageImages.add(href);
    });

    for (const rawImage of pageImages) {
      const imageUrl = normalizeResourceUrl(rawImage, response.url || currentPage);
      if (!imageUrl) continue;
      if (!imageRefs.has(imageUrl)) imageRefs.set(imageUrl, new Set());
      imageRefs.get(imageUrl).add(currentPage);
    }

    // Internal links for crawl
    $('a[href]').each((_, el) => {
      const href = ($(el).attr('href') || '').trim();
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }
      const normalized = normalizeResourceUrl(href, response.url || currentPage);
      if (!normalized) return;
      if (!shouldFollowLink(normalized)) return;
      const normalizedPage = normalizePageUrl(normalized);
      if (!visitedPages.has(normalizedPage)) {
        queue.push(normalizedPage);
      }
    });
  }

  return { pageResults, imageRefs };
}

async function main() {
  const startedAt = new Date();
  console.log(`Broken image audit started at ${startedAt.toISOString()}`);
  console.log(`Base URL: ${base.toString()}`);

  const { pageResults, imageRefs } = await crawl();
  const imageUrls = [...imageRefs.keys()];

  console.log(`Pages crawled: ${pageResults.length}`);
  console.log(`Unique image URLs found: ${imageUrls.length}`);
  console.log(`Checking image URLs (concurrency=${imageCheckConcurrency})...`);

  const imageChecks = await runWithConcurrency(
    imageUrls,
    imageCheckConcurrency,
    async (imageUrl) => {
      const check = await checkImage(imageUrl);
      return { imageUrl, ...check };
    }
  );

  const brokenImages = imageChecks.filter((item) => !item.ok);
  const brokenLocal = brokenImages.filter((item) => isInternalUrl(item.imageUrl));
  const brokenExternal = brokenImages.filter((item) => !isInternalUrl(item.imageUrl));
  const brokenByStatus = {};
  for (const item of brokenImages) {
    const key = String(item.status || 0);
    brokenByStatus[key] = (brokenByStatus[key] || 0) + 1;
  }

  const pageErrors = pageResults.filter((p) => !p.ok);
  const sortedBroken = brokenImages
    .map((item) => ({
      ...item,
      refs: [...(imageRefs.get(item.imageUrl) || [])],
      refCount: (imageRefs.get(item.imageUrl) || new Set()).size,
    }))
    .sort((a, b) => b.refCount - a.refCount || a.imageUrl.localeCompare(b.imageUrl, 'en'));

  mkdirSync(docsDir, { recursive: true });

  const reportJson = {
    generatedAt: new Date().toISOString(),
    baseUrl: base.toString(),
    totals: {
      pagesCrawled: pageResults.length,
      pagesFailed: pageErrors.length,
      uniqueImages: imageUrls.length,
      brokenImages: brokenImages.length,
      brokenLocal: brokenLocal.length,
      brokenExternal: brokenExternal.length,
    },
    brokenByStatus,
    pageErrors,
    brokenImages: sortedBroken,
  };
  writeFileSync(outJson, JSON.stringify(reportJson, null, 2), 'utf8');

  const csvHeader = ['image_url', 'status', 'is_internal', 'ref_count', 'first_ref_page', 'error'];
  const csvLines = [
    csvHeader.join(','),
    ...sortedBroken.map((item) =>
      [
        csvEscape(item.imageUrl),
        csvEscape(item.status),
        csvEscape(isInternalUrl(item.imageUrl) ? 'yes' : 'no'),
        csvEscape(item.refCount),
        csvEscape(item.refs[0] || ''),
        csvEscape(item.error || ''),
      ].join(',')
    ),
  ];
  writeFileSync(outCsv, `${csvLines.join('\n')}\n`, 'utf8');

  const mdLines = [
    '# Broken Images Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${base.toString()}`,
    '',
    '## Summary',
    '',
    `- Pages crawled: ${pageResults.length}`,
    `- Pages failed: ${pageErrors.length}`,
    `- Unique image URLs: ${imageUrls.length}`,
    `- Broken images: ${brokenImages.length}`,
    `- Broken local images: ${brokenLocal.length}`,
    `- Broken external images: ${brokenExternal.length}`,
    '',
    '## Broken by Status',
    '',
    ...(Object.keys(brokenByStatus).length === 0
      ? ['- none']
      : Object.entries(brokenByStatus)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([status, count]) => `- ${status}: ${count}`)),
    '',
    '## Failed Pages',
    '',
    ...(pageErrors.length === 0
      ? ['- none']
      : pageErrors.map((p) => `- ${p.status} ${p.url}${p.error ? ` (${p.error})` : ''}`)),
    '',
    '## Broken Images (Top 200 by references)',
    '',
    '| Status | Internal | Ref Count | Image URL | First Referrer |',
    '| --- | --- | --- | --- | --- |',
    ...sortedBroken.slice(0, 200).map((item) => {
      const internal = isInternalUrl(item.imageUrl) ? 'yes' : 'no';
      const firstRef = item.refs[0] || '';
      const img = item.imageUrl.replace(/\|/g, '\\|');
      const ref = firstRef.replace(/\|/g, '\\|');
      return `| ${item.status} | ${internal} | ${item.refCount} | ${img} | ${ref} |`;
    }),
    '',
    '## Files',
    '',
    '- JSON: `docs/broken-images-report.json`',
    '- CSV: `docs/broken-images-report.csv`',
    '- Markdown: `docs/broken-images-report.md`',
    '',
  ];
  writeFileSync(outMd, mdLines.join('\n'), 'utf8');

  console.log('\nDone.');
  console.log(`- ${outJson}`);
  console.log(`- ${outCsv}`);
  console.log(`- ${outMd}`);
  console.log(`Broken images: ${brokenImages.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
