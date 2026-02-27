# Mission Control

Stand: 2026-02-26

## Done

- i18n Infrastruktur erweitert (`de`, `en`, `fr`, `es`, `it`) inkl. Locale-Resolver, Locale-Switching und env-basierter Aktivierung.
- `loadStaticPage` auf Locale-Fallback umgestellt (`locale -> en -> de`).
- SEO-Hreflang auf aktivierte Locales umgestellt (`x-default` inklusive).
- Header/Footer/World-Navigation auf locale-sichere und gültige Links umgestellt.
- Defekte und alte Routen in geänderten Seiten bereinigt (`/labor/kontakt`, `/serie/kontakt`, `/unternehmen/*`, alte `/en/*`-Ziele etc.).
- Statische Kernseiten mehrsprachig angebunden:
  - `agb`, `datenschutz`, `impressum`, `faq`, `team`, `zertifizierungen`.
- FR/ES/IT statische Seiten erstellt und nachbearbeitet (Platzhalter-Artefakte entfernt, CTA/Links konsolidiert).
- QA-Skripte ergänzt:
  - `scripts/i18n-inventory.mjs`
  - `scripts/i18n-missing-check.mjs`
  - `scripts/translate_static_pages.py`
- NPM-Skripte ergänzt:
  - `i18n:inventory`
  - `i18n:check`
  - `i18n:translate-static`
- Keystatic installiert und konfiguriert:
  - `@keystatic/astro`, `@keystatic/core`, `@astrojs/react`, `react`, `react-dom`
  - Content-Collections + kategorisierte Static-Singletons in `keystatic.config.ts`.
- Keystatic-Dokumentation hinzugefügt (`docs/keystatic.md`).
- `astro.config.mjs` auf React + Keystatic-Integration umgestellt.
- Middleware um Keystatic-Ausnahmen ergänzt (`/keystatic`, `/keystatic/*`, `/api/keystatic/*`).

## In Progress

- Konsolidierung Keystatic-Routing in lokal wechselnden Dev-Prozess-Situationen (mehrere parallele Astro-Instanzen auf 432x).
- Laufende Stabilisierung alter, bereits geänderter Inhalte (großer bestehender Dirty-Workspace).

## Open

- Finales Sprachlektorat FR/ES/IT für Tonalität und Fachsprache.
- Optionaler Rollout aller Locales über Env (`PUBLIC_ENABLED_LOCALES=de,en,fr,es,it`).
- Bereinigung verbleibender Legacy-Content-Dateien mit alten Linkpfaden in einzelnen Magazin-/Wiki-Inhalten.
- Optional: Keystatic-Deeplink-Verhalten für `keystatic/*` finalisieren (wenn über Middleware künftig anders gewünscht).

## Letzte technische Checks

- `npm run build` erfolgreich.
- `npm run i18n:check` erfolgreich.
- Lokale Keystatic-URL wurde mehrfach auf `200` validiert (`/keystatic`), abhängig von korrekt laufender einzelner Dev-Instanz.
