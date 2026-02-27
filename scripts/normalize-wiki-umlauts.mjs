import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wikiDir = path.join(projectRoot, 'src', 'content', 'wiki', 'de');

const files = fs
  .readdirSync(wikiDir)
  .filter((name) => name.endsWith('.mdx'))
  .sort((a, b) => a.localeCompare(b, 'de'));

const keepWords = new Set([
  'Quelle',
  'Quellen',
  'quelle',
  'quellen',
  'neue',
  'Neuen',
  'neuen',
  'Neues',
  'neues',
  'neuem',
  'Neuem',
  'Steuerung',
  'steuerung',
  'steuern',
  'Steuern',
  'gesteuert',
  'Gesteuert',
]);

function convertWord(word) {
  if (!/[A-Za-z]/.test(word)) return word;
  if (keepWords.has(word)) return word;
  return word
    .replace(/Ae/g, 'Ä')
    .replace(/Oe/g, 'Ö')
    .replace(/Ue/g, 'Ü')
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    // Keep "qu" combinations (e.g. Quelle) unchanged.
    .replace(/(?<![qQ])ue/g, 'ü');
}

function convertText(input) {
  let out = input.replace(/[A-Za-zÄÖÜäöüß]+/g, (w) => convertWord(w));
  // Clean up known typos from generated content.
  out = out
    .replace(/\bPrüaf/gu, 'Prüf')
    .replace(/\bVergösserung\b/gu, 'Vergrößerung');
  return out;
}

function convertPreservingLinkTargets(input) {
  const placeholders = [];
  const masked = input.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, target) => {
    const id = placeholders.length;
    placeholders.push(`[${convertText(label)}](${target})`);
    return `@@MV_LINK_${id}@@`;
  });

  const converted = convertText(masked);
  return converted.replace(/@@MV_LINK_(\d+)@@/g, (_m, idx) => placeholders[Number(idx)]);
}

let updated = 0;

for (const file of files) {
  const fullPath = path.join(wikiDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const next = convertPreservingLinkTargets(raw);
  if (next !== raw) {
    fs.writeFileSync(fullPath, next, 'utf8');
    updated += 1;
    console.log(`UPDATED: ${file}`);
  }
}

console.log(`TOTAL_UPDATED=${updated}`);
