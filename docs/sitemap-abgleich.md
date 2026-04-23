# Sitemap-Abgleich microvista: ALT vs. NEU

**Stand:** 2026-04-23T11:04:11

**Quellen:**
- `https://www.microvista.de/sitemap.xml` (WordPress Legacy — 161 URLs)
- `https://www.industrial-ct-software.com/sitemap.xml` (28 URLs)
- NEU: `https://microvista-astro.pages.dev/sitemap-0.xml` (171 URLs) + `public/_redirects` (Pages-Rules, 65 aktive Regeln) + `src/middleware.ts` (Worker für `/en/*`, `/fr/*`)

**Methode:**
1. Jeden alten Pfad gegen `public/_redirects` matchen
2. Sonst gegen neue Sitemap-URL-Liste matchen
3. Bleibt unklar: Live-GET auf `microvista-astro.pages.dev` (Status + Final-URL)

**Auswertung:** {'301 _redirects': 70, 'OK direkt': 15, 'OK live': 71, 'FEHLT': 31, '301 live': 7}

## Zusammenfassung

| Status | Count | Bedeutung |
|---|---|---|
| **OK direkt** | 15 | Selber Pfad existiert 1:1 auf neuer Seite |
| **OK live** | 71 | Pfad existiert via Middleware-Rewrite (v.a. `/en/*`) — Live-Test liefert 200 |
| **301 _redirects** | 70 | Wird per `public/_redirects` umgeleitet |
| **301 live** | 7 | Live-Redirect bei Abruf (z.B. trailing-slash-Handling oder EN-Worker-Legacy) |
| **FEHLT** | 31 | Weder Pfad noch Redirect vorhanden → 404 |

**Abdeckung 84 %** (163 / 194 alte URLs). 31 Lücken sind zu schließen.

## Handlungsempfehlung zu den 31 FEHLT-URLs

### A) `industrial-ct-software.com` (24 URLs) — EIGENE Domain

Diese Domain ist ein separates Produkt (InspectVista / CT-Auswertungs-Cloud), nicht Teil der microvista.de-Migration. Auf microvista.de existiert bereits `/software` als Landing. Falls die Software-Domain zurückgebaut werden soll, eigenes `_redirects` auf jener Domain nötig (nicht hier).

### B) microvista.de-Lücken (7 URLs) — konkreter Fix-Plan

| Alte URL | Vorschlag | Priorität |
|---|---|---|
| `/3d-messtechnik-dienstleister/` | 301 → `/pruefaufgaben/3d-vermessung` | hoch |
| `/express-inspektion-buchen/` | 301 → `/express-ct-inspektion` | hoch (Conversion-Landing!) |
| `/qualitaetssicherung-additive-fertigung/` | 301 → `/branchen/additive-fertigung` | hoch |
| `/qualitatsmanagement-medizinprodukte/` | 301 → `/branchen/medizintechnik` | hoch |
| `/en/end-of-line-testing-using-industrial-ct/` | 301 → `/en/end-of-line-test` (Worker) | hoch |
| `/fr/services-en-metrologie-3d/` | 301 → `/fr/pruefaufgaben/3d-vermessung` (Worker) | mittel |
| `/fr/test-de-fin-de-ligne-par-ct-...` | 301 → `/fr/end-of-line-test` (Worker) | mittel |


## FEHLT (31)

| Alte URL | Quelle | Ziel | Note |
|---|---|---|---|
| https://www.industrial-ct-software.com/2024/11/28/hallo-welt/ | CTSW-Post | - | 404 |
| https://www.industrial-ct-software.com/category/allgemein/ | CTSW-Cat | - | 404 |
| https://www.industrial-ct-software.com/cookie-policy-eu-2/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/cookie-policy-uk/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/de/agb/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/de/cookie-richtlinie-eu/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/de/ct-software/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/de/datenschutzerklaerung-eu/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/de/haftungsausschluss/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/de/impressum/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/disclaimer-2/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/fr/conditions-generales-de-vente/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/fr/ct-software-fr/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/fr/directive-sur-les-cookies-ue/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/gtc/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/imprint/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/it/condizioni-generali-di-contratto/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/it/dichiarazione-di-non-responsabilita/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/it/dichiarazione-sulla-privacy-ue/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/it/direttiva-sui-cookie-ue/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/it/impronta/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/it/valutazione-automatizzata/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/privacy-statement-eu/ | CTSW-Page | - | 404 |
| https://www.industrial-ct-software.com/privacy-statement-uk/ | CTSW-Page | - | 404 |
| https://www.microvista.de/3d-messtechnik-dienstleister/ | WP-Page | - | 404 |
| https://www.microvista.de/en/end-of-line-testing-using-industrial-ct/ | WP-Page | - | 404 |
| https://www.microvista.de/express-inspektion-buchen/ | WP-Page | - | 404 |
| https://www.microvista.de/fr/services-en-metrologie-3d/ | WP-Page | - | 404 |
| https://www.microvista.de/fr/test-de-fin-de-ligne-par-ct-une-securite-supplementaire-au-demarrage-moins-de-risques-sur-le-terrain/ | WP-Page | - | 404 |
| https://www.microvista.de/qualitaetssicherung-additive-fertigung/ | WP-Page | - | 404 |
| https://www.microvista.de/qualitatsmanagement-medizinprodukte/ | WP-Page | - | 404 |

