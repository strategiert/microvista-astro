"""
Import WP scraped content into src/data/static-pages/*.md

Quellen:
  scraped-content/full/*.json    → DE-Inhalt
  scraped-content/pages/         → wird NICHT verwendet (alles Placeholder)

Mapping: JSON-Slug → static-page Dateiname
"""
import json, re, os, sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
FULL_DIR  = ROOT / 'scraped-content' / 'full'
OUT_DIR   = ROOT / 'src' / 'data' / 'static-pages'

# Mapping: scraped-full/<json>.json  →  static-pages/<md>.md
MAPPING = {
    '3d-vermessung':                  'pruefaufgabe-3d-vermessung',
    'agb':                            'agb',
    'cad-soll-ist-vergleich':         'pruefaufgabe-cad-soll-ist-vergleich',
    'ct-datenauswertung':             'dienstleistung-ct-datenauswertung',
    'ct-labor':                       'dienstleistung-ct-labor',
    'datenschutz':                    'datenschutz',
    'dienstleistungen':               'dienstleistung-index',
    'end-of-line-test':               'end-of-line-test-de',
    'erstmusterpruefbericht':         'pruefaufgabe-erstmusterpruefbericht',
    'faq':                            'faq-de',
    'form-und-lagetoleranzen':        'pruefaufgabe-form-und-lagetoleranzen',
    'grat-kernreste-spaene':          'pruefaufgabe-grat-kernreste-spaene',
    'hairpin-statoren':               'pruefaufgabe-hairpin-statoren',
    'impressum':                      'impressum',
    # index.json = Homepage (neues Design, kein static-page)
    'industrielle-computertomographie': 'industrielle-computertomographie-de',
    'kontakt':                        'kontakt-de',
    'laminographie':                  'pruefaufgabe-laminographie',
    'messung-wandstaerken':           'pruefaufgabe-messung-wandstaerken',
    'montage-fugekontrolle':          'pruefaufgabe-montage-fugekontrolle',
    'newsroom':                       'newsroom-de',
    'porositatsanalyse':              'pruefaufgabe-porositatsanalyse',
    'prufaufgaben':                   'pruefaufgabe-index',
    'reverse-engineering':            'pruefaufgabe-reverse-engineering',
    'scanexpress':                    'dienstleistung-scanexpress',
    'schweissnahtpruefung':           'pruefaufgabe-schweissnahtpruefung',
    'serienpruefung':                 'zerstoerungsfreie-serienpruefung-de',
    'team':                           'team-de',
    'zertifizierungen':               'zertifizierungen-de',
}

def fix_urls(markdown: str) -> str:
    """
    Wandle absolute microvista.de URLs in relative URLs um und
    entferne trailing slashes von internen Links.
    """
    # Absolut → relativ: https://www.microvista.de/foo/ → /foo
    def replace_url(m):
        path = m.group(1)
        # Trailing slash entfernen (außer wenn nur /)
        path = path.rstrip('/') or '/'
        return f']({path}'

    markdown = re.sub(
        r'\]\(https?://(?:www\.)?microvista\.de(/[^)]*)',
        replace_url,
        markdown
    )
    return markdown

def process(src_slug: str, dst_stem: str, dry_run: bool = False):
    src_path = FULL_DIR / f'{src_slug}.json'
    dst_path = OUT_DIR / f'{dst_stem}.md'

    if not src_path.exists():
        print(f'  FEHLT: {src_path.name}')
        return

    data = json.loads(src_path.read_text(encoding='utf-8'))
    content = data.get('markdown', '')
    if not content.strip():
        print(f'  LEER:  {src_path.name}')
        return

    content = fix_urls(content)

    # Vorher: Zeilenzahl der existierenden Datei loggen
    existing_lines = 0
    if dst_path.exists():
        existing_lines = len(dst_path.read_text(encoding='utf-8').splitlines())

    new_lines = len(content.splitlines())
    delta = f'{existing_lines} -> {new_lines} Zeilen'

    if not dry_run:
        dst_path.write_text(content, encoding='utf-8')

    print(f'  OK: {src_path.name:40s} -> {dst_path.name:45s} ({delta})')

def main():
    dry_run = '--dry' in sys.argv
    if dry_run:
        print('=== DRY RUN - keine Dateien werden geaendert ===\n')
    else:
        print('=== Content-Import von scraped-content/full/ nach src/data/static-pages/ ===\n')

    updated = 0
    for src_slug, dst_stem in sorted(MAPPING.items()):
        process(src_slug, dst_stem, dry_run=dry_run)
        updated += 1

    label = 'Simuliert' if dry_run else 'Geschrieben'
    print(f'\n{label}: {updated} Dateien')

if __name__ == '__main__':
    main()
