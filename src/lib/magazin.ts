import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/translations';

export type MagazinPost = CollectionEntry<'magazin'>;

const LOCALE_PREFIXES = ['de/', 'en/', 'fr/', 'es/', 'it/'] as const;

function getSlugBase(id: string): string {
  for (const prefix of LOCALE_PREFIXES) {
    if (id.startsWith(prefix)) return id.slice(prefix.length).replace(/\.mdx$/, '');
  }
  return id.replace(/\.mdx$/, '');
}

function getPostLocale(id: string): Locale {
  for (const prefix of LOCALE_PREFIXES) {
    if (id.startsWith(prefix)) return prefix.slice(0, -1) as Locale;
  }
  return 'de';
}

/**
 * Lädt Magazin-Artikel mit Sprach-Fallback-Kette:
 *   - DE: nur DE
 *   - EN: nur EN
 *   - FR/ES/IT: bevorzugt eigene Sprache, fehlende werden aus EN ergänzt, dann DE
 *
 * Jeder Artikel ist pro Slug-Basis nur einmal in der Ergebnisliste.
 */
export async function getLocalizedMagazin(locale: Locale) {
  const all = await getCollection('magazin', ({ data }) => !data.draft);

  const fallbackChain: Locale[] =
    locale === 'de' ? ['de']
    : locale === 'en' ? ['en']
    : [locale, 'en', 'de'];

  const bySlug = new Map<string, MagazinPost>();

  for (const preferredLocale of fallbackChain) {
    for (const post of all) {
      if (getPostLocale(post.id) !== preferredLocale) continue;
      const base = getSlugBase(post.id);
      if (bySlug.has(base)) continue;
      bySlug.set(base, post);
    }
  }

  return [...bySlug.values()];
}

/**
 * Findet einen einzelnen Magazin-Artikel nach Slug mit derselben Fallback-Kette.
 */
export async function findLocalizedMagazinPost(slug: string, locale: Locale) {
  const posts = await getLocalizedMagazin(locale);
  return posts.find((p) => getSlugBase(p.id) === slug);
}

export function stripLocalePrefix(slug: string): string {
  return slug.replace(/^(de|en|fr|es|it)\//, '');
}

export { getSlugBase, getPostLocale };
