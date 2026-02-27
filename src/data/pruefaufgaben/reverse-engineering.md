# REVERSE ENGINEERING VOM 3D SCAN MIT DEM CT ZUM CAD

GET YOUR INSPECTION DONE – Anywhere. Anytime. Fast.

[Express-Inspektion  
buchen](/kontakt/)

[Gratis-Beratung  
sichern](/kontakt/)

## Was ist Reverse Engineering?

**Reverse Engineering** ermöglicht die digitale Rekonstruktion **physischer Objekte**, wenn keine **CAD-Daten** vorliegen. Ob verlorene **Konstruktionspläne**, nachträglich **modifizierte Produkte** oder **manuell hergestellte Designstudien**: Der Reverse Engineering Prozess wandelt **physische Bauteile in nutzbare digitale Dateien** um. Das Ziel ist es Konstruktion und Funktionalität zu verstehen und digital nachzubilden für Produktion, Optimierung oder Dokumentation.

## Welche 3D-Scanner eignen sich für Reverse Engineering?

Für die Erfassung von Objekten stehen verschiedene Technologien zur Verfügung. Die Wahl des geeigneten 3D-Scanners hängt von Bauteilgröße, Komplexität und den Anforderungen an die Genauigkeit ab.

**Optische 3D-Scanner** arbeiten mit strukturiertem Licht oder Laser und erfassen die sichtbare Oberfläche des Objekts. Sie eignen sich gut für Freiformflächen und organische Formen. Die Genauigkeit liegt typischerweise bei 0,02 bis 0,1 mm. Nachteil: Innenliegende Strukturen, Hinterschneidungen und verdeckte Bereiche können nicht erfasst werden. Bei komplexen Baugruppen sind multiple Scans aus verschiedenen Winkeln erforderlich, die anschließend zusammengefügt werden müssen.

**Industrielle Computertomographie (CT)** durchstrahlt das gesamte Objekt mit Röntgenstrahlen und erzeugt ein vollständiges 3D-Volumenmodell. Anders als bei optischen Scannern werden auch innenliegende Strukturen, Hohlräume und verdeckte Geometrien erfasst. Die Präzision moderner CT-Systeme erreicht Werte unter 10 Mikrometern. Für Reverse Engineering komplexer Bauteile mit Innengeometrien ist CT oft die einzige praktikable Methode.

**Taktile Koordinatenmessgeräte (KMG)** tasten einzelne Punkte auf der Oberfläche ab. Sie liefern höchste Genauigkeit, sind aber für die Erfassung komplexer Freiformflächen zu langsam und erfassen keine Volumendaten.

## Wann ist CT besser geeignet als ein Oberflächen-Scanner?

Die **industrielle Computertomographie** bietet beim Reverse Engineering entscheidende Vorteile gegenüber optischen 3D-Scannern, wenn bestimmte Anforderungen vorliegen. Die Investition in einen CT-Scan lohnt sich besonders **bei komplexen Bauteilen**.

**CT ist die bessere Wahl bei:**

-   **Innenliegenden Strukturen:** Kanäle, Hohlräume, Wandstärken werden vollständig erfasst
-   **Komplexen Baugruppen:** Montierte Komponenten müssen nicht zerlegt werden
-   **Hinterschneidungen:** Geometrien, die von außen nicht sichtbar sind
-   **Schwer zugänglichen Bereichen:** Tiefe Bohrungen, enge Spalte
-   **Materialanalyse:** CT zeigt auch die innere Materialbeschaffenheit

Ein **Turbolader beispielsweise enthält komplexe Strömungskanäle**, die von **außen nicht sichtbar sind**. Mit einem optischen Scanner wäre eine Demontage erforderlich, wobei Dichtflächen und Passungen beschädigt werden könnten. Die CT-Aufnahme erfasst das gesamte Bauteil zerstörungsfrei in einem Scanvorgang.

Moderne CT-Systeme können auch große Bauteile mit einem **maximalen Hüllkreis von 715 mm und bis zu 1600 mm Länge** erfassen. Selbst **schwer durchstrahlbare Materialien wie Eisen oder Stahl** sind mit entsprechender Röhrenleistung analysierbar. Für Reverse Engineering großer Komponenten ist dies ein entscheidender Vorteil.

![Reverse Engineering - Netzmodell](/images/wp/2022/09/Reverse-Engineering-Netzmodell.webp)

Netzmodell eines Turboladers

Die mit dem CT gewonnen 3D-Daten wurden hier zu einem geschlossenen Oberflächennetz verarbeitet, welches auch innenliegende Strukturen abbildet.

[Gratis-Beratung  
sichern](/kontakt/)

## Wie wird aus 3D Scandaten ein CAD-Modell erstellt?

Der Scan to CAD Prozess wandelt die gescannten Rohdaten in ein parametrisches CAD-Modell um, das für Fertigung, Simulation oder 3D-Druck genutzt werden kann. Dies erfordert spezialisierte Software und Erfahrung in der Flächenrückführung.

