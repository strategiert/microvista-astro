import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dynamische Content-Collection-URLs für Sitemap (SSR kennt dynamische Routen nicht)
function getDynamicSitemapUrls() {
  const root = dirname(fileURLToPath(import.meta.url));
  const siteUrl = 'https://microvista.de';
  const urls = [];

  // Blog-Posts: src/content/magazin/de/*.mdx + src/content/magazin/en/*.mdx
  const magazinBase = join(root, 'src', 'content', 'magazin');
  for (const lang of ['de', 'en']) {
    try {
      const files = readdirSync(join(magazinBase, lang));
      for (const file of files) {
        if (!file.endsWith('.mdx')) continue;
        const slug = file.replace('.mdx', '');
        if (slug === 'posts') continue; // Archiv-Seite, kein Post
        urls.push(lang === 'de'
          ? `${siteUrl}/magazin/${slug}`
          : `${siteUrl}/${lang}/magazin/${slug}`
        );
      }
    } catch { /* Verzeichnis existiert nicht */ }
  }

  // Branchen-Unterseiten: src/content/branchen/*.yaml
  const branchenBase = join(root, 'src', 'content', 'branchen');
  try {
    const files = readdirSync(branchenBase);
    for (const file of files) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
      const slug = file.replace(/\.ya?ml$/, '');
      urls.push(`${siteUrl}/branchen/${slug}`);
    }
  } catch { /* Verzeichnis existiert nicht */ }

  // Prüfaufgaben-Unterseiten: src/content/pruefaufgaben/*.yaml
  const pruefBase = join(root, 'src', 'content', 'pruefaufgaben');
  try {
    const files = readdirSync(pruefBase);
    for (const file of files) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
      const slug = file.replace(/\.ya?ml$/, '');
      urls.push(`${siteUrl}/pruefaufgaben/${slug}`);
    }
  } catch { /* Verzeichnis existiert nicht */ }

  return urls;
}

export default defineConfig({
  site: 'https://microvista.de',
  output: 'server',
  trailingSlash: 'never',
  adapter: cloudflare({
    imageService: 'compile',
    routes: {
      strategy: 'all'
    }
  }),
  integrations: [
    mdx(),
    sitemap({
      customPages: getDynamicSitemapUrls(),
      filter: (page) => !page.includes('/keystatic'),
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de-DE',
          en: 'en-US',
          fr: 'fr-FR',
          es: 'es-ES',
          it: 'it-IT'
        }
      }
    }),
    keystatic(),
    react()
  ],

  markdown: {
    syntaxHighlight: false,
  },
  image: {
    domains: ['microvista.de', 'www.microvista.de'],
  },
  vite: {
    ssr: {
      external: ['node:buffer', 'node:path', 'node:fs', 'node:os']
    },
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.node'
      }
    }
  }
});
