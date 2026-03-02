import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Blog-Post-URLs für Sitemap aus Content-Collection lesen (SSR kennt dynamische Routen nicht)
function getMagazinUrls() {
  const root = dirname(fileURLToPath(import.meta.url));
  const base = join(root, 'src', 'content', 'magazin');
  const siteUrl = 'https://microvista.de';
  const urls = [];
  for (const lang of ['de', 'en']) {
    try {
      const files = readdirSync(join(base, lang));
      for (const file of files) {
        if (!file.endsWith('.mdx')) continue;
        const slug = file.replace('.mdx', '');
        // Ausgeschlossene Dateien (nicht echte Posts)
        if (slug === 'posts') continue;
        if (lang === 'de') {
          urls.push(`${siteUrl}/magazin/${slug}`);
        } else {
          urls.push(`${siteUrl}/${lang}/magazin/${slug}`);
        }
      }
    } catch { /* Verzeichnis existiert nicht */ }
  }
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
      customPages: getMagazinUrls(),
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
