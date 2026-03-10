/**
 * Content-Audit: Wort-für-Wort-Vergleich WordPress → Astro
 *
 * Vergleicht den gescrapeten WP-Content (all-content.json) gegen
 * die neuen Astro-Dateien (MDX, MD, .astro) und erzeugt ein HTML-Dashboard.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load WP content ──
const wpData = JSON.parse(readFileSync(join(ROOT, 'scraped-content/all-content.json'), 'utf8'));
console.log(`Loaded ${wpData.length} WP entries`);

// ── Helpers ──
function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\n*/m, '');
}

function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')        // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')  // links → text
    .replace(/^#+\s+/gm, '')                // headings
    .replace(/\*\*|__/g, '')                // bold
    .replace(/\*|_/g, '')                   // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')     // code
    .replace(/^>\s+/gm, '')                // blockquotes
    .replace(/^[-*]\s+/gm, '')             // list items
    .replace(/^\d+\.\s+/gm, '')            // numbered list
    .replace(/\|.*\|/g, '')                // tables
    .replace(/^[-:| ]+$/gm, '')            // table separators
    .replace(/<[^>]+>/g, '')               // HTML tags
    .replace(/&[a-z]+;/g, ' ')             // HTML entities
    .replace(/\{[^}]*\}/g, '')             // JSX/MDX expressions
    .replace(/import\s+.*$/gm, '')         // import statements
    .replace(/export\s+.*$/gm, '');        // export statements
}

function normalizeText(text) {
  if (!text) return '';
  return stripMarkdown(stripFrontmatter(text))
    .replace(/\s+/g, ' ')
    .replace(/[""„]/g, '"')
    .replace(/['']/g, "'")
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .trim()
    .toLowerCase();
}

function extractWords(text) {
  return normalizeText(text).split(/\s+/).filter(w => w.length > 2);
}

function wordOverlap(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  const setB = new Set(wordsB);
  const matched = wordsA.filter(w => setB.has(w)).length;
  return matched / wordsA.length;
}

// ── Extract images from markdown ──
function extractImages(markdown) {
  if (!markdown) return [];
  const imgs = [];
  // ![alt](url)
  const mdImgs = markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
  for (const m of mdImgs) imgs.push(m[2]);
  // <img src="url"
  const htmlImgs = markdown.matchAll(/<img[^>]+src=["']([^"']+)["']/g);
  for (const m of htmlImgs) imgs.push(m[1]);
  return imgs;
}

// ── Read all Astro content files ──
function readDirRecursive(dir, exts) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readDirRecursive(fullPath, exts));
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── Collect all new Astro content ──
const astroContent = {};

// 1. Magazine MDX (DE + EN)
for (const lang of ['de', 'en']) {
  const dir = join(ROOT, 'src/content/magazin', lang);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
    const slug = basename(f, '.mdx');
    const content = readFileSync(join(dir, f), 'utf8');
    astroContent[`magazin/${lang}/${slug}`] = { content, path: join(dir, f), type: 'magazin' };
  }
}

// 2. Data markdown (pruefaufgaben, dienstleistungen, static-pages)
for (const sub of ['pruefaufgaben', 'dienstleistungen', 'static-pages']) {
  const dir = join(ROOT, 'src/data', sub);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const slug = basename(f, '.md');
    const content = readFileSync(join(dir, f), 'utf8');
    astroContent[`data/${sub}/${slug}`] = { content, path: join(dir, f), type: sub };
  }
}

// 3. Branchen YAML
const branchenDir = join(ROOT, 'src/content/branchen');
if (existsSync(branchenDir)) {
  for (const f of readdirSync(branchenDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))) {
    const slug = basename(f, extname(f));
    const content = readFileSync(join(branchenDir, f), 'utf8');
    astroContent[`branchen/${slug}`] = { content, path: join(branchenDir, f), type: 'branchen' };
  }
}

