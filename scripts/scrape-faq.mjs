import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(import.meta.dirname, '..', 'src', 'data', 'static-pages');
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

async function scrapeFaq(pageId, filename, title) {
  console.log(`\n--- ${filename} (page ${pageId}) ---`);
  const res = await fetch(`https://www.microvista.de/wp-json/wp/v2/pages/${pageId}?_fields=content`);
  const json = await res.json();
  const $ = cheerio.load(json.content.rendered);

  const sections = [];
  sections.push(`# ${title}\n`);

  // Extract toggle/accordion items
  $('.elementor-toggle-item').each((i, item) => {
    const titleEl = $(item).find('.elementor-toggle-title');
    const contentEl = $(item).find('.elementor-tab-content');

    const question = titleEl.text().trim();
    const answerHtml = contentEl.html();

    if (question && answerHtml) {
      const answer = turndown.turndown(answerHtml).trim();
      if (answer) {
        sections.push(`## ${question}\n\n${answer}\n`);
      }
    }
  });

  if (sections.length <= 1) {
    console.log('  SKIP: No FAQ items found');
    return;
  }

  const md = sections.join('\n');
  const outPath = join(OUT_DIR, filename);
  writeFileSync(outPath, md + '\n', 'utf-8');
  console.log(`  OK: ${sections.length - 1} questions, ${md.length} chars`);
}

await scrapeFaq(3160, 'faq-de.md', 'FAQ');
await scrapeFaq(3919, 'faq-en.md', 'FAQ');
// Clean up temp script
import { unlinkSync } from 'node:fs';
try { unlinkSync(join(import.meta.dirname, 'check-faq-structure.mjs')); } catch {}
