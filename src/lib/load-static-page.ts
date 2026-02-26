/**
 * Utility to load static page content from markdown files in src/data/static-pages/
 */

const pages = import.meta.glob('../data/static-pages/*.md', { query: '?raw', import: 'default' });

export async function loadStaticPage(filename: string): Promise<string> {
  const key = `../data/static-pages/${filename}`;
  const loader = pages[key];
  if (!loader) return '';
  const content = await loader() as string;
  return content;
}