Nach dem Scannen liegt zunächst eine Point Cloud vor, also eine Wolke aus Millionen einzelner 3D-Punkte. Diese Punktwolke wird zu einem STL-Netzmodell verarbeitet, das die Oberfläche als Dreiecksnetz darstellt. Das Netzmodell eignet sich bereits für Visualisierung und 3D-Druck, ist aber für die meisten CAD-Anwendungen nicht direkt nutzbar.

Die eigentliche Herausforderung liegt in der Flächenrückführung (Surface Reconstruction). Dabei werden aus dem Dreiecksnetz parametrische Flächen extrahiert, die in CAD-Software bearbeitet werden können. Je nach Baugruppe kommen zwei Ansätze zum Einsatz:

-   **Automatische Flächenrückführung:** Software erkennt geometrische Grundformen (Ebenen, Zylinder, Kegel) automatisch. Geeignet für prismatische Bauteile mit klaren Geometrien.
-   **Konstruktive Rückführung:** Ein Ingenieur modelliert das Bauteil in CAD-Software nach, nutzt aber die Scandaten als Referenz. Erforderlich bei komplexen Freiformflächen oder wenn ein "sauberes" parametrisches Modell benötigt wird.

Das Ergebnis ist ein CAD-Modell, das sich in gängige CAD-Tools importieren lässt und alle Abmessungen des Original-Objekts enthält.

## Welche Software wird für Reverse Engineering eingesetzt?

Für den Workflow von Scan to CAD werden spezialisierte Softwarelösungen eingesetzt, die Punktwolken verarbeiten und in CAD-Dateien umwandeln können. Die Wahl der Software hängt vom Anwendungsfall und den vorhandenen CAD-Tools ab.

**Software für Punktwolkenverarbeitung:**

-   CloudCompare (Open Source)
-   VXelements
-   Artec Studio
-   Geomagic Design X / Wrap

**CAD-Software mit Reverse-Engineering-Funktionen:**

-   Autodesk Inventor
-   SolidWorks
-   Siemens NX
-   CATIA

**Der typische Ablauf:** Die Scan-Data wird zunächst in spezialisierter Software bereinigt, ausgerichtet und zu einem Netzmodell verarbeitet. Anschließend erfolgt die Flächenrückführung, entweder in derselben Software oder durch Export und Weiterverarbeitung in CAD-Software. Das finale Modell wird als STEP, IGES oder natives CAD-Format exportiert.

Bei der automatischen Modellierung erkennt die Software geometrische Features wie Bohrungen, Fasen und Verrundungen und erzeugt parametrische Elemente. Die Schnelligkeit dieses Prozesses hängt stark von der Komplexität des Bauteils ab: Ein einfaches prismatisches Teil ist in Minuten rekonstruiert, eine organische Freiformfläche kann Stunden oder Tage dauern.

## Welche Software wird für Reverse Engineering eingesetzt?

### Typische Genauigkeiten nach Gerät bzw. Technologie:

Technologie

Genauigkeit

Geeignet für

Optischer 3D Scanner

0,02 - 0,1 mm

Oberflächen, Freiformflächen

Industrielle CT

0,015 - 0,05 mm

Komplette Bauteile inkl. Innengeometrie

Koordinaten-Messgerät

0,001 - 0,01 mm

Einzelmaße, Referenzpunkte

Die erreichbare Genauigkeit beim Reverse Engineering hängt von der Scan-Technologie, der Bauteilgröße und der Nachbearbeitung ab. Für die meisten industriellen Anwendungen sind Toleranzen im Hundertstel-Millimeter-Bereich erreichbar.

Die Präzision des Scan-Vorgangs allein garantiert noch kein genaues CAD-Modell. Bei der Flächenrückführung entstehen Abweichungen, wenn Freiformflächen durch mathematische Flächen angenähert werden. Ein erfahrener Ingenieur kann diese Abweichungen minimieren und kritische Maße gezielt optimieren.

Für die Prototypenfertigung und Ersatzteilherstellung reichen Genauigkeiten von 0,1 mm meist aus. Bei Passungen, Dichtflächen oder funktionskritischen Maßen ist eine höhere Präzision erforderlich. Hier empfiehlt sich eine Kombination aus Scan und gezielter Nachmessung kritischer Abmessungen.

[Gratis-Beratung  
sichern](/kontakt/)

## Welche Anwendungen hat Reverse Engineering in der Industrie?

Reverse Engineering findet in nahezu allen Industriebranchen Anwendung. Die digitale Nachbildung bestehender Produkte beschleunigt Entwicklungsprozesse und ermöglicht Innovationen auf Basis vorhandener Konstruktionen. Der Bedarf an Reverse Engineering wächst mit zunehmender Produktkomplexität und längeren Lebenszyklen von Investitionsgütern.