// 4. Astro page files (for static pages like kontakt, team, etc.)
const pagesDir = join(ROOT, 'src/pages');
const astroPages = readDirRecursive(pagesDir, ['.astro']);
for (const p of astroPages) {
  const rel = p.replace(pagesDir, '').replace(/\\/g, '/').replace(/^\//, '');
  const content = readFileSync(p, 'utf8');
  astroContent[`pages/${rel}`] = { content, path: p, type: 'page' };
}

console.log(`Loaded ${Object.keys(astroContent).length} Astro content files`);

// ── Match WP entries to Astro files ──
function findAstroMatch(wpEntry) {
  const slug = wpEntry.slug;
  const lang = wpEntry.lang;
  const type = wpEntry.type;

  // Extract the last slug segment
  const lastSlug = slug.split('/').pop();

  const candidates = [];

  // Try magazine match
  const magKey = `magazin/${lang}/${lastSlug}`;
  if (astroContent[magKey]) candidates.push({ key: magKey, ...astroContent[magKey] });

  // Try EN posts (old slug: en/posts/X → magazin/en/X)
  if (lang === 'en' && slug.startsWith('en/posts/')) {
    const enSlug = slug.replace('en/posts/', '');
    const enKey = `magazin/en/${enSlug}`;
    if (astroContent[enKey]) candidates.push({ key: enKey, ...astroContent[enKey] });
  }

  // Try data matches
  for (const sub of ['pruefaufgaben', 'dienstleistungen', 'static-pages']) {
    const dataKey = `data/${sub}/${lastSlug}`;
    if (astroContent[dataKey]) candidates.push({ key: dataKey, ...astroContent[dataKey] });
  }

  // Try branchen
  const brKey = `branchen/${lastSlug}`;
  if (astroContent[brKey]) candidates.push({ key: brKey, ...astroContent[brKey] });

  // Try page files
  for (const [key, val] of Object.entries(astroContent)) {
    if (key.startsWith('pages/') && key.includes(lastSlug)) {
      candidates.push({ key, ...val });
    }
  }

  // If no direct match, try fuzzy matching on all content
  if (candidates.length === 0) {
    const wpWords = extractWords(wpEntry.markdown);
    if (wpWords.length < 10) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const [key, val] of Object.entries(astroContent)) {
      const astroWords = extractWords(val.content);
      if (astroWords.length < 10) continue;
      const score = wordOverlap(wpWords.slice(0, 100), astroWords);
      if (score > bestScore && score > 0.4) {
        bestScore = score;
        bestMatch = { key, ...val, score };
      }
    }

    return bestMatch;
  }

  return candidates[0];
}

// ── Run comparison ──
const results = [];

for (const wp of wpData) {
  const wpWords = extractWords(wp.markdown);
  const wpImages = wp.images || [];
  const match = findAstroMatch(wp);

  let result = {
    oldUrl: wp.url,
    oldSlug: wp.slug,
    title: wp.title,
    type: wp.type,
    lang: wp.lang,
    wpWordCount: wpWords.length,
    wpImageCount: wpImages.length,
    wpImages: wpImages,
    status: 'missing',       // missing | partial | complete
    matchKey: null,
    matchPath: null,
    astroWordCount: 0,
    astroImageCount: 0,
    overlap: 0,
    missingWords: [],
    missingImages: [],
    notes: ''
  };

  if (match) {
    const astroWords = extractWords(match.content);
    const astroImgs = extractImages(match.content);
    const overlap = wordOverlap(wpWords, astroWords);

    // Find significantly missing words (content words that appear in WP but not Astro)
    const astroWordSet = new Set(astroWords);
    const missingWords = [...new Set(wpWords.filter(w => !astroWordSet.has(w) && w.length > 4))];

    // Check images
    const astroImgSet = new Set(astroImgs.map(i => i.split('/').pop()));
    const missingImages = wpImages.filter(img => {
      const imgFile = img.split('/').pop();
      return !astroImgSet.has(imgFile);
    });

    result.matchKey = match.key;
    result.matchPath = match.path;
    result.astroWordCount = astroWords.length;
    result.astroImageCount = astroImgs.length;
    result.overlap = Math.round(overlap * 100);
    result.missingWords = missingWords.slice(0, 30);
    result.missingImages = missingImages;

    if (overlap >= 0.85) {
      result.status = 'complete';
    } else if (overlap >= 0.3) {
      result.status = 'partial';
    } else {
      result.status = 'weak';
    }
  }

  results.push(result);
}