## 301 live (7)

| Alte URL | Quelle | Ziel | Note |
|---|---|---|---|
| https://www.microvista.de/en/media-library/ | WP-Page | ? | 301 |
| https://www.microvista.de/en/press-releases/ | WP-Page | ? | 301 |
| https://www.microvista.de/en/questionnaire/ | WP-Page | ? | 301 |
| https://www.microvista.de/en/registration-live-demo-scanexpress/ | WP-Page | ? | 301 |
| https://www.microvista.de/en/research-development/ | WP-Page | ? | 301 |
| https://www.microvista.de/en/reward-program/ | WP-Page | ? | 301 |
| https://www.microvista.de/en/serial-testing/ | WP-Page | ? | 301 |

## 301 _redirects (70)

| Alte URL | Quelle | Ziel | Note |
|---|---|---|---|
| https://www.microvista.de/beitraege/ | WP-Page | /magazin/ | 301 |
| https://www.microvista.de/beitraege/3d-ct-auswertung/ | WP-Post | /magazin/3d-ct-auswertung | 301 |
| https://www.microvista.de/beitraege/3d-ct-metall-pruefung-waermemanagement/ | WP-Post | /magazin/3d-ct-metall-pruefung-waermemanagement | 301 |
| https://www.microvista.de/beitraege/5-beliebte-zerstoerungsfreie-pruefverfahren-in-der-automobilindustrie/ | WP-Post | /magazin/5-beliebte-zerstoerungsfreie-pruefverfahren-in-der-automobilindustrie | 301 |
| https://www.microvista.de/beitraege/ablauf-industrielle-ct-pruefung/ | WP-Post | /magazin/ablauf-industrielle-ct-pruefung | 301 |
| https://www.microvista.de/beitraege/archaeologie-mobiles-ct/ | WP-Post | /magazin/archaeologie-mobiles-ct | 301 |
| https://www.microvista.de/beitraege/ausschuss-automobilindustrie-mit-zerstoerungsfreier-pruefung-minimieren/ | WP-Post | /magazin/ausschuss-automobilindustrie-mit-zerstoerungsfreier-pruefung-minimieren | 301 |
| https://www.microvista.de/beitraege/ct-container-long-vs-compact/ | WP-Post | /magazin/ct-container-long-vs-compact | 301 |
| https://www.microvista.de/beitraege/ct-inspektion-serienstart-whitepaper/ | WP-Post | /magazin/ct-inspektion-serienstart-whitepaper | 301 |
| https://www.microvista.de/beitraege/effiziente-fehleranalyse-express-service/ | WP-Post | /magazin/effiziente-fehleranalyse-express-service | 301 |
| https://www.microvista.de/beitraege/einblicke-in-trends-marktentwicklung-und-innovationen/ | WP-Post | /magazin/einblicke-in-trends-marktentwicklung-und-innovationen | 301 |
| https://www.microvista.de/beitraege/endspurt-nun-auch-beim-mobilen-ct-container/ | WP-Post | /magazin/endspurt-nun-auch-beim-mobilen-ct-container | 301 |
| https://www.microvista.de/beitraege/erste-testscans-mit-dem-mobilen-ct/ | WP-Post | /magazin/erste-testscans-mit-dem-mobilen-ct | 301 |
| https://www.microvista.de/beitraege/erster-kundeneinsatz-des-scanexpress/ | WP-Post | /magazin/erster-kundeneinsatz-des-scanexpress | 301 |
| https://www.microvista.de/beitraege/industrielle-ct-die-beste-methode-fuer-zerstoerungsfreie-pruefung-von-gussteilen/ | WP-Post | /magazin/industrielle-ct-die-beste-methode-fuer-zerstoerungsfreie-pruefung-von-gussteilen | 301 |
| https://www.microvista.de/beitraege/industrielle-ct-zur-prufung-additiv-gefertigter-bauteile/ | WP-Post | /magazin/industrielle-ct-zur-prufung-additiv-gefertigter-bauteile | 301 |
| https://www.microvista.de/beitraege/industrielle-ct-zylinderkopfpruefung/ | WP-Post | /magazin/industrielle-ct-zylinderkopfpruefung | 301 |
| https://www.microvista.de/beitraege/industrielle-rontgenprufung-vs-industrielle-computertomographie/ | WP-Post | /magazin/industrielle-rontgenprufung-vs-industrielle-computertomographie | 301 |
| https://www.microvista.de/beitraege/innovative-methode-zur-auswertung-von-hairpin-stator-scans/ | WP-Post | /magazin/innovative-methode-zur-auswertung-von-hairpin-stator-scans | 301 |
| https://www.microvista.de/beitraege/inspecthub/ | WP-Post | /magazin/inspecthub | 301 |
| https://www.microvista.de/beitraege/microvista-erneut-zertifiziert/ | WP-Post | /magazin/microvista-erneut-zertifiziert | 301 |
| https://www.microvista.de/beitraege/mobiler-industrieller-computertomograph/ | WP-Post | /magazin/mobiler-industrieller-computertomograph | 301 |
| https://www.microvista.de/beitraege/mobiles-ct-auf-der-zielgeraden/ | WP-Post | /magazin/mobiles-ct-auf-der-zielgeraden | 301 |
| https://www.microvista.de/beitraege/mobiles-ct-bei-der-vdi-tagung-giesstechnik-im-motorenbau/ | WP-Post | /magazin/mobiles-ct-bei-der-vdi-tagung-giesstechnik-im-motorenbau | 301 |
| https://www.microvista.de/beitraege/mobiles-ct-und-container-vereint-der-scanexpress-ist-fast-fertig/ | WP-Post | /magazin/mobiles-ct-und-container-vereint-der-scanexpress-ist-fast-fertig | 301 |
| https://www.microvista.de/beitraege/mobiles-industrielles-ct-auf-der-zielgeraden/ | WP-Post | /magazin/mobiles-industrielles-ct-auf-der-zielgeraden | 301 |
| https://www.microvista.de/beitraege/palaeontologie-trifft-industrielle-ct/ | WP-Post | /magazin/palaeontologie-trifft-industrielle-ct | 301 |
| https://www.microvista.de/beitraege/ppf-verfahren-optimierung-potenzialfreisetzung-durch-industrielle-ct-pruefung/ | WP-Post | /magazin/ppf-verfahren-optimierung-potenzialfreisetzung-durch-industrielle-ct-pruefung | 301 |
| https://www.microvista.de/beitraege/qualitaetssicherung-pharmaindustrie/ | WP-Post | /magazin/qualitaetssicherung-pharmaindustrie | 301 |
| https://www.microvista.de/beitraege/scanexpress-eingetroffen/ | WP-Post | /magazin/scanexpress-eingetroffen | 301 |
| https://www.microvista.de/beitraege/scanexpress-wie-funktioniert-das-mobile-ct/ | WP-Post | /magazin/scanexpress-wie-funktioniert-das-mobile-ct | 301 |
| https://www.microvista.de/beitraege/update-schnellere-ct-scans-hoehere-aufloesung-laminografie/ | WP-Post | /magazin/update-schnellere-ct-scans-hoehere-aufloesung-laminografie | 301 |
| https://www.microvista.de/beitraege/wanddickenmessung-im-uberblick/ | WP-Post | /magazin/wanddickenmessung-im-uberblick | 301 |
| https://www.microvista.de/beitraege/zerstorungfreie-prufung-von-leichtmetallguss/ | WP-Post | /magazin/zerstorungfreie-prufung-von-leichtmetallguss | 301 |
| https://www.microvista.de/beitraege/zerstorungsfreie-prufung-von-batteriesystemen/ | WP-Post | /magazin/zerstorungsfreie-prufung-von-batteriesystemen | 301 |
| https://www.microvista.de/beitraege/zerstorungsfreie-prufung-von-eisenguss/ | WP-Post | /magazin/zerstorungsfreie-prufung-von-eisenguss | 301 |
| https://www.microvista.de/beitraege/zfp-automobilindustrie/ | WP-Post | /magazin/zfp-automobilindustrie | 301 |
| https://www.microvista.de/cookie-richtlinie-eu/ | WP-Page | /datenschutz | 301 |
| https://www.microvista.de/datenschutzerklaerung/ | WP-Page | /datenschutz | 301 |
| https://www.microvista.de/end-of-line-test/ | WP-Page | /serie | 301 |
| https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ | WP-Page | /dienstleistungen | 301 |
| https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ct-datenauswertung/ | WP-Page | /dienstleistungen/ct-datenauswertung | 301 |
| https://www.microvista.de/industrielle-computertomographie/dienstleistungen/ct-labor/ | WP-Page | /dienstleistungen/ct-labor | 301 |
| https://www.microvista.de/industrielle-computertomographie/faq/ | WP-Page | /faq | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/ | WP-Page | /pruefaufgaben | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/3d-vermessung/ | WP-Page | /pruefaufgaben/3d-vermessung | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/cad-soll-ist-vergleich/ | WP-Page | /pruefaufgaben/cad-soll-ist-vergleich | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/erstmusterpruefbericht/ | WP-Page | /pruefaufgaben/erstmusterpruefbericht | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/form-und-lagetoleranzen/ | WP-Page | /pruefaufgaben/form-und-lagetoleranzen | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/grat-kernreste-spaene/ | WP-Page | /pruefaufgaben/grat-kernreste-spaene | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/laminographie/ | WP-Page | /pruefaufgaben/laminographie | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/messung-wandstaerken/ | WP-Page | /pruefaufgaben/wanddickenmessung | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/montage-fugekontrolle/ | WP-Page | /pruefaufgaben/montage-fuegekontrolle | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/porositatsanalyse/ | WP-Page | /pruefaufgaben/porositaetsanalyse | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/qualitatssicherung-bei-hairpin-statoren/ | WP-Page | /pruefaufgaben/hairpin-stator-pruefung | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/reverse-engineering/ | WP-Page | /pruefaufgaben/reverse-engineering | 301 |
| https://www.microvista.de/industrielle-computertomographie/prufaufgaben/schweissnahtpruefung/ | WP-Page | /pruefaufgaben/schweissnahtpruefung | 301 |
| https://www.microvista.de/presse/mobiles-ct-system-direkt-vor-ort/ | WP-Post | /magazin/mobiles-ct-system-direkt-vor-ort | 301 |
| https://www.microvista.de/presse/promovierter-ingenieur-ergaenzt-unternehmensgruender-in-gemeinsamer-geschaeftsfuehrung-fuehrungsteam-legt-fokus-auf-mobile-ct-technologie-und-ki-gestuetzte-loesungen/ | WP-Post | /magazin/geschaeftsfuehrung-mobile-ct-ki | 301 |
| https://www.microvista.de/presse/qualitaetskontrolle-die-zur-produktion-rollt-flexibel-mietbares-ct-system/ | WP-Post | /magazin/qualitaetskontrolle-die-zur-produktion-rollt-flexibel-mietbares-ct-system | 301 |
| https://www.microvista.de/presse/zerstoerungsfreie-bauteilpruefung-mit-mobilem-industriellem-ct-direkt-vor-ort/ | WP-Post | /magazin/zerstoerungsfreie-bauteilpruefung-mit-mobilem-industriellem-ct-direkt-vor-ort | 301 |
| https://www.microvista.de/pruefung-additiv-gefertigter-bauteile/ | WP-Page | /branchen/additive-fertigung | 301 |
| https://www.microvista.de/test/ | WP-Page | / | 301 |
| https://www.microvista.de/umweltallianz-sachen-anhalt/ | WP-Page | /zertifizierungen | 301 |
| https://www.microvista.de/zerstoerungsfreie-pruefung-automobilindustrie/ | WP-Page | /branchen/automotive | 301 |
| https://www.microvista.de/zerstoerungsfreie-pruefung-batteriesystemen/ | WP-Page | /branchen/e-mobilitaet | 301 |
| https://www.microvista.de/zerstoerungsfreie-pruefung-leichtmetallguss/ | WP-Page | /branchen/leichtmetallguss | 301 |
| https://www.microvista.de/zerstoerungsfreie-werkstoffpruefung/ | WP-Page | /branchen/werkstoffpruefung | 301 |
| https://www.microvista.de/zerstorungsfreie-prufung-von-eisenguss/ | WP-Page | /branchen/eisenguss | 301 |
| https://www.microvista.de/zfp-archaeologie/ | WP-Page | /branchen/archaeologie | 301 |

