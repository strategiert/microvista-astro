/**
 * Text-Audit v2: Vergleicht WP-Markdown Wort für Wort gegen Astro-Content.
 *
 * Korrekte Zuordnung:
 * - Posts (beitraege/*) → src/content/magazin/de/*.mdx
 * - EN Posts (en/posts/*) → src/content/magazin/en/*.mdx
 * - Pages → src/data/static-pages/*.md
 * - Prüfaufgaben → src/data/static-pages/pruefaufgabe-*.md + src/data/pruefaufgaben/*.md
 * - Dienstleistungen → src/data/static-pages/dienstleistung-*.md + src/data/dienstleistungen/*.md
 * - Branchen → src/content/branchen/*.yaml
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const wpData = JSON.parse(readFileSync(join(ROOT, 'scraped-content/all-content.json'), 'utf8'));

// ── Helpers ──
function normalize(text) {
  if (!text) return '';
  return text
    .replace(/^---[\s\S]*?---\n*/m, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*|__/g, '').replace(/\*|_/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\{[^}]*\}/g, '')
    .replace(/import\s+.*$/gm, '')
    .replace(/export\s+.*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^[-:| ]+$/gm, '')
    .replace(/\|.*\|/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[""„]/g, '"').replace(/['']/g, "'").replace(/–/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function getWords(text) {
  return normalize(text).toLowerCase().split(/\s+/).filter(w => w.length > 2);
}

function overlap(wpWords, astroWords) {
  if (!wpWords.length) return 1; // No WP content = nothing to check
  if (!astroWords.length) return 0;
  const set = new Set(astroWords);
  return wpWords.filter(w => set.has(w)).length / wpWords.length;
}

// Paragraph-level comparison
function paragraphCheck(wpMarkdown, astroText) {
  const wpParas = wpMarkdown.split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => {
      const clean = normalize(p);
      return clean.length > 40 && !clean.startsWith('get your') && !clean.startsWith('express-');
    });

  if (wpParas.length === 0) return { total: 0, found: 0, missing: [] };

  const astroLower = normalize(astroText).toLowerCase();
  let found = 0;
  const missing = [];

  for (const para of wpParas) {
    const clean = normalize(para).toLowerCase();
    // Check if first 50 chars of paragraph exist in astro
    const snippet = clean.substring(0, 50);
    if (snippet.length < 20) { found++; continue; }

    if (astroLower.includes(snippet)) {
      found++;
    } else {
      // Try a shorter match (30 chars)
      const short = clean.substring(0, 30);
      if (astroLower.includes(short)) {
        found++;
      } else {
        missing.push(normalize(para).substring(0, 150));
      }
    }
  }

  return { total: wpParas.length, found, missing };
}

// ── Load all Astro content into a flat map ──
function readFile(path) {
  try { return readFileSync(path, 'utf8'); } catch { return ''; }
}

function loadAllContent() {
  const content = {};

  // Magazine MDX
  for (const lang of ['de', 'en']) {
    const dir = join(ROOT, 'src/content/magazin', lang);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
      content[`magazin/${lang}/${basename(f, '.mdx')}`] = readFile(join(dir, f));
    }
  }

  // Static pages
  const spDir = join(ROOT, 'src/data/static-pages');
  if (existsSync(spDir)) {
    for (const f of readdirSync(spDir).filter(f => f.endsWith('.md'))) {
      content[`static/${basename(f, '.md')}`] = readFile(join(spDir, f));
    }
  }

  // Data pruefaufgaben
  const paDir = join(ROOT, 'src/data/pruefaufgaben');
  if (existsSync(paDir)) {
    for (const f of readdirSync(paDir).filter(f => f.endsWith('.md'))) {
      content[`pruefaufgaben/${basename(f, '.md')}`] = readFile(join(paDir, f));
    }
  }

  // Data dienstleistungen
  const dlDir = join(ROOT, 'src/data/dienstleistungen');
  if (existsSync(dlDir)) {
    for (const f of readdirSync(dlDir).filter(f => f.endsWith('.md'))) {
      content[`dienstleistungen/${basename(f, '.md')}`] = readFile(join(dlDir, f));
    }
  }

  // Branchen YAML
  const brDir = join(ROOT, 'src/content/branchen');
  if (existsSync(brDir)) {
    for (const f of readdirSync(brDir).filter(f => f.endsWith('.yaml'))) {
      content[`branchen/${basename(f, '.yaml')}`] = readFile(join(brDir, f));
    }
  }

  return content;
}

