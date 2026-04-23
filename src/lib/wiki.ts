import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';

export type WikiEntry = CollectionEntry<'wiki'>;

const LOCALE_PREFIXES = ['de/', 'en/', 'fr/', 'es/', 'it/'] as const;

function getSlugBase(id: string): string {
  for (const prefix of LOCALE_PREFIXES) {
    if (id.startsWith(prefix)) return id.slice(prefix.length).replace(/\.mdx$/, '');
  }
  return id.replace(/\.mdx$/, '');
}

function getEntryLocale(id: string): Locale {
  for (const prefix of LOCALE_PREFIXES) {
    if (id.startsWith(prefix)) return prefix.slice(0, -1) as Locale;
  }
  return 'de';
}

/**
 * Wiki-Fallback-Kette: eigene Sprache > EN > DE, dedup per Slug-Basis.
 */
export async function getLocalizedWiki(locale: Locale) {
  const all = await getCollection('wiki');
  const chain: Locale[] =
    locale === 'de' ? ['de']
    : locale === 'en' ? ['en', 'de']
    : [locale, 'en', 'de'];
  const bySlug = new Map<string, WikiEntry>();
  for (const preferred of chain) {
    for (const entry of all) {
      if (getEntryLocale(entry.id) !== preferred) continue;
      const base = getSlugBase(entry.id);
      if (bySlug.has(base)) continue;
      bySlug.set(base, entry);
    }
  }
  return [...bySlug.values()];
}

export async function findLocalizedWikiEntry(slug: string, locale: Locale) {
  const entries = await getLocalizedWiki(locale);
  return entries.find(e => getSlugBase(e.id) === slug);
}

export function stripLocalePrefix(slug: string): string {
  return slug.replace(/^(de|en|fr|es|it)\//, '');
}

export { getSlugBase, getEntryLocale };
