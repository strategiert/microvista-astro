import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'scraped-content', 'full');

const allImages = new Set();
readdirSync(dir)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .forEach(f => {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    (d.images || []).forEach(img => allImages.add(img));
  });

const list = [...allImages].sort();
writeFileSync(join(dir, '_all-images.json'), JSON.stringify(list, null, 2), 'utf8');
console.log('Bilder gesamt:', list.length);
list.slice(0, 15).forEach(u => console.log(' ', u));