const astro = loadAllContent();

// ── Slug-based matching rules ──
function findMatch(wp) {
  const slug = wp.slug;
  const lang = wp.lang;
  const lastSeg = slug.split('/').pop();

  const candidates = [];

  // 1. Posts → magazin
  if (wp.type === 'post') {
    if (lang === 'de' && slug.startsWith('beitraege/')) {
      const key = `magazin/de/${slug.replace('beitraege/', '')}`;
      if (astro[key]) return { key, content: astro[key] };
    }
    if (lang === 'en' && slug.startsWith('en/posts/')) {
      const key = `magazin/en/${slug.replace('en/posts/', '')}`;
      if (astro[key]) return { key, content: astro[key] };
    }
    // beitraege index
    if (slug === 'beitraege' || slug === 'en/posts') return null; // listing pages
  }

  // 2. Prüfaufgaben
  if (wp.type === 'pruefaufgabe') {
    // Try static-pages first
    const spKey = `static/pruefaufgabe-${lastSeg}`;
    if (astro[spKey]) return { key: spKey, content: astro[spKey] };
    // Try data/pruefaufgaben
    const paKey = `pruefaufgaben/${lastSeg}`;
    if (astro[paKey]) return { key: paKey, content: astro[paKey] };
    // Index page
    if (lastSeg === 'prufaufgaben' || lastSeg === 'inspection-tasks') {
      if (astro['static/pruefaufgabe-index']) return { key: 'static/pruefaufgabe-index', content: astro['static/pruefaufgabe-index'] };
    }
  }

  // 3. Dienstleistungen
  if (wp.type === 'dienstleistung') {
    const dlMap = {
      'ct-labor': 'dienstleistung-ct-labor',
      'ct-laboratory': 'dienstleistung-ct-labor',
      'ct-datenauswertung': 'dienstleistung-ct-datenauswertung',
      'ct-data-analysis': 'dienstleistung-ct-datenauswertung',
      'scanexpress-mobiles-industrielles-ct': 'dienstleistung-scanexpress',
      'dienstleistungen': 'dienstleistung-index',
      'services': 'dienstleistung-index',
    };
    const mapped = dlMap[lastSeg];
    if (mapped && astro[`static/${mapped}`]) return { key: `static/${mapped}`, content: astro[`static/${mapped}`] };
    // Also check data dir
    const dlKey = `dienstleistungen/${lastSeg}`;
    if (astro[dlKey]) return { key: dlKey, content: astro[dlKey] };
  }

  // 4. Press
  if (wp.type === 'press') {
    // DE press → mapped to magazin or newsroom
    const magKey = `magazin/de/${lastSeg}`;
    if (astro[magKey]) return { key: magKey, content: astro[magKey] };
    // EN press
    const magEnKey = `magazin/en/${lastSeg}`;
    if (astro[magEnKey]) return { key: magEnKey, content: astro[magEnKey] };
    return null; // press releases → newsroom (dynamic)
  }

  // 5. Static pages (DE)
  if (lang === 'de') {
    // Direct slug match
    const directKeys = [
      `static/${lastSeg}-de`,
      `static/${lastSeg}`,
      `static/${slug.replace(/\//g, '-')}`,
    ];
    for (const k of directKeys) {
      if (astro[k]) return { key: k, content: astro[k] };
    }

    // Special mappings
    const deMap = {
      'index': 'static/index-homepage',
      'datenschutzerklaerung': 'static/datenschutz',
      'cookie-richtlinie-eu': 'static/cookie-richtlinie',
      'industrielle-computertomographie/faq': 'static/faq-de',
    };
    if (deMap[slug] && astro[deMap[slug]]) return { key: deMap[slug], content: astro[deMap[slug]] };

    // Branchen mapping
    const branchenMap = {
      'zerstoerungsfreie-pruefung-automobilindustrie': 'automotive',
      'zerstoerungsfreie-pruefung-leichtmetallguss': 'leichtmetallguss',
      'zerstorungsfreie-prufung-von-eisenguss': 'eisenguss',
      'zerstoerungsfreie-pruefung-batteriesystemen': 'e-mobilitaet',
      'pruefung-additiv-gefertigter-bauteile': 'additive-fertigung',
      'zfp-archaeologie': 'archaeologie',
      'zerstoerungsfreie-werkstoffpruefung': 'werkstoffpruefung',
      'forschung-entwicklung': 'forschung-entwicklung',
    };
    if (branchenMap[slug]) {
      const bk = `branchen/${branchenMap[slug]}`;
      if (astro[bk]) return { key: bk, content: astro[bk] };
    }
  }

  // 6. EN pages
  if (lang === 'en') {
    const enMap = {
      'en/contact': 'static/kontakt-de',
      'en/employees': 'static/team-en',
      'en/certificates': 'static/zertifizierungen-en',
      'en/general-terms-and-conditions': 'static/agb-en',
      'en/imprint': 'static/impressum-en',
      'en/data-privacy': 'static/datenschutz-en',
      'en/cookie-policy': 'static/cookie-richtlinie-en',
      'en/questionnaire': 'static/fragebogen-de',
      'en/media-library': 'static/mediathek-de',
      'en/news-center': 'static/newsroom-de',
      'en/press-releases': 'static/pressemitteilungen-de',
      'en/reward-program': 'static/bonusprogramm-de',
      'en/serial-testing': 'static/zerstoerungsfreie-serienpruefung-de',
      'en/registration-live-demo-scanexpress': 'static/live-demo-scanexpress-de',
      'en/research-development': 'static/forschung-entwicklung-de',
      'en/environmental-alliance-saxony-anhalt': 'static/zertifizierungen-en',
      'en/industrial-computed-tomography/faq-2': 'static/faq-en',
    };
    if (enMap[slug] && astro[enMap[slug]]) return { key: enMap[slug], content: astro[enMap[slug]] };

    // EN prüfaufgaben
    const enPaMap = {
      'porosity-analysis': 'porositatsanalyse',
      'wall-thickness-measurement': 'messung-wandstaerken',
      'assembly-and-joining-inspection': 'montage-fugekontrolle',
      'burr-core-residues-and-chips': 'grat-kernreste-spaene',
      'initial-sample-inspection-report': 'erstmusterpruefbericht',
      'quality-assurance-for-hairpin-stators': 'hairpin-statoren',
      'reverse-engineerin': 'reverse-engineering',
    };
    if (enPaMap[lastSeg]) {
      const k = `static/pruefaufgabe-${enPaMap[lastSeg]}`;
      if (astro[k]) return { key: k, content: astro[k] };
    }

    // EN measuring/weld pages → static pages
    if (slug === 'en/measuring-geometric-tolerances-gdt-methods-and-procedures') {
      return astro['static/pruefaufgabe-form-und-lagetoleranzen']
        ? { key: 'static/pruefaufgabe-form-und-lagetoleranzen', content: astro['static/pruefaufgabe-form-und-lagetoleranzen'] }
        : null;
    }
    if (slug === 'en/non-destructive-weld-testing-methods-procedures-and-techniques') {
      return astro['static/pruefaufgabe-schweissnahtpruefung']
        ? { key: 'static/pruefaufgabe-schweissnahtpruefung', content: astro['static/pruefaufgabe-schweissnahtpruefung'] }
        : null;
    }
    if (slug === 'en/cad-target-actual-comparison') {
      return astro['static/pruefaufgabe-cad-soll-ist-vergleich']
        ? { key: 'static/pruefaufgabe-cad-soll-ist-vergleich', content: astro['static/pruefaufgabe-cad-soll-ist-vergleich'] }
        : null;
    }
  }

  // FR pages
  if (lang === 'fr') {
    const frMap = {
      'fr/impression': 'static/impressum.fr',
      'fr/clause-de-non-responsabilite': 'static/agb.fr',
      'fr/politique-en-matiere-de-cookies': 'static/datenschutz.fr',
      'fr/declaration-de-confidentialite-ue': 'static/datenschutz.fr',
    };
    if (frMap[slug] && astro[frMap[slug]]) return { key: frMap[slug], content: astro[frMap[slug]] };
  }

  return null;
}