## OK direkt (15)

| Alte URL | Quelle | Ziel | Note |
|---|---|---|---|
| https://www.industrial-ct-software.com/ | CTSW-Page | / | 200 |
| https://www.microvista.de/ | WP-Page | / | 200 |
| https://www.microvista.de/agb/ | WP-Page | /agb | 200 |
| https://www.microvista.de/bonusprogramm/ | WP-Page | /bonusprogramm | 200 |
| https://www.microvista.de/forschung-entwicklung/ | WP-Page | /forschung-entwicklung | 200 |
| https://www.microvista.de/impressum/ | WP-Page | /impressum | 200 |
| https://www.microvista.de/kontakt/ | WP-Page | /kontakt | 200 |
| https://www.microvista.de/live-demo-scanexpress/ | WP-Page | /live-demo-scanexpress | 200 |
| https://www.microvista.de/mediathek/ | WP-Page | /mediathek | 200 |
| https://www.microvista.de/newsletter/ | WP-Page | /newsletter | 200 |
| https://www.microvista.de/newsroom/ | WP-Page | /newsroom | 200 |
| https://www.microvista.de/pressemitteilungen/ | WP-Page | /pressemitteilungen | 200 |
| https://www.microvista.de/team/ | WP-Page | /team | 200 |
| https://www.microvista.de/zerstoerungsfreie-serienpruefung/ | WP-Page | /zerstoerungsfreie-serienpruefung | 200 |
| https://www.microvista.de/zertifizierungen/ | WP-Page | /zertifizierungen | 200 |

