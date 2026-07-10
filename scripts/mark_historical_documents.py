#!/usr/bin/env python3
"""Mark pre-manifest reports as historical and redact credential material."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


PATTERNS = [
    "docs/AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
    "docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF*.md",
    "docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md",
    "docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF*.md",
    "docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md",
    "docs/planificacao/guias-bk/PLANO-EXECUCAO-real_dev-MF*.md",
    "docs/evidence/MF8/TESTES-EM-FALTA.md",
    "docs/evidence/MF8/TESTES-FINAIS.md",
    "docs/evidence/MF8/CORRECAO-ERROS.md",
]
FIELDS = [
    "status: SUPERSEDED",
    "authoritative_for_release: false",
    "superseded_by: docs/PLANO-CORRECAO-AUDITORIA-COMPLETA-REAL_DEV-2026-07-09.md",
]


def redact(text: str) -> str:
    """Remove credential values without changing historical conclusions."""

    text = re.sub(
        r"(STUDYFLOW_[A-Z0-9_]*PASSWORD=)([^\s|`]+)",
        r"\1<redacted>",
        text,
    )
    text = re.sub(
        r"\b(?:mongodb(?:\+srv)?|redis|https?)://[^\s/:@]+:[^\s/@]+@[^\s|`]+",
        "<redacted-authenticated-uri>",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"\bsk-[A-Za-z0-9_-]{20,}\b", "<redacted-openai-key>", text)
    return text


def add_banner(text: str) -> str:
    text = redact(text)
    prefix_lines = {line.strip() for line in text.splitlines()[:16]}
    if all(field in prefix_lines for field in FIELDS):
        return text
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            frontmatter = text[4:end]
            missing = [field for field in FIELDS if field not in frontmatter]
            if not missing:
                return text
            merged = frontmatter.rstrip() + "\n" + "\n".join(missing)
            return f"---\n{merged}\n---\n{text[end + 5:]}"
    banner = "\n".join(FIELDS)
    return f"---\n{banner}\n---\n\n{text}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    paths: set[Path] = set()
    for pattern in PATTERNS:
        paths.update(root.glob(pattern))
    changed: list[Path] = []
    outputs: dict[Path, str] = {}
    for path in sorted(paths):
        content = add_banner(path.read_text(encoding="utf-8"))
        outputs[path] = content
        if content != path.read_text(encoding="utf-8"):
            changed.append(path)
    if args.check:
        if changed:
            for path in changed:
                print(path.relative_to(root).as_posix())
            raise SystemExit(1)
        print(f"historical-authority: PASS ({len(paths)} relatórios)")
        return
    for path in changed:
        path.write_text(outputs[path], encoding="utf-8")
    print(f"historical-authority: WRITE ({len(changed)}/{len(paths)} relatórios)")


if __name__ == "__main__":
    main()