// ── Run ──
const results = [];

for (const wp of wpData) {
  const wpWords = getWords(wp.markdown);
  const match = findMatch(wp);

  const r = {
    slug: wp.slug,
    title: wp.title,
    type: wp.type,
    lang: wp.lang,
    wpWords: wpWords.length,
    wpChars: normalize(wp.markdown).length,
    matchKey: null,
    astroWords: 0,
    astroChars: 0,
    overlapPct: 0,
    parasTotal: 0,
    parasFound: 0,
    parasMissing: [],
    status: 'no_match',
  };

  if (match) {
    const astroWords = getWords(match.content);
    const ov = overlap(wpWords, astroWords);
    const pCheck = paragraphCheck(wp.markdown, match.content);

    r.matchKey = match.key;
    r.astroWords = astroWords.length;
    r.astroChars = normalize(match.content).length;
    r.overlapPct = Math.round(ov * 100);
    r.parasTotal = pCheck.total;
    r.parasFound = pCheck.found;
    r.parasMissing = pCheck.missing;

    if (wpWords.length <= 20) {
      // Short pages (navs, CTAs) — check paragraph match
      r.status = pCheck.total === 0 || pCheck.found >= pCheck.total * 0.5 ? 'ok_short' : 'partial_short';
    } else if (ov >= 0.80) {
      r.status = 'complete';
    } else if (ov >= 0.50) {
      r.status = 'partial';
    } else if (ov >= 0.20) {
      r.status = 'weak';
    } else {
      r.status = 'rewritten';
    }
  }

  results.push(r);
}

