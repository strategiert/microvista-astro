from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, Iterable, List

from deep_translator import GoogleTranslator


ROOT = Path(__file__).resolve().parents[1]
STATIC_DIR = ROOT / "src" / "data" / "static-pages"

# source filename per slug (English as source for best consistency)
SOURCE_FILES: Dict[str, str] = {
    "agb": "agb-en.md",
    "datenschutz": "datenschutz-en.md",
    "impressum": "impressum-en.md",
    "faq": "faq-en.md",
    "team": "team-en.md",
    "zertifizierungen": "zertifizierungen-en.md",
}

TARGETS = ["fr", "es", "it"]
MAX_CHARS = 3500

URL_RE = re.compile(r"https?://[^\s)\]]+")
LINK_TARGET_RE = re.compile(r"(!?\[[^\]]*\]\()([^)]+)(\))")
PLACEHOLDER_INDEX_RE = re.compile(r"__[^_]+_(\d+)__", flags=re.IGNORECASE)


def chunk_text(lines: Iterable[str], max_chars: int) -> List[str]:
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for line in lines:
        line_len = len(line) + 1
        if current and current_len + line_len > max_chars:
            chunks.append("\n".join(current))
            current = [line]
            current_len = line_len
            continue
        current.append(line)
        current_len += line_len

    if current:
        chunks.append("\n".join(current))
    return chunks


def protect_markup(text: str) -> tuple[str, Dict[str, str]]:
    replacements: Dict[str, str] = {}
    counter = 0

    def repl_link_target(match: re.Match[str]) -> str:
        nonlocal counter
        key = f"__URL_{counter}__"
        replacements[key] = match.group(2)
        counter += 1
        return f"{match.group(1)}{key}{match.group(3)}"

    # Keep markdown link/image targets stable while still translating link text.
    text = LINK_TARGET_RE.sub(repl_link_target, text)

    def repl_url(match: re.Match[str]) -> str:
        nonlocal counter
        key = f"__URL_{counter}__"
        replacements[key] = match.group(0)
        counter += 1
        return key

    text = URL_RE.sub(repl_url, text)
    return text, replacements


def restore_markup(text: str, replacements: Dict[str, str]) -> str:
    restored = text
    for key, value in replacements.items():
        restored = restored.replace(key, value)

    if "__" not in restored:
        return restored

    indexed: Dict[str, str] = {}
    for key, value in replacements.items():
        match = re.match(r"__[^_]+_(\d+)__", key)
        if match:
            indexed[match.group(1)] = value

    def replace_by_index(match: re.Match[str]) -> str:
        index = match.group(1)
        return indexed.get(index, match.group(0))

    return PLACEHOLDER_INDEX_RE.sub(replace_by_index, restored)


def translate_document(content: str, target: str) -> str:
    translator = GoogleTranslator(source="en", target=target)
    lines = content.splitlines()
    chunks = chunk_text(lines, MAX_CHARS)
    translated_chunks: List[str] = []

    for chunk in chunks:
        protected, replacements = protect_markup(chunk)
        translated = translator.translate(protected)
        translated_chunks.append(restore_markup(translated, replacements))

    return "\n\n".join(translated_chunks).strip() + "\n"


def main() -> None:
    for slug, source_name in SOURCE_FILES.items():
        source_path = STATIC_DIR / source_name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source file: {source_path}")

        source_content = source_path.read_text(encoding="utf-8")
        for target in TARGETS:
            translated = translate_document(source_content, target)
            out_path = STATIC_DIR / f"{slug}.{target}.md"
            out_path.write_text(translated, encoding="utf-8")
            print(f"created: {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
