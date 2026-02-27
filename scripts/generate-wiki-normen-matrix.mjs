import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wikiDir = path.join(projectRoot, 'src', 'content', 'wiki', 'de');
const docsDir = path.join(projectRoot, 'docs');
const csvOut = path.join(docsDir, 'wiki-normen-matrix.csv');
const mdOut = path.join(docsDir, 'wiki-normen-matrix.md');

const files = fs
  .readdirSync(wikiDir)
  .filter((name) => name.endsWith('.mdx'))
  .sort((a, b) => a.localeCompare(b, 'de'));

function pick(content, re) {
  const m = content.match(re);
  return m ? m[1].trim() : '';
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function mdEscape(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function extractSection(content, heading) {
  const headingRe = new RegExp(`^##\\s+${heading}\\s*$`, 'm');
  const startMatch = content.match(headingRe);
  if (!startMatch || startMatch.index === undefined) return '';

  const startAfterHeading = content.indexOf('\n', startMatch.index) + 1;
  if (startAfterHeading <= 0) return '';

  const rest = content.slice(startAfterHeading);
  const nextHeadingIdx = rest.search(/^##\s+/m);
  if (nextHeadingIdx === -1) return rest.trim();
  return rest.slice(0, nextHeadingIdx).trim();
}

const rows = files.map((file) => {
  const fullPath = path.join(wikiDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const slug = file.replace(/\.mdx$/, '');

  const frontmatter = pick(content, /^---\s*([\s\S]*?)\s*---/m);
  const term = pick(frontmatter, /^term:\s*"([^"]+)"/m);
  const category = pick(frontmatter, /^category:\s*"([^"]+)"/m);

  const normbezug = pick(content, /^- \*\*Normbezug:\*\*\s*(.+)$/m);
  const schwellwerte = pick(
    content,
    /^- \*\*Typische Schwellwerte \(Praxis\):\*\*\s*(.+)$/m
  );
  const gueltigkeit = pick(
    content,
    /^- \*\*(?:Gültigkeit|Gueltigkeit):\*\*\s*(.+)$/mu
  );

  const quellenSection = extractSection(content, 'Quellen und Ausgabenstand');
  const quellenLines = quellenSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());

  const standLine =
    quellenLines.find((line) =>
      /^Stand der Einordnung:/i.test(line)
    ) ?? '';
  const quellen = quellenLines
    .filter((line) => !/^Stand der Einordnung:/i.test(line))
    .join(' | ');
  const stand = standLine.replace(/^Stand der Einordnung:\s*/i, '');

  return {
    slug,
    term,
    category,
    normbezug,
    schwellwerte,
    gueltigkeit,
    quellen,
    stand,
    datei: `src/content/wiki/de/${file}`,
  };
});

fs.mkdirSync(docsDir, { recursive: true });

const csvHeader = [
  'slug',
  'term',
  'category',
  'normbezug',
  'typische_schwellwerte_praxis',
  'gültigkeit',
  'quellen',
  'stand_der_einordnung',
  'datei',
];

const csvLines = [
  csvHeader.join(','),
  ...rows.map((r) =>
    [
      r.slug,
      r.term,
      r.category,
      r.normbezug,
      r.schwellwerte,
      r.gueltigkeit,
      r.quellen,
      r.stand,
      r.datei,
    ]
      .map(csvEscape)
      .join(',')
  ),
];
fs.writeFileSync(csvOut, `${csvLines.join('\n')}\n`, 'utf8');

const generatedAt = new Date().toISOString();
const mdLines = [
  '# Wiki Normen-Matrix (DE)',
  '',
  `Automatisch generiert am: ${generatedAt}`,
  '',
  'Quelle: `src/content/wiki/de/*.mdx`',
  '',
  '| Term | Kategorie | Normbezug | Typische Schwellwerte (Praxis) | Gültigkeit | Quellen | Stand | Datei |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map(
    (r) =>
      `| ${mdEscape(r.term)} | ${mdEscape(r.category)} | ${mdEscape(
        r.normbezug
      )} | ${mdEscape(r.schwellwerte)} | ${mdEscape(r.gueltigkeit)} | ${mdEscape(
        r.quellen
      )} | ${mdEscape(r.stand)} | ${mdEscape(r.datei)} |`
  ),
  '',
];
fs.writeFileSync(mdOut, mdLines.join('\n'), 'utf8');

console.log(`Wrote ${rows.length} rows to:`);
console.log(`- ${csvOut}`);
console.log(`- ${mdOut}`);
