# Keystatic in Microvista Astro

## Start

- Development (CMS aktiv): `npm run dev`
- CMS URL lokal: `http://127.0.0.1:4322/keystatic` (oder dein gewaehlter Dev-Port)

## Build Verhalten

- Keystatic ist standardmaessig aktiviert (Dev und Build).
- Falls du es explizit deaktivieren willst:
  - Windows PowerShell: `$env:KEYSTATIC='false'; npm run dev`
  - Unix: `KEYSTATIC=false npm run dev`

## Content Struktur im CMS

- `Inhalt`
  - `magazin_de`
  - `magazin_en`
  - `wiki_de`
  - `branchen`
  - `pruefaufgaben`
  - `materialien`
- `Rechtliches`
  - alle AGB-/Datenschutz-/Impressum-/Cookie-Seiten in allen vorhandenen Sprachen
- `FAQ`
  - alle FAQ-Seiten in allen vorhandenen Sprachen
- `Unternehmen`
  - Team-, Zertifizierungs- und F&E-Seiten
- `Dienstleistungen`
  - Service- und SCANEXPRESS-Landingpages
- `VertriebKampagnen`
  - Bonusprogramm- und Fragebogen-Seiten
- `NewsMedien`
  - Newsletter-, Newsroom-, Pressemitteilungen- und Mediathek-Seiten

## Technische Quelle

- CMS-Konfiguration: `keystatic.config.ts`
- Astro-Integration: `astro.config.mjs`
