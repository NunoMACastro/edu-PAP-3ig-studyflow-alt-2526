#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def run_validator_command(validator: Path, *arguments: str) -> tuple[dict, int]:
    """Executa o validador e preserva o JSON mesmo quando há findings."""

    root = Path(__file__).resolve().parents[3]
    proc = subprocess.run(
        [sys.executable, str(validator), *arguments, "--json"],
        cwd=root,
        check=False,
        capture_output=True,
        text=True,
    )
    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError as error:
        detail = proc.stderr.strip() or proc.stdout.strip() or "sem output"
        raise RuntimeError(f"Validador não devolveu JSON válido: {detail}") from error
    return payload, proc.returncode


def calculate_implementation_manifest(root: Path) -> tuple[str | None, str | None]:
    generator = root / "real_dev/api/src/scripts/generate-implementation-manifest.mjs"
    if not generator.exists():
        return None, "gerador de manifesto ausente"
    proc = subprocess.run(
        ["node", str(generator)],
        cwd=root,
        check=False,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        return None, f"gerador de manifesto terminou com exit code {proc.returncode}"
    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None, "gerador de manifesto não devolveu JSON"
    sha256 = payload.get("sha256")
    if not isinstance(sha256, str) or not re.fullmatch(r"[0-9a-f]{64}", sha256):
        return None, "gerador de manifesto não devolveu SHA-256 válido"
    return sha256, None


def run_canonical_validator() -> dict:
    """Valida primeiro as fixtures semânticas e só depois o projeto."""

    root = Path(__file__).resolve().parents[3]
    validator = root / "scripts" / "validate_planificacao_canonica.py"
    if not validator.exists():
        raise FileNotFoundError(f"Validador canónico não encontrado: {validator}")

    fixtures, fixtures_exit_code = run_validator_command(
        validator,
        "--semantic-fixtures",
    )
    if fixtures_exit_code != 0 or not fixtures.get("pass"):
        failures = "; ".join(fixtures.get("failures", [])) or "falha desconhecida"
        raise RuntimeError(f"Fixtures semânticas falharam: {failures}")

    data, validator_exit_code = run_validator_command(
        validator,
        "--project",
        "studyflow",
    )
    manifest_sha256, manifest_error = calculate_implementation_manifest(root)
    data["semantic_fixtures"] = fixtures
    data["audit_execution"] = {
        "status": "COMPLETE" if manifest_error is None else "PARTIAL",
        "validator_exit_code": validator_exit_code,
    }
    if manifest_sha256:
        data["implementation_manifest_sha256"] = manifest_sha256
    else:
        data["audit_execution"]["manifest_error"] = manifest_error
        data.setdefault("status", {})["overall_pass"] = False
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description="Executa auditoria canónica da StudyFlow e guarda latest-audit.json.")
    parser.add_argument("--out", default="latest-audit.json", help="Caminho de saída do JSON (default: latest-audit.json).")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Executa fixtures e auditoria sem alterar latest-audit.json.",
    )
    args = parser.parse_args()

    data = run_canonical_validator()
    if not args.check:
        configured_out = Path(args.out)
        out_path = (
            configured_out.resolve()
            if configured_out.is_absolute()
            else (Path(__file__).resolve().parent / configured_out).resolve()
        )
        out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return 0 if data.get("status", {}).get("overall_pass") is True else 1


if __name__ == "__main__":
    raise SystemExit(main())