// ── Stats ──
const complete = results.filter(r => r.status === 'complete').length;
const partial = results.filter(r => r.status === 'partial').length;
const weak = results.filter(r => r.status === 'weak').length;
const missing = results.filter(r => r.status === 'missing').length;

console.log('\n=== CONTENT AUDIT RESULTS ===');
console.log(`Complete (≥85%): ${complete}`);
console.log(`Partial (30-84%): ${partial}`);
console.log(`Weak (<30%): ${weak}`);
console.log(`Missing (no match): ${missing}`);
console.log(`Total: ${results.length}`);

// ── Generate HTML Dashboard ──
const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Microvista — Content-Audit: WP vs. Astro</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #0c0e12; --surface: #14171e; --surface-2: #1b1f28;
  --border: #262b36; --border-light: #333a48;
  --text: #e2e5eb; --text-muted: #7d8594; --text-dim: #4e5564;
  --green: #34d399; --green-bg: rgba(52,211,153,0.08); --green-border: rgba(52,211,153,0.2);
  --amber: #fbbf24; --amber-bg: rgba(251,191,36,0.08); --amber-border: rgba(251,191,36,0.2);
  --red: #f87171; --red-bg: rgba(248,113,113,0.08); --red-border: rgba(248,113,113,0.2);
  --orange: #fb923c; --orange-bg: rgba(251,146,60,0.08); --orange-border: rgba(251,146,60,0.2);
  --blue: #60a5fa; --blue-bg: rgba(96,165,250,0.08);
  --accent: #ff6600;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Instrument Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; line-height:1.5; }

.header { border-bottom:1px solid var(--border); padding:24px 40px; display:flex; align-items:center; justify-content:space-between; background:var(--surface); }
.header-left { display:flex; align-items:center; gap:16px; }
.logo-mark { width:10px; height:32px; background:var(--accent); border-radius:2px; }
.header h1 { font-size:18px; font-weight:600; letter-spacing:-0.3px; }
.header h1 span { color:var(--text-muted); font-weight:400; margin-left:8px; }
.header-right { font-family:'DM Mono',monospace; font-size:12px; color:var(--text-muted); }

.main { max-width:1500px; margin:0 auto; padding:32px 40px; }

.kpi-row { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:32px; }
.kpi-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:20px 24px; position:relative; overflow:hidden; }
.kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; }
.kpi-card.total::before { background:var(--blue); }
.kpi-card.complete::before { background:var(--green); }
.kpi-card.partial::before { background:var(--amber); }
.kpi-card.weak::before { background:var(--orange); }
.kpi-card.missing::before { background:var(--red); }
.kpi-label { font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-muted); margin-bottom:8px; }
.kpi-value { font-size:32px; font-weight:700; letter-spacing:-1px; font-family:'DM Mono',monospace; }
.kpi-card.total .kpi-value { color:var(--blue); }
.kpi-card.complete .kpi-value { color:var(--green); }
.kpi-card.partial .kpi-value { color:var(--amber); }
.kpi-card.weak .kpi-value { color:var(--orange); }
.kpi-card.missing .kpi-value { color:var(--red); }
.kpi-pct { font-size:12px; color:var(--text-dim); margin-top:4px; font-family:'DM Mono',monospace; }

.progress-section { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:24px; margin-bottom:32px; }
.progress-header { display:flex; justify-content:space-between; margin-bottom:16px; }
.progress-title { font-size:14px; font-weight:600; }
.progress-pct { font-family:'DM Mono',monospace; font-size:14px; }
.progress-bar { height:8px; background:var(--surface-2); border-radius:4px; overflow:hidden; display:flex; }
.progress-bar > div { height:100%; transition:width 0.6s ease; }
.seg-complete { background:var(--green); }
.seg-partial { background:var(--amber); }
.seg-weak { background:var(--orange); }
.seg-missing { background:var(--red); opacity:0.4; }
.progress-legend { display:flex; gap:20px; margin-top:12px; font-size:12px; color:var(--text-muted); }
.legend-dot { display:inline-block; width:8px; height:8px; border-radius:2px; margin-right:6px; vertical-align:middle; }