**Typische industrielle Anwendungen:**

-   **Ersatzteilbeschaffung:** Nachfertigung von Komponenten, die nicht mehr lieferbar sind. Besonders relevant bei Maschinen mit langer Lebensdauer, wo Ersatzteile nach 20+ Jahren benötigt werden.
-   **Produktentwicklung:** Analyse eines Produkts als Ausgangspunkt für Weiterentwicklungen. Bestehende Bauteile werden digital erfasst und als Basis für Optimierung genutzt.
-   **Qualitätskontrolle:** Soll-Ist-Vergleich zwischen CAD-Entwurf und gefertigtem Bauteil. Abweichungen werden farbcodiert dargestellt und quantifiziert.
-   **Wartung und Reparatur:** Dokumentation des Ist-Zustands von Anlagen. Bei Verschleiß oder Beschädigung dienen die Scandaten als Referenz für die Instandsetzung.
-   **Additive Fertigung:** Vorbereitung von Bauteilen für 3D-Druck. Das gescannte Objekt wird für additive Fertigung optimiert und als STL exportiert.
-   **Prototypenentwicklung:** Schnelle Erstellung von Prototypen auf Basis physischer Muster. Handgefertigte Designstudien werden digitalisiert und für die Serienfertigung vorbereitet.

Die digitale Erfassung physischer Objekte ist auch für die Dokumentation von Kulturgütern, die Analyse von Wettbewerbsprodukten und die Erstellung von Schulungsunterlagen relevant. Der 3D-Scan liefert eine exakte räumliche Dokumentation, die für vielfältige Zwecke genutzt werden kann.

## Wie läuft ein Reverse-Engineering-Projekt bei Microvista ab?

Microvista bietet Reverse Engineering als Dienstleistung für große und komplexe Bauteile an. Die industrielle CT erfasst dabei auch innenliegende Strukturen, die mit optischen 3D-Scannern nicht zugänglich sind. Der Prozess ist auf Effizienz und Genauigkeit optimiert.

**Projektablauf:**

1.  **Auftragsklärung:** Definition der Anforderungen (Dateiformate, Toleranzen, Lieferumfang)
2.  **CT-Scan:** Erfassung des physischen Objekts mit industrieller Computertomographie
3.  **Punktwolke erzeugen:** Aus den CT-Daten wird eine 3D-Punktwolke extrahiert
4.  **STL-Netzmodell:** Die Punktwolke wird zu einem geschlossenen Oberflächennetz verarbeitet
5.  **Flächenrückführung:** Je nach Anforderung automatisch oder konstruktiv
6.  **CAD-Lieferung:** Export im gewünschten Format (STEP, IGES, natives Format)

Die CT-Systeme von Microvista erfassen Bauteile mit einem maximalen Hüllkreis von 715 mm und bis zu 1600 mm Länge. Auch schwer durchstrahlbare Materialien wie Eisen, Stahl oder dichte Legierungen können verarbeitet werden. Die neueste Software ermöglicht eine präzise Rekonstruktion auch bei anspruchsvollen Geometrien.

Für Unternehmen ohne eigene CT-Kapazität bietet dieser Service Zugang zu hochauflösender 3D-Digitalisierung ohne Investition in eigene Anlagen. Die Durchlaufzeit für ein typisches Projekt liegt je nach Komplexität zwischen wenigen Tagen und zwei Wochen.

## Welche Vorteile bietet CT-basiertes Reverse Engineering?

Die industrielle Computertomographie bietet gegenüber optischen Scan-Verfahren spezifische Vorteile, die bei bestimmten Anwendungen entscheidend sind. Die Kombination aus vollständiger Erfassung und hoher Genauigkeit macht CT zur bevorzugten Technologie für anspruchsvolle Reverse-Engineering-Projekte.

**Vorteile der CT für Reverse Engineering:**

-   **Vollständige Erfassung:** Innen- und Außengeometrie in einem Scan
-   **Keine Demontage:** Baugruppen werden im montierten Zustand gescannt
-   **Verdeckte Strukturen:** Hinterschneidungen, Kanäle, Hohlräume werden erfasst
-   **Materialinformation:** Porositäten, Einschlüsse, Wandstärken sind sichtbar
-   **Zerstörungsfrei:** Das Objekt bleibt vollständig erhalten
-   **Ein Datensatz:** Keine Zusammenführung mehrerer Scans erforderlich

Die detaillierte Erfassung ermöglicht eine präzise Nachbildung auch komplexer mechanischer Teile. Ein Getriebegehäuse mit internen Ölkanälen, ein Turbinenschaufel mit Kühlbohrungen oder ein Kunststoffteil mit Clipsen und Rastnasen: All diese Geometrien werden vollständig digital erfasst und können exakt rekonstruiert werden.

[Gratis-Beratung  
sichern](/kontakt/)