// ── Print Report ──
const statuses = { complete: 0, ok_short: 0, rewritten: 0, partial: 0, partial_short: 0, weak: 0, no_match: 0 };
results.forEach(r => statuses[r.status]++);

console.log('=== TEXT-AUDIT v2: WP → Astro ===\n');
console.log(`Vollständig (≥80% Overlap):     ${statuses.complete}`);
console.log(`Kurze Seiten (OK):              ${statuses.ok_short}`);
console.log(`Umgeschrieben (Match, <20%):    ${statuses.rewritten}`);
console.log(`Teilweise (50-79%):             ${statuses.partial}`);
console.log(`Schwach (20-49%):               ${statuses.weak}`);
console.log(`Kein Match:                     ${statuses.no_match}`);
console.log(`Gesamt:                         ${results.length}`);

// Show problems
const problems = results.filter(r => ['partial', 'weak', 'no_match'].includes(r.status));
if (problems.length > 0) {
  console.log(`\n\n=== PROBLEME (${problems.length}) ===\n`);
  problems.sort((a, b) => a.overlapPct - b.overlapPct);

  for (const r of problems) {
    console.log(`[${r.status.toUpperCase()}] ${r.lang.toUpperCase()} | ${r.slug}`);
    console.log(`  "${r.title}"`);
    console.log(`  Overlap: ${r.overlapPct}% | WP: ${r.wpWords} Wörter | Astro: ${r.astroWords} Wörter`);
    console.log(`  Match: ${r.matchKey || 'KEINER'}`);
    if (r.parasMissing.length > 0) {
      console.log(`  Absätze: ${r.parasFound}/${r.parasTotal} gefunden`);
      r.parasMissing.slice(0, 3).forEach(p => console.log(`    FEHLT: "${p.substring(0, 100)}..."`));
    }
    console.log('');
  }
}

// Show rewritten pages
const rewritten = results.filter(r => r.status === 'rewritten');
if (rewritten.length > 0) {
  console.log(`\n=== UMGESCHRIEBEN (${rewritten.length}) — Content existiert, aber neu formuliert ===\n`);
  for (const r of rewritten) {
    console.log(`  ${r.lang.toUpperCase()} | ${r.slug} → ${r.matchKey} | WP=${r.wpWords} Astro=${r.astroWords}`);
  }
}

// Show no_match
const noMatch = results.filter(r => r.status === 'no_match');
if (noMatch.length > 0) {
  console.log(`\n=== KEIN MATCH (${noMatch.length}) — Keine Astro-Datei gefunden ===\n`);
  for (const r of noMatch) {
    console.log(`  ${r.lang.toUpperCase()} | ${r.type} | ${r.slug} | "${r.title}" (${r.wpWords} Wörter)`);
  }
}

// Save JSON for dashboard
writeFileSync(join(ROOT, 'docs/text-audit-v2.json'), JSON.stringify(results, null, 2));
console.log('\nJSON gespeichert: docs/text-audit-v2.json');