.controls { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center; }
.filter-group { display:flex; border:1px solid var(--border); border-radius:6px; overflow:hidden; }
.filter-btn { background:var(--surface); border:none; color:var(--text-muted); padding:8px 14px; font-size:12px; font-family:'Instrument Sans',sans-serif; font-weight:500; cursor:pointer; border-right:1px solid var(--border); transition:all 0.15s; }
.filter-btn:last-child { border-right:none; }
.filter-btn:hover { background:var(--surface-2); color:var(--text); }
.filter-btn.active { background:var(--surface-2); color:var(--text); box-shadow:inset 0 -2px 0 var(--accent); }
.search-input { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:8px 14px; color:var(--text); font-size:13px; font-family:'DM Mono',monospace; width:280px; outline:none; }
.search-input:focus { border-color:var(--accent); }
.search-input::placeholder { color:var(--text-dim); }
.result-count { font-size:12px; color:var(--text-dim); font-family:'DM Mono',monospace; margin-left:auto; }

.table-section { background:var(--surface); border:1px solid var(--border); border-radius:8px; overflow:hidden; }
.table-section-header { padding:16px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
.table-section-title { font-size:14px; font-weight:600; }
table { width:100%; border-collapse:collapse; font-size:13px; }
thead th { text-align:left; padding:10px 16px; background:var(--surface-2); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:1; cursor:pointer; user-select:none; white-space:nowrap; }
thead th:hover { color:var(--text); }
tbody tr { border-bottom:1px solid var(--border); transition:background 0.1s; }
tbody tr:hover { background:rgba(255,255,255,0.02); }
td { padding:10px 16px; vertical-align:top; }
.cell-path { font-family:'DM Mono',monospace; font-size:11px; word-break:break-all; max-width:260px; }
.cell-title { max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }

.status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:500; font-family:'DM Mono',monospace; white-space:nowrap; }
.status-badge.complete { background:var(--green-bg); color:var(--green); border:1px solid var(--green-border); }
.status-badge.partial { background:var(--amber-bg); color:var(--amber); border:1px solid var(--amber-border); }
.status-badge.weak { background:var(--orange-bg); color:var(--orange); border:1px solid var(--orange-border); }
.status-badge.missing { background:var(--red-bg); color:var(--red); border:1px solid var(--red-border); }

.lang-badge { font-family:'DM Mono',monospace; font-size:11px; padding:2px 6px; border-radius:3px; background:var(--surface-2); color:var(--text-muted); border:1px solid var(--border); text-transform:uppercase; }

.bar-mini { height:6px; background:var(--surface-2); border-radius:3px; overflow:hidden; min-width:80px; }
.bar-mini-fill { height:100%; border-radius:3px; transition:width 0.4s ease; }
.bar-mini-fill.complete { background:var(--green); }
.bar-mini-fill.partial { background:var(--amber); }
.bar-mini-fill.weak { background:var(--orange); }
.bar-mini-fill.missing { background:var(--red); }

.overlap-cell { display:flex; align-items:center; gap:8px; }
.overlap-pct { font-family:'DM Mono',monospace; font-size:12px; min-width:36px; text-align:right; }

.missing-words { font-size:11px; color:var(--text-dim); max-width:300px; line-height:1.6; }
.missing-words .word { display:inline-block; background:var(--red-bg); color:var(--red); border:1px solid var(--red-border); padding:1px 5px; border-radius:3px; margin:1px 2px; font-family:'DM Mono',monospace; font-size:10px; }

.img-count { font-family:'DM Mono',monospace; font-size:12px; }
.img-ok { color:var(--green); }
.img-warn { color:var(--amber); }
.img-bad { color:var(--red); }

.table-scroll { max-height:700px; overflow-y:auto; }
.table-scroll::-webkit-scrollbar { width:6px; }
.table-scroll::-webkit-scrollbar-track { background:var(--surface); }
.table-scroll::-webkit-scrollbar-thumb { background:var(--border-light); border-radius:3px; }

