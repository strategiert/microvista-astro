# Microvista Astro - Roadmap

> Aktueller operativer Stand: [docs/mission-control.md](./docs/mission-control.md)

## Phase 1: SEO-Fundament (Kritisch)

### 1.1 Technische SEO-Fixes
- [ ] `robots.txt` erstellen
- [ ] `trailingSlash: 'never'` in astro.config.mjs
- [ ] Hreflang-Tags im BaseLayout
- [ ] Favicon-Set erstellen (SVG, PNG, Apple Touch Icon)
- [ ] OG-Default-Image erstellen (1200x630px)

### 1.2 SEO-Komponenten
- [ ] `SEO.astro` - Zentrale Meta-Tag Komponente
- [ ] `SchemaOrg.astro` - JSON-LD Strukturierte Daten
- [ ] Schema für Organization (Microvista)
- [ ] Schema für LocalBusiness
- [ ] Schema für Article (Magazin)
- [ ] Schema für FAQPage (Wiki)

### 1.3 Content Collections Optimierung
- [ ] `description` max(160) Validierung hinzufügen
- [ ] Pflicht-SEO-Felder in allen Schemas

---

## Phase 2: Core Pages

### 2.1 Gateway & Navigation
- [x] Gateway-Seite (Welten-Auswahl)
- [ ] Globale Navigation (responsive)
- [ ] Breadcrumbs-Komponente
- [ ] Footer mit Sitemap-Links

### 2.2 Labor-Welt (Welt 1)
- [ ] `/labor/` - Landing Page
- [ ] `/labor/erstmuster/` - Erstmusterprüfung
- [ ] `/labor/schadensanalyse/` - Schadensanalyse
- [ ] `/labor/reverse-engineering/` - Reverse Engineering
- [ ] `/labor/kontakt/` - Kontaktformular Labor

### 2.3 Serie-Welt (Welt 2)
- [ ] `/serie/` - Landing Page
- [ ] `/serie/inline-ct/` - Inline-CT
- [ ] `/serie/100-prozent-pruefung/` - 100% Prüfung
- [ ] `/serie/ki-auswertung/` - KI-Automatisierung
- [ ] `/serie/kontakt/` - Kontaktformular Serie

### 2.4 Shared Pages
- [ ] `/unternehmen/` - Über Microvista
- [ ] `/unternehmen/team/` - Team
- [ ] `/unternehmen/karriere/` - Jobs
- [ ] `/impressum/` - Impressum
- [ ] `/datenschutz/` - Datenschutz
- [ ] `/kontakt/` - Allgemeines Kontaktformular

---

## Phase 3: Content Hub

### 3.1 Magazin (Blog)
- [ ] `/magazin/` - Blog-Index mit Filterung
- [ ] `/magazin/[slug]/` - Einzelne Artikel
- [ ] `/magazin/kategorie/[category]/` - Kategorie-Seiten
- [ ] `/magazin/tag/[tag]/` - Tag-Seiten
- [ ] RSS-Feed `/magazin/rss.xml`

### 3.2 Wiki (Lexikon)
- [ ] `/wiki/` - Wiki-Index (A-Z Navigation)
- [ ] `/wiki/[term]/` - Einzelne Begriffe
- [ ] `/wiki/kategorie/[category]/` - Kategorie-Seiten
- [ ] Interne Verlinkung zwischen Begriffen

### 3.3 Branchen-Seiten
- [ ] `/branchen/` - Branchen-Übersicht
- [ ] `/branchen/automotive/` - Automotive
- [ ] `/branchen/elektronik/` - Elektronik
- [ ] `/branchen/medizintechnik/` - Medizintechnik
- [ ] `/branchen/luftfahrt/` - Luftfahrt
- [ ] `/branchen/kunststoff/` - Kunststoffverarbeitung

### 3.4 Ressourcen
- [ ] `/ressourcen/` - Übersicht Downloads
- [ ] `/ressourcen/whitepapers/` - Whitepapers
- [ ] `/ressourcen/webinare/` - Webinar-Recordings
- [ ] `/ressourcen/case-studies/` - Case Studies

---

## Phase 4: WordPress Migration

### 4.1 Content-Export
- [ ] WordPress REST API Skript für Blog-Export
- [ ] 87 Blog-Posts → MDX konvertieren
- [ ] Bilder herunterladen und optimieren
- [ ] Interne Links anpassen
- [ ] Redirects erstellen (alte URLs → neue URLs)

### 4.2 Redirect-Mapping
```
/blog/[old-slug]/ → /magazin/[new-slug]/
/lexikon/[term]/ → /wiki/[term]/
```

### 4.3 Asset-Migration
- [ ] Bilder von WordPress herunterladen
- [ ] In `/public/images/magazin/` speichern
- [ ] WebP-Versionen generieren
- [ ] Alt-Texte aus WordPress übernehmen

---

## Phase 5: Interaktive Features

### 5.1 Kontaktformulare
- [ ] Cloudflare Worker für Form-Handling
- [ ] E-Mail-Versand (Resend/SendGrid)
- [ ] Spam-Schutz (Turnstile)
- [ ] Form-Validierung (Client + Server)

### 5.2 Suche
- [ ] Pagefind Integration (statische Suche)
- [ ] Such-Modal Komponente
- [ ] Keyboard-Shortcuts (Cmd+K)

### 5.3 Interaktive Elemente
- [ ] CT-Scan Viewer (3D Modell Preview)
- [ ] ROI-Rechner (Preact Island)
- [ ] Vergleichstabellen (Labor vs Serie)

---

## Phase 6: Performance & Analytics

### 6.1 Performance
- [ ] Lighthouse Score > 95 auf allen Seiten
- [ ] Critical CSS Inlining
- [ ] Image Lazy Loading
- [ ] Font Subsetting

### 6.2 Analytics
- [ ] Cloudflare Web Analytics (datenschutzfreundlich)
- [ ] Event Tracking (Kontaktformulare, Downloads)
- [ ] Conversion Tracking Setup

### 6.3 Monitoring
- [ ] Uptime Monitoring
- [ ] Core Web Vitals Tracking
- [ ] 404-Error Logging

---

## Technische Infrastruktur

### Cloudflare Setup
```
microvista.de
├── Cloudflare Pages (Astro Static)
├── Cloudflare Workers
│   ├── /api/contact → Form Handler
│   └── /api/newsletter → Newsletter Signup
├── Cloudflare KV
│   └── Rate Limiting / Sessions
├── Cloudflare R2
│   └── Large Assets (PDFs, Videos)
└── Cloudflare Turnstile
    └── Bot Protection
```

### Environments
| Environment | URL | Branch |
|-------------|-----|--------|
| Production | microvista.de | main |
| Staging | staging.microvista.de | staging |
| Preview | *.microvista.pages.dev | PR branches |

---

## Prioritäten

### Sofort (Diese Woche)
1. SEO-Fixes (Phase 1.1)
2. robots.txt + Favicon
3. Labor & Serie Landing Pages

### Kurzfristig (2 Wochen)
1. SEO-Komponenten (Phase 1.2)
2. Magazin-Index + erste Artikel
3. Wiki-Index + erste Begriffe

### Mittelfristig (1 Monat)
1. WordPress Migration komplett
2. Alle Branchen-Seiten
3. Kontaktformulare

### Langfristig (3 Monate)
1. Interaktive Features
2. Suche
3. Analytics & Optimierung
