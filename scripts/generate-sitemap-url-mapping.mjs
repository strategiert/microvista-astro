import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

const OLD_CONTENT_FILE = path.join(projectRoot, 'scraped-content', 'all-content.json');
const REDIRECTS_FILE = path.join(projectRoot, 'public', '_redirects');
const DIST_DIR = path.join(projectRoot, 'dist');
const DOCS_DIR = path.join(projectRoot, 'docs');
const OUT_CSV = path.join(DOCS_DIR, 'url-mapping-old-to-new.csv');
const OUT_MD = path.join(DOCS_DIR, 'url-mapping-old-to-new.md');
const DEFAULT_BASE_URL = 'https://microvista.de';

function normalizePath(input) {
  if (!input) return '';
  let value = String(input).trim();

  if (/^https?:\/\//i.test(value)) {
    try {
      const u = new URL(value);
      value = `${u.pathname || '/'}${u.search || ''}${u.hash || ''}`;
    } catch {
      // keep as-is; handled below
    }
  }

  const [withoutHash] = value.split('#');
  const [withoutQuery] = withoutHash.split('?');
  let p = withoutQuery || '/';

  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function toAbsoluteUrl(baseUrl, p) {
  if (!p) return '';
  const pathValue = p === '/' ? '' : p;
  return `${baseUrl}${pathValue}`;
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

function parseSitemapLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

function readNewSitemapUrls() {
  const files = fs
    .readdirSync(DIST_DIR)
    .filter((f) => /^sitemap-\d+\.xml$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'en'));

  const all = [];
  for (const f of files) {
    const xml = fs.readFileSync(path.join(DIST_DIR, f), 'utf8');
    all.push(...parseSitemapLocs(xml));
  }

  const pathToUrl = new Map();
  for (const url of all) {
    const p = normalizePath(url);
    if (!pathToUrl.has(p)) pathToUrl.set(p, url);
  }
  return pathToUrl;
}

function parseRedirectRules() {
  const text = fs.readFileSync(REDIRECTS_FILE, 'utf8');
  const lines = text.split(/\r?\n/);
  const rules = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const m = trimmed.match(/^(\S+)\s+(\S+)(?:\s+(\d{3}))?/);
    if (!m) return;

    const fromRaw = m[1];
    const toRaw = m[2];
    const status = Number(m[3] || 301);
    const from = normalizePath(fromRaw);
    const wildcard = from.includes('*');
    const regex = wildcard
      ? new RegExp(
          `^${from
            .split('*')
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('(.*)')}$`
        )
      : null;

    rules.push({
      line: idx + 1,
      fromRaw,
      toRaw,
      from,
      status,
      wildcard,
      regex,
    });
  });

  return rules;
}

function applyRedirect(pathValue, rules) {
  for (const rule of rules) {
    if (!rule.wildcard) {
      if (pathValue === rule.from) {
        return {
          targetPath: normalizePath(rule.toRaw),
          status: rule.status,
          ruleLine: rule.line,
          ruleFrom: rule.fromRaw,
          ruleTo: rule.toRaw,
        };
      }
      continue;
    }

    const m = pathValue.match(rule.regex);
    if (!m) continue;
    const splat = m[1] || '';
    const targetRaw = rule.toRaw.replace(/:splat/g, splat);
    return {
      targetPath: normalizePath(targetRaw),
      status: rule.status,
      ruleLine: rule.line,
      ruleFrom: rule.fromRaw,
      ruleTo: rule.toRaw,
    };
  }
  return null;
}