.detail-row { display:none; }
.detail-row.open { display:table-row; }
.detail-cell { padding:12px 24px; background:var(--surface-2); }
.detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.detail-block h4 { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
.detail-block .img-list { font-size:11px; font-family:'DM Mono',monospace; color:var(--text-dim); max-height:120px; overflow-y:auto; }
.detail-block .img-list div { padding:2px 0; }
.detail-block .img-missing { color:var(--red); }

.summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:32px; }
.summary-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:20px 24px; }
.summary-card h3 { font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin-bottom:16px; }
.summary-list { list-style:none; }
.summary-list li { padding:6px 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; font-size:13px; }
.summary-list li:last-child { border-bottom:none; }
.summary-list .label { color:var(--text-muted); }
.summary-list .value { font-family:'DM Mono',monospace; }

@media (max-width:1100px) { .kpi-row { grid-template-columns:repeat(3,1fr); } .summary-grid { grid-template-columns:1fr; } }
@media (max-width:700px) { .kpi-row { grid-template-columns:repeat(2,1fr); } .main { padding:20px 16px; } }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <div class="logo-mark"></div>
    <h1>Microvista<span>Content-Audit: WP vs. Astro</span></h1>
  </div>
  <div class="header-right">Stand: ${new Date().toLocaleDateString('de-DE')}</div>
</div>

<div class="main">
  <div class="kpi-row" id="kpis"></div>
  <div class="progress-section" id="progress"></div>
  <div class="summary-grid" id="summaries"></div>
  <div class="controls" id="controls"></div>
  <div class="table-section">
    <div class="table-section-header">
      <div class="table-section-title">Content-Vergleich Details</div>
      <div id="table-count" class="result-count"></div>
    </div>
    <div class="table-scroll">
      <table>
        <thead id="thead"></thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>
</div>

<script>
const DATA = ${JSON.stringify(results)};
const total = DATA.length;
const complete = DATA.filter(d => d.status === 'complete').length;
const partial = DATA.filter(d => d.status === 'partial').length;
const weak = DATA.filter(d => d.status === 'weak').length;
const missing = DATA.filter(d => d.status === 'missing').length;
const pct = (n) => ((n/total)*100).toFixed(1);

let activeStatus = 'all';
let activeLang = 'all';
let activeType = 'all';
let searchTerm = '';
let sortCol = 'overlap';
let sortAsc = true;

