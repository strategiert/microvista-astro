# Handover für Kimi — Microvista Bereiche Redesign

**Datum:** 2026-03-04
**Von:** Claude Code
**An:** Kimi
**Projekt:** Microvista Website (Astro 5 + Cloudflare Pages)
**Repo:** `strategiert/microvista-astro` (Branch: `master`)
**Lokal:** `C:\Users\karent\Documents\Software\netco\microvista\website\microvista-astro`
**Live:** `https://microvista-astro.pages.dev`

---

## ⚠️ Pflichtlektüre zuerst

1. `C:\Users\karent\.openclaw\workspace\SHARED-MEMORY.md` — Projektstatus + Fallen
2. `C:\Users\karent\.openclaw\workspace\AGENT-STATUS.md` — deinen Status auf „🔄 Arbeitet" setzen

---

## 🎯 Deine Aufgabe

**Redesign der Sektionen auf den einzelnen Bereichen der Microvista-Website.**

Die Seiten existieren technisch bereits. Der Content ist drin. Aber das Design der einzelnen Sektionen sieht generisch aus und braucht einen echten Microvista-Look. Du überarbeitest die Sektionen visuell — mit den richtigen Brand-Farben, besserer Typografie, mehr Struktur, mehr Professionalität.

---

## 📁 Projektstruktur

```
microvista-astro/
├── src/
│   ├── pages/                     ← Seiten (eine .astro pro Route)
│   │   ├── index.astro            ← HOMEPAGE (Hauptpriorität)
│   │   ├── labor/                 ← Labor-Welt
│   │   ├── serie/                 ← Serien-Welt
│   │   ├── wiki/
│   │   │   ├── index.astro        ← Wiki-Übersicht
│   │   │   └── [...slug].astro    ← Wiki-Detailseite
│   │   ├── branchen/              ← Branchen-Seiten
│   │   ├── dienstleistungen/
│   │   ├── magazin/
│   │   ├── unternehmen/
│   │   ├── kontakt.astro
│   │   ├── team.astro
│   │   └── ...weitere Seiten
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro       ← Globale Navigation
│   │   │   └── Footer.astro       ← Globaler Footer
│   │   ├── sections/              ← (noch leer — hier neue Komponenten ablegen)
│   │   ├── ui/
│   │   │   ├── Card.astro
│   │   │   └── Tag.astro
│   │   └── common/
│   ├── layouts/
│   │   ├── BaseLayout.astro       ← Basis-Layout (head, SEO, Body-Wrapper)
│   │   ├── LaborLayout.astro      ← Layout für Labor-Welt
│   │   └── SerieLayout.astro      ← Layout für Serien-Welt
│   ├── styles/
│   │   └── global.css             ← DAS DESIGN SYSTEM (Brand-Farben, Fonts, alle CSS-Vars)
│   ├── i18n/
│   │   └── translations.ts        ← i18n-Helper + `localePath()` Funktion
│   └── content/
│       ├── wiki/de/               ← 37 Wiki-Einträge (.mdx)
│       └── magazin/               ← Blog-Posts
├── public/                        ← Statische Assets (Bilder, SVGs, Fonts)
├── astro.config.mjs               ← Astro-Konfiguration
└── package.json
```

---

## 🎨 Design System

**Alle CSS-Variablen sind in `src/styles/global.css` definiert. NUR diese verwenden.**

### Brand-Farben

```css
--mv-violet: #32285b;   /* Primärfarbe — Headlines, Buttons, Akzente */
--mv-blue:   #8ebfd6;   /* Sekundär — Badges, Hintergründe, Links */
--mv-orange: #ee7711;   /* Highlight — CTAs, Hover, wichtige Elemente */
--mv-cyan:   #00a0d2;   /* Zusatz — technische Akzente */
```

### Fonts

```css
--font-heading: 'Antonio', sans-serif;   /* Headlines, Überschriften */
--font-body: 'PT Sans', sans-serif;      /* Fließtext */
```

### Verbote