function main() {
  if (!fs.existsSync(OLD_CONTENT_FILE)) {
    throw new Error(`Missing old content source: ${OLD_CONTENT_FILE}`);
  }
  if (!fs.existsSync(REDIRECTS_FILE)) {
    throw new Error(`Missing redirects file: ${REDIRECTS_FILE}`);
  }
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(`Missing dist directory: ${DIST_DIR}. Run build first.`);
  }

  const oldItems = JSON.parse(fs.readFileSync(OLD_CONTENT_FILE, 'utf8'));
  const baseUrl = DEFAULT_BASE_URL;
  const newPathToUrl = readNewSitemapUrls();
  const rules = parseRedirectRules();

  const oldByPath = new Map();
  for (const item of oldItems) {
    const oldUrl = item?.url || '';
    const oldPath = normalizePath(oldUrl);
    if (!oldPath) continue;
    if (!oldByPath.has(oldPath)) {
      oldByPath.set(oldPath, {
        old_url: oldUrl,
        old_path: oldPath,
        type: item?.type || '',
        lang: item?.lang || '',
        title: item?.title || '',
      });
    }
  }

  const rows = [];
  for (const item of oldByPath.values()) {
    const direct = newPathToUrl.has(item.old_path);
    if (direct) {
      rows.push({
        ...item,
        new_url: newPathToUrl.get(item.old_path),
        new_path: item.old_path,
        mapping_type: 'direct_200',
        status_code: '200',
        target_in_new_sitemap: 'yes',
        redirect_rule: '',
        notes: 'Path exists directly in new sitemap.',
      });
      continue;
    }

    const redirect = applyRedirect(item.old_path, rules);
    if (!redirect) {
      rows.push({
        ...item,
        new_url: '',
        new_path: '',
        mapping_type: 'no_mapping',
        status_code: '',
        target_in_new_sitemap: 'no',
        redirect_rule: '',
        notes: 'No redirect rule matched old path.',
      });
      continue;
    }

    const targetInSitemap = newPathToUrl.has(redirect.targetPath);
    rows.push({
      ...item,
      new_url: toAbsoluteUrl(baseUrl, redirect.targetPath),
      new_path: redirect.targetPath,
      mapping_type: targetInSitemap
        ? 'redirect_301_in_sitemap'
        : 'redirect_301_not_in_sitemap',
      status_code: String(redirect.status),
      target_in_new_sitemap: targetInSitemap ? 'yes' : 'no',
      redirect_rule: `L${redirect.ruleLine}: ${redirect.ruleFrom} -> ${redirect.ruleTo}`,
      notes: targetInSitemap
        ? 'Redirect target exists in new sitemap.'
        : 'Redirect target not found in new sitemap.',
    });
  }

  rows.sort((a, b) => a.old_path.localeCompare(b.old_path, 'en'));

  fs.mkdirSync(DOCS_DIR, { recursive: true });

  const header = [
    'old_url',
    'old_path',
    'type',
    'lang',
    'new_url',
    'new_path',
    'mapping_type',
    'status_code',
    'target_in_new_sitemap',
    'redirect_rule',
    'notes',
    'title',
  ];

  const csvLines = [
    header.join(','),
    ...rows.map((r) =>
      header
        .map((k) => csvEscape(r[k]))
        .join(',')
    ),
  ];
  fs.writeFileSync(OUT_CSV, `${csvLines.join('\n')}\n`, 'utf8');

  const total = rows.length;
  const direct200 = rows.filter((r) => r.mapping_type === 'direct_200').length;
  const redirectIn = rows.filter((r) => r.mapping_type === 'redirect_301_in_sitemap').length;
  const redirectOut = rows.filter(
    (r) => r.mapping_type === 'redirect_301_not_in_sitemap'
  ).length;
  const unmapped = rows.filter((r) => r.mapping_type === 'no_mapping').length;

  const mdLines = [
    '# URL Mapping: Alte zu Neue Sitemap',
    '',
    `Generiert am: ${new Date().toISOString()}`,
    '',
    `Quellen: \`${path.relative(projectRoot, OLD_CONTENT_FILE)}\`, \`${path.relative(projectRoot, REDIRECTS_FILE)}\`, \`${path.relative(projectRoot, DIST_DIR)}\``,
    '',
    '## Zusammenfassung',
    '',
    `- Alte URLs (eindeutige Pfade): ${total}`,
    `- Direkte Treffer in neuer Sitemap (200): ${direct200}`,
    `- Redirect 301 mit Ziel in neuer Sitemap: ${redirectIn}`,
    `- Redirect 301 mit Ziel nicht in neuer Sitemap: ${redirectOut}`,
    `- Ohne Mapping: ${unmapped}`,
    '',
    '## Ausgabe',
    '',
    '- CSV: `docs/url-mapping-old-to-new.csv`',
    '',
    '| Old Path | New Path | Typ | Sitemap-Ziel | Regel |',
    '| --- | --- | --- | --- | --- |',
    ...rows.slice(0, 60).map(
      (r) =>
        `| ${mdEscape(r.old_path)} | ${mdEscape(r.new_path || '—')} | ${mdEscape(
          r.mapping_type
        )} | ${mdEscape(r.target_in_new_sitemap)} | ${mdEscape(
          r.redirect_rule || '—'
        )} |`
    ),
    '',
    '_Hinweis: Tabelle zeigt die ersten 60 Einträge, vollständige Liste in CSV._',
    '',
  ];
  fs.writeFileSync(OUT_MD, mdLines.join('\n'), 'utf8');

  console.log(`Wrote ${rows.length} mappings:`);
  console.log(`- ${OUT_CSV}`);
  console.log(`- ${OUT_MD}`);
  console.log(
    `Summary: direct=${direct200}, redirect_in_sitemap=${redirectIn}, redirect_not_in_sitemap=${redirectOut}, unmapped=${unmapped}`
  );
}

main();
