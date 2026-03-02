import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

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
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'fr', 'es', 'it'],
    routing: {
      prefixDefaultLocale: false
    }
  },
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
