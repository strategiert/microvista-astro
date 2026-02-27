# URL Mapping: Alte zu Neue Sitemap

Generiert am: 2026-02-26T12:36:51.200Z

Quellen: `scraped-content\all-content.json`, `public\_redirects`, `dist`

## Zusammenfassung

- Alte URLs (eindeutige Pfade): 160
- Direkte Treffer in neuer Sitemap (200): 15
- Redirect 301 mit Ziel in neuer Sitemap: 17
- Redirect 301 mit Ziel nicht in neuer Sitemap: 128
- Ohne Mapping: 0

## Ausgabe

- CSV: `docs/url-mapping-old-to-new.csv`

| Old Path | New Path | Typ | Sitemap-Ziel | Regel |
| --- | --- | --- | --- | --- |
| / | / | direct_200 | yes | — |
| /agb | /agb | direct_200 | yes | — |
| /beitraege | /magazin | redirect_301_in_sitemap | yes | L6: /beitraege/ -> /magazin |
| /beitraege/3d-ct-auswertung | /magazin/3d-ct-auswertung | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/3d-ct-metall-pruefung-waermemanagement | /magazin/3d-ct-metall-pruefung-waermemanagement | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/5-beliebte-zerstoerungsfreie-pruefverfahren-in-der-automobilindustrie | /magazin/5-beliebte-zerstoerungsfreie-pruefverfahren-in-der-automobilindustrie | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/ablauf-industrielle-ct-pruefung | /magazin/ablauf-industrielle-ct-pruefung | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/archaeologie-mobiles-ct | /magazin/archaeologie-mobiles-ct | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/ausschuss-automobilindustrie-mit-zerstoerungsfreier-pruefung-minimieren | /magazin/ausschuss-automobilindustrie-mit-zerstoerungsfreier-pruefung-minimieren | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/ct-container-long-vs-compact | /magazin/ct-container-long-vs-compact | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/ct-inspektion-serienstart-whitepaper | /magazin/ct-inspektion-serienstart-whitepaper | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/effiziente-fehleranalyse-express-service | /magazin/effiziente-fehleranalyse-express-service | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/einblicke-in-trends-marktentwicklung-und-innovationen | /magazin/einblicke-in-trends-marktentwicklung-und-innovationen | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/endspurt-nun-auch-beim-mobilen-ct-container | /magazin/endspurt-nun-auch-beim-mobilen-ct-container | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/erste-testscans-mit-dem-mobilen-ct | /magazin/erste-testscans-mit-dem-mobilen-ct | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/erster-kundeneinsatz-des-scanexpress | /magazin/erster-kundeneinsatz-des-scanexpress | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/industrielle-ct-die-beste-methode-fuer-zerstoerungsfreie-pruefung-von-gussteilen | /magazin/industrielle-ct-die-beste-methode-fuer-zerstoerungsfreie-pruefung-von-gussteilen | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/industrielle-ct-zur-prufung-additiv-gefertigter-bauteile | /magazin/industrielle-ct-zur-prufung-additiv-gefertigter-bauteile | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/industrielle-ct-zylinderkopfpruefung | /magazin/industrielle-ct-zylinderkopfpruefung | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/industrielle-rontgenprufung-vs-industrielle-computertomographie | /magazin/industrielle-rontgenprufung-vs-industrielle-computertomographie | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/innovative-methode-zur-auswertung-von-hairpin-stator-scans | /magazin/innovative-methode-zur-auswertung-von-hairpin-stator-scans | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/inspecthub | /magazin/inspecthub | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/microvista-erneut-zertifiziert | /magazin/microvista-erneut-zertifiziert | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/mobiler-industrieller-computertomograph | /magazin/mobiler-industrieller-computertomograph | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/mobiles-ct-auf-der-zielgeraden | /magazin/mobiles-ct-auf-der-zielgeraden | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/mobiles-ct-bei-der-vdi-tagung-giesstechnik-im-motorenbau | /magazin/mobiles-ct-bei-der-vdi-tagung-giesstechnik-im-motorenbau | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/mobiles-ct-und-container-vereint-der-scanexpress-ist-fast-fertig | /magazin/mobiles-ct-und-container-vereint-der-scanexpress-ist-fast-fertig | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/mobiles-industrielles-ct-auf-der-zielgeraden | /magazin/mobiles-industrielles-ct-auf-der-zielgeraden | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/palaeontologie-trifft-industrielle-ct | /magazin/palaeontologie-trifft-industrielle-ct | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/ppf-verfahren-optimierung-potenzialfreisetzung-durch-industrielle-ct-pruefung | /magazin/ppf-verfahren-optimierung-potenzialfreisetzung-durch-industrielle-ct-pruefung | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/qualitaetssicherung-pharmaindustrie | /magazin/qualitaetssicherung-pharmaindustrie | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/scanexpress-eingetroffen | /magazin/scanexpress-eingetroffen | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/scanexpress-wie-funktioniert-das-mobile-ct | /magazin/scanexpress-wie-funktioniert-das-mobile-ct | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/update-schnellere-ct-scans-hoehere-aufloesung-laminografie | /magazin/update-schnellere-ct-scans-hoehere-aufloesung-laminografie | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/wanddickenmessung-im-uberblick | /magazin/wanddickenmessung-im-uberblick | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/zerstorungfreie-prufung-von-leichtmetallguss | /magazin/zerstorungfreie-prufung-von-leichtmetallguss | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/zerstorungsfreie-prufung-von-batteriesystemen | /magazin/zerstorungsfreie-prufung-von-batteriesystemen | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/zerstorungsfreie-prufung-von-eisenguss | /magazin/zerstorungsfreie-prufung-von-eisenguss | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /beitraege/zfp-automobilindustrie | /magazin/zfp-automobilindustrie | redirect_301_not_in_sitemap | no | L5: /beitraege/* -> /magazin/:splat |
| /bonusprogramm | /bonusprogramm | direct_200 | yes | — |
| /cookie-richtlinie-eu | /datenschutz | redirect_301_in_sitemap | yes | L88: /cookie-richtlinie-eu/ -> /datenschutz |
| /datenschutzerklaerung | /datenschutz | redirect_301_in_sitemap | yes | L86: /datenschutzerklaerung/ -> /datenschutz |
| /en/cad-target-actual-comparison | /en/pruefaufgaben/cad-soll-ist-vergleich | redirect_301_not_in_sitemap | no | L43: /en/cad-target-actual-comparison/ -> /en/pruefaufgaben/cad-soll-ist-vergleich |
| /en/certificates | /en/zertifizierungen | redirect_301_not_in_sitemap | no | L94: /en/certificates/ -> /en/zertifizierungen |
| /en/contact | /en/kontakt | redirect_301_not_in_sitemap | no | L92: /en/contact/ -> /en/kontakt |
| /en/cookie-policy | /en/datenschutz | redirect_301_not_in_sitemap | no | L89: /en/cookie-policy/ -> /en/datenschutz |
| /en/data-privacy | /en/datenschutz | redirect_301_not_in_sitemap | no | L87: /en/data-privacy/ -> /en/datenschutz |
| /en/drive-efficiency-eliminate-scrap-see-the-power-of-mobile-industrial-ct | /en/dienstleistungen/scanexpress | redirect_301_not_in_sitemap | no | L101: /en/drive-efficiency-eliminate-scrap-see-the-power-of-mobile-industrial-ct/ -> /en/dienstleistungen/scanexpress |
| /en/employees | /en/team | redirect_301_not_in_sitemap | no | L93: /en/employees/ -> /en/team |
| /en/environmental-alliance-saxony-anhalt | /en/zertifizierungen | redirect_301_not_in_sitemap | no | L100: /en/environmental-alliance-saxony-anhalt/ -> /en/zertifizierungen |
| /en/general-terms-and-conditions | /en/agb | redirect_301_not_in_sitemap | no | L91: /en/general-terms-and-conditions/ -> /en/agb |
| /en/imprint | /en/impressum | redirect_301_not_in_sitemap | no | L90: /en/imprint/ -> /en/impressum |
| /en/industrial-computed-tomography/faq-2 | /en/faq | redirect_301_not_in_sitemap | no | L59: /en/industrial-computed-tomography/faq-2/ -> /en/faq |
| /en/industrial-computed-tomography/inspection-tasks | /en/pruefaufgaben | redirect_301_not_in_sitemap | no | L35: /en/industrial-computed-tomography/inspection-tasks/ -> /en/pruefaufgaben |
| /en/industrial-computed-tomography/inspection-tasks/assembly-and-joining-inspection | /en/pruefaufgaben/montage-fuegekontrolle | redirect_301_not_in_sitemap | no | L38: /en/industrial-computed-tomography/inspection-tasks/assembly-and-joining-inspection/ -> /en/pruefaufgaben/montage-fuegekontrolle |
| /en/industrial-computed-tomography/inspection-tasks/burr-core-residues-and-chips | /en/pruefaufgaben/grat-kernreste-spaene | redirect_301_not_in_sitemap | no | L39: /en/industrial-computed-tomography/inspection-tasks/burr-core-residues-and-chips/ -> /en/pruefaufgaben/grat-kernreste-spaene |
| /en/industrial-computed-tomography/inspection-tasks/initial-sample-inspection-report | /en/pruefaufgaben/erstmusterpruefbericht | redirect_301_not_in_sitemap | no | L42: /en/industrial-computed-tomography/inspection-tasks/initial-sample-inspection-report/ -> /en/pruefaufgaben/erstmusterpruefbericht |
| /en/industrial-computed-tomography/inspection-tasks/porosity-analysis | /en/pruefaufgaben/porositaetsanalyse | redirect_301_not_in_sitemap | no | L36: /en/industrial-computed-tomography/inspection-tasks/porosity-analysis/ -> /en/pruefaufgaben/porositaetsanalyse |
| /en/industrial-computed-tomography/inspection-tasks/quality-assurance-for-hairpin-stators | /en/pruefaufgaben/hairpin-stator-pruefung | redirect_301_not_in_sitemap | no | L40: /en/industrial-computed-tomography/inspection-tasks/quality-assurance-for-hairpin-stators/ -> /en/pruefaufgaben/hairpin-stator-pruefung |
| /en/industrial-computed-tomography/inspection-tasks/reverse-engineerin | /en/pruefaufgaben/reverse-engineering | redirect_301_not_in_sitemap | no | L41: /en/industrial-computed-tomography/inspection-tasks/reverse-engineerin/ -> /en/pruefaufgaben/reverse-engineering |

_Hinweis: Tabelle zeigt die ersten 60 Einträge, vollständige Liste in CSV._