- **Kein** `var(--primary)` oder `var(--accent)` — das sind falsche Farben aus alten Seiten
- **Kein** Grün in Buttons
- **Keine** Emojis in UI-Komponenten (in Content-Objeketen als Platzhalter ok, nicht als echtes Icon-System)
- **Keine** Farbverläufe außer subtilen (z.B. `--mv-violet` zu einem etwas helleren Violett)

---

## 📄 Sektionen auf der Homepage (Hauptpriorität)

Datei: `src/pages/index.astro`

Die Homepage hat diese Sektionen (von oben nach unten):

| Sektion | Was sie tut | Redesign-Ziel |
|---------|------------|---------------|
| **Hero** | Headline + 2 CTAs | Klarer, professioneller — mehr Tech-Feeling, starke Typografie |
| **Bekannt aus** (Press) | Logos von Medien/Partnern | Dezent, vertrauenbildend |
| **Pain Points** | 4 Problemfelder mit Icon + Label | Professionelle Kacheln statt generischer Liste |
| **Labor/Serie Gateway** | 2 große Kacheln für die zwei Welten | Die wichtigste Conversion-Sektion — muss stark aussehen |
| **Prüfaufgaben** | Was CT löst (4 Felder) | Technisch, strukturiert |
| **USPs** | 4 Alleinstellungsmerkmale | Klare Icons + Text |
| **Magazin-Vorschau** | 3 neueste Blog-Posts | Blog-Karten in Microvista-Style |
| **CTA-Banner** | Abschluss-Handlungsaufforderung | Kräftig, `--mv-orange` als Hintergrundfarbe |

---

## 🏗️ Wie du vorgehst

### 1. Lies die Index-Seite

```
src/pages/index.astro
```

Die Sektionen sind als großes `<style>`-Block inline in der Datei. Alle Styles sind drin.

### 2. Redesigne Sektion für Sektion

Fang mit dem Hero an. Dann Labor/Serie Gateway (höchste Conversion-Relevanz).

**Empfohlener Ansatz:** Auslagern in `src/components/sections/` als wiederverwendbare Komponenten:
- `HeroSection.astro`
- `GatewaySection.astro`
- `PainPointsSection.astro`
- usw.

So bleibt `index.astro` sauber und die Komponenten können auf anderen Seiten wiederverwendet werden.

### 3. Lokaler Entwicklungsserver

```bash
cd C:\Users\karent\Documents\Software\netco\microvista\website\microvista-astro
npm run dev
```

Öffnet auf `http://localhost:4321`.

### 4. Build testen vor Commit

```bash
npm run build
```

Fehler hier = Fehler auf Cloudflare. Erst wenn Build grün, committen.

---

## 🌐 i18n-Hinweis

Die Seite hat 5 Sprachen (DE default, EN/FR/ES/IT). Die Homepage liest die aktuelle Sprache aus `Astro.locals.locale`. Content-Texte sind als Objekte definiert (`content.de`, `content.en`, etc.) direkt in der Seite.

Für neue Komponenten: immer `locale` als Prop durchreichen, keine hardcodierten deutschen Texte in Komponenten.

---

## 🚀 Deployment

```bash
# Branch: master — GitHub Actions deployt automatisch auf Cloudflare Pages
git add src/...
git commit -m "feat(design): [was du gemacht hast]"
git push origin master
```

Live nach ~2 Minuten auf `https://microvista-astro.pages.dev`.

---

## ✅ Prioritätenliste

1. **Homepage Hero** — erster Eindruck
2. **Labor/Serie Gateway Kacheln** — wichtigste Conversion
3. **Pain Points Sektion** — emotional, überzeugend
4. **USP-Sektion** — vertrauenbildend
5. **Wiki Design-Fix** — `var(--primary)` → `var(--mv-violet)` (Details in `HANDOVER_KIMI.md`)

---

## 📝 Abschluss

Wenn fertig:
1. `C:\Users\karent\.openclaw\workspace\AGENT-STATUS.md` — Status auf ✅ Fertig setzen
2. Neue Erkenntnisse/Fallen in `C:\Users\karent\.openclaw\workspace\SHARED-MEMORY.md` notieren

---

**Erstellt am:** 2026-03-04
**Autor:** Claude Code
