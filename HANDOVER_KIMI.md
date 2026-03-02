# Handover für Kimi — Microvista Wiki (Astro)

**Datum:** 2026-03-02
**Von:** Claude Code
**An:** Kimi Code
**Projekt:** Microvista CT-Lexikon
**Repo:** `strategiert/microvista-astro` (Branch: `master`)
**Lokal:** `C:\Users\karent\Documents\Software\netco\microvista\website\microvista-astro`

---

## ⚠️ WICHTIG: Du arbeitest in Astro, NICHT in Next.js

Dein vorheriger Handover bezog sich auf ein Next.js-Projekt. Das war das falsche Projekt.
Die Live-Website läuft auf **Astro 5 + Cloudflare Pages**. Alles in diesem Repo ist Astro.

**Kein `page.tsx`, kein App Router, kein `generateMetadata()`, kein `use client`.**
Astro-Seiten enden auf `.astro`. React-Komponenten (`.tsx`) können eingebunden werden, aber nur mit `client:*`-Direktive für interaktive Parts.

---

## 🎯 Deine Aufgaben

### 1. Design-Fix: Brand-Farben im Wiki korrigieren

Das Wiki nutzt aktuell generische CSS-Variablen (`--primary: #0A2463`) statt der Microvista-Brand-Farben.

**Die richtigen Farben sind bereits als CSS-Variablen definiert** (in `src/styles/global.css`):

```css
--mv-violet: #32285b;   /* Primärfarbe — Headlines, Navigation, Buttons */
--mv-blue:   #8ebfd6;   /* Akzentfarbe — Links, Hintergründe, Badges */
--mv-orange: #ee7711;   /* Highlight — CTAs, Hover, Progress-Bar */
```

**Was zu fixen ist:**

In `src/pages/wiki/index.astro` und `src/pages/wiki/[...slug].astro` werden überall `var(--primary)` und `var(--accent)` verwendet. Ersetze sie durch die Microvista-Brand-Variablen:

| Jetzt | Soll |
|-------|------|
| `var(--primary)` | `var(--mv-violet)` |
| `var(--accent)` / `var(--accent-light)` | `var(--mv-blue)` |
| Hover / CTA-Highlights | `var(--mv-orange)` |

**Konkret betroffene Stellen in `index.astro`:**
- `.az-letter:hover` — `background: var(--primary)` → `var(--mv-violet)`
- `.letter-heading` — `color: var(--primary)`, `border-bottom: 2px solid var(--primary)` → `var(--mv-violet)`
- `.wiki-entry:hover` — `border-color: var(--primary)` → `var(--mv-violet)`
- `.wiki-entry:hover h3` — `color: var(--primary)` → `var(--mv-violet)`
- `.search-box input:focus` — `border-color: var(--primary)` → `var(--mv-violet)`

**Konkret betroffene Stellen in `[...slug].astro`:**
- `.definition` — `border-left: 4px solid var(--primary)` → `var(--mv-violet)`
- `.letter-heading` etc. → `var(--mv-violet)`
- `.related-link:hover` — `border-color/color: var(--primary)` → `var(--mv-violet)`
- Tag-Farben, Breadcrumb-Hover → `var(--mv-violet)`

### 2. Hero-Sektion auf Wiki-Index verbessern (optional, falls Zeit)

Die aktuelle Index-Seite ist sehr einfach (nur Suche + Buchstaben + Liste).
Kimi's Next.js-Version hatte eine schönere Hero-Sektion mit:
- "Begriff des Tages" Spotlight
- Kategorie-Kacheln
- Trust-Indikatoren (Anzahl Einträge, etc.)

Diese Elemente können als Inspiration dienen, müssen aber in Astro neu gebaut werden (kein React-Import nötig, reine `.astro`-Syntax).

---

## 📁 Projektstruktur (Relevant für Wiki)

```
microvista-astro/
├── src/
│   ├── content/
│   │   └── wiki/
│   │       ├── de/          ← 37 deutsche Wiki-Einträge (.mdx)
│   │       └── en/          ← englische Einträge (noch leer, später)
│   ├── pages/
│   │   └── wiki/
│   │       ├── index.astro         ← Wiki-Übersicht (A-Z, Suche, Filter)
│   │       └── [...slug].astro     ← Wiki-Detailseite
│   ├── styles/
│   │   └── global.css              ← Brand-Farben: --mv-violet, --mv-blue, --mv-orange
│   └── layouts/
│       └── BaseLayout.astro        ← Basis-Layout (title, description, schema props)
└── src/content/config.ts           ← Wiki-Schema (Zod)
```

---

## 📋 Content-Schema für neue Wiki-Einträge

Neue Einträge kommen als `.mdx`-Dateien in `src/content/wiki/de/`. Format:

```mdx
---
term: "Begriff"
definition: "kurze Definition in einem Satz"
category: "grundlagen"   # grundlagen | verfahren | qm | materialien | normen | software | hardware | allgemein
synonyms: ["Synonym 1", "Synonym 2"]
relatedTerms: ["Verwandter Begriff 1", "Verwandter Begriff 2"]
seoTitle: "Begriff – SEO-Titel | CT-Lexikon Microvista"
seoDescription: "SEO-Beschreibung, 120-160 Zeichen."
---

## Was ist [Begriff]?

[Inhalt in Markdown...]

## Wissenschaftlicher Hintergrund
...

## Relevante Kennzahlen
...

## Normbezug und Schwellwerte
...

## Anwendung in der industriellen Praxis
...

## Quellen und Ausgabenstand
...

## Verwandte Begriffe
- [Begriff 1](/wiki/slug-1/)
- [Begriff 2](/wiki/slug-2/)
```

---

## 🔗 Routing & i18n

- Deutsch: `/wiki/` → `index.astro` mit `locale = 'de'`
- Locale-aware Links: immer `localePath('/wiki/slug', locale)` nutzen (Import aus `../../i18n/translations`)
- Slug = Dateiname ohne `.mdx` (z.B. `laminographie.mdx` → `/wiki/laminographie`)

---

## 🚀 Deployment

- GitHub Actions deployed automatisch bei `push origin master`
- Live: `https://microvista-astro.pages.dev`
- Build lokal testen: `npm run build` im Projektordner

---

## ✅ Aktueller Stand

- **37 Wiki-Einträge** (DE) live
- **Wiki-Seiten** funktionieren (index + slug)
- **Design** nutzt falsche Farben → **das ist dein Hauptjob**
- **Navigation** bereits vorhanden (Header + Footer)

---

## 📝 Git-Workflow

```bash
# In das richtige Verzeichnis wechseln
cd C:\Users\karent\Documents\Software\netco\microvista\website\microvista-astro

# Status prüfen
git status

# Änderungen stagen
git add src/pages/wiki/index.astro
git add src/pages/wiki/[...slug].astro

# Commiten (konventionelles Format)
git commit -m "fix(wiki): Brand-Farben auf Microvista --mv-* Variablen umstellen"

# Pushen
git push origin master
```

---

**Erstellt am:** 2026-03-02
**Autor:** Claude Code
