#!/usr/bin/env node
/**
 * Generiert fehlende Astro-Seiten für Prüfaufgaben und andere Seiten
 * die loadStaticPage() zum Laden des Contents nutzen.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FULL_DIR = join(__dirname, '..', 'scraped-content', 'full');
const PAGES_DIR = join(__dirname, '..', 'src', 'pages');

function getTitle(slug) {
  const d = JSON.parse(readFileSync(join(FULL_DIR, `${slug}.json`), 'utf8'));
  return d.title || slug;
}

function getMeta(slug) {
  const d = JSON.parse(readFileSync(join(FULL_DIR, `${slug}.json`), 'utf8'));
  return { title: d.title || slug, desc: d.metaDescription || '' };
}

// Template für Prüfaufgaben-Einzelseite
function pruefaufgabeTemplate({ title, desc, contentSlug, relativePath, breadcrumbParent }) {
  return `---
import BaseLayout from '${relativePath}layouts/BaseLayout.astro';
import Header from '${relativePath}components/layout/Header.astro';
import Footer from '${relativePath}components/layout/Footer.astro';
import Breadcrumbs from '${relativePath}components/layout/Breadcrumbs.astro';
import { loadStaticPage } from '${relativePath}lib/load-static-page';
import { type Locale } from '${relativePath}i18n/translations';

const locale = (Astro.locals.locale || 'de') as Locale;
const content = await loadStaticPage('${contentSlug}', locale);
---

<BaseLayout title="${title}" description="${desc.replace(/"/g, '&quot;')}">
  <Header slot="header" />

  <div class="static-page">
    <div class="container">
      <Breadcrumbs items={[
        { label: 'Prüfaufgaben', href: '/industrielle-computertomographie/prufaufgaben/' },
        { label: '${title}' }
      ]} />
      <article class="static-content">
        {content ? <div set:html={content} /> : <p>Inhalt folgt in Kürze.</p>}
      </article>
    </div>
  </div>

  <Footer slot="footer" />
</BaseLayout>

<style>
  .static-page { padding-bottom: var(--space-16); }
  .static-content { max-width: 900px; margin: 0 auto; padding: var(--space-8) 0; }
  .static-content :global(h1) { font-size: var(--text-4xl); margin-bottom: var(--space-8); }
  .static-content :global(h2) { margin-top: var(--space-8); margin-bottom: var(--space-4); }
  .static-content :global(h3) { margin-top: var(--space-6); margin-bottom: var(--space-3); }
  .static-content :global(h4) { margin-top: var(--space-4); margin-bottom: var(--space-2); }
  .static-content :global(p) { line-height: 1.8; margin-bottom: var(--space-4); }
  .static-content :global(ul), .static-content :global(ol) { padding-left: var(--space-6); margin-bottom: var(--space-4); }
  .static-content :global(li) { line-height: 1.7; margin-bottom: var(--space-2); }
  .static-content :global(table) { width: 100%; border-collapse: collapse; margin-bottom: var(--space-6); }
  .static-content :global(th), .static-content :global(td) { padding: var(--space-3); border: 1px solid var(--border, #eef2f5); }
  .static-content :global(th) { background: var(--surface, #f8fafc); font-weight: 600; }
  .static-content :global(img) { max-width: 100%; height: auto; border-radius: var(--radius-xl); margin: var(--space-4) 0; }
  .static-content :global(a) { color: var(--accent, #ee7711); }
  .static-content :global(strong) { font-weight: 700; }
</style>
`;
}

// Template für allgemeine Content-Seite (End-of-Line etc.)
function genericTemplate({ title, desc, contentSlug, relativePath, breadcrumbLabel }) {
  return `---
import BaseLayout from '${relativePath}layouts/BaseLayout.astro';
import Header from '${relativePath}components/layout/Header.astro';
import Footer from '${relativePath}components/layout/Footer.astro';
import Breadcrumbs from '${relativePath}components/layout/Breadcrumbs.astro';
import { loadStaticPage } from '${relativePath}lib/load-static-page';
import { type Locale } from '${relativePath}i18n/translations';

const locale = (Astro.locals.locale || 'de') as Locale;
const content = await loadStaticPage('${contentSlug}', locale);
---

<BaseLayout title="${title}" description="${desc.replace(/"/g, '&quot;')}">
  <Header slot="header" />

  <div class="static-page">
    <div class="container">
      <Breadcrumbs items={[{ label: '${breadcrumbLabel}' }]} />
      <article class="static-content">
        {content ? <div set:html={content} /> : <p>Inhalt folgt in Kürze.</p>}
      </article>
    </div>
  </div>

  <Footer slot="footer" />
</BaseLayout>

<style>
  .static-page { padding-bottom: var(--space-16); }
  .static-content { max-width: 900px; margin: 0 auto; padding: var(--space-8) 0; }
  .static-content :global(h1) { font-size: var(--text-4xl); margin-bottom: var(--space-8); }
  .static-content :global(h2) { margin-top: var(--space-8); margin-bottom: var(--space-4); }
  .static-content :global(h3) { margin-top: var(--space-6); margin-bottom: var(--space-3); }
  .static-content :global(h4) { margin-top: var(--space-4); margin-bottom: var(--space-2); }
  .static-content :global(p) { line-height: 1.8; margin-bottom: var(--space-4); }
  .static-content :global(ul), .static-content :global(ol) { padding-left: var(--space-6); margin-bottom: var(--space-4); }
  .static-content :global(li) { line-height: 1.7; margin-bottom: var(--space-2); }
  .static-content :global(table) { width: 100%; border-collapse: collapse; margin-bottom: var(--space-6); }
  .static-content :global(th), .static-content :global(td) { padding: var(--space-3); border: 1px solid var(--border, #eef2f5); }
  .static-content :global(th) { background: var(--surface, #f8fafc); font-weight: 600; }
  .static-content :global(img) { max-width: 100%; height: auto; border-radius: var(--radius-xl); margin: var(--space-4) 0; }
  .static-content :global(a) { color: var(--accent, #ee7711); }
  .static-content :global(strong) { font-weight: 700; }
</style>
`;
}

// Prüfaufgaben-Seiten erstellen
const pruefaufgaben = [
  { slug: 'porositatsanalyse', file: 'porositatsanalyse.astro' },
  { slug: 'messung-wandstaerken', file: 'messung-wandstaerken.astro' },
  { slug: 'cad-soll-ist-vergleich', file: 'cad-soll-ist-vergleich.astro' },
  { slug: 'reverse-engineering', file: 'reverse-engineering.astro' },
  { slug: 'grat-kernreste-spaene', file: 'grat-kernreste-spaene.astro' },
  { slug: 'hairpin-statoren', file: 'hairpin-statoren.astro' },
  { slug: 'montage-fugekontrolle', file: 'montage-fugekontrolle.astro' },
  { slug: 'erstmusterpruefbericht', file: 'erstmusterpruefbericht.astro' },
  { slug: 'laminographie', file: 'laminographie.astro' },
  { slug: 'schweissnahtpruefung', file: 'schweissnahtpruefung.astro' },
  { slug: 'form-und-lagetoleranzen', file: 'form-und-lagetoleranzen.astro' },
  { slug: '3d-vermessung', file: '3d-vermessung.astro' },
];

// Seiten unter korrektem URL-Pfad: /industrielle-computertomographie/prufaufgaben/
const pruefaufgabenDir = join(PAGES_DIR, 'industrielle-computertomographie', 'prufaufgaben');
mkdirSync(pruefaufgabenDir, { recursive: true });

let ok = 0;
for (const { slug, file } of pruefaufgaben) {
  const meta = getMeta(slug);
  const code = pruefaufgabeTemplate({
    title: meta.title,
    desc: meta.desc,
    contentSlug: `pruefaufgabe-${slug}`,
    relativePath: '../../../',
    breadcrumbParent: 'Prüfaufgaben',
  });
  writeFileSync(join(pruefaufgabenDir, file), code, 'utf8');
  console.log(`✓ industrielle-computertomographie/prufaufgaben/${file}`);
  ok++;
}

// End-of-Line-Test
const eolMeta = getMeta('end-of-line-test');
const eolCode = genericTemplate({
  title: eolMeta.title,
  desc: eolMeta.desc,
  contentSlug: 'end-of-line-test',
  relativePath: '../',
  breadcrumbLabel: 'End of Line Test',
});
writeFileSync(join(PAGES_DIR, 'end-of-line-test.astro'), eolCode, 'utf8');
console.log(`✓ end-of-line-test.astro`);
ok++;

// Dienstleistungen unter /industrielle-computertomographie/dienstleistungen/
const icDienstDir = join(PAGES_DIR, 'industrielle-computertomographie', 'dienstleistungen');
mkdirSync(icDienstDir, { recursive: true });

const dienstleistungen = [
  { slug: 'dienstleistungen', file: 'index.astro', contentSlug: 'dienstleistung-index', label: 'Dienstleistungen' },
  { slug: 'ct-labor', file: 'ct-labor.astro', contentSlug: 'dienstleistung-ct-labor', label: 'CT-Labor' },
  { slug: 'ct-datenauswertung', file: 'ct-datenauswertung.astro', contentSlug: 'dienstleistung-ct-datenauswertung', label: 'CT-Datenauswertung' },
  { slug: 'scanexpress', file: 'scanexpress-mobiles-industrielles-ct.astro', contentSlug: 'dienstleistung-scanexpress', label: 'SCANEXPRESS' },
];

for (const { slug, file, contentSlug, label } of dienstleistungen) {
  const meta = getMeta(slug);
  const code = genericTemplate({
    title: meta.title,
    desc: meta.desc,
    contentSlug,
    relativePath: '../../../',
    breadcrumbLabel: label,
  });
  writeFileSync(join(icDienstDir, file), code, 'utf8');
  console.log(`✓ industrielle-computertomographie/dienstleistungen/${file}`);
  ok++;
}

// /industrielle-computertomographie/faq/
const icDir = join(PAGES_DIR, 'industrielle-computertomographie');
mkdirSync(icDir, { recursive: true });
const faqMeta = getMeta('faq');
const faqCode = genericTemplate({
  title: faqMeta.title,
  desc: faqMeta.desc,
  contentSlug: 'faq',
  relativePath: '../../',
  breadcrumbLabel: 'FAQ',
});
writeFileSync(join(icDir, 'faq.astro'), faqCode, 'utf8');
console.log(`✓ industrielle-computertomographie/faq.astro`);
ok++;

// /industrielle-computertomographie/prufaufgaben/ index
const icPruefDir = join(PAGES_DIR, 'industrielle-computertomographie', 'prufaufgaben');
const pruefIndexMeta = getMeta('prufaufgaben');
const pruefIndexCode = genericTemplate({
  title: pruefIndexMeta.title,
  desc: pruefIndexMeta.desc,
  contentSlug: 'pruefaufgabe-index',
  relativePath: '../../../',
  breadcrumbLabel: 'Prüfaufgaben',
});
writeFileSync(join(icPruefDir, 'index.astro'), pruefIndexCode, 'utf8');
console.log(`✓ industrielle-computertomographie/prufaufgaben/index.astro`);
ok++;

console.log(`\n=== ${ok} Seiten generiert ===`);
