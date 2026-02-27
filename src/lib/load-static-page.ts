/**
 * Utility to load static page content from markdown files in src/data/static-pages/
 */

import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { defaultLocale, type Locale } from '../i18n/translations';

const pages = import.meta.glob('../data/static-pages/*.md', { query: '?raw', import: 'default' });
let markdownProcessorPromise: ReturnType<typeof createMarkdownProcessor> | undefined;

async function getMarkdownProcessor() {
  if (!markdownProcessorPromise) {
    markdownProcessorPromise = createMarkdownProcessor();
  }
  return markdownProcessorPromise;
}

function toUnique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function localeFallbackChain(locale: Locale): Locale[] {
  if (locale === defaultLocale) {
    return [defaultLocale];
  }

  if (locale === 'en') {
    return ['en', defaultLocale];
  }

  return [locale, 'en', defaultLocale];
}

function buildCandidates(slug: string, locale: Locale): string[] {
  const normalized = slug.replace(/\.md$/i, '');
  const names = [
    `${normalized}.${locale}.md`,
    `${normalized}-${locale}.md`
  ];

  if (locale === defaultLocale) {
    names.push(`${normalized}.md`);
  }

  return toUnique(names);
}

export async function loadStaticPageRaw(slugOrFilename: string, locale: Locale = defaultLocale): Promise<string> {
  const directKey = `../data/static-pages/${slugOrFilename}`;
  const directLoader = pages[directKey];
  if (directLoader) {
    return await directLoader() as string;
  }

  const fallbacks = localeFallbackChain(locale);
  for (const candidateLocale of fallbacks) {
    const candidateFiles = buildCandidates(slugOrFilename, candidateLocale);
    for (const filename of candidateFiles) {
      const key = `../data/static-pages/${filename}`;
      const loader = pages[key];
      if (loader) {
        return await loader() as string;
      }
    }
  }

  // Fallback: Suche direkt nach <slugOrFilename>.md (ohne Locale-Suffix)
  const directMdKey = `../data/static-pages/${slugOrFilename}.md`;
  const directMdLoader = pages[directMdKey];
  if (directMdLoader) {
    return await directMdLoader() as string;
  }

  return '';
}

export async function loadStaticPage(slugOrFilename: string, locale: Locale = defaultLocale): Promise<string> {
  const raw = await loadStaticPageRaw(slugOrFilename, locale);
  if (!raw) {
    return '';
  }

  const processor = await getMarkdownProcessor();
  const rendered = await processor.render(raw);
  return rendered.code;
}