## OK live (71)

| Alte URL | Quelle | Ziel | Note |
|---|---|---|---|
| https://www.industrial-ct-software.com/fr/clause-de-non-responsabilite/ | CTSW-Page | /fr/clause-de-non-responsabilite | final=https://microvista-astro.pages.dev/datenschutz |
| https://www.industrial-ct-software.com/fr/declaration-de-confidentialite-ue/ | CTSW-Page | /fr/declaration-de-confidentialite-ue | final=https://microvista-astro.pages.dev/datenschutz |
| https://www.industrial-ct-software.com/fr/impression/ | CTSW-Page | /fr/impression | final=https://microvista-astro.pages.dev/impressum |
| https://www.microvista.de/en/cad-target-actual-comparison/ | WP-Page | /en/cad-target-actual-comparison | final=https://microvista-astro.pages.dev/en/pruefaufgaben/cad-soll-ist-vergleich |
| https://www.microvista.de/en/certificates/ | WP-Page | /en/certificates | final=https://microvista-astro.pages.dev/en/zertifizierungen |
| https://www.microvista.de/en/contact/ | WP-Page | /en/contact | final=https://microvista-astro.pages.dev/en/kontakt |
| https://www.microvista.de/en/cookie-policy/ | WP-Page | /en/cookie-policy | final=https://microvista-astro.pages.dev/en/datenschutz |
| https://www.microvista.de/en/data-privacy/ | WP-Page | /en/data-privacy | final=https://microvista-astro.pages.dev/en/datenschutz |
| https://www.microvista.de/en/drive-efficiency-eliminate-scrap-see-the-power-of-mobile-industrial-ct/ | WP-Page | /en/drive-efficiency-eliminate-scrap-see-the-power-of-mobile-industrial-ct | final=https://microvista-astro.pages.dev/en/dienstleistungen/scanexpress |
| https://www.microvista.de/en/employees/ | WP-Page | /en/employees | final=https://microvista-astro.pages.dev/en/team |
| https://www.microvista.de/en/environmental-alliance-saxony-anhalt/ | WP-Page | /en/environmental-alliance-saxony-anhalt | final=https://microvista-astro.pages.dev/en/zertifizierungen |
| https://www.microvista.de/en/general-terms-and-conditions/ | WP-Page | /en/general-terms-and-conditions | final=https://microvista-astro.pages.dev/en/agb |
| https://www.microvista.de/en/imprint/ | WP-Page | /en/imprint | final=https://microvista-astro.pages.dev/en/impressum |
| https://www.microvista.de/en/industrial-computed-tomography/faq-2/ | WP-Page | /en/industrial-computed-tomography/faq-2 | final=https://microvista-astro.pages.dev/en/faq |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks | final=https://microvista-astro.pages.dev/en/pruefaufgaben |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/assembly-and-joining-inspection/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/assembly-and-joining-inspection | final=https://microvista-astro.pages.dev/en/pruefaufgaben/montage-fuegekontrolle |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/burr-core-residues-and-chips/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/burr-core-residues-and-chips | final=https://microvista-astro.pages.dev/en/pruefaufgaben/grat-kernreste-spaene |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/initial-sample-inspection-report/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/initial-sample-inspection-report | final=https://microvista-astro.pages.dev/en/pruefaufgaben/erstmusterpruefbericht |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/porosity-analysis/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/porosity-analysis | final=https://microvista-astro.pages.dev/en/pruefaufgaben/porositaetsanalyse |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/quality-assurance-for-hairpin-stators/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/quality-assurance-for-hairpin-stators | final=https://microvista-astro.pages.dev/en/pruefaufgaben/hairpin-stator-pruefung |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/reverse-engineerin/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/reverse-engineerin | final=https://microvista-astro.pages.dev/en/pruefaufgaben/reverse-engineering |
| https://www.microvista.de/en/industrial-computed-tomography/inspection-tasks/wall-thickness-measurement/ | WP-Page | /en/industrial-computed-tomography/inspection-tasks/wall-thickness-measurement | final=https://microvista-astro.pages.dev/en/pruefaufgaben/wanddickenmessung |
| https://www.microvista.de/en/industrial-computed-tomography/services/ | WP-Page | /en/industrial-computed-tomography/services | final=https://microvista-astro.pages.dev/en/dienstleistungen |
| https://www.microvista.de/en/industrial-computed-tomography/services/ct-data-analysis/ | WP-Page | /en/industrial-computed-tomography/services/ct-data-analysis | final=https://microvista-astro.pages.dev/en/dienstleistungen/ct-datenauswertung |
| https://www.microvista.de/en/industrial-computed-tomography/services/ct-laboratory/ | WP-Page | /en/industrial-computed-tomography/services/ct-laboratory | final=https://microvista-astro.pages.dev/en/dienstleistungen/ct-labor |
| https://www.microvista.de/en/measuring-geometric-tolerances-gdt-methods-and-procedures/ | WP-Page | /en/measuring-geometric-tolerances-gdt-methods-and-procedures | final=https://microvista-astro.pages.dev/en/pruefaufgaben/form-und-lagetoleranzen |
| https://www.microvista.de/en/news-center/ | WP-Page | /en/news-center | final=https://microvista-astro.pages.dev/en/newsroom |
| https://www.microvista.de/en/newsletter-registration/ | WP-Page | /en/newsletter-registration | final=https://microvista-astro.pages.dev/en/newsletter |
| https://www.microvista.de/en/non-destructive-weld-testing-methods-procedures-and-techniques/ | WP-Page | /en/non-destructive-weld-testing-methods-procedures-and-techniques | final=https://microvista-astro.pages.dev/en/pruefaufgaben/schweissnahtpruefung |
| https://www.microvista.de/en/posts/ | WP-Page | /en/posts | final=https://microvista-astro.pages.dev/en/magazin |
| https://www.microvista.de/en/posts/3d-ct-analysis-with-ai/ | WP-Post | /en/posts/3d-ct-analysis-with-ai | final=https://microvista-astro.pages.dev/en/magazin/3d-ct-analysis-with-ai |
| https://www.microvista.de/en/posts/3d-ct-metal-testing-components/ | WP-Post | /en/posts/3d-ct-metal-testing-components | final=https://microvista-astro.pages.dev/en/magazin/3d-ct-metal-testing-components |
| https://www.microvista.de/en/posts/5-popular-methods-for-non-destructive-testing/ | WP-Post | /en/posts/5-popular-methods-for-non-destructive-testing | final=https://microvista-astro.pages.dev/en/magazin/5-popular-methods-for-non-destructive-testing |
| https://www.microvista.de/en/posts/7-steps-of-industrial-ct-testing/ | WP-Post | /en/posts/7-steps-of-industrial-ct-testing | final=https://microvista-astro.pages.dev/en/magazin/7-steps-of-industrial-ct-testing |
| https://www.microvista.de/en/posts/arrival-of-the-mobile-ct/ | WP-Post | /en/posts/arrival-of-the-mobile-ct | final=https://microvista-astro.pages.dev/en/magazin/arrival-of-the-mobile-ct |
| https://www.microvista.de/en/posts/ct-container-long-vs-compact-2/ | WP-Post | /en/posts/ct-container-long-vs-compact-2 | final=https://microvista-astro.pages.dev/en/magazin/ct-container-long-vs-compact-2 |
| https://www.microvista.de/en/posts/ct-for-pharma/ | WP-Post | /en/posts/ct-for-pharma | final=https://microvista-astro.pages.dev/en/magazin/ct-for-pharma |
| https://www.microvista.de/en/posts/efficient-failure-analysis-for-blocked-batches-fast-decisions-with-our-express-service/ | WP-Post | /en/posts/efficient-failure-analysis-for-blocked-batches-fast-decisions-with-our-express-service | final=https://microvista-astro.pages.dev/en/magazin/efficient-failure-analysis-for-blocked-batches-fast-decisions-with-our-express-service |
| https://www.microvista.de/en/posts/final-spurt-now-also-for-the-mobile-ct-container/ | WP-Post | /en/posts/final-spurt-now-also-for-the-mobile-ct-container | final=https://microvista-astro.pages.dev/en/magazin/final-spurt-now-also-for-the-mobile-ct-container |
| https://www.microvista.de/en/posts/first-customer-use-of-the-scanexpress/ | WP-Post | /en/posts/first-customer-use-of-the-scanexpress | final=https://microvista-astro.pages.dev/en/magazin/first-customer-use-of-the-scanexpress |
| https://www.microvista.de/en/posts/first-test-scans-with-the-mobile-ct/ | WP-Post | /en/posts/first-test-scans-with-the-mobile-ct | final=https://microvista-astro.pages.dev/en/magazin/first-test-scans-with-the-mobile-ct |
| https://www.microvista.de/en/posts/hairpin-stator-crown/ | WP-Post | /en/posts/hairpin-stator-crown | final=https://microvista-astro.pages.dev/en/magazin/hairpin-stator-crown |
| https://www.microvista.de/en/posts/industrial-ct-cylinder-head-inspection/ | WP-Post | /en/posts/industrial-ct-cylinder-head-inspection | final=https://microvista-astro.pages.dev/en/magazin/industrial-ct-cylinder-head-inspection |
| https://www.microvista.de/en/posts/industrial-ct-for-testing-additively-manufactured-components/ | WP-Post | /en/posts/industrial-ct-for-testing-additively-manufactured-components | final=https://microvista-astro.pages.dev/en/magazin/industrial-ct-for-testing-additively-manufactured-components |
| https://www.microvista.de/en/posts/industrial-ct-the-best-method-for-non-destructive-testing-of-casting-parts/ | WP-Post | /en/posts/industrial-ct-the-best-method-for-non-destructive-testing-of-casting-parts | final=https://microvista-astro.pages.dev/en/magazin/industrial-ct-the-best-method-for-non-destructive-testing-of-casting-parts |
| https://www.microvista.de/en/posts/industrial-x-ray-inspection-vs-industrial-computed-tomography/ | WP-Post | /en/posts/industrial-x-ray-inspection-vs-industrial-computed-tomography | final=https://microvista-astro.pages.dev/en/magazin/industrial-x-ray-inspection-vs-industrial-computed-tomography |
| https://www.microvista.de/en/posts/insights-into-trends-market-development-and-technological-innovations/ | WP-Post | /en/posts/insights-into-trends-market-development-and-technological-innovations | final=https://microvista-astro.pages.dev/en/magazin/insights-into-trends-market-development-and-technological-innovations |
| https://www.microvista.de/en/posts/inspecthub-cloudsolution/ | WP-Post | /en/posts/inspecthub-cloudsolution | final=https://microvista-astro.pages.dev/en/magazin/inspecthub-cloudsolution |
| https://www.microvista.de/en/posts/microvista-certified-once-again/ | WP-Post | /en/posts/microvista-certified-once-again | final=https://microvista-astro.pages.dev/en/magazin/microvista-certified-once-again |
| https://www.microvista.de/en/posts/minimise-rejects-in-the-automotive-industry-with-non-destructive-testing/ | WP-Post | /en/posts/minimise-rejects-in-the-automotive-industry-with-non-destructive-testing | final=https://microvista-astro.pages.dev/en/magazin/minimise-rejects-in-the-automotive-industry-with-non-destructive-testing |
| https://www.microvista.de/en/posts/mobile-ct-at-the-vdi-conference-on-casting-technology-in-engine-construction/ | WP-Post | /en/posts/mobile-ct-at-the-vdi-conference-on-casting-technology-in-engine-construction | final=https://microvista-astro.pages.dev/en/magazin/mobile-ct-at-the-vdi-conference-on-casting-technology-in-engine-construction |
| https://www.microvista.de/en/posts/mobile-ct-container-united-the-scanexpress-almost-ready/ | WP-Post | /en/posts/mobile-ct-container-united-the-scanexpress-almost-ready | final=https://microvista-astro.pages.dev/en/magazin/mobile-ct-container-united-the-scanexpress-almost-ready |
| https://www.microvista.de/en/posts/mobile-industrial-ct-compact/ | WP-Post | /en/posts/mobile-industrial-ct-compact | final=https://microvista-astro.pages.dev/en/magazin/mobile-industrial-ct-compact |
| https://www.microvista.de/en/posts/mobile-industrial-ct-on-the-home-straight/ | WP-Post | /en/posts/mobile-industrial-ct-on-the-home-straight | final=https://microvista-astro.pages.dev/en/magazin/mobile-industrial-ct-on-the-home-straight |
| https://www.microvista.de/en/posts/ndt-for-the-automotive-industry/ | WP-Post | /en/posts/ndt-for-the-automotive-industry | final=https://microvista-astro.pages.dev/en/magazin/ndt-for-the-automotive-industry |
| https://www.microvista.de/en/posts/ndt-of-light-metal-castings/ | WP-Post | /en/posts/ndt-of-light-metal-castings | final=https://microvista-astro.pages.dev/en/magazin/ndt-of-light-metal-castings |
| https://www.microvista.de/en/posts/new-website-with-blog-newsletter-etc/ | WP-Post | /en/posts/new-website-with-blog-newsletter-etc | final=https://microvista-astro.pages.dev/en/magazin/new-website-with-blog-newsletter-etc |
| https://www.microvista.de/en/posts/non-destructive-testing-of-battery-systems/ | WP-Post | /en/posts/non-destructive-testing-of-battery-systems | final=https://microvista-astro.pages.dev/en/magazin/non-destructive-testing-of-battery-systems |
| https://www.microvista.de/en/posts/non-destructive-testing-of-cast-iron/ | WP-Post | /en/posts/non-destructive-testing-of-cast-iron | final=https://microvista-astro.pages.dev/en/magazin/non-destructive-testing-of-cast-iron |
| https://www.microvista.de/en/posts/palaeontology-meets-industrial-ct/ | WP-Post | /en/posts/palaeontology-meets-industrial-ct | final=https://microvista-astro.pages.dev/en/magazin/palaeontology-meets-industrial-ct |
| https://www.microvista.de/en/posts/ppf-process-optimisation-industrial-ct-testing/ | WP-Post | /en/posts/ppf-process-optimisation-industrial-ct-testing | final=https://microvista-astro.pages.dev/en/magazin/ppf-process-optimisation-industrial-ct-testing |
| https://www.microvista.de/en/posts/scanexpress-how-does-the-mobile-ct-work/ | WP-Post | /en/posts/scanexpress-how-does-the-mobile-ct-work | final=https://microvista-astro.pages.dev/en/magazin/scanexpress-how-does-the-mobile-ct-work |
| https://www.microvista.de/en/posts/scanning-artifacts-with-low-risk-using-mobile-industrial-ct/ | WP-Post | /en/posts/scanning-artifacts-with-low-risk-using-mobile-industrial-ct | final=https://microvista-astro.pages.dev/en/magazin/scanning-artifacts-with-low-risk-using-mobile-industrial-ct |
| https://www.microvista.de/en/posts/temporary-ct-inspection-series-start-ups/ | WP-Post | /en/posts/temporary-ct-inspection-series-start-ups | final=https://microvista-astro.pages.dev/en/magazin/temporary-ct-inspection-series-start-ups |
| https://www.microvista.de/en/posts/update-faster-ct-scans-higher-resolution-laminography/ | WP-Post | /en/posts/update-faster-ct-scans-higher-resolution-laminography | final=https://microvista-astro.pages.dev/en/magazin/update-faster-ct-scans-higher-resolution-laminography |
| https://www.microvista.de/en/posts/wall-thickness-measurement-your-options-at-a-glance/ | WP-Post | /en/posts/wall-thickness-measurement-your-options-at-a-glance | final=https://microvista-astro.pages.dev/en/magazin/wall-thickness-measurement-your-options-at-a-glance |
| https://www.microvista.de/en/presse-en/microvista-gmbh-strengthens-management-team-dr-robin-hohne-and-prof-dr-lutz-hagner-form-dual-leadership/ | WP-Post | /en/presse-en/microvista-gmbh-strengthens-management-team-dr-robin-hohne-and-prof-dr-lutz-hagner-form-dual-leadership | final=https://microvista-astro.pages.dev/en/newsroom |
| https://www.microvista.de/fr/clause-de-non-responsabilite/ | WP-Page | /fr/clause-de-non-responsabilite | final=https://microvista-astro.pages.dev/datenschutz |
| https://www.microvista.de/fr/declaration-de-confidentialite-ue/ | WP-Page | /fr/declaration-de-confidentialite-ue | final=https://microvista-astro.pages.dev/datenschutz |
| https://www.microvista.de/fr/impression/ | WP-Page | /fr/impression | final=https://microvista-astro.pages.dev/impressum |
| https://www.microvista.de/fr/politique-en-matiere-de-cookies/ | WP-Page | /fr/politique-en-matiere-de-cookies | final=https://microvista-astro.pages.dev/datenschutz |