function filtered() {
  let f = DATA;
  if (activeStatus !== 'all') f = f.filter(d => d.status === activeStatus);
  if (activeLang !== 'all') f = f.filter(d => d.lang === activeLang);
  if (activeType !== 'all') f = f.filter(d => d.type === activeType);
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    f = f.filter(d => d.oldSlug.toLowerCase().includes(q) || d.title.toLowerCase().includes(q));
  }
  // Sort
  f.sort((a,b) => {
    let va, vb;
    if (sortCol === 'overlap') { va = a.overlap; vb = b.overlap; }
    else if (sortCol === 'words') { va = a.wpWordCount; vb = b.wpWordCount; }
    else if (sortCol === 'images') { va = a.wpImageCount; vb = b.wpImageCount; }
    else { va = a.title; vb = b.title; }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
  return f;
}

// KPIs
document.getElementById('kpis').innerHTML = \`
  <div class="kpi-card total"><div class="kpi-label">Gesamt</div><div class="kpi-value">\${total}</div><div class="kpi-pct">WP-Seiten geprüft</div></div>
  <div class="kpi-card complete"><div class="kpi-label">Vollständig</div><div class="kpi-value">\${complete}</div><div class="kpi-pct">\${pct(complete)}% — Overlap ≥85%</div></div>
  <div class="kpi-card partial"><div class="kpi-label">Teilweise</div><div class="kpi-value">\${partial}</div><div class="kpi-pct">\${pct(partial)}% — Overlap 30-84%</div></div>
  <div class="kpi-card weak"><div class="kpi-label">Schwach</div><div class="kpi-value">\${weak}</div><div class="kpi-pct">\${pct(weak)}% — Overlap <30%</div></div>
  <div class="kpi-card missing"><div class="kpi-label">Fehlt</div><div class="kpi-value">\${missing}</div><div class="kpi-pct">\${pct(missing)}% — kein Match</div></div>
\`;

// Progress
const completePct = (complete/total)*100;
const partialPct = (partial/total)*100;
const weakPct = (weak/total)*100;
const missingPct = (missing/total)*100;

document.getElementById('progress').innerHTML = \`
  <div class="progress-header">
    <div class="progress-title">Content-Abdeckung</div>
    <div class="progress-pct" style="color:var(--green)">\${pct(complete)}% vollständig</div>
  </div>
  <div class="progress-bar">
    <div class="seg-complete" style="width:\${completePct}%"></div>
    <div class="seg-partial" style="width:\${partialPct}%"></div>
    <div class="seg-weak" style="width:\${weakPct}%"></div>
    <div class="seg-missing" style="width:\${missingPct}%"></div>
  </div>
  <div class="progress-legend">
    <span><span class="legend-dot" style="background:var(--green)"></span>Vollständig (\${complete})</span>
    <span><span class="legend-dot" style="background:var(--amber)"></span>Teilweise (\${partial})</span>
    <span><span class="legend-dot" style="background:var(--orange)"></span>Schwach (\${weak})</span>
    <span><span class="legend-dot" style="background:var(--red);opacity:0.5"></span>Fehlt (\${missing})</span>
  </div>
\`;

// Summaries
const byLang = {};
const byType = {};
DATA.forEach(d => {
  byLang[d.lang] = byLang[d.lang] || {complete:0,partial:0,weak:0,missing:0,total:0};
  byLang[d.lang][d.status]++;
  byLang[d.lang].total++;
  byType[d.type] = byType[d.type] || {complete:0,partial:0,weak:0,missing:0,total:0};
  byType[d.type][d.status]++;
  byType[d.type].total++;
});

const totalWpWords = DATA.reduce((s,d) => s + d.wpWordCount, 0);
const totalWpImages = DATA.reduce((s,d) => s + d.wpImageCount, 0);
const totalAstroWords = DATA.reduce((s,d) => s + d.astroWordCount, 0);

document.getElementById('summaries').innerHTML = \`
  <div class="summary-card">
    <h3>Nach Sprache</h3>
    <ul class="summary-list">
      \${Object.entries(byLang).sort((a,b)=>b[1].total-a[1].total).map(([l,v]) => \`
        <li><span class="label">\${l.toUpperCase()}</span><span class="value" style="color:\${v.missing > v.complete ? 'var(--red)' : 'var(--green)'}">\${v.complete}/\${v.total} vollständig</span></li>
      \`).join('')}
    </ul>
  </div>
  <div class="summary-card">
    <h3>Volumina</h3>
    <ul class="summary-list">
      <li><span class="label">WP Wörter gesamt</span><span class="value">\${totalWpWords.toLocaleString('de')}</span></li>
      <li><span class="label">Astro Wörter gesamt</span><span class="value">\${totalAstroWords.toLocaleString('de')}</span></li>
      <li><span class="label">WP Bilder gesamt</span><span class="value">\${totalWpImages}</span></li>
      <li><span class="label">Wort-Abdeckung</span><span class="value" style="color:\${totalAstroWords/totalWpWords > 0.7 ? 'var(--green)' : 'var(--red)'}">\${((totalAstroWords/totalWpWords)*100).toFixed(1)}%</span></li>
    </ul>
  </div>
\`;

// Controls
const types = [...new Set(DATA.map(d => d.type))].sort();
document.getElementById('controls').innerHTML = \`
  <div class="filter-group" id="status-filter">
    <button class="filter-btn active" data-v="all">Alle</button>
    <button class="filter-btn" data-v="complete">Voll</button>
    <button class="filter-btn" data-v="partial">Teil</button>
    <button class="filter-btn" data-v="weak">Schwach</button>
    <button class="filter-btn" data-v="missing">Fehlt</button>
  </div>
  <div class="filter-group" id="lang-filter">
    <button class="filter-btn active" data-v="all">Alle</button>
    <button class="filter-btn" data-v="de">DE</button>
    <button class="filter-btn" data-v="en">EN</button>
    <button class="filter-btn" data-v="fr">FR</button>
  </div>
  <div class="filter-group" id="type-filter">
    <button class="filter-btn active" data-v="all">Alle</button>
    \${types.map(t => \`<button class="filter-btn" data-v="\${t}">\${t}</button>\`).join('')}
  </div>
  <input type="text" class="search-input" id="search" placeholder="Slug oder Titel suchen...">
\`;

// Table
document.getElementById('thead').innerHTML = \`<tr>
  <th>Status</th>
  <th>Spr</th>
  <th>Typ</th>
  <th>Alter Slug</th>
  <th>Titel</th>
  <th data-sort="overlap">Text-Overlap</th>
  <th data-sort="words">Wörter WP/Astro</th>
  <th data-sort="images">Bilder WP/Astro</th>
  <th>Fehlende Schlüsselwörter</th>
</tr>\`;

function renderTable() {
  const rows = filtered();
  document.getElementById('table-count').textContent = rows.length + ' von ' + total;
  document.getElementById('tbody').innerHTML = rows.map((d, i) => {
    const statusLabel = {complete:'voll',partial:'teil',weak:'schwach',missing:'fehlt'}[d.status];
    const barClass = d.status;
    const imgClass = d.wpImageCount === 0 ? 'img-ok' : (d.missingImages.length === 0 ? 'img-ok' : (d.missingImages.length < d.wpImageCount ? 'img-warn' : 'img-bad'));

    return \`<tr class="clickable-row" data-idx="\${i}">
      <td><span class="status-badge \${d.status}">\${statusLabel}</span></td>
      <td><span class="lang-badge">\${d.lang}</span></td>
      <td><span class="lang-badge">\${d.type}</span></td>
      <td class="cell-path">\${d.oldSlug}</td>
      <td class="cell-title" title="\${d.title}">\${d.title}</td>
      <td><div class="overlap-cell"><div class="bar-mini"><div class="bar-mini-fill \${barClass}" style="width:\${d.overlap}%"></div></div><span class="overlap-pct">\${d.overlap}%</span></div></td>
      <td style="font-family:'DM Mono',monospace;font-size:12px;white-space:nowrap">\${d.wpWordCount} / \${d.astroWordCount}</td>
      <td class="\${imgClass}" style="font-family:'DM Mono',monospace;font-size:12px;white-space:nowrap">\${d.wpImageCount} / \${d.astroImageCount}</td>
      <td class="missing-words">\${d.missingWords.slice(0, 12).map(w => '<span class="word">' + w + '</span>').join('') || '<span style="color:var(--green)">—</span>'}</td>
    </tr>
    <tr class="detail-row" id="detail-\${i}">
      <td colspan="9" class="detail-cell">
        <div class="detail-grid">
          <div class="detail-block">
            <h4>Match-Datei</h4>
            <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text-muted);word-break:break-all">\${d.matchPath || 'Kein Match gefunden'}</div>
            <h4 style="margin-top:12px">Alle fehlenden Schlüsselwörter (\${d.missingWords.length})</h4>
            <div class="missing-words">\${d.missingWords.map(w => '<span class="word">' + w + '</span>').join('') || '—'}</div>
          </div>
          <div class="detail-block">
            <h4>Fehlende Bilder (\${d.missingImages.length})</h4>
            <div class="img-list">\${d.missingImages.length ? d.missingImages.map(img => '<div class="img-missing">' + img.split('/').pop() + '</div>').join('') : '<div style="color:var(--green)">Alle Bilder vorhanden</div>'}</div>
          </div>
        </div>
      </td>
    </tr>\`;
  }).join('');
}

// Events
document.addEventListener('click', e => {
  if (e.target.closest('.clickable-row')) {
    const idx = e.target.closest('.clickable-row').dataset.idx;
    document.getElementById('detail-' + idx)?.classList.toggle('open');
  }
});

['status-filter','lang-filter','type-filter'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', e => {
    if (!e.target.matches('.filter-btn')) return;
    e.target.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const v = e.target.dataset.v;
    if (id === 'status-filter') activeStatus = v;
    if (id === 'lang-filter') activeLang = v;
    if (id === 'type-filter') activeType = v;
    renderTable();
  });
});

document.getElementById('search')?.addEventListener('input', e => { searchTerm = e.target.value; renderTable(); });

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.sort;
    if (sortCol === col) sortAsc = !sortAsc;
    else { sortCol = col; sortAsc = col === 'overlap' ? true : false; }
    renderTable();
  });
});

renderTable();
</script>
</body>
</html>`;

writeFileSync(join(ROOT, 'docs/content-audit.html'), html, 'utf8');
console.log('\nDashboard: docs/content-audit.html');
