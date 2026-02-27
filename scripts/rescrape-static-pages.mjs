#!/usr/bin/env node
/**
 * Re-scrape static page content from WordPress API (Elementor pages)
 * Extracts actual content from Elementor widgets, skips hero/CTA sections
 * Writes clean Markdown to src/data/static-pages/
 */

import TurndownService from 'turndown';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const WP_API = 'https://www.microvista.de/wp-json/wp/v2/pages';
const OUT_DIR = join(import.meta.dirname, '..', 'src', 'data', 'static-pages');

// Map: target filename -> WP page ID
const PAGE_MAP = {
  // DE pages
  'impressum.md': 766,
  'datenschutz.md': 778,
  'agb.md': 773,
  'faq-de.md': 3160,
  'team-de.md': 7553,
  'zertifizierungen-de.md': 217,
  'newsletter-de.md': 2882,
  'bonusprogramm-de.md': 6652,
  'newsroom-de.md': 26264,
  // EN pages
  'datenschutz-en.md': 4290,
  'faq-en.md': 3919,
  'team-en.md': 24757,
};

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Skip images that are WP internal
turndown.addRule('cleanImages', {
  filter: 'img',
  replacement: (_, node) => {
    const src = node.getAttribute('src') || '';
    const alt = node.getAttribute('alt') || '';
    if (src.includes('wp-content/plugins') || src.includes('pixel') || !src) return '';
    // Keep real content images
    if (src.includes('microvista.de')) {
      return `![${alt}](${src})`;
    }
    return '';
  },
});

async function fetchPage(id) {
  const url = `${WP_API}/${id}?_fields=id,title,slug,content,link`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  Failed to fetch page ${id}: ${res.status}`);
    return null;
  }
  return res.json();
}

function extractElementorContent(html) {
  const $ = cheerio.load(html);

  // Remove scripts, styles
  $('script, style, noscript, svg').remove();

  // Remove Elementor divider widgets
  $('.elementor-widget-divider').remove();

  // Remove button widgets (CTA buttons)
  $('.elementor-widget-button').remove();

  // Remove spacer widgets
  $('.elementor-widget-spacer').remove();

  // Collect content from Elementor widgets
  const sections = [];
  let isFirstHeading = true;

  // Process each top-level Elementor section (skip the first one = hero/CTA)
  const topSections = $('section.elementor-top-section');

  topSections.each((i, section) => {
    const sectionText = $(section).text().trim();

    // Skip hero sections with CTA
    if (sectionText.includes('GET YOUR INSPECTION DONE') && i === 0) {
      return;
    }

    // Extract headings and text-editor widgets from this section
    const sectionHtml = [];

    $(section).find('.elementor-widget-heading .elementor-widget-container, .elementor-widget-text-editor .elementor-widget-container').each((_, widget) => {
      const widgetHtml = $(widget).html();
      if (widgetHtml && widgetHtml.trim()) {
        sectionHtml.push(widgetHtml.trim());
      }
    });

    if (sectionHtml.length > 0) {
      sections.push(sectionHtml.join('\n'));
    }
  });

  // If no sections found, try extracting all text-editor and heading widgets
  if (sections.length === 0) {
    $('.elementor-widget-heading .elementor-widget-container, .elementor-widget-text-editor .elementor-widget-container').each((_, widget) => {
      const text = $(widget).text().trim();
      if (text && !text.includes('GET YOUR INSPECTION DONE') && !text.includes('Express-Inspektion')) {
        sections.push($(widget).html().trim());
      }
    });
  }

  return sections.join('\n\n');
}

function htmlToMarkdown(html, title) {
  const contentHtml = extractElementorContent(html);

  if (!contentHtml) return '';

  let md = turndown.turndown(contentHtml);

  // Clean up excessive whitespace and non-breaking spaces
  md = md.replace(/\u00a0+/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.replace(/[ \t]+\n/g, '\n');
  md = md.trim();

  // Ensure title is at the top if not already present
  if (title && !md.match(/^#\s/)) {
    md = `# ${title}\n\n${md}`;
  }

  return md;
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  let scraped = 0;
  let failed = 0;
  let skipped = 0;

  const seen = new Set();

  for (const [filename, pageId] of Object.entries(PAGE_MAP)) {
    if (seen.has(filename)) continue;
    seen.add(filename);

    console.log(`\n--- ${filename} ---`);

    if (!pageId) {
      console.log('  SKIP: No page ID');
      skipped++;
      continue;
    }

    console.log(`  Fetching page ID ${pageId}...`);
    const page = await fetchPage(pageId);

    if (!page || !page.content?.rendered) {
      console.log('  SKIP: No content found');
      skipped++;
      continue;
    }

    const title = decodeHtmlEntities(page.title?.rendered || '');
    const md = htmlToMarkdown(page.content.rendered, title);

    if (md.length < 50) {
      console.log(`  SKIP: Content too short (${md.length} chars): "${md.substring(0, 80)}..."`);
      skipped++;
      continue;
    }

    const outPath = join(OUT_DIR, filename);
    writeFileSync(outPath, md + '\n', 'utf-8');
    console.log(`  OK: ${md.length} chars -> ${filename}`);
    scraped++;
  }

  console.log(`\n=== Done: ${scraped} scraped, ${skipped} skipped, ${failed} failed ===`);
}

main().catch(console.error);
