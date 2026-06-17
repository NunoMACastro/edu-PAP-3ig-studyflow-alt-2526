#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def run_canonical_validator() -> dict:
    root = Path(__file__).resolve().parents[4]
    validator = root / "scripts" / "validate_planificacao_canonica.py"
    if not validator.exists():
        raise FileNotFoundError(f"Validador canónico não encontrado: {validator}")

    proc = subprocess.run(
        [sys.executable, str(validator), "--project", "studyflow", "--json"],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(proc.stdout)


def main() -> None:
    parser = argparse.ArgumentParser(description="Executa auditoria canónica da StudyFlow e guarda latest-audit.json.")
    parser.add_argument("--out", default="latest-audit.json", help="Caminho de saída do JSON (default: latest-audit.json).")
    args = parser.parse_args()

    data = run_canonical_validator()
    out_path = Path(args.out).resolve()
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